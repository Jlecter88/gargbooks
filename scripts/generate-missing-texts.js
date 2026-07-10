/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const DOWNLOADS_DIR = path.join(__dirname, "..", "public", "downloads");
const MOCK_PATH = path.join(__dirname, "..", "src", "data", "livros-mock.json");
const PROGRESS_PATH = path.join(__dirname, "..", "scripts", "progress.json");
const LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions";
const MODEL_NAME = process.env.LM_MODEL || "gemma-4-e4b-uncensored-hauhaucs-aggressive";

const TARGET_DIR = process.argv.includes("--downloads")
  ? path.resolve(process.argv[process.argv.indexOf("--downloads") + 1])
  : DOWNLOADS_DIR;

const WORKS = [
  { id: "bn000067", title: "Dom Casmurro",                    author: "Machado de Assis" },
  { id: "bn000069", title: "Quincas Borba",                   author: "Machado de Assis" },
  { id: "bn000070", title: "O Alienista",                     author: "Machado de Assis" },
  { id: "bn000082", title: "Helena",                          author: "Machado de Assis" },
  { id: "bn000083", title: "Iaiá Garcia",                     author: "Machado de Assis" },
  { id: "bn000084", title: "Esaú e Jacó",                     author: "Machado de Assis" },
  { id: "bn000085", title: "Memorial de Aires",               author: "Machado de Assis" },
  { id: "bn000086", title: "Ressurreição",                    author: "Machado de Assis" },
  { id: "bn000087", title: "A Mão e a Luva",                  author: "Machado de Assis" },
  { id: "bn000088", title: "Várias Histórias",                author: "Machado de Assis" },
  { id: "bn000089", title: "Páginas Recolhidas",              author: "Machado de Assis" },
  { id: "bn000090", title: "Relíquias de Casa Velha",         author: "Machado de Assis" },
  { id: "bn000071", title: "Iracema",                         author: "José de Alencar" },
  { id: "bn000072", title: "O Guarani",                       author: "José de Alencar" },
  { id: "bn000073", title: "Senhora",                         author: "José de Alencar" },
  { id: "bn000078", title: "Lucíola",                         author: "José de Alencar" },
  { id: "bn000079", title: "Diva",                            author: "José de Alencar" },
  { id: "bn000080", title: "Til",                             author: "José de Alencar" },
  { id: "bn000081", title: "O Sertanejo",                     author: "José de Alencar" },
  { id: "bn000091", title: "Ubirajara",                       author: "José de Alencar" },
  { id: "bn000092", title: "As Minas de Prata",               author: "José de Alencar" },
  { id: "bn000093", title: "Sonhos D'Ouro",                   author: "José de Alencar" },
  { id: "bn000094", title: "Encarnação",                      author: "José de Alencar" },
  { id: "bn000074", title: "O Cortiço",                       author: "Aluísio Azevedo" },
  { id: "bn000095", title: "O Mulato",                        author: "Aluísio Azevedo" },
  { id: "bn000096", title: "Casa de Pensão",                  author: "Aluísio Azevedo" },
  { id: "bn000097", title: "O Livro de uma Sogra",            author: "Aluísio Azevedo" },
  { id: "bn000075", title: "O Navio Negreiro",                author: "Castro Alves" },
  { id: "bn000098", title: "Espumas Flutuantes",              author: "Castro Alves" },
  { id: "bn000099", title: "Hinos do Equador",                author: "Castro Alves" },
  { id: "bn000100", title: "Gonzaga ou a Revolução de Minas", author: "Castro Alves" },
  { id: "bn000076", title: "Noite na Taverna",                author: "Álvares de Azevedo" },
  { id: "bn000101", title: "Lira dos Vinte Anos",             author: "Álvares de Azevedo" },
  { id: "bn000102", title: "Macário",                         author: "Álvares de Azevedo" },
  { id: "bn000077", title: "A Moreninha",                     author: "Joaquim Manuel de Macedo" },
  { id: "bn000103", title: "O Moço Loiro",                    author: "Joaquim Manuel de Macedo" },
  { id: "bn000104", title: "Os Dois Amores",                  author: "Joaquim Manuel de Macedo" },
  { id: "bn000105", title: "Marília de Dirceu",               author: "Tomás Antônio Gonzaga" },
  { id: "bn000106", title: "Cartas Chilenas",                 author: "Tomás Antônio Gonzaga" },
  { id: "bn000107", title: "O Uruguay",                       author: "Basílio da Gama" },
  { id: "bn000108", title: "Caramuru",                        author: "Frei José de Santa Rita Durão" },
  { id: "bn000109", title: "I-Juca-Pirama",                   author: "Gonçalves Dias" },
  { id: "bn000110", title: "Os Timbiras",                     author: "Gonçalves Dias" },
  { id: "bn000111", title: "Primeiros Cantos",                author: "Gonçalves Dias" },
  { id: "bn000112", title: "As Primaveras",                   author: "Casimiro de Abreu" },
  { id: "bn000113", title: "Suspiros Poéticos e Saudades",    author: "Gonçalves de Magalhães" },
  { id: "bn000114", title: "A Confederação dos Tamoios",      author: "Gonçalves de Magalhães" },
  { id: "bn000115", title: "A Escrava Isaura",                author: "Bernardo Guimarães" },
  { id: "bn000116", title: "O Seminarista",                   author: "Bernardo Guimarães" },
  { id: "bn000117", title: "Inocência",                       author: "Visconde de Taunay" },
  { id: "bn000118", title: "O Ateneu",                        author: "Raul Pompeia" },
  { id: "bn000119", title: "Canções Sem Palavras",            author: "Raul Pompeia" },
];

const WIKI_PAGES = {
  "bn000077": "A_Moreninha", "bn000078": "Lucíola", "bn000079": "Diva",
  "bn000080": "Til", "bn000081": "O_Sertanejo", "bn000082": "Helena",
  "bn000083": "Iaiá_Garcia", "bn000084": "Esaú_e_Jacó", "bn000095": "O_Mulato",
  "bn000105": "Marília_de_Dirceu", "bn000106": "Cartas_Chilenas",
  "bn000109": "I-Juca-Pirama", "bn000112": "As_Primaveras",
  "bn000113": "Suspiros_Poéticos_e_Saudades", "bn000117": "Inocência",
};

function toSlug(title) {
  return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function log(msg, type = "INFO") {
  const icon = { SUCCESS: "✅", ERROR: "❌", WARN: "⚠️", LLM: "🤖" }[type] || "ℹ️";
  console.log(`${icon} [${type}] ${msg}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── SOURCES ───

async function tryLocal(slug) {
  const p = path.join(TARGET_DIR, `${slug}.txt`);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : null;
}

async function tryGutendex(title) {
  try {
    const r = await fetch("https://gutendex.com/books/?languages=pt&search=" + encodeURIComponent(title), { signal: AbortSignal.timeout(10000) });
    if (!r.ok) return null;
    const data = await r.json();
    const match = data.results?.find((b) => {
      const words = title.toLowerCase().split(" ").filter((w) => w.length > 3);
      return words.some((w) => b.title.toLowerCase().includes(w));
    }) || data.results?.[0];
    if (!match) return null;
    const g = await fetch(`https://www.gutenberg.org/cache/epub/${match.id}/pg${match.id}.txt`, {
      signal: AbortSignal.timeout(30000),
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    if (!g.ok) return null;
    let text = await g.text();
    const si = text.indexOf("*** START OF THE PROJECT GUTENBERG");
    const ei = text.indexOf("*** END OF THE PROJECT GUTENBERG");
    if (si !== -1) text = text.substring(text.indexOf("\n", si) + 1);
    if (ei !== -1) text = text.substring(0, text.indexOf("*** END OF THE PROJECT GUTENBERG"));
    return text.trim();
  } catch { return null; }
}

async function tryWikisource(id) {
  const page = WIKI_PAGES[id];
  if (!page) return null;
  try {
    const r = await fetch(`https://pt.wikisource.org/w/index.php?title=${encodeURIComponent(page)}&action=raw`, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) return null;
    const text = await r.text();
    return text && text.length > 500 ? text : null;
  } catch { return null; }
}

// ─── LM STUDIO ───

async function tryLMStudio(title, author) {
  const CHAPTER_SIZES = {
    "Memorial de Aires": 25, "Ressurreição": 18, "Várias Histórias": 12,
    "Páginas Recolhidas": 10, "Relíquias de Casa Velha": 12,
    "Sonhos D'Ouro": 15, "Encarnação": 10, "Casa de Pensão": 20,
    "O Livro de uma Sogra": 15, "Espumas Flutuantes": 8,
    "Hinos do Equador": 6, "Gonzaga ou a Revolução de Minas": 8,
    "Noite na Taverna": 7, "Macário": 5, "A Moreninha": 15,
    "O Moço Loiro": 14, "Marília de Dirceu": 3,
    "O Uruguay": 5, "Caramuru": 10, "Os Timbiras": 10,
    "Primeiros Cantos": 8, "Suspiros Poéticos e Saudades": 5,
    "A Confederação dos Tamoios": 10, "O Ateneu": 12,
    "Canções Sem Palavras": 8,
  };
  const chapters = CHAPTER_SIZES[title] || 10;

  log(`Gerando ${chapters} capítulos via LM Studio...`, "LLM");
  const chapters_text = [];

  for (let ch = 1; ch <= chapters; ch++) {
    process.stdout.write(`  Capítulo ${ch}/${chapters}... `);
    try {
      const body = {
        model: MODEL_NAME,
        messages: [
          { role: "system", content: "Você é um escritor brasileiro especializado em literatura clássica. Gere o texto completo e fiel do capítulo solicitado, em português brasileiro, no estilo do autor original." },
          { role: "user", content: `Gere o texto completo do Capítulo ${ch} de "${title}" de ${author}. Escreva em português brasileiro, no estilo literário da obra original. O capítulo deve ter cerca de 2000-4000 palavras e incluir diálogos e narração detalhada. Comece com "## Capítulo ${ch}" e continue o texto naturalmente.` },
        ],
        temperature: 0.7,
        max_tokens: 8192,
      };
      const r = await fetch(LM_STUDIO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000),
      });
      if (!r.ok) { process.stdout.write(`erro HTTP ${r.status}\n`); break; }
      const data = await r.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) { process.stdout.write("resposta vazia\n"); break; }
      chapters_text.push(content);
      process.stdout.write(`${content.length} chars\n`);
    } catch (err) {
      process.stdout.write(`erro: ${err.message}\n`);
      break;
    }
    await sleep(500);
  }

  if (chapters_text.length === 0) return null;
  return chapters_text.join("\n\n");
}

// ─── MAIN ───

async function main() {
  log("GERADOR DE TEXTOS — Fontes reais + LM Studio fallback");
  log(`Modelo: ${MODEL_NAME}`);
  log(`Target: ${TARGET_DIR}`);
  console.log();

  if (!fs.existsSync(TARGET_DIR)) fs.mkdirSync(TARGET_DIR, { recursive: true });

  let progress = {};
  if (fs.existsSync(PROGRESS_PATH)) progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf-8"));
  if (!progress.missingTexts) progress.missingTexts = {};

  let mock = JSON.parse(fs.readFileSync(MOCK_PATH, "utf-8"));

  let ok = 0, fail = 0, skip = 0;

  for (let i = 0; i < WORKS.length; i++) {
    const w = WORKS[i];
    const slug = toSlug(w.title);
    const entry = mock.find((b) => b.id === slug);
    if (!entry) { skip++; continue; }

    const file = path.join(TARGET_DIR, `${slug}.txt`);
    if (fs.existsSync(file) && fs.statSync(file).size > 500) { skip++; continue; }

    if (progress.missingTexts[w.id] === "done") { skip++; continue; }

    log(`[${i + 1}/${WORKS.length}] ${w.title} (${w.author})`);

    let text = null;

    text = await tryLocal(slug);
    if (text) log("  Fonte: local", "SUCCESS");

    if (!text) { text = await tryGutendex(w.title); if (text) log("  Fonte: Gutendex", "SUCCESS"); }

    if (!text) { text = await tryWikisource(w.id); if (text) log("  Fonte: Wikisource", "SUCCESS"); }

    if (!text) {
      log(`  Nenhuma fonte real. Tentando LM Studio...`, "LLM");
      text = await tryLMStudio(w.title, w.author);
      if (text) log(`  Texto gerado via LLM (${text.length} chars)`, "SUCCESS");
    }

    if (text) {
      fs.writeFileSync(file, text, "utf-8");
      progress.missingTexts[w.id] = "done";
      ok++;

      // Extrair preview e atualizar entry
      const lines = text.split("\n");
      let h2 = 0, previewIdx = text.length;
      for (let j = 0; j < lines.length; j++) {
        if (lines[j].startsWith("## ") || lines[j].startsWith("##")) { h2++; if (h2 === 2) { previewIdx = lines.slice(0, j).join("\n").trim().length; break; } }
      }
      const preview = previewIdx < text.length ? text.substring(0, previewIdx) : (text.length > 5000 ? text.substring(0, 5000) : text);
      entry.fullText = preview;
      entry.downloadFile = `/downloads/${slug}.txt`;
      if (entry.language === "pt-br" && text.length > 1000) {
        entry.language = "pt-br";
      }
    } else {
      progress.missingTexts[w.id] = "failed";
      fail++;
    }

    fs.writeFileSync(MOCK_PATH, JSON.stringify(mock, null, 2), "utf-8");
    fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), "utf-8");
    await sleep(500);
  }

  console.log(`\n✅ ${ok} textos salvos`);
  console.log(`⏭️  ${skip} já existentes`);
  if (fail > 0) console.log(`❌ ${fail} falhas`);
}

main().catch(console.error);
