import { readFileSync, writeFileSync } from 'fs';

const filePath = './src/data/livros-mock.json';
const data = JSON.parse(readFileSync(filePath, 'utf-8'));

// Find works with empty fullText
const empty = data.filter(b => !b.fullText || b.fullText.length === 0);
console.log('Obras com fullText vazio:', empty.length);

function tryCleanDominoPublico(text) {
  const lines = text.split('\n');
  let start = 0, end = lines.length;
  for (let i = 0; i < Math.min(40, lines.length); i++) {
    const t = lines[i].trim().toLowerCase();
    if (t.includes('domínio público') || t.includes('ministerio da educacao') || t.includes('ministerio da educação') || t.includes('===') || (t.includes('---') && t.length < 20)) {
      const nextNonEmpty = lines.slice(i + 1).findIndex(l => l.trim().length > 0);
      if (nextNonEmpty !== -1 && nextNonEmpty < 5) {
        start = i + nextNonEmpty + 1;
        break;
      }
    }
  }
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 30); i--) {
    const t = lines[i].trim().toLowerCase();
    if (t.includes('===') || t.includes('domínio público') || t.includes('obtido em') || t.includes('http://www.dominiopublico.gov.br')) {
      end = i;
    }
  }
  const cleaned = lines.slice(start, end).join('\n').trim();
  return cleaned.length > 80 ? cleaned : null;
}

// Gutendex search + text download
async function tryGutendexText(title) {
  try {
    const searchRes = await fetch(`https://gutendex.com/books/?languages=pt&search=${encodeURIComponent(title)}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!searchRes.ok) return null;
    const data = await searchRes.json();
    if (!data.results || data.results.length === 0) return null;
    
    // Find best match
    const match = data.results.find(b => {
      const words = title.toLowerCase().split(' ').filter(w => w.length > 3);
      return words.some(w => b.title.toLowerCase().includes(w));
    }) || data.results[0];
    
    if (!match || !match.id) return null;
    
    const textRes = await fetch(`https://www.gutenberg.org/cache/epub/${match.id}/pg${match.id}.txt`, {
      signal: AbortSignal.timeout(30000),
    });
    if (!textRes.ok) return null;
    const rawText = await textRes.text();
    
    // Clean Gutenberg headers/footers
    const startIdx = rawText.indexOf('*** START OF THE PROJECT GUTENBERG');
    const endIdx = rawText.indexOf('*** END OF THE PROJECT GUTENBERG');
    let cleanText = rawText;
    if (startIdx !== -1) {
      const lineEnd = rawText.indexOf('\n', startIdx);
      cleanText = rawText.substring(lineEnd !== -1 ? lineEnd : startIdx);
    }
    if (endIdx !== -1) {
      cleanText = cleanText.substring(0, cleanText.indexOf('*** END OF THE PROJECT GUTENBERG'));
    }
    cleanText = cleanText.trim();
    
    return cleanText.length > 200 ? cleanText : null;
  } catch {
    return null;
  }
}

async function tryDownload(book) {
  const match = book.downloadFile?.match(/id=([^&]+)/);
  const dpId = match ? match[1] : null;
  if (!dpId) {
    console.log('  -', book.id, 'sem downloadFile com ID');
    return null;
  }

  const WIKI_MAP = {
    "bn000077": "A_Moreninha",
    "bn000078": "Lucíola",
    "bn000079": "Diva",
    "bn000080": "Til",
    "bn000081": "O_Sertanejo",
    "bn000082": "Helena",
    "bn000083": "Iaiá_Garcia",
    "bn000084": "Esaú_e_Jacó",
    "bn000095": "O_Mulato",
    "bn000105": "Marília_de_Dirceu",
    "bn000106": "Cartas_Chilenas",
    "bn000109": "I-Juca-Pirama",
    "bn000112": "As_Primaveras",
    "bn000113": "Suspiros_Poéticos_e_Saudades",
    "bn000117": "Inocência",
  };

  // Source 1: Dominio Publico
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`http://www.dominiopublico.gov.br/download/texto/${dpId}.txt`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const text = await res.text();
      const cleaned = tryCleanDominoPublico(text);
      if (cleaned) return { source: 'Dominio Publico', text: cleaned };
    }
  } catch {}

  // Source 2: Wikisource
  const wikiPage = WIKI_MAP[dpId];
  if (wikiPage) {
    try {
      const res = await fetch(`https://pt.wikisource.org/w/index.php?title=${encodeURIComponent(wikiPage)}&action=raw`, {
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 500) return { source: 'Wikisource', text };
      }
    } catch {}
  }

  // Source 3: Gutendex
  const gutText = await tryGutendexText(book.title);
  if (gutText) return { source: 'Gutendex', text: gutText };

  return null;
}

let filled = 0;
for (const book of empty) {
  const result = await tryDownload(book);
  if (result) {
    book.fullText = result.text;
    if (book.translations && book.translations['pt-br']) {
      book.translations['pt-br'].fullText = result.text;
    }
    filled++;
    console.log(`  \u2705 ${book.id} (${result.source}) - ${result.text.length} chars`);
  } else {
    console.log(`  \u274c ${book.id}`);
  }
}

writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
console.log(`\nTotal preenchidos: ${filled} de ${empty.length}`);
