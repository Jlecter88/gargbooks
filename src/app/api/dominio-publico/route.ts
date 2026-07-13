import { NextResponse } from "next/server";

interface GutendexBook {
  id: number;
  title: string;
  authors?: Array<{ name: string }>;
  languages?: string[];
  formats?: Record<string, string>;
}

const GUTENDEX_PT = "https://gutendex.com/books/?languages=pt&search=";

function cleanDominioPublicoText(rawText: string): string {
  const lines = rawText.split("\n");
  let startIdx = 0;
  let endIdx = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim().toLowerCase();
    if (
      trimmed.includes("domínio público") ||
      trimmed.includes("ministerio da educacao") ||
      trimmed.includes("ministerio da educação") ||
      trimmed.includes("fundação biblioteca nacional") ||
      trimmed.includes("fundacao biblioteca nacional") ||
      trimmed.includes("====") ||
      trimmed.includes("---") && trimmed.length < 20
    ) {
      const nextNonEmpty = lines.slice(i + 1).findIndex(l => l.trim().length > 0);
      if (nextNonEmpty !== -1 && nextNonEmpty < 5) {
        startIdx = i + nextNonEmpty + 1;
        break;
      }
    }
  }

  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim().toLowerCase();
    if (
      trimmed.includes("====") ||
      trimmed.includes("este texto foi digitalizado") ||
      trimmed.includes("obtido em") ||
      trimmed.includes("domínio público") ||
      trimmed.includes("formato") && trimmed.includes("texto") ||
      trimmed.includes("http://www.dominiopublico.gov.br")
    ) {
      endIdx = i;
    }
  }

  return lines.slice(startIdx, endIdx).join("\n").trim();
}

function cleanGutenbergText(rawText: string): string {
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

async function tryDominioPublico(id: string): Promise<string | null> {
  const url = `http://www.dominiopublico.gov.br/download/texto/${id}.txt`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const rawText = await response.text();
    return cleanDominioPublicoText(rawText);
  } catch {
    return null;
  }
}

async function tryGutendex(title: string): Promise<string | null> {
  try {
    const searchRes = await fetch(`${GUTENDEX_PT}${encodeURIComponent(title)}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!searchRes.ok) return null;
    const data = await searchRes.json();
    if (!data.results || data.results.length === 0) return null;

    const results: GutendexBook[] = data.results;
    const match = results.find((b: GutendexBook) => {
      const titleWords = title.toLowerCase().split(" ").filter((w: string) => w.length > 3);
      return titleWords.some((w: string) => b.title.toLowerCase().includes(w));
    }) || results[0];
    if (!match) return null;

    const gUrl = `https://www.gutenberg.org/cache/epub/${match.id}/pg${match.id}.txt`;
    const gRes = await fetch(gUrl, {
      signal: AbortSignal.timeout(30000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!gRes.ok) return null;
    const text = await gRes.text();
    return cleanGutenbergText(text);
  } catch {
    return null;
  }
}

// Mapa de IDs DP → títulos para fallback no Gutendex
const DP_TITLE_MAP: Record<string, string> = {
  "bn000067": "Dom Casmurro",
  "bn000068": "Memórias Póstumas de Brás Cubas",
  "bn000069": "Quincas Borba",
  "bn000070": "O Alienista",
  "bn000082": "Helena",
  "bn000083": "Iaiá Garcia",
  "bn000084": "Esaú e Jacó",
  "bn000085": "Memorial de Aires",
  "bn000086": "Ressurreição",
  "bn000087": "A Mão e a Luva",
  "bn000088": "Várias Histórias",
  "bn000089": "Páginas Recolhidas",
  "bn000090": "Relíquias de Casa Velha",
  "bn000071": "Iracema",
  "bn000072": "O Guarani",
  "bn000073": "Senhora",
  "bn000078": "Lucíola",
  "bn000079": "Diva",
  "bn000080": "Til",
  "bn000081": "O Sertanejo",
  "bn000091": "Ubirajara",
  "bn000092": "As Minas de Prata",
  "bn000093": "Sonhos D'Ouro",
  "bn000094": "Encarnação",
  "bn000074": "O Cortiço",
  "bn000095": "O Mulato",
  "bn000096": "Casa de Pensão",
  "bn000097": "O Livro de uma Sogra",
  "bn000075": "O Navio Negreiro",
  "bn000098": "Espumas Flutuantes",
  "bn000099": "Hinos do Equador",
  "bn000100": "Gonzaga ou a Revolução de Minas",
  "bn000076": "Noite na Taverna",
  "bn000101": "Lira dos Vinte Anos",
  "bn000102": "Macário",
  "bn000077": "A Moreninha",
  "bn000103": "O Moço Loiro",
  "bn000104": "Os Dois Amores",
  "bn000105": "Marília de Dirceu",
  "bn000106": "Cartas Chilenas",
  "bn000107": "O Uruguay",
  "bn000108": "Caramuru",
  "bn000109": "I-Juca-Pirama",
  "bn000110": "Os Timbiras",
  "bn000111": "Primeiros Cantos",
  "bn000112": "As Primaveras",
  "bn000113": "Suspiros Poéticos e Saudades",
  "bn000114": "A Confederação dos Tamoios",
  "bn000115": "A Escrava Isaura",
  "bn000116": "O Seminarista",
  "bn000117": "Inocência",
  "bn000118": "O Ateneu",
  "bn000119": "Canções Sem Palavras",
};

const WIKI_CANDIDATES: Record<string, string> = {
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

async function tryWikisource(id: string): Promise<string | null> {
  const page = WIKI_CANDIDATES[id];
  if (!page) return null;
  try {
    const url = `https://pt.wikisource.org/w/index.php?title=${encodeURIComponent(page)}&action=raw`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const text = await res.text();
    if (text && text.length > 500) return text;
  } catch { /* ignore */ }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID da obra não fornecido." }, { status: 400 });
  }

  let text: string | null = null;
  let source = "nenhuma";

  // 1. Try Domínio Público first
  text = await tryDominioPublico(id);
  if (text) source = "dominio-publico";

  // 2. Fallback: Wikisource
  if (!text) {
    text = await tryWikisource(id);
    if (text) source = "wikisource";
  }

  // 3. Fallback: Gutendex / Gutenberg (Portuguese)
  if (!text) {
    const title = DP_TITLE_MAP[id];
    if (title) {
      text = await tryGutendex(title);
      if (text) source = "gutenberg";
    }
  }

  // 4. Fallback: Archive.org (plain text)
  if (!text) {
    const title = DP_TITLE_MAP[id];
    if (title) {
      try {
        const searchUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(title)}+languageSorter:portuguese&fl[]=identifier&rows=3&page=1&output=json`;
        const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const docs = searchData?.response?.docs || [];
          if (docs.length > 0) {
            const iaId = docs[0].identifier;
            const textRes = await fetch(`https://archive.org/stream/${iaId}/${iaId}_djvu.txt`, {
              signal: AbortSignal.timeout(30000),
              headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            if (textRes.ok) {
              const rawText = await textRes.text();
              if (rawText.length > 500) {
                text = rawText;
                source = "archive-org";
              }
            }
          }
        }
      } catch { /* ignore */ }
    }
  }

  if (text) {
    return new NextResponse(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
        "X-Text-Source": source,
      },
    });
  }

  return NextResponse.json(
    { 
      error: "Obra não encontrada em nenhuma fonte disponível no momento.",
      tip: "Esta obra está em domínio público mas não foi encontrada nos acervos online disponíveis. Tente novamente mais tarde ou utilize a aba 'Catálogo Comercial' para buscar edições físicas."
    },
    { status: 404 }
  );
}
