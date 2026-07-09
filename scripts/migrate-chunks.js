/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const LM_STUDIO_URL = 'http://localhost:1234/v1/chat/completions';
const MODEL_NAME = 'gemma-4-e4b-uncensored-hauhaucs-aggressive';
const GUTENBERG_WORKS = [
  { id: 345,  title: "Dracula",                          author: "Bram Stoker",           year: 1897, genres: ["Terror Gótico", "Clássicos"] },
  { id: 5200, title: "The Metamorphosis",                author: "Franz Kafka",           year: 1915, genres: ["Ficção Absurda", "Clássicos"] },
  { id: 84,   title: "Frankenstein",                     author: "Mary Shelley",          year: 1818, genres: ["Terror Gótico", "Ficção Científica"] },
  { id: 11,   title: "Alice's Adventures in Wonderland", author: "Lewis Carroll",         year: 1865, genres: ["Fantasia", "Clássicos"] },
  { id: 1342, title: "Pride and Prejudice",              author: "Jane Austen",           year: 1813, genres: ["Romance", "Clássicos"] },
  { id: 2701, title: "Moby Dick",                        author: "Herman Melville",       year: 1851, genres: ["Aventura", "Clássicos"] },
  { id: 98,   title: "A Tale of Two Cities",             author: "Charles Dickens",       year: 1859, genres: ["Drama Histórico", "Clássicos"] },
  { id: 174,  title: "The Picture of Dorian Gray",       author: "Oscar Wilde",           year: 1890, genres: ["Ficção Filosófica", "Clássicos"] },
  { id: 36,   title: "The War of the Worlds",            author: "H.G. Wells",            year: 1898, genres: ["Ficção Científica", "Clássicos"] },
  { id: 43,   title: "Dr Jekyll and Mr Hyde",            author: "R.L. Stevenson",        year: 1886, genres: ["Terror Gótico", "Ficção Científica"] },
  { id: 219,  title: "Heart of Darkness",                author: "Joseph Conrad",         year: 1899, genres: ["Drama", "Clássicos"] },
  { id: 35,   title: "The Time Machine",                 author: "H.G. Wells",            year: 1895, genres: ["Ficção Científica", "Clássicos"] },
  { id: 1513, title: "Romeo and Juliet",                 author: "William Shakespeare",   year: 1597, genres: ["Tragédia", "Romance"] },
  { id: 2554, title: "Crime and Punishment",             author: "Fyodor Dostoevsky",     year: 1866, genres: ["Drama Psicológico", "Clássicos"] },
  { id: 1661, title: "The Adventures of Sherlock Holmes",author: "Arthur Conan Doyle",    year: 1892, genres: ["Mistério", "Detetive"] },
  { id: 120,  title: "Treasure Island",                  author: "R.L. Stevenson",        year: 1883, genres: ["Aventura", "Clássicos"] },
  { id: 236,  title: "The Jungle Book",                  author: "Rudyard Kipling",       year: 1894, genres: ["Aventura", "Fantasia"] },
  { id: 1184, title: "The Count of Monte Cristo",        author: "Alexandre Dumas",       year: 1844, genres: ["Aventura", "Drama"] },
  { id: 1727, title: "The Odyssey",                      author: "Homer",                 year: -800, genres: ["Épico", "Mitologia"] },
  { id: 996,  title: "Don Quixote",                      author: "Miguel de Cervantes",   year: 1605, genres: ["Aventura", "Sátira"] }
];
const LANGUAGES = [
  { code: 'en',    name: 'English',           flag: '🇬🇧' },
  { code: 'pt-br', name: 'Português (BR)',     flag: '🇧🇷' },
  { code: 'pt-pt', name: 'Português (PT)',     flag: '🇵🇹' },
  { code: 'es',    name: 'Español',            flag: '🇪🇸' },
  { code: 'fr',    name: 'Français',           flag: '🇫🇷' }
];

const PROGRESS_PATH = path.join(__dirname, 'progress.json');
const LIVROS_MOCK_PATH = path.join(__dirname, '..', 'src', 'data', 'livros-mock.json');
const DOWNLOADS_DIR = path.join(__dirname, '..', 'public', 'downloads');

function log(msg, type = "MIGRATE") {
  console.log(`[${new Date().toISOString()}] [${type}] ${msg}`);
}

function splitIntoChunks(fullText, chunkSize = 4000) {
  const chunks = [];
  for (let i = 0; i < fullText.length; i += chunkSize) {
    chunks.push(fullText.substring(i, i + chunkSize));
  }
  return chunks;
}

function cleanGutenbergText(rawText) {
  let cleanText = rawText;
  const startIdx = rawText.indexOf("*** START OF THE PROJECT GUTENBERG");
  const endIdx = rawText.indexOf("*** END OF THE PROJECT GUTENBERG");
  if (startIdx !== -1) {
    const startLineEnd = rawText.indexOf("\n", startIdx);
    cleanText = rawText.substring(startLineEnd !== -1 ? startLineEnd : startIdx);
  }
  if (endIdx !== -1) {
    cleanText = cleanText.substring(0, cleanText.indexOf("*** END OF THE PROJECT GUTENBERG"));
  }
  return cleanText.trim();
}

async function fetchGutenbergBook(bookId) {
  const url = `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`;
  log(`Baixando obra #${bookId} do Gutenberg...`);
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if (!response.ok) throw new Error(`Erro ${response.status}`);
  return await response.text();
}

async function migrate() {
  log("================================================");
  log("MIGRAÇÃO: Convertendo livros legados para chunks");
  log("================================================");

  if (!fs.existsSync(PROGRESS_PATH)) {
    log("progress.json não encontrado!", "ERROR");
    return;
  }

  const progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8'));
  let migrated = 0;

  for (const work of GUTENBERG_WORKS) {
    const bookId = work.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const bp = progress.books[bookId];

    if (!bp) continue;

    // Verifica se precisa re-baixar (arquivo truncado)
    const enPath = path.join(DOWNLOADS_DIR, `${bookId}-en.txt`);
    let needsRedownload = false;
    if (fs.existsSync(enPath)) {
      const size = fs.statSync(enPath).size;
      if (size < 50000) {
        needsRedownload = true;
        log(`"${work.title}" texto truncado (${size} bytes). Re-baixando...`, "WARN");
      }
    }

    // Se já tem chunks e o texto é grande o suficiente, pula
    if (bp.chunks && !needsRedownload) {
      log(`"${work.title}" já possui chunks OK. Pulando.`);
      continue;
    }

    log(`Migrando: "${work.title}" (${bookId})...`);

    // Baixar ou carregar texto completo (re-baixa se < 50KB = truncado)
    const MIN_TEXT_SIZE = 50000;
    const downloadPath = path.join(DOWNLOADS_DIR, `${bookId}-en.txt`);
    let fullText;
    let needsDownload = false;

    if (fs.existsSync(downloadPath)) {
      const existingSize = fs.statSync(downloadPath).size;
      if (existingSize < MIN_TEXT_SIZE) {
        log(`Arquivo local muito pequeno (${existingSize} bytes). Re-baixando do Gutenberg...`, "WARN");
        needsDownload = true;
      } else {
        fullText = fs.readFileSync(downloadPath, 'utf-8');
        log(`Texto EN encontrado localmente (${existingSize} bytes).`);
      }
    } else {
      needsDownload = true;
    }

    if (needsDownload) {
      try {
        const raw = await fetchGutenbergBook(work.id);
        fullText = cleanGutenbergText(raw);
        fs.writeFileSync(downloadPath, fullText, 'utf-8');
        const legacyPath = path.join(DOWNLOADS_DIR, `${bookId}.txt`);
        fs.writeFileSync(legacyPath, fullText, 'utf-8');
        log(`Texto EN baixado do Gutenberg (${fullText.length} chars).`);
      } catch (err) {
        log(`Falha ao baixar "${work.title}": ${err.message}`, "WARN");
        continue;
      }
    }

    // Dividir em chunks
    const chunks = splitIntoChunks(fullText, 4000);
    log(`Dividido em ${chunks.length} chunks.`);

    // Inicializar estrutura de chunks
    bp.chunks = {};
    for (const lang of LANGUAGES) {
      bp.chunks[lang.code] = new Array(chunks.length).fill(false);
    }
    bp.totalChunks = chunks.length;

    // Marcar EN (original) como completo
    for (let i = 0; i < chunks.length; i++) {
      bp.chunks['en'][i] = true;
      const chunkPath = path.join(DOWNLOADS_DIR, `${bookId}-en.chunk.${i}.txt`);
      fs.writeFileSync(chunkPath, chunks[i], 'utf-8');
    }

    // Salvar texto completo EN
    const fullEnText = chunks.map(c => c).join('\n\n');
    fs.writeFileSync(downloadPath, fullEnText, 'utf-8');
    fs.writeFileSync(path.join(DOWNLOADS_DIR, `${bookId}.txt`), fullEnText, 'utf-8');

    // Atualizar livros-mock.json com o fullText completo
    if (fs.existsSync(LIVROS_MOCK_PATH)) {
      const livros = JSON.parse(fs.readFileSync(LIVROS_MOCK_PATH, 'utf-8'));
      const idx = livros.findIndex(b => b.id === bookId);
      if (idx !== -1) {
        livros[idx].fullText = fullEnText;
        livros[idx].isFullTextComplete = true;
        if (livros[idx].translations && livros[idx].translations['en']) {
          livros[idx].translations['en'].fullText = fullEnText;
        }
        if (livros[idx].translations && livros[idx].translations['pt-br']) {
          livros[idx].translations['pt-br'].fullText = fullEnText;
        }
        fs.writeFileSync(LIVROS_MOCK_PATH, JSON.stringify(livros, null, 2), 'utf-8');
        log(`livros-mock.json atualizado para "${work.title}".`);
      }
    }

    migrated++;
    log(`✅ "${work.title}" migrado com sucesso!`);

    // Salvar progresso a cada livro
    fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf-8');
  }

  // Também migrar obras descobertas
  if (progress.discoveredWorks) {
    for (const work of progress.discoveredWorks) {
      const bookId = work.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const bp = progress.books[bookId];
      if (!bp || bp.chunks) continue;

      log(`Migrando descoberta: "${work.title}"...`);
      const downloadPath = path.join(DOWNLOADS_DIR, `${bookId}-en.txt`);
      let fullText;
      if (fs.existsSync(downloadPath)) {
        fullText = fs.readFileSync(downloadPath, 'utf-8');
      } else {
        try {
          const raw = await fetchGutenbergBook(work.id);
          fullText = cleanGutenbergText(raw);
          fs.writeFileSync(downloadPath, fullText, 'utf-8');
        } catch (err) {
          log(`Falha: ${err.message}`, "WARN");
          continue;
        }
      }

      const chunks = splitIntoChunks(fullText, 4000);
      bp.chunks = {};
      for (const lang of LANGUAGES) {
        bp.chunks[lang.code] = new Array(chunks.length).fill(false);
      }
      bp.totalChunks = chunks.length;

      for (let i = 0; i < chunks.length; i++) {
        bp.chunks['en'][i] = true;
        const chunkPath = path.join(DOWNLOADS_DIR, `${bookId}-en.chunk.${i}.txt`);
        fs.writeFileSync(chunkPath, chunks[i], 'utf-8');
      }

      const fullEnText = chunks.map(c => c).join('\n\n');
      fs.writeFileSync(downloadPath, fullEnText, 'utf-8');

      migrated++;
      log(`✅ Descoberta "${work.title}" migrada.`);
      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf-8');
    }
  }

  log(`========================================`);
  log(`Migração concluída! ${migrated} livros processados.`);
  log(`Agora execute: npm run orchestrator`);
  log(`Os idiomas originais (EN) estão completos.`);
  log(`Os demais idiomas serão traduzidos bloco a bloco.`);
  log(`========================================`);
}

migrate().catch(err => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
