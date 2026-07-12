import { NextResponse } from "next/server";

const ML_AFFILIATE_MATT_TOOL = "49364275";
const ML_AFFILIATE_MATT_WORD = "prycco";
const MLB_CATEGORY_BOOKS = "MLB1196"; // Livros, Revistas e Comics

/** Item retornado pela API do Mercado Livre */
interface MlApiItem {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  currency_id: string;
  thumbnail?: string;
  condition: "new" | "used";
  permalink: string;
  category_id?: string;
  seller?: { id?: number; nickname?: string };
  installments?: { quantity: number; amount: number };
}

/** Item normalizado para o frontend */
interface MlResultItem {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  currency: string;
  installments: { quantity: number; amount: number } | null;
  thumbnail: string | null;
  condition: "Novo" | "Usado";
  store: string;
  link: string;
  categoryId?: string;
  sellerId?: number;
}

/** Resposta paginada da API do ML */
interface MlApiResponse {
  results: MlApiItem[];
  paging?: { total: number };
}

/**
 * Injeta parâmetros de afiliado do Mercado Livre na URL do produto.
 * Formato: &matt_tool=49364275&matt_word=prycco&forceInApp=true
 */
function injectMlAffiliate(url: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("matt_tool", ML_AFFILIATE_MATT_TOOL);
    parsed.searchParams.set("matt_word", ML_AFFILIATE_MATT_WORD);
    parsed.searchParams.set("forceInApp", "true");
    return parsed.toString();
  } catch {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}matt_tool=${ML_AFFILIATE_MATT_TOOL}&matt_word=${ML_AFFILIATE_MATT_WORD}&forceInApp=true`;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: "Parâmetro 'q' é obrigatório.", results: [] }, { status: 400 });
  }

  try {
    // Estratégia 1: Busca autenticada (tenta com token público primeiro)
    let searchUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=20&sort=relevance`;

    // Adiciona filtro de categoria se parecer ser livro (para evitar eletrônicos)
    const isBookQuery = /livro|romance|conto|poesia|literatura|clássico|obra|conto|autores?/i.test(query);
    if (isBookQuery) {
      searchUrl += `&category=${MLB_CATEGORY_BOOKS}`;
    }

    const response = await fetch(searchUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      // Estratégia 2: Fallback sem filtro de categoria
      const fallbackUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=20&sort=relevance`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(10000),
      });
      if (!fallbackRes.ok) {
        return NextResponse.json(
          { error: "Mercado Livre temporariamente indisponível. Tente novamente.", results: [] },
          { status: 503 }
        );
      }
      const fallbackData: MlApiResponse = await fallbackRes.json();
      return processResults(fallbackData, query);
    }

    const data: MlApiResponse = await response.json();
    return processResults(data, query);
  } catch (error) {
    console.error("Erro ao consultar Mercado Livre:", error);
    return NextResponse.json(
      { error: "Erro ao consultar Mercado Livre. Verifique sua conexão.", results: [] },
      { status: 500 }
    );
  }
}

function processResults(data: MlApiResponse, query: string): NextResponse {
  const results: MlResultItem[] = (data.results || []).map((item: MlApiItem) => ({
    id: `ml-${item.id}`,
    title: item.title,
    author: item.seller?.nickname || "Vendedor Mercado Livre",
    price: item.price,
    originalPrice: item.original_price,
    currency: item.currency_id === "BRL" ? "BRL" : "BRL",
    installments: item.installments
      ? {
          quantity: item.installments.quantity,
          amount: item.installments.amount,
        }
      : null,
    thumbnail: item.thumbnail?.replace("http://", "https://") ?? null,
    condition: item.condition === "new" ? "Novo" : "Usado",
    store: "Mercado Livre",
    link: injectMlAffiliate(item.permalink),
    categoryId: item.category_id,
    sellerId: item.seller?.id,
  }));

  // Ordenar: novos primeiro, depois menor preço
  results.sort((a: MlResultItem, b: MlResultItem) => {
    if (a.condition === "Novo" && b.condition !== "Novo") return -1;
    if (a.condition !== "Novo" && b.condition === "Novo") return 1;
    return a.price - b.price;
  });

  return NextResponse.json({
    results,
    total: data.paging?.total || results.length,
    query,
    source: "mercadolivre",
  });
}
