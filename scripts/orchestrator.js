/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');


// ============================================================================
// CONFIGURAÇÕES OBRIGATÓRIAS DE AMBIENTE LOCAL
// ============================================================================
const LM_STUDIO_URL = 'http://localhost:1234/v1/chat/completions';
const MODEL_NAME = 'C:/Users/USER 1/.lmstudio/models/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-Q4_K_M.gguf';
const SD_API_URL = 'http://localhost:7860/sdapi/v1/txt2img';

// Caminhos locais do projeto Next.js
const LIVROS_MOCK_PATH = path.join(__dirname, '..', 'src', 'data', 'livros-mock.json');
const CONTOS_MOCK_PATH = path.join(__dirname, '..', 'src', 'data', 'contos-mock.json');
const COVERS_DIR = path.join(__dirname, '..', 'public', 'covers');
const DOWNLOADS_DIR = path.join(__dirname, '..', 'public', 'downloads');
const PROGRESS_PATH = path.join(__dirname, 'progress.json');

// Configuração de Tags de Afiliado (Substitua pelos seus tags reais da Amazon)
const AMAZON_TAG_BR = 'gargbooks-20';
const AMAZON_TAG_PT = 'gargbookspt-21';

// Intervalo de execução (10 minutos por padrão)
const ORCHESTRATOR_INTERVAL = 10 * 60 * 1000;

// ============================================================================
// IDIOMAS SUPORTADOS
// ============================================================================
const LANGUAGES = [
  { code: 'en',    name: 'English',           flag: '🇬🇧', translateFrom: null },
  { code: 'pt-br', name: 'Português (BR)',     flag: '🇧🇷', translateFrom: 'inglês para o português brasileiro' },
  { code: 'pt-pt', name: 'Português (PT)',     flag: '🇵🇹', translateFrom: 'inglês para o português europeu' },
  { code: 'es',    name: 'Español',            flag: '🇪🇸', translateFrom: 'inglés al español' },
  { code: 'fr',    name: 'Français',           flag: '🇫🇷', translateFrom: "l'anglais vers le français" }
];

// Mapa de títulos traduzidos para cada idioma
const TITLE_MAP = {
  "The Metamorphosis":          { "en": "The Metamorphosis",          "pt-br": "A Metamorfose",                   "pt-pt": "A Metamorfose",                  "es": "La Metamorfosis",                "fr": "La Métamorphose" },
  "Frankenstein":               { "en": "Frankenstein",               "pt-br": "Frankenstein",                    "pt-pt": "Frankenstein",                   "es": "Frankenstein",                   "fr": "Frankenstein" },
  "Alice's Adventures in Wonderland": { "en": "Alice's Adventures in Wonderland", "pt-br": "Alice no País das Maravilhas", "pt-pt": "Alice no País das Maravilhas", "es": "Alicia en el País de las Maravillas", "fr": "Alice au Pays des Merveilles" },
  "Dracula":                    { "en": "Dracula",                    "pt-br": "Drácula",                         "pt-pt": "Drácula",                        "es": "Drácula",                        "fr": "Dracula" },
  "Pride and Prejudice":        { "en": "Pride and Prejudice",        "pt-br": "Orgulho e Preconceito",            "pt-pt": "Orgulho e Preconceito",           "es": "Orgullo y Prejuicio",             "fr": "Orgueil et Préjugés" },
  "Moby Dick":                  { "en": "Moby Dick",                  "pt-br": "Moby Dick",                       "pt-pt": "Moby Dick",                      "es": "Moby Dick",                      "fr": "Moby Dick" },
  "A Tale of Two Cities":       { "en": "A Tale of Two Cities",       "pt-br": "Um Conto de Duas Cidades",         "pt-pt": "Um Conto de Duas Cidades",        "es": "Historia de Dos Ciudades",        "fr": "Le Conte de Deux Cités" },
  "The Picture of Dorian Gray": { "en": "The Picture of Dorian Gray", "pt-br": "O Retrato de Dorian Gray",         "pt-pt": "O Retrato de Dorian Gray",        "es": "El Retrato de Dorian Gray",       "fr": "Le Portrait de Dorian Gray" },
  "The War of the Worlds":      { "en": "The War of the Worlds",      "pt-br": "A Guerra dos Mundos",              "pt-pt": "A Guerra dos Mundos",             "es": "La Guerra de los Mundos",         "fr": "La Guerre des Mondes" },
  "Dr Jekyll and Mr Hyde":      { "en": "Dr Jekyll and Mr Hyde",      "pt-br": "O Médico e o Monstro",             "pt-pt": "O Estranho Caso do Dr. Jekyll e Mr. Hyde", "es": "El Extraño Caso del Dr. Jekyll y Mr. Hyde", "fr": "L'Étrange Cas du Dr Jekyll et de Mr Hyde" },
  "Heart of Darkness":          { "en": "Heart of Darkness",          "pt-br": "Coração das Trevas",               "pt-pt": "Coração das Trevas",              "es": "El Corazón de las Tinieblas",     "fr": "Au Cœur des Ténèbres" },
  "The Time Machine":           { "en": "The Time Machine",           "pt-br": "A Máquina do Tempo",               "pt-pt": "A Máquina do Tempo",              "es": "La Máquina del Tiempo",           "fr": "La Machine à Explorer le Temps" },
  "Romeo and Juliet":           { "en": "Romeo and Juliet",           "pt-br": "Romeu e Julieta",                  "pt-pt": "Romeu e Julieta",                 "es": "Romeo y Julieta",                "fr": "Roméo et Juliette" },
  "Crime and Punishment":       { "en": "Crime and Punishment",       "pt-br": "Crime e Castigo",                  "pt-pt": "Crime e Castigo",                 "es": "Crimen y Castigo",               "fr": "Crime et Châtiment" },
  "The Adventures of Sherlock Holmes": { "en": "The Adventures of Sherlock Holmes", "pt-br": "As Aventuras de Sherlock Holmes", "pt-pt": "As Aventuras de Sherlock Holmes", "es": "Las Aventuras de Sherlock Holmes", "fr": "Les Aventures de Sherlock Holmes" },
  "Treasure Island":            { "en": "Treasure Island",            "pt-br": "A Ilha do Tesouro",                "pt-pt": "A Ilha do Tesouro",               "es": "La Isla del Tesoro",              "fr": "L'Île au Trésor" },
  "The Jungle Book":            { "en": "The Jungle Book",            "pt-br": "O Livro da Selva",                 "pt-pt": "O Livro da Selva",                "es": "El Libro de la Selva",            "fr": "Le Livre de la Jungle" },
  "The Count of Monte Cristo":  { "en": "The Count of Monte Cristo",  "pt-br": "O Conde de Monte Cristo",          "pt-pt": "O Conde de Monte Cristo",         "es": "El Conde de Montecristo",         "fr": "Le Comte de Monte-Cristo" },
  "The Odyssey":                { "en": "The Odyssey",                "pt-br": "A Odisseia",                       "pt-pt": "A Odisseia",                      "es": "La Odisea",                       "fr": "L'Odyssée" },
  "Don Quixote":                { "en": "Don Quixote",                "pt-br": "Dom Quixote",                      "pt-pt": "Dom Quixote",                     "es": "Don Quijote de la Mancha",        "fr": "Don Quichotte" },
  "Neuromancer":                { "en": "Neuromancer",                "pt-br": "Neuromancer",                      "pt-pt": "Neuromancer",                     "es": "Neuromante",                      "fr": "Neuromancien" }
};

// ============================================================================
// 10 PERSONAS EDITORIAIS (Incluindo as de romance/contos eróticos +18)
// ============================================================================
const PERSONAS = [
  {
    name: "Elena Thorne",
    genre: "Romance Erótico",
    theme: "romance contemporâneo adulto, paixão intensa e tramas passionais",
    isAdult: true,
    style: "lírico, altamente sensual, focado na tensão física e psicológica entre os personagens"
  },
  {
    name: "Alistair Vance",
    genre: "Terror Gótico",
    theme: "rituais obscuros, mansões decadentes e possessões misteriosas",
    isAdult: true,
    style: "sombrio, visceral, descrições ricas, focado no terror anatômico e na loucura"
  },
  {
    name: "Luna Novak",
    genre: "Cyberpunk",
    theme: "transumanismo, corporações controladoras e crimes na Matrix sob chuva ácida",
    isAdult: false,
    style: "acelerado, repleto de gírias de hacker e jargão tecnológico, tom noir futurista"
  },
  {
    name: "Thomas Kael",
    genre: "Fantasia Épica",
    theme: "conquistas de impérios, relíquias mágicas esquecidas e dragões ancestrais",
    isAdult: false,
    style: "majestoso, descritivo, tom mitológico, heróico e lendário"
  },
  {
    name: "Chloe Mercier",
    genre: "Drama Romântico",
    theme: "reconciliações, segundas chances e amores impossíveis entre classes sociais",
    isAdult: false,
    style: "delicado, profundo, focado em diálogos emocionais e atmosferas intensas"
  },
  {
    name: "Rex Obsidian",
    genre: "Sci-Fi Militar",
    theme: "tropas intergalácticas, invasões alienígenas, sacrifício e honra sob fogo cruzado",
    isAdult: false,
    style: "brutal, direto, repleto de ação militar, jargão tático e descrições de armamento"
  },
  {
    name: "Isabela Requena",
    genre: "Realismo Mágico",
    theme: "vilas latino-americanas, fenômenos sobrenaturais cotidianos, memórias ancestrais",
    isAdult: false,
    style: "poético, cadenciado, com descrições oníricas e realidade fluida como a de Gabriel García Márquez"
  },
  {
    name: "Viktor Draum",
    genre: "Horror Psicológico",
    theme: "insônia, figuras distorcidas em espelhos, pesadelos lúcidos e pacientes de sanatórios",
    isAdult: true,
    style: "claustrofóbico, perturbador, com frases curtas e ritmo crescente de tensão"
  },
  {
    name: "Satoshi Kurogane",
    genre: "Thriller de Espionagem",
    theme: "conspirações geopolíticas, IA usada para controle global e agentes duplos",
    isAdult: false,
    style: "calculista, com reviravoltas frequentes e descrições frias e técnicas"
  },
  {
    name: "Jax Mercer",
    genre: "Noir Thriller",
    theme: "submundos de cidades portuárias, contrabandistas, tráfico de relíquias e prostituição de luxo",
    isAdult: true,
    style: "áspero, dinâmico, focado na resiliência física e em descrições de sucatas tecnológicas"
  }
];

// ============================================================================
// CATÁLOGO DE OBRAS CLÁSSICAS DO GUTENBERG (20 obras)
// ============================================================================
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

// Presets de gradientes caso a geração de imagem falhe
const GRADIENT_PRESETS = [
  "from-stone-900 via-red-950 to-neutral-900",
  "from-emerald-950 via-teal-900 to-zinc-950",
  "from-amber-950 via-stone-900 to-zinc-950",
  "from-cyan-950 via-zinc-900 to-emerald-950",
  "from-orange-950 via-amber-900 to-stone-950"
];

// Helper para obter gradiente aleatório
function getRandomGradient() {
  return GRADIENT_PRESETS[Math.floor(Math.random() * GRADIENT_PRESETS.length)];
}

// Logger com timestamp
function log(msg, type = "INFO") {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${type}] ${msg}`);
}

// ============================================================================
// PERSISTÊNCIA DE PROGRESSO — progress.json
// ============================================================================
function loadProgress() {
  if (fs.existsSync(PROGRESS_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8'));
    } catch (e) {
      log(`Erro ao carregar progress.json: ${e.message}. Reinicializando.`, "WARN");
    }
  }
  // Estrutura padrão do progresso
  return {
    // Obras do Gutenberg: { bookId: { en: true, "pt-br": true, ... } }
    books: {},
    // Contos: { contoId: { "pt-br": true, ... } }
    stories: {},
    // Títulos descobertos automaticamente (auto-discovery)
    discoveredWorks: [],
    // Último timestamp de auto-discovery
    lastDiscoveryTimestamp: null,
    // Total de ciclos executados
    totalCycles: 0
  };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf-8');
}

// ============================================================================
// HELPER: Parsear JSON de respostas do LLM
// ============================================================================
function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error("Não foi possível encontrar chaves { } no texto da resposta.");
  }
  const jsonStr = text.substring(start, end + 1);

  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    log(`Erro no parsing de JSON puro: ${err.message}. Tentando recuperação via regex...`, "WARN");
  }

  // Fallback via regex
  try {
    const titleMatch = jsonStr.match(/"title"\s*:\s*"([\s\S]*?)"\s*,\s*"/);
    const contentMatch = jsonStr.match(/"content"\s*:\s*"([\s\S]*?)"\s*,\s*"imagePrompt"/) ||
                         jsonStr.match(/"content"\s*:\s*"([\s\S]*?)"\s*(?=,\s*"imagePrompt"|})/) ;
    const imagePromptMatch = jsonStr.match(/"imagePrompt"\s*:\s*"([\s\S]*?)"\s*}/) ||
                             jsonStr.match(/"imagePrompt"\s*:\s*"([\s\S]*?)"/);

    if (titleMatch && contentMatch && imagePromptMatch) {
      log("Recuperação do JSON via Regex bem-sucedida!", "INFO");
      return {
        title: titleMatch[1].trim(),
        content: contentMatch[1].trim(),
        imagePrompt: imagePromptMatch[1].trim()
      };
    }
  } catch (regexErr) {
    log(`Falha na recuperação por regex: ${regexErr.message}`, "ERROR");
  }

  throw new Error("Falha ao parsear o JSON retornado pelo modelo.");
}

// ============================================================================
// HELPER: Baixar imagem externa e salvar localmente
// ============================================================================
async function downloadImage(url, destPath) {
  log(`Baixando imagem de ${url} para salvar em ${destPath}...`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro ao baixar imagem: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(destPath, buffer);
    log(`Imagem salva localmente com sucesso!`);
    return true;
  } catch (err) {
    log(`Falha ao baixar imagem localmente: ${err.message}`, "WARN");
    return false;
  }
}

// Criar pasta de covers se não existir
if (!fs.existsSync(COVERS_DIR)) {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
  log(`Diretório de capas criado em: ${COVERS_DIR}`);
}

// Criar pasta de downloads se não existir
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  log(`Diretório de downloads criado em: ${DOWNLOADS_DIR}`);
}

// ============================================================================
// CHAMADAS DE API DE IA LOCAL
// ============================================================================

async function callLocalLLM(systemPrompt, userPrompt, maxTokens = 1500) {
  log(`Enviando prompt ao LM Studio (Gemma-4 Uncensored)...`);
  try {
    const response = await fetch(LM_STUDIO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API do LM Studio: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (err) {
    log(`Falha ao conectar ou processar no LM Studio: ${err.message}`, "ERROR");
    throw err;
  }
}

async function callStableDiffusion(prompt, imagePath) {
  log(`Enviando prompt de imagem ao Stable Diffusion local (${SD_API_URL})...`);
  try {
    const response = await fetch(SD_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        negative_prompt: "easynegative, worst quality, low quality, normal quality, bad anatomy, bad hands, bad eyes, blurry, text, watermark, signature",
        steps: 20,
        cfg_scale: 7.0,
        width: 512,
        height: 768,
        sampler_name: "Euler a",
        output_format: "webp"
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Stable Diffusion: ${response.status}`);
    }

    const data = await response.json();
    if (data.images && data.images.length > 0) {
      const base64Image = data.images[0];
      fs.writeFileSync(imagePath, Buffer.from(base64Image, 'base64'));
      log(`Ilustração salva com sucesso em: ${imagePath}`);
      return true;
    } else {
      throw new Error("Nenhuma imagem retornada pelo Stable Diffusion.");
    }
  } catch (err) {
    log(`Falha no Stable Diffusion: ${err.message}. Usando fallback sem imagem.`, "WARN");
    return false;
  }
}

// ============================================================================
// BUSCAS DE APIs DE TERCEIROS (Project Gutenberg e Open Library)
// ============================================================================

async function fetchGutenbergBook(bookId) {
  const url = `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`;
  log(`Buscando texto da obra ID ${bookId} no Project Gutenberg...`);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) {
      throw new Error(`Erro ao baixar livro: ${response.status}`);
    }
    return await response.text();
  } catch (err) {
    log(`Falha ao baixar do Gutenberg: ${err.message}`, "ERROR");
    throw err;
  }
}

async function fetchOpenLibraryCover(title, author) {
  log(`Buscando capa da edição histórica (vintage) para "${title}" de ${author} na Open Library...`);
  try {
    const searchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&sort=old`;
    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error("Erro na busca da Open Library.");

    const searchData = await response.json();
    if (searchData.docs && searchData.docs.length > 0) {
      const doc = searchData.docs[0];
      if (doc.cover_i) {
        const coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
        log(`Capa encontrada para "${title}": ${coverUrl}`);
        return coverUrl;
      }
      if (doc.isbn && doc.isbn.length > 0) {
        const coverUrl = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
        log(`Capa encontrada via ISBN para "${title}": ${coverUrl}`);
        return coverUrl;
      }
    }
    log(`Nenhuma capa encontrada na Open Library para "${title}".`, "INFO");
  } catch (err) {
    log(`Falha ao obter capa da Open Library: ${err.message}`, "WARN");
  }
  return null;
}

// ============================================================================
// AUTO-DISCOVERY — Buscar novos títulos do Gutenberg automaticamente
// ============================================================================
async function discoverNewWorks(progress) {
  log("=================================================");
  log("INICIANDO AUTO-DISCOVERY (Gutenberg Popular)", "DISCOVERY");
  log("=================================================");

  try {
    // Busca livros populares do Gutenberg via API
    const url = 'https://gutendex.com/books/?sort=popular&languages=en&copyright=true&page=1';
    log(`Consultando catálogo Gutendex: ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Gutendex API error: ${response.status}`);
    
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      log("Nenhum resultado do Gutendex.", "WARN");
      return;
    }

    const existingIds = new Set([
      ...GUTENBERG_WORKS.map(w => w.id),
      ...(progress.discoveredWorks || []).map(w => w.id)
    ]);

    let newCount = 0;
    for (const book of data.results) {
      if (existingIds.has(book.id)) continue;
      
      // Extrair ano de nascimento do autor para estimar domínio público
      const authorName = book.authors && book.authors.length > 0 ? book.authors[0].name : "Unknown";
      const birthYear = book.authors && book.authors.length > 0 ? book.authors[0].birth_year : null;
      const deathYear = book.authors && book.authors.length > 0 ? book.authors[0].death_year : null;
      
      // Critério conservador: autor morreu antes de 1954 (70 anos de domínio público)
      if (!deathYear || deathYear >= 1954) continue;

      const subjects = book.subjects || [];
      const genres = subjects.slice(0, 3).map(s => {
        if (s.toLowerCase().includes('fiction')) return 'Ficção';
        if (s.toLowerCase().includes('horror')) return 'Terror';
        if (s.toLowerCase().includes('science')) return 'Ficção Científica';
        if (s.toLowerCase().includes('adventure')) return 'Aventura';
        if (s.toLowerCase().includes('romance')) return 'Romance';
        if (s.toLowerCase().includes('mystery')) return 'Mistério';
        return 'Clássicos';
      });

      const newWork = {
        id: book.id,
        title: book.title.split(';')[0].split(':')[0].trim(), // Limpa subtítulos
        author: authorName.split(',').reverse().join(' ').trim(), // "Austen, Jane" -> "Jane Austen"
        year: birthYear ? birthYear + 25 : 1850, // Estimativa conservadora
        genres: [...new Set(genres), 'Clássicos'],
        discovered: true
      };

      progress.discoveredWorks.push(newWork);
      existingIds.add(book.id);
      newCount++;
      log(`Descoberta: "${newWork.title}" por ${newWork.author} (Gutenberg #${newWork.id})`);

      if (newCount >= 10) break; // Limita a 10 novas por ciclo de discovery
    }

    progress.lastDiscoveryTimestamp = new Date().toISOString();
    saveProgress(progress);
    log(`Auto-Discovery concluído: ${newCount} novas obras adicionadas ao catálogo.`);

  } catch (err) {
    log(`Falha no Auto-Discovery: ${err.message}`, "ERROR");
  }
}

// ============================================================================
// HELPER: Limpar texto do Gutenberg
// ============================================================================
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

// ============================================================================
// HELPER: Obter título localizado
// ============================================================================
function getLocalizedTitle(originalTitle, langCode) {
  if (TITLE_MAP[originalTitle] && TITLE_MAP[originalTitle][langCode]) {
    return TITLE_MAP[originalTitle][langCode];
  }
  return originalTitle; // Fallback ao título original
}

// ============================================================================
// ESTEIRA A: DOMÍNIO PÚBLICO — Multi-Idioma Incremental
// ============================================================================
async function runEsteiraA(progress) {
  log("=================================================");
  log("INICIANDO ESTEIRA A (Domínio Público — Multi-Idioma)", "ESTEIRA_A");
  log("=================================================");

  try {
    // Combina catálogo fixo + descobertas
    const allWorks = [...GUTENBERG_WORKS, ...(progress.discoveredWorks || [])];
    
    // Encontra a próxima tarefa: obra + idioma que ainda não foi processado
    let targetWork = null;
    let targetLang = null;

    for (const work of allWorks) {
      // Validação de Segurança de Domínio Público
      if (work.year >= 1929) continue;

      const bookId = work.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const bookProgress = progress.books[bookId] || {};

      for (const lang of LANGUAGES) {
        if (!bookProgress[lang.code]) {
          targetWork = work;
          targetLang = lang;
          break;
        }
      }
      if (targetWork) break;
    }

    if (!targetWork || !targetLang) {
      log("✅ Todas as obras do catálogo estão traduzidas em todos os idiomas! Verificando Auto-Discovery...", "ESTEIRA_A");
      
      // Tenta auto-discovery se todas as obras foram processadas
      const lastDiscovery = progress.lastDiscoveryTimestamp ? new Date(progress.lastDiscoveryTimestamp) : null;
      const hoursSinceDiscovery = lastDiscovery ? (Date.now() - lastDiscovery.getTime()) / (1000 * 60 * 60) : 999;
      
      if (hoursSinceDiscovery > 6) {
        await discoverNewWorks(progress);
      } else {
        log(`Auto-Discovery já executado há ${hoursSinceDiscovery.toFixed(1)}h. Próximo em ${(6 - hoursSinceDiscovery).toFixed(1)}h.`, "ESTEIRA_A");
      }
      return;
    }

    const bookId = targetWork.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const localizedTitle = getLocalizedTitle(targetWork.title, targetLang.code);
    
    log(`Processando: "${targetWork.title}" → ${targetLang.flag} ${targetLang.name} (${targetLang.code})`, "ESTEIRA_A");
    log(`Validação de Domínio Público: OK! (${targetWork.year}) — domínio público livre.`);

    // Carrega JSON atual
    let livrosMock = [];
    if (fs.existsSync(LIVROS_MOCK_PATH)) {
      livrosMock = JSON.parse(fs.readFileSync(LIVROS_MOCK_PATH, 'utf-8'));
    }

    // Buscar ou carregar o texto original em inglês
    let cleanText;
    const enDownloadPath = path.join(DOWNLOADS_DIR, `${bookId}-en.txt`);
    
    if (fs.existsSync(enDownloadPath)) {
      cleanText = fs.readFileSync(enDownloadPath, 'utf-8');
      log(`Texto EN já existe localmente: ${enDownloadPath}`);
    } else {
      const rawText = await fetchGutenbergBook(targetWork.id);
      cleanText = cleanGutenbergText(rawText);
      fs.writeFileSync(enDownloadPath, cleanText, 'utf-8');
      log(`Texto EN original salvo: ${enDownloadPath}`);
    }

    // Também salvar sem sufixo de idioma para compatibilidade
    const legacyPath = path.join(DOWNLOADS_DIR, `${bookId}.txt`);
    if (!fs.existsSync(legacyPath)) {
      fs.copyFileSync(enDownloadPath, legacyPath);
    }

    // Extrair segmento para tradução
    let bookChapterText = "";
    const chapterMatch = cleanText.match(/(CHAPTER I|CAPÍTULO I|I\.\s)/i);
    if (chapterMatch && chapterMatch.index !== -1) {
      bookChapterText = cleanText.substring(chapterMatch.index, chapterMatch.index + 12000);
    } else {
      bookChapterText = cleanText.substring(0, 12000);
    }
    log(`Segmentado trecho de ${bookChapterText.length} caracteres.`);

    let translatedText;
    let synopsis;

    if (targetLang.code === 'en') {
      // Idioma original — sem tradução necessária
      translatedText = bookChapterText;
      
      // Gerar sinopse em inglês
      const synopsisSystemPrompt = `You are a literary critic. Write a captivating, short synopsis in English for the classic work "${targetWork.title}" by ${targetWork.author}. Return only the synopsis.`;
      synopsis = await callLocalLLM(synopsisSystemPrompt, `Write a synopsis for the work.`);
      log(`Sinopse EN gerada: "${synopsis.substring(0, 80)}..."`);
      
    } else {
      // Tradução para o idioma-alvo
      const langInstruction = targetLang.translateFrom;
      
      const systemPrompt = `Você é um tradutor literário experiente. Traduza o texto a seguir ${langInstruction} de forma muito fiel e artística, mantendo o tom clássico e a profundidade da obra original.
Formate o texto aplicando boas práticas de UX de leitura:
- Crie parágrafos confortáveis, dividindo blocos longos em trechos menores e mais legíveis.
- Mantenha um line-height visualmente limpo através de quebras de parágrafo adequadas.
- Use negrito/itálico onde apropriado de forma elegante.
Retorne APENAS o texto traduzido e formatado em Markdown, sem introduções ou explicações.`;

      const userPrompt = `Traduza o seguinte capítulo/segmento da obra clássica "${targetWork.title}":\n\n${bookChapterText}`;
      
      translatedText = await callLocalLLM(systemPrompt, userPrompt);
      log(`Tradução ${targetLang.code} finalizada com sucesso.`);

      // Gerar sinopse no idioma-alvo
      const synopsisLangMap = {
        'pt-br': { sys: `Escreva uma sinopse cativante e curta em português brasileiro`, lang: "português brasileiro" },
        'pt-pt': { sys: `Escreva uma sinopse cativante e curta em português europeu`, lang: "português europeu" },
        'es':    { sys: `Escribe una sinopsis cautivadora y corta en español`, lang: "español" },
        'fr':    { sys: `Écrivez un synopsis captivant et court en français`, lang: "français" }
      };
      const synConf = synopsisLangMap[targetLang.code];
      const synopsisSystemPrompt = `Você é um crítico literário. ${synConf.sys} para a obra clássica "${localizedTitle}" de ${targetWork.author}. Retorne apenas a sinopse.`;
      synopsis = await callLocalLLM(synopsisSystemPrompt, `Crie a sinopse em ${synConf.lang} da obra.`);
      log(`Sinopse ${targetLang.code} gerada: "${synopsis.substring(0, 80)}..."`);
    }

    // Salvar texto traduzido como arquivo de download
    const langDownloadPath = path.join(DOWNLOADS_DIR, `${bookId}-${targetLang.code}.txt`);
    fs.writeFileSync(langDownloadPath, translatedText, 'utf-8');
    log(`Texto ${targetLang.code} salvo para download: ${langDownloadPath}`);

    // Busca capa na Open Library (apenas uma vez por livro)
    let localCoverImage = undefined;
    const existingBook = livrosMock.find(b => b.id === bookId);
    
    if (existingBook && existingBook.coverImage) {
      localCoverImage = existingBook.coverImage;
      log(`Capa já existe localmente: ${localCoverImage}`);
    } else {
      const coverUrl = await fetchOpenLibraryCover(targetWork.title, targetWork.author);
      if (coverUrl) {
        const ext = coverUrl.split('.').pop() || 'jpg';
        const filename = `cover-${bookId}.${ext}`;
        const imagePath = path.join(COVERS_DIR, filename);
        const downloadSuccess = await downloadImage(coverUrl, imagePath);
        if (downloadSuccess) {
          localCoverImage = `/covers/${filename}`;
        }
      }
    }

    // Montar ou atualizar o objeto do livro
    const primaryTitle = getLocalizedTitle(targetWork.title, 'pt-br');
    const searchQuery = `${primaryTitle} ${targetWork.author}`;
    const affLinkBR = `https://www.amazon.com.br/s?k=${encodeURIComponent(searchQuery)}&tag=${AMAZON_TAG_BR}`;
    const affLinkPT = `https://www.amazon.es/s?k=${encodeURIComponent(searchQuery)}&tag=${AMAZON_TAG_PT}`;

    // Construir o campo translations
    let translations = {};
    if (existingBook && existingBook.translations) {
      translations = { ...existingBook.translations };
    }
    translations[targetLang.code] = {
      title: localizedTitle,
      synopsis: synopsis,
      fullText: translatedText,
      downloadFile: `/downloads/${bookId}-${targetLang.code}.txt`
    };

    const newBook = {
      id: bookId,
      title: primaryTitle, // Título principal sempre em pt-br
      author: targetWork.author,
      year: targetWork.year,
      genres: targetWork.genres,
      rating: existingBook ? existingBook.rating : 4.8,
      coverGradient: existingBook ? existingBook.coverGradient : getRandomGradient(),
      coverImage: localCoverImage || (existingBook ? existingBook.coverImage : undefined),
      synopsis: translations['pt-br'] ? translations['pt-br'].synopsis : (translations['en'] ? translations['en'].synopsis : synopsis),
      fullText: translations['pt-br'] ? translations['pt-br'].fullText : (translations['en'] ? translations['en'].fullText : translatedText),
      downloadFile: `/downloads/${bookId}.txt`,
      translations: translations,
      editions: existingBook ? existingBook.editions : [
        {
          id: `ed-${bookId}-physical`,
          publisher: "Edição Física Recomendada",
          year: targetWork.year,
          isbn: `978-3161484${targetWork.id}`,
          pages: Math.floor(Math.random() * 200) + 150,
          coverType: "Brochura Clássica",
          priceBR: 29.90,
          pricePT: 8.99,
          linkBR: affLinkBR,
          linkPT: affLinkPT
        }
      ],
      reviews: existingBook ? existingBook.reviews : [
        {
          id: `rev-${bookId}-gut`,
          username: "leitor_gutenberg",
          rating: 5,
          date: new Date().toISOString().split('T')[0],
          text: "Edição excelente traduzida localmente por IA. A leitura flui de forma incrível no e-reader da página!"
        }
      ]
    };

    // Atualiza ou insere no JSON
    const bookIndex = livrosMock.findIndex(b => b.id === bookId);
    if (bookIndex !== -1) {
      livrosMock[bookIndex] = { ...livrosMock[bookIndex], ...newBook };
      log(`Livro "${newBook.title}" atualizado com tradução ${targetLang.code}.`);
    } else {
      livrosMock.push(newBook);
      log(`Novo livro "${newBook.title}" inserido no JSON (${targetLang.code}).`);
    }

    fs.writeFileSync(LIVROS_MOCK_PATH, JSON.stringify(livrosMock, null, 2), 'utf-8');
    log("Arquivo 'src/data/livros-mock.json' atualizado com sucesso!");

    // Atualizar progresso
    if (!progress.books[bookId]) progress.books[bookId] = {};
    progress.books[bookId][targetLang.code] = true;
    saveProgress(progress);
    log(`Progresso salvo: ${bookId} → ${targetLang.code} ✅`);

  } catch (err) {
    log(`Falha crítica na Esteira A: ${err.message}`, "ERROR");
  }
}

// ============================================================================
// ESTEIRA B: CONTOS DAS PERSONAS — Multi-Idioma
// ============================================================================
async function runEsteiraB(progress) {
  log("=================================================");
  log("INICIANDO ESTEIRA B (Contos das Personas — Multi-Idioma)", "ESTEIRA_B");
  log("=================================================");

  try {
    // Verifica se algum conto existente precisa de tradução
    let contosMock = [];
    if (fs.existsSync(CONTOS_MOCK_PATH)) {
      try {
        contosMock = JSON.parse(fs.readFileSync(CONTOS_MOCK_PATH, 'utf-8'));
      } catch (e) {
        log(`Erro ao carregar contos-mock.json: ${e.message}. Reinicializando.`, "WARN");
      }
    }

    // Procura conto que precisa de tradução
    let pendingConto = null;
    let pendingLang = null;

    for (const conto of contosMock) {
      const storyProgress = progress.stories[conto.id] || {};
      for (const lang of LANGUAGES) {
        if (lang.code === 'pt-br') continue; // Contos são gerados em pt-br, já está feito
        if (!storyProgress[lang.code]) {
          pendingConto = conto;
          pendingLang = lang;
          break;
        }
      }
      if (pendingConto) break;
    }

    if (pendingConto && pendingLang) {
      // Traduzir conto existente para novo idioma
      log(`Traduzindo conto existente "${pendingConto.title}" para ${pendingLang.flag} ${pendingLang.name}`, "ESTEIRA_B");

      const sourceText = pendingConto.fullText;
      let translatedContent;
      let translatedTitle;

      if (pendingLang.code === 'en') {
        const sysPrompt = `You are a professional literary translator. Translate the following short story from Portuguese to English, maintaining the artistic quality, tone, and style. Return ONLY the translated text in Markdown format.`;
        translatedContent = await callLocalLLM(sysPrompt, sourceText);
        
        const titleSysPrompt = `Translate this short story title from Portuguese to English. Return ONLY the translated title, nothing else.`;
        translatedTitle = await callLocalLLM(titleSysPrompt, pendingConto.title);
      } else {
        const langInstruction = pendingLang.translateFrom;
        // Traduz do pt-br para o idioma alvo via instrução
        const sysPrompt = `Você é um tradutor literário. Traduza o seguinte conto do português brasileiro ${langInstruction.replace('inglês', 'português')}. Mantenha a qualidade artística e o tom. Retorne APENAS o texto traduzido em Markdown.`;
        translatedContent = await callLocalLLM(sysPrompt, sourceText);
        
        const titleSysPrompt = `Traduza este título de conto do português para ${pendingLang.name}. Retorne APENAS o título traduzido.`;
        translatedTitle = await callLocalLLM(titleSysPrompt, pendingConto.title);
      }

      translatedTitle = translatedTitle.replace(/["\n]/g, '').trim();
      log(`Tradução concluída: "${translatedTitle}" (${pendingLang.code})`);

      // Atualizar o conto com a tradução
      const contoIndex = contosMock.findIndex(c => c.id === pendingConto.id);
      if (contoIndex !== -1) {
        if (!contosMock[contoIndex].translations) contosMock[contoIndex].translations = {};
        contosMock[contoIndex].translations[pendingLang.code] = {
          title: translatedTitle,
          synopsis: translatedContent.split('\n')[0].replace(/[#*`]/g, '').substring(0, 150) + "...",
          fullText: translatedContent
        };
        // pt-br é o original
        if (!contosMock[contoIndex].translations['pt-br']) {
          contosMock[contoIndex].translations['pt-br'] = {
            title: contosMock[contoIndex].title,
            synopsis: contosMock[contoIndex].synopsis,
            fullText: contosMock[contoIndex].fullText
          };
        }
      }

      fs.writeFileSync(CONTOS_MOCK_PATH, JSON.stringify(contosMock, null, 2), 'utf-8');
      log("Arquivo 'src/data/contos-mock.json' atualizado com sucesso!");

      if (!progress.stories[pendingConto.id]) progress.stories[pendingConto.id] = {};
      progress.stories[pendingConto.id][pendingLang.code] = true;
      progress.stories[pendingConto.id]['pt-br'] = true; // Marca original também
      saveProgress(progress);
      log(`Progresso salvo: ${pendingConto.id} → ${pendingLang.code} ✅`);
      
      return; // Uma tradução por ciclo
    }

    // Se não há traduções pendentes, gera um novo conto
    log("Nenhuma tradução pendente. Gerando novo conto...", "ESTEIRA_B");

    // Escolhe uma persona aleatória
    const persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
    log(`Persona selecionada: ${persona.name} (Gênero: ${persona.genre}${persona.isAdult ? " [+18]" : ""})`);

    const systemPrompt = `Você é a persona literária ${persona.name}, autor(a) profissional do gênero ${persona.genre}.
Seu estilo de escrita é: ${persona.style}.
Seu tema recorrente é: ${persona.theme}.

Você deve gerar um conto inédito, imersivo e completo com aproximadamente 800 palavras sobre este tema.
Se a sua persona for categorizada como +18 (romance erótico, terror visceral, etc.), sinta-se livre para incluir descrições sensuais, adultas ou viscerais explícitas sem qualquer filtro, aproveitando a natureza sem censura do seu modelo Gemma-4.

Além disso, forneça um prompt descritivo em inglês (máximo de 20 palavras) para alimentar um gerador de imagem (Stable Diffusion) que ilustrará este conto. O estilo da ilustração deve ser artístico, conceitual e condizente com o tom do conto (ex: pintura a óleo gótica, arte digital cyberpunk, etc.), sem conter textos, marcas d'água ou assinaturas na imagem.

Sua resposta DEVE ser estritamente um objeto JSON válido, sem introdução ou explicações no chat. Formate o JSON com as seguintes propriedades:
{
  "title": "Título criativo do conto em português",
  "content": "Texto completo do conto em português, formatado em markdown com quebras de parágrafo confortáveis e boa UX de leitura",
  "imagePrompt": "Prompt visual detalhado em inglês de até 20 palavras descrevendo a cena principal do conto"
}`;

    const userPrompt = `Escreva um conto inédito de acordo com as especificações da sua persona editorial. Lembre-se de retornar estritamente o objeto JSON.`;

    const rawResponse = await callLocalLLM(systemPrompt, userPrompt);

    // Tenta parsear a resposta como JSON de forma robusta
    const generatedData = extractJson(rawResponse);
    if (!generatedData.title || !generatedData.content || !generatedData.imagePrompt) {
      throw new Error("Modelo não gerou a estrutura JSON completa com title, content e imagePrompt.");
    }

    const storyId = `conto-${persona.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const filename = `${storyId}.webp`;
    const imagePath = path.join(COVERS_DIR, filename);
    const webpPathInJson = `/covers/${filename}`;

    log(`Conto gerado: "${generatedData.title}". Gênero: ${persona.genre}.`);
    log(`Prompt de imagem extraído: "${generatedData.imagePrompt}"`);

    // Aciona Stable Diffusion local
    const imageSuccess = await callStableDiffusion(generatedData.imagePrompt, imagePath);

    // Monta o conto com campo translations preenchido para pt-br
    const newConto = {
      id: storyId,
      title: generatedData.title,
      author: persona.name,
      year: new Date().getFullYear(),
      genres: [persona.genre, "Original", persona.isAdult ? "Adulto +18" : "Geral"],
      rating: 5.0,
      coverGradient: getRandomGradient(),
      coverImage: imageSuccess ? webpPathInJson : undefined,
      synopsis: generatedData.content.split('\n')[0].replace(/[#*`]/g, '').substring(0, 150) + "...",
      fullText: generatedData.content,
      translations: {
        'pt-br': {
          title: generatedData.title,
          synopsis: generatedData.content.split('\n')[0].replace(/[#*`]/g, '').substring(0, 150) + "...",
          fullText: generatedData.content
        }
      },
      editions: [],
      reviews: [
        {
          id: `rev-${storyId}-sys`,
          username: "editorial_gargbooks",
          rating: 5,
          date: new Date().toISOString().split('T')[0],
          text: `Conto original gerado pela IA da nossa editora sob a persona de ${persona.name}. Excelente exploração literária do gênero ${persona.genre}.`
        }
      ],
      isUserPublished: false
    };

    // Insere no início do array de contos
    contosMock.unshift(newConto);
    fs.writeFileSync(CONTOS_MOCK_PATH, JSON.stringify(contosMock, null, 2), 'utf-8');
    log("Arquivo 'src/data/contos-mock.json' atualizado com sucesso!");

    // Marcar pt-br como feito no progresso
    if (!progress.stories[storyId]) progress.stories[storyId] = {};
    progress.stories[storyId]['pt-br'] = true;
    saveProgress(progress);

  } catch (err) {
    log(`Falha crítica na Esteira B: ${err.message}`, "ERROR");
  }
}

// ============================================================================
// CICLO DO ORQUESTRADOR
// ============================================================================

async function runOrchestrator() {
  const progress = loadProgress();
  progress.totalCycles = (progress.totalCycles || 0) + 1;
  
  log(`Iniciando ciclo #${progress.totalCycles} do Orquestrador...`);
  log(`Progresso: ${Object.keys(progress.books).length} livros, ${Object.keys(progress.stories).length} contos rastreados.`);

  // Roda Esteira A e Esteira B consecutivamente
  await runEsteiraA(progress);
  await runEsteiraB(progress);

  saveProgress(progress);
  log("Ciclo concluído. Aguardando próximo agendamento.");
}

// Execução imediata no início
runOrchestrator();

// Configura o agendamento em background
setInterval(runOrchestrator, ORCHESTRATOR_INTERVAL);

log(`Orquestrador v2 Multi-Idioma ativo e monitorando a cada ${ORCHESTRATOR_INTERVAL / 1000 / 60} minutos.`);
log(`Idiomas: ${LANGUAGES.map(l => `${l.flag} ${l.code}`).join(', ')}`);
log(`Catálogo fixo: ${GUTENBERG_WORKS.length} obras | Auto-Discovery: ativado`);
log(`Persistência: ${PROGRESS_PATH}`);
