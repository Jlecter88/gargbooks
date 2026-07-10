/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const DOWNLOADS_DIR = path.join(__dirname, "..", "public", "downloads");
const MOCK_PATH = path.join(__dirname, "..", "src", "data", "livros-mock.json");
const PROGRESS_PATH = path.join(__dirname, "progress.json");

const DOMINIO_PUBLICO = [
  { id: "bn000067", title: "Dom Casmurro",                    author: "Machado de Assis",      year: 1899 },
  { id: "bn000068", title: "Memórias Póstumas de Brás Cubas", author: "Machado de Assis",      year: 1881 },
  { id: "bn000069", title: "Quincas Borba",                   author: "Machado de Assis",      year: 1891 },
  { id: "bn000070", title: "O Alienista",                     author: "Machado de Assis",      year: 1882 },
  { id: "bn000082", title: "Helena",                          author: "Machado de Assis",      year: 1876 },
  { id: "bn000083", title: "Iaiá Garcia",                     author: "Machado de Assis",      year: 1878 },
  { id: "bn000084", title: "Esaú e Jacó",                     author: "Machado de Assis",      year: 1904 },
  { id: "bn000085", title: "Memorial de Aires",               author: "Machado de Assis",      year: 1908 },
  { id: "bn000086", title: "Ressurreição",                    author: "Machado de Assis",      year: 1872 },
  { id: "bn000087", title: "A Mão e a Luva",                  author: "Machado de Assis",      year: 1874 },
  { id: "bn000088", title: "Várias Histórias",                author: "Machado de Assis",      year: 1896 },
  { id: "bn000089", title: "Páginas Recolhidas",              author: "Machado de Assis",      year: 1899 },
  { id: "bn000090", title: "Relíquias de Casa Velha",         author: "Machado de Assis",      year: 1906 },
  { id: "bn000071", title: "Iracema",                         author: "José de Alencar",       year: 1865 },
  { id: "bn000072", title: "O Guarani",                       author: "José de Alencar",       year: 1857 },
  { id: "bn000073", title: "Senhora",                         author: "José de Alencar",       year: 1875 },
  { id: "bn000078", title: "Lucíola",                         author: "José de Alencar",       year: 1862 },
  { id: "bn000079", title: "Diva",                            author: "José de Alencar",       year: 1864 },
  { id: "bn000080", title: "Til",                             author: "José de Alencar",       year: 1872 },
  { id: "bn000081", title: "O Sertanejo",                     author: "José de Alencar",       year: 1875 },
  { id: "bn000091", title: "Ubirajara",                       author: "José de Alencar",       year: 1874 },
  { id: "bn000092", title: "As Minas de Prata",               author: "José de Alencar",       year: 1865 },
  { id: "bn000093", title: "Sonhos D'Ouro",                   author: "José de Alencar",       year: 1872 },
  { id: "bn000094", title: "Encarnação",                      author: "José de Alencar",       year: 1877 },
  { id: "bn000074", title: "O Cortiço",                       author: "Aluísio Azevedo",       year: 1890 },
  { id: "bn000095", title: "O Mulato",                        author: "Aluísio Azevedo",       year: 1881 },
  { id: "bn000096", title: "Casa de Pensão",                  author: "Aluísio Azevedo",       year: 1884 },
  { id: "bn000097", title: "O Livro de uma Sogra",            author: "Aluísio Azevedo",       year: 1895 },
  { id: "bn000075", title: "O Navio Negreiro",                author: "Castro Alves",          year: 1880 },
  { id: "bn000098", title: "Espumas Flutuantes",              author: "Castro Alves",          year: 1870 },
  { id: "bn000099", title: "Hinos do Equador",                author: "Castro Alves",          year: 1875 },
  { id: "bn000100", title: "Gonzaga ou a Revolução de Minas", author: "Castro Alves",          year: 1875 },
  { id: "bn000076", title: "Noite na Taverna",                author: "Álvares de Azevedo",    year: 1855 },
  { id: "bn000101", title: "Lira dos Vinte Anos",             author: "Álvares de Azevedo",    year: 1853 },
  { id: "bn000102", title: "Macário",                         author: "Álvares de Azevedo",    year: 1855 },
  { id: "bn000077", title: "A Moreninha",                     author: "Joaquim Manuel de Macedo", year: 1844 },
  { id: "bn000103", title: "O Moço Loiro",                    author: "Joaquim Manuel de Macedo", year: 1845 },
  { id: "bn000104", title: "Os Dois Amores",                  author: "Joaquim Manuel de Macedo", year: 1848 },
  { id: "bn000105", title: "Marília de Dirceu",               author: "Tomás Antônio Gonzaga",  year: 1792 },
  { id: "bn000106", title: "Cartas Chilenas",                 author: "Tomás Antônio Gonzaga",  year: 1789 },
  { id: "bn000107", title: "O Uruguay",                       author: "Basílio da Gama",        year: 1769 },
  { id: "bn000108", title: "Caramuru",                        author: "Frei José de Santa Rita Durão", year: 1781 },
  { id: "bn000109", title: "I-Juca-Pirama",                   author: "Gonçalves Dias",         year: 1851 },
  { id: "bn000110", title: "Os Timbiras",                     author: "Gonçalves Dias",         year: 1857 },
  { id: "bn000111", title: "Primeiros Cantos",                author: "Gonçalves Dias",         year: 1846 },
  { id: "bn000112", title: "As Primaveras",                   author: "Casimiro de Abreu",      year: 1859 },
  { id: "bn000113", title: "Suspiros Poéticos e Saudades",    author: "Gonçalves de Magalhães", year: 1836 },
  { id: "bn000114", title: "A Confederação dos Tamoios",      author: "Gonçalves de Magalhães", year: 1856 },
  { id: "bn000115", title: "A Escrava Isaura",                author: "Bernardo Guimarães",     year: 1875 },
  { id: "bn000116", title: "O Seminarista",                   author: "Bernardo Guimarães",     year: 1872 },
  { id: "bn000117", title: "Inocência",                       author: "Visconde de Taunay",     year: 1872 },
  { id: "bn000118", title: "O Ateneu",                        author: "Raul Pompeia",           year: 1888 },
  { id: "bn000119", title: "Canções Sem Palavras",            author: "Raul Pompeia",           year: 1881 },
];

function toSlug(title) {
  return title
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractPreview(text) {
  const lines = text.split("\n");
  let headingCount = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("## ") || lines[i].startsWith("##")) {
      headingCount++;
      if (headingCount === 2) {
        const preview = lines.slice(0, i).join("\n").trim();
        if (preview.length < 1000 && headingCount < 10) {
          continue;
        }
        return preview;
      }
    }
  }

  if (text.length <= 10000) return text;
  return text.substring(0, 5000) + "\n\n[...continua...]";
}

function log(msg, type = "INFO") {
  const icon = type === "SUCCESS" ? "✅" : type === "ERROR" ? "❌" : type === "WARN" ? "⚠️" : "ℹ️";
  console.log(`${icon} [${type}] ${msg}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryGutendex(title) {
  try {
    const q = encodeURIComponent(title.replace(/['']/g, "").split("(")[0].trim());
    const res = await fetch(`https://gutendex.com/books/?languages=pt&search=${q}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    const match = data.results.find((b) => {
      const titleWords = title.toLowerCase().split(" ").filter((w) => w.length > 3);
      const matchTitle = titleWords.some((w) => b.title.toLowerCase().includes(w));
      return matchTitle;
    });
    return match || data.results[0];
  } catch {
    return null;
  }
}

async function fetchGutenbergText(gbook) {
  try {
    const url = `https://www.gutenberg.org/cache/epub/${gbook.id}/pg${gbook.id}.txt`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(30000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (!res.ok) return null;
    const text = await res.text();

    let clean = text;
    const startIdx = text.indexOf("*** START OF THE PROJECT GUTENBERG");
    const endIdx = text.indexOf("*** END OF THE PROJECT GUTENBERG");
    if (startIdx !== -1) {
      const startLineEnd = text.indexOf("\n", startIdx);
      clean = text.substring(startLineEnd !== -1 ? startLineEnd : startIdx);
    }
    if (endIdx !== -1) {
      clean = clean.substring(0, clean.indexOf("*** END OF THE PROJECT GUTENBERG"));
    }
    return clean.trim();
  } catch {
    return null;
  }
}

async function tryWikisource(title, slug) {
  const candidates = [
    title.replace(/ /g, "_"),
    title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "_"),
    title.replace(/['']/g, "").replace(/ /g, "_"),
  ];

  for (const cand of [...new Set(candidates)]) {
    try {
      const url = `https://pt.wikisource.org/w/index.php?title=${encodeURIComponent(cand)}&action=raw`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 500) return text;
      }
    } catch {
      /* next candidate */
    }
  }
  return null;
}

async function tryLocalFile(slug) {
  const filePath = path.join(DOWNLOADS_DIR, `${slug}.txt`);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf-8");
  }
  return null;
}

async function fetchAndSavePreview() {
  let progress = {};
  if (fs.existsSync(PROGRESS_PATH)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf-8"));
  }
  if (!progress.previews) progress.previews = {};

  let mockData = JSON.parse(fs.readFileSync(MOCK_PATH, "utf-8"));
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < DOMINIO_PUBLICO.length; i++) {
    const work = DOMINIO_PUBLICO[i];
    const slug = toSlug(work.title);
    const entry = mockData.find((b) => b.id === slug);
    if (!entry) {
      log(`[${i + 1}/${DOMINIO_PUBLICO.length}] ${work.title} — sem entry no mock`, "WARN");
      skipped++;
      continue;
    }

    if (entry.fullText && entry.fullText.length >= 500) {
      log(`[${i + 1}/${DOMINIO_PUBLICO.length}] ${work.title} — já tem preview (${entry.fullText.length} chars)`);
      skipped++;
      continue;
    }

    if (progress.previews[work.id] === true) {
      log(`[${i + 1}/${DOMINIO_PUBLICO.length}] ${work.title} — já processado`);
      skipped++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${DOMINIO_PUBLICO.length}] ${work.title}... `);

    let fullText = null;

    fullText = await tryLocalFile(slug);
    if (fullText) {
      process.stdout.write(`local ✓ `);
    }

    if (!fullText) {
      const match = await tryGutendex(work.title);
      if (match) {
        process.stdout.write(`gutendex #${match.id}... `);
        fullText = await fetchGutenbergText(match);
        if (fullText) process.stdout.write(`✓ `);
      }
    }

    if (!fullText) {
      const lastSlug = toSlug(work.title);
      fullText = await tryWikisource(work.title, lastSlug);
      if (fullText) process.stdout.write(`wikisource ✓ `);
    }

    if (fullText) {
      const preview = extractPreview(fullText);
      entry.fullText = preview;
      progress.previews[work.id] = true;
      fs.writeFileSync(MOCK_PATH, JSON.stringify(mockData, null, 2), "utf-8");
      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), "utf-8");
      process.stdout.write(`(${preview.length} chars)\n`);
      updated++;
    } else {
      progress.previews[work.id] = false;
      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), "utf-8");
      process.stdout.write(`❌ nenhuma fonte\n`);
      failed++;
    }

    await sleep(1200);
  }

  console.log(`\n✅ ${updated} previews extraídos`);
  console.log(`⏭️  ${skipped} já tinham preview`);
  console.log(`❌ ${failed} sem fonte disponível`);
}

fetchAndSavePreview().catch(console.error);
