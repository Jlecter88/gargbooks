import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  const key = process.env.GOOGLE_BOOKS_API_KEY || "";

  if (!key) {
    console.warn("⚠️ GOOGLE_BOOKS_API_KEY não configurada — requisições limitadas a 10/dia sem chave.");
  }

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&printType=books${key ? `&key=${key}` : ""}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (response.status === 403) {
      return NextResponse.json({
        error: "Cota de requisições diárias excedida. Tente novamente amanhã ou configure uma chave de API do Google Books.",
        results: []
      });
    }
    if (!response.ok) {
      console.error(`Google Books API returned status ${response.status}`);
      return NextResponse.json({ error: "Erro ao consultar catálogo de livros." }, { status: response.status });
    }

    const data = await response.json();
    const items = data.items || [];

    const gradients = [
      "from-stone-900 via-neutral-950 to-neutral-900",
      "from-cyan-950 via-zinc-900 to-emerald-950",
      "from-red-950 via-neutral-900 to-zinc-950",
      "from-emerald-950 via-teal-900 to-zinc-950",
      "from-blue-950 via-indigo-950 to-neutral-900",
      "from-purple-950 via-slate-950 to-neutral-900"
    ];

    const results = items.map((item: any) => {
      const volumeInfo = item.volumeInfo || {};
      const title = volumeInfo.title || "Obra Sem Título";
      const authors = volumeInfo.authors || [];
      const author = authors.length > 0 ? authors.join(", ") : "Autor Desconhecido";
      const firstAuthor = authors.length > 0 ? authors[0] : "";
      
      const publishedDate = volumeInfo.publishedDate || "";
      const year = publishedDate ? parseInt(publishedDate.substring(0, 4)) : new Date().getFullYear();
      
      // Deterministic gradient selection based on title
      let hash = 0;
      for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
      }
      const coverGradient = gradients[Math.abs(hash) % gradients.length];
      
      // Official cover image
      let coverImage = null;
      if (volumeInfo.imageLinks) {
        coverImage = volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail || null;
        if (coverImage && coverImage.startsWith("http://")) {
          coverImage = coverImage.replace("http://", "https://");
        }
      }

      const isbnObj = volumeInfo.industryIdentifiers?.find((id: any) => id.type === "ISBN_13" || id.type === "ISBN_10");
      const isbn = isbnObj ? isbnObj.identifier : "978-XXXXXXXXXX";
      const pages = volumeInfo.pageCount || 280;

      // Price generation based on pages count
      const priceBR = parseFloat((29.90 + (pages % 50)).toFixed(2));
      const pricePT = parseFloat((8.99 + ((pages % 20) * 0.8)).toFixed(2));

      return {
        id: `google-${item.id}`,
        title: title,
        author: author,
        year: year,
        genres: volumeInfo.categories || ["Edição Comercial"],
        rating: volumeInfo.averageRating || 4.5,
        coverGradient: coverGradient,
        coverImage: coverImage,
        synopsis: volumeInfo.description || `Edição comercial do livro "${title}". Disponível para compra física e digital através de nossos parceiros afiliados.`,
        fullText: "Esta obra está protegida por direitos autorais. Leitura online indisponível.",
        type: "livro",
        publicDomain: false,
        language: volumeInfo.language === "pt" ? "pt-br" : "en",
        editions: [
          {
            id: `ed-${item.id}`,
            publisher: volumeInfo.publisher || "Editora Comercial",
            year: year,
            isbn: isbn,
            pages: pages,
            coverType: "Brochura / Capa Comum / Digital",
            priceBR: priceBR,
            pricePT: pricePT,
            linkBR: `https://www.amazon.com.br/s?k=${encodeURIComponent(title + " " + firstAuthor)}&tag=${process.env.AMAZON_AFFILIATE_TAG_BR || "prycco-20"}`,
            linkPT: `https://www.amazon.es/s?k=${encodeURIComponent(title + " " + firstAuthor)}&tag=${process.env.AMAZON_AFFILIATE_TAG_PT || "prycco-21"}`
          }
        ],
        reviews: [],
        translations: {}
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error in Amazon Search API Route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
