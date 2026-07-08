import { Book } from "@/context/BookContext";
import { User } from "@/utils/rpgMatchmaker";

export interface RecommendedBook {
  book: Book;
  score: number;
  reasons: string[];
}

/**
 * Gera uma lista de livros/contos recomendados para um usuário baseado no seu perfil literário.
 *
 * Critérios de pontuação:
 *  +3  por cada gênero favorito compartilhado
 *  +2  se o autor escreveu algo que o usuário já leu
 *  +1  por cada interest_tag compartilhada
 *  +1  se o livro está na wishlist do usuário (confirmar interesse)
 *  -10 se o livro já foi lido (nunca recomendar o que já leu)
 *  -10 se o livro é o que está sendo lido agora
 *
 * @param user  Perfil do usuário logado
 * @param books Lista completa de livros+contos disponíveis
 * @param limit Número máximo de recomendações retornadas
 */
export function getRecommendations(
  user: User,
  books: Book[],
  limit = 6
): RecommendedBook[] {
  const readIds = new Set((user.read_books ?? []).map((e) => e.bookId));
  const favoriteGenres = new Set((user.favorite_genres ?? []).map((g) => g.toLowerCase()));
  const interestTags = new Set((user.interest_tags ?? []).map((t) => t.toLowerCase()));
  const readAuthors = new Set(
    books
      .filter((b) => readIds.has(b.id))
      .map((b) => b.author.toLowerCase())
  );

  const scored: RecommendedBook[] = books.map((book) => {
    let score = 0;
    const reasons: string[] = [];

    // Already read → strongly penalise
    if (readIds.has(book.id)) {
      score -= 10;
    }

    // Currently reading → exclude
    if (user.reading_now === book.id) {
      score -= 10;
    }

    // Genre match
    const matchedGenres = book.genres.filter((g) => favoriteGenres.has(g.toLowerCase()));
    if (matchedGenres.length > 0) {
      score += matchedGenres.length * 3;
      reasons.push(`Gênero favorito: ${matchedGenres.slice(0, 2).join(", ")}`);
    }

    // Author already read
    if (readAuthors.has(book.author.toLowerCase()) && !readIds.has(book.id)) {
      score += 2;
      reasons.push(`Autor que você já leu`);
    }

    // Interest tag match
    const matchedTags = book.genres.filter((g) => interestTags.has(g.toLowerCase()));
    if (matchedTags.length > 0) {
      score += matchedTags.length * 1;
      if (!reasons.some((r) => r.startsWith("Gênero"))) {
        reasons.push(`Tag de interesse: ${matchedTags[0]}`);
      }
    }

    // Wishlist bonus (confirmed interest)
    if ((user.wishlist ?? []).includes(book.id)) {
      score += 1;
      reasons.push("Na sua lista de desejos");
    }

    // Rating bonus (tiny) — prefer high-quality items
    score += book.rating * 0.1;

    return { book, score, reasons };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Dentro de um conjunto de livros recomendados, retorna aqueles que têm edições
 * disponíveis para compra (com links de afiliados), ordenados pelo menor preço.
 */
export function getDiscountedRecommendations(
  recommendations: RecommendedBook[],
  region: "BR" | "PT" = "BR"
): RecommendedBook[] {
  return recommendations
    .filter((r) => r.book.editions && r.book.editions.length > 0)
    .sort((a, b) => {
      const priceA =
        region === "BR"
          ? Math.min(...a.book.editions.map((e) => e.priceBR))
          : Math.min(...a.book.editions.map((e) => e.pricePT));
      const priceB =
        region === "BR"
          ? Math.min(...b.book.editions.map((e) => e.priceBR))
          : Math.min(...b.book.editions.map((e) => e.pricePT));
      return priceA - priceB;
    });
}

/**
 * Retorna o melhor link afiliado para um livro dado a região do usuário.
 */
export function getBestAffiliateLink(book: Book, region: "BR" | "PT"): string | null {
  if (!book.editions || book.editions.length === 0) return null;
  const sorted =
    region === "BR"
      ? [...book.editions].sort((a, b) => a.priceBR - b.priceBR)
      : [...book.editions].sort((a, b) => a.pricePT - b.pricePT);
  return region === "BR" ? sorted[0].linkBR : sorted[0].linkPT;
}

/**
 * Retorna o menor preço disponível para um livro.
 */
export function getBestPrice(book: Book, region: "BR" | "PT"): number | null {
  if (!book.editions || book.editions.length === 0) return null;
  const prices =
    region === "BR" ? book.editions.map((e) => e.priceBR) : book.editions.map((e) => e.pricePT);
  return Math.min(...prices);
}
