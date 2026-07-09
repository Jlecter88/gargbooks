const fs = require('fs');
const path = require('path');

const DOWNLOADS_DIR = path.join(__dirname, '..', 'public', 'downloads');
const LIVROS_MOCK_PATH = path.join(__dirname, '..', 'src', 'data', 'livros-mock.json');

// Logger
function log(msg, type = "INFO") {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] [${type}] ${msg}`);
}

// Clean Gutenberg header/footer
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

// Download function
async function downloadBook(gutenbergId, destFilename) {
  const url = `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.txt`;
  log(`Baixando ID ${gutenbergId} do Gutenberg...`);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    const text = await response.text();
    const cleaned = cleanGutenbergText(text);
    const destPath = path.join(DOWNLOADS_DIR, destFilename);
    fs.writeFileSync(destPath, cleaned, 'utf-8');
    log(`Salvo em ${destFilename} (${cleaned.length} caracteres)`, "SUCCESS");
    return true;
  } catch (err) {
    log(`Erro ao baixar ID ${gutenbergId}: ${err.message}`, "ERROR");
    return false;
  }
}

async function run() {
  // Ensure directories exist
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }

  log("=================================================");
  log("INICIANDO DOWNLOAD DE LIVROS COMPLETOS");
  log("=================================================");

  // 1. Download missing/Portuguese books
  // - 54829: Memórias Póstumas de Brás Cubas (PT)
  await downloadBook(54829, "memorias-postumas.txt");
  fs.copyFileSync(
    path.join(DOWNLOADS_DIR, "memorias-postumas.txt"),
    path.join(DOWNLOADS_DIR, "memorias-postumas-pt-br.txt")
  );
  fs.copyFileSync(
    path.join(DOWNLOADS_DIR, "memorias-postumas.txt"),
    path.join(DOWNLOADS_DIR, "memorias-postumas-pt-pt.txt")
  );

  // - 23337: Dom Quixote (PT translation)
  await downloadBook(23337, "don-quixote-pt-br.txt");
  fs.copyFileSync(
    path.join(DOWNLOADS_DIR, "don-quixote-pt-br.txt"),
    path.join(DOWNLOADS_DIR, "don-quixote-pt-pt.txt")
  );

  // - 30889: Romeu e Julieta (PT translation)
  await downloadBook(30889, "romeo-and-juliet-pt-br.txt");
  fs.copyFileSync(
    path.join(DOWNLOADS_DIR, "romeo-and-juliet-pt-br.txt"),
    path.join(DOWNLOADS_DIR, "romeo-and-juliet-pt-pt.txt")
  );

  // - 47864: A Odisseia (PT translation)
  await downloadBook(47864, "the-odyssey-pt-br.txt");
  fs.copyFileSync(
    path.join(DOWNLOADS_DIR, "the-odyssey-pt-br.txt"),
    path.join(DOWNLOADS_DIR, "the-odyssey-pt-pt.txt")
  );

  // - 696: The Castle of Otranto (EN complete)
  await downloadBook(696, "castelo-otranto.txt");
  fs.copyFileSync(
    path.join(DOWNLOADS_DIR, "castelo-otranto.txt"),
    path.join(DOWNLOADS_DIR, "castelo-otranto-en.txt")
  );

  log("Todos os downloads solicitados foram concluídos.", "SUCCESS");

  // 2. Update livros-mock.json
  log("=================================================");
  log("ATUALIZANDO LIVROS-MOCK.JSON");
  log("=================================================");

  if (!fs.existsSync(LIVROS_MOCK_PATH)) {
    log("Arquivo livros-mock.json não encontrado!", "ERROR");
    return;
  }

  const books = JSON.parse(fs.readFileSync(LIVROS_MOCK_PATH, 'utf-8'));

  const updatedBooks = books.map(book => {
    // Determine the base file path
    const baseId = book.id;
    const originalFile = `${baseId}.txt`;
    const originalExists = fs.existsSync(path.join(DOWNLOADS_DIR, originalFile));

    log(`Avaliando "${book.title}" (ID: ${baseId}) - Original completo existe: ${originalExists}`);

    if (originalExists) {
      // Point default downloadFile to the complete original file
      book.downloadFile = `/downloads/${originalFile}`;
    }

    if (book.translations) {
      Object.keys(book.translations).forEach(lang => {
        const trans = book.translations[lang];
        
        // If English, point to the complete original English file
        if (lang === 'en' && originalExists) {
          trans.downloadFile = `/downloads/${originalFile}`;
          log(`  -> Tradução 'en': apontando para arquivo completo: /downloads/${originalFile}`);
        }
        
        // If Portuguese (pt-br or pt-pt) and we have a complete PT file in downloads
        if ((lang === 'pt-br' || lang === 'pt-pt')) {
          const ptFile = `${baseId}-${lang}.txt`;
          if (fs.existsSync(path.join(DOWNLOADS_DIR, ptFile))) {
            trans.downloadFile = `/downloads/${ptFile}`;
            log(`  -> Tradução '${lang}': apontando para arquivo completo: /downloads/${ptFile}`);
          }
        }
      });
    }

    // Special fix for memorias-postumas since it doesn't have translation fields in JSON,
    // we want to create translations or set downloadFile directly
    if (baseId === 'memorias-postumas') {
      book.downloadFile = '/downloads/memorias-postumas.txt';
      book.translations = book.translations || {};
      book.translations['pt-br'] = {
        title: "Memórias Póstumas de Brás Cubas",
        synopsis: book.synopsis,
        fullText: book.fullText,
        downloadFile: "/downloads/memorias-postumas-pt-br.txt"
      };
      book.translations['pt-pt'] = {
        title: "Memórias Póstumas de Brás Cubas",
        synopsis: book.synopsis,
        fullText: book.fullText,
        downloadFile: "/downloads/memorias-postumas-pt-pt.txt"
      };
      log("  -> Especial: configuradas as traduções completas para Memórias Póstumas.");
    }

    return book;
  });

  fs.writeFileSync(LIVROS_MOCK_PATH, JSON.stringify(updatedBooks, null, 2), 'utf-8');
  log("livros-mock.json atualizado com sucesso!", "SUCCESS");
}

run();
