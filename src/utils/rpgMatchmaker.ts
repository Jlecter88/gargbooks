export interface ReadBookEntry {
  bookId: string;
  bookTitle: string;
  readAt: string; // ISO date string
  rating: number; // 1–5
  note?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role?: "leitor" | "escritor";
  age_verified: boolean;
  is_premium: boolean;
  is_ai_persona: boolean;
  interest_tags: string[];
  bio: string;
  // Literary profile fields
  favorite_style?: string;
  favorite_genres?: string[];
  read_books?: ReadBookEntry[];
  wishlist?: string[];        // array of book IDs
  reading_now?: string | null; // book ID
  avatar_initial?: string;    // single letter for avatar
  profile_picture?: string;   // base64 compressed data URL
  followers?: string[];       // array of user IDs
  following?: string[];       // array of user IDs
  preferences?: {
    showAdultContent?: boolean;
    receiveNotifications?: boolean;
  };
}

export interface RPGTable {
  id: string;
  title: string;
  system: string;
  slots: number;
  vacancies: number;
  participants: string[];
  tags: string[];
  description: string;
  masterId: string;
}

/**
 * Função helper que recebe o ID de um usuário, lê a lista de usuários e mesas de RPG,
 * e retorna apenas as mesas que tenham interseção (afinidade) de tags com o perfil dele.
 *
 * @param userId ID do usuário logado
 * @param users Lista de perfis de usuários
 * @param tables Lista de mesas de RPG cadastradas
 */
export function matchTablesForUser(userId: string, users: User[], tables: RPGTable[]): RPGTable[] {
  const user = users.find(u => u.id === userId);
  if (!user) return [];

  // Normaliza as tags do usuário para minúsculo para comparação robusta
  const userTags = new Set(user.interest_tags.map(t => t.toLowerCase()));

  return tables.filter(table =>
    table.tags.some(tag => userTags.has(tag.toLowerCase()))
  );
}
