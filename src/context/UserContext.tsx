"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, RPGTable, ReadBookEntry } from "@/utils/rpgMatchmaker";
import { canEditProfile, canSimulateIdentity } from "@/utils/security";

export interface ForumComment {
  id: string;
  bookId: string;
  parentId: string | null;
  authorId: string;
  content: string;
  timestamp: string;
  isSpoiler: boolean;
  reactions?: Record<string, string[]>; // mapping reaction type (e.g. '❤️') to list of user IDs
}
 
interface UserContextType {
  users: User[];
  currentUser: User | null;
  rpgTables: RPGTable[];
  forumComments: ForumComment[];
  isLoading: boolean;
  error: string | null;
  changeCurrentUser: (userId: string) => Promise<boolean>;
  updateUser: (userId: string, updatedFields: Partial<User>) => Promise<{ success: boolean; message: string }>;
  toggleJoinRPGTable: (tableId: string) => Promise<void>;
  createRPGTable: (newTable: Omit<RPGTable, "id" | "participants">) => Promise<void>;
  addComment: (bookId: string, parentId: string | null, content: string, isSpoiler: boolean) => Promise<void>;
  toggleFollowUser: (targetUserId: string) => Promise<void>;
  toggleReactionOnComment: (commentId: string, reactionType: string) => Promise<void>;
  // Literary profile actions
  addToReadBooks: (entry: ReadBookEntry) => Promise<void>;
  removeFromReadBooks: (bookId: string) => Promise<void>;
  toggleWishlist: (bookId: string) => Promise<void>;
  setReadingNow: (bookId: string | null) => Promise<void>;
  isInWishlist: (bookId: string) => boolean;
  isRead: (bookId: string) => boolean;
  isReadingNow: (bookId: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [rpgTables, setRpgTables] = useState<RPGTable[]>([]);
  const [forumComments, setForumComments] = useState<ForumComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all mock databases on mount
  useEffect(() => {
    async function initData() {
      try {
        setIsLoading(true);
        const [resUsers, resRpg, resForum] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/rpg"),
          fetch("/api/forum"),
        ]);

        if (!resUsers.ok || !resRpg.ok || !resForum.ok) {
          throw new Error("Falha ao inicializar dados a partir das APIs.");
        }

        const dataUsers: User[] = await resUsers.json();
        const dataRpg: RPGTable[] = await resRpg.json();
        const dataForum: ForumComment[] = await resForum.json();

        setUsers(dataUsers);
        setRpgTables(dataRpg);
        setForumComments(dataForum);

        // Define o primeiro usuário da lista como logado por padrão para testes
        if (dataUsers.length > 0) {
          // Tenta recuperar do localStorage a sessão anterior
          const savedUserId = localStorage.getItem("gargbooks_simulated_user_id");
          const savedUser = dataUsers.find((u) => u.id === savedUserId);
          setCurrentUser(savedUser || dataUsers[0]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido ao carregar simulação.";
        console.error(err);
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }

    initData();
  }, []);

  // Simular alteração de usuário logado (respeitando restrições)
  const changeCurrentUser = async (userId: string): Promise<boolean> => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return false;

    // Gate de Segurança: Usuários comuns não podem simular ou sequestrar a identidade de Personas de IA
    const allowed = canSimulateIdentity(currentUser, targetUser);
    if (!allowed) {
      alert(
        `⚠️ Erro de Segurança: O perfil de '${targetUser.name}' é uma Persona de IA Protegida e não pode ser simulado por usuários comuns.`
      );
      return false;
    }

    setCurrentUser(targetUser);
    localStorage.setItem("gargbooks_simulated_user_id", targetUser.id);
    return true;
  };

  // Atualizar dados de usuário no arquivo físico users-mock.json
  const updateUser = async (
    userId: string,
    updatedFields: Partial<User>
  ): Promise<{ success: boolean; message: string }> => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, message: "Usuário não encontrado." };
    }

    // Gate de Segurança: Impedir que usuários comuns editem dados dos perfis protegidos de IAs
    if (!canEditProfile(currentUser, targetUser)) {
      const msg = `⚠️ Violação de Segurança: Perfis comuns não possuem privilégios para editar os dados protegidos de IAs (${targetUser.name}).`;
      alert(msg);
      return { success: false, message: msg };
    }

    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        return { ...u, ...updatedFields };
      }
      return u;
    });

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUsers),
      });

      if (!response.ok) {
        throw new Error("Erro ao gravar dados no servidor.");
      }

      setUsers(updatedUsers);
      // Se atualizou o usuário logado atualmente, atualiza o estado da sessão
      if (currentUser && currentUser.id === userId) {
        const freshUser = { ...currentUser, ...updatedFields };
        setCurrentUser(freshUser);
      }

      return { success: true, message: "Perfil atualizado com sucesso no disco." };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido ao salvar perfil.";
      console.error(err);
      return { success: false, message: msg };
    }
  };

  // Participar ou Sair de uma mesa de RPG (salva em rpg-mock.json)
  const toggleJoinRPGTable = async (tableId: string) => {
    if (!currentUser) {
      alert("Você precisa estar logado para interagir com mesas de RPG.");
      return;
    }

    const updatedTables = rpgTables.map((table) => {
      if (table.id === tableId) {
        const isJoined = table.participants.includes(currentUser.id);
        let newParticipants: string[];
        let newVacancies = table.vacancies;

        if (isJoined) {
          newParticipants = table.participants.filter((pid) => pid !== currentUser.id);
          newVacancies += 1;
        } else {
          if (table.vacancies <= 0) {
            alert("Não há vagas disponíveis nesta mesa!");
            return table;
          }
          newParticipants = [...table.participants, currentUser.id];
          newVacancies -= 1;
        }

        return {
          ...table,
          participants: newParticipants,
          vacancies: newVacancies,
        };
      }
      return table;
    });

    try {
      const response = await fetch("/api/rpg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTables),
      });

      if (!response.ok) throw new Error("Erro ao atualizar mesa de RPG.");
      setRpgTables(updatedTables);
    } catch (err) {
      console.error(err);
      alert("Falha ao salvar participação na mesa.");
    }
  };

  // Criar uma mesa de RPG (salva em rpg-mock.json)
  const createRPGTable = async (newTableData: Omit<RPGTable, "id" | "participants">) => {
    if (!currentUser) return;

    const newTable: RPGTable = {
      ...newTableData,
      id: `table-${Date.now()}`,
      participants: [],
    };

    const updatedTables = [newTable, ...rpgTables];

    try {
      const response = await fetch("/api/rpg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTables),
      });

      if (!response.ok) throw new Error("Erro ao salvar nova mesa de RPG.");
      setRpgTables(updatedTables);
    } catch (err) {
      console.error(err);
      alert("Falha ao criar mesa de RPG.");
    }
  };

  // Adicionar comentário aninhado ao fórum (salva em forum-mock.json)
  const addComment = async (
    bookId: string,
    parentId: string | null,
    content: string,
    isSpoiler: boolean
  ) => {
    if (!currentUser) {
      alert("Você precisa estar logado para comentar.");
      return;
    }

    const newComment: ForumComment = {
      id: `comm-${Date.now()}`,
      bookId,
      parentId,
      authorId: currentUser.id,
      content,
      timestamp: new Date().toISOString(),
      isSpoiler,
    };

    const updatedComments = [...forumComments, newComment];

    try {
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedComments),
      });

      if (!response.ok) throw new Error("Erro ao enviar comentário.");
      setForumComments(updatedComments);
    } catch (err) {
      console.error(err);
      alert("Falha ao enviar comentário.");
    }
  };

  const toggleFollowUser = async (targetUserId: string) => {
    if (!currentUser) {
      alert("Você precisa estar logado para seguir outros usuários.");
      return;
    }
    if (currentUser.id === targetUserId) {
      alert("Você não pode seguir a si mesmo!");
      return;
    }

    const updatedUsers = users.map((u) => {
      if (u.id === currentUser.id) {
        const following = u.following ?? [];
        const isFollowing = following.includes(targetUserId);
        return {
          ...u,
          following: isFollowing
            ? following.filter((id) => id !== targetUserId)
            : [...following, targetUserId],
        };
      }
      if (u.id === targetUserId) {
        const followers = u.followers ?? [];
        const isFollowed = followers.includes(currentUser.id);
        return {
          ...u,
          followers: isFollowed
            ? followers.filter((id) => id !== currentUser.id)
            : [...followers, currentUser.id],
        };
      }
      return u;
    });

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUsers),
      });

      if (!response.ok) throw new Error("Erro ao atualizar relações de seguidores.");
      setUsers(updatedUsers);
      const updatedMe = updatedUsers.find((u) => u.id === currentUser.id);
      if (updatedMe) setCurrentUser(updatedMe);
    } catch (err) {
      console.error(err);
      alert("Falha ao atualizar seguidores.");
    }
  };

  const toggleReactionOnComment = async (commentId: string, reactionType: string) => {
    if (!currentUser) {
      alert("Você precisa estar logado para reagir.");
      return;
    }

    const updatedComments = forumComments.map((c) => {
      if (c.id === commentId) {
        const reactions = c.reactions ?? {};
        const userList = reactions[reactionType] ?? [];
        const hasReacted = userList.includes(currentUser.id);

        return {
          ...c,
          reactions: {
            ...reactions,
            [reactionType]: hasReacted
              ? userList.filter((uid) => uid !== currentUser.id)
              : [...userList, currentUser.id],
          },
        };
      }
      return c;
    });

    try {
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedComments),
      });

      if (!response.ok) throw new Error("Erro ao atualizar reações no comentário.");
      setForumComments(updatedComments);
    } catch (err) {
      console.error(err);
      alert("Falha ao salvar reação.");
    }
  };

  // ─── Literary Profile Actions ─────────────────────────────────────────────

  const addToReadBooks = async (entry: ReadBookEntry) => {
    if (!currentUser) return;
    const existing = currentUser.read_books ?? [];
    // Avoid duplicates — remove old entry for same book if exists
    const filtered = existing.filter((e) => e.bookId !== entry.bookId);
    const updated: Partial<User> = { read_books: [entry, ...filtered] };
    await updateUser(currentUser.id, updated);
  };

  const removeFromReadBooks = async (bookId: string) => {
    if (!currentUser) return;
    const existing = currentUser.read_books ?? [];
    const updated: Partial<User> = { read_books: existing.filter((e) => e.bookId !== bookId) };
    await updateUser(currentUser.id, updated);
  };

  const toggleWishlist = async (bookId: string) => {
    if (!currentUser) return;
    const existing = currentUser.wishlist ?? [];
    const isIn = existing.includes(bookId);
    const updated: Partial<User> = {
      wishlist: isIn ? existing.filter((id) => id !== bookId) : [bookId, ...existing],
    };
    await updateUser(currentUser.id, updated);
  };

  const setReadingNow = async (bookId: string | null) => {
    if (!currentUser) return;
    await updateUser(currentUser.id, { reading_now: bookId });
  };

  // Derived helpers for quick UI checks
  const isInWishlist = (bookId: string) =>
    (currentUser?.wishlist ?? []).includes(bookId);

  const isRead = (bookId: string) =>
    (currentUser?.read_books ?? []).some((e) => e.bookId === bookId);

  const isReadingNow = (bookId: string) =>
    currentUser?.reading_now === bookId;

  return (
    <UserContext.Provider
      value={{
        users,
        currentUser,
        rpgTables,
        forumComments,
        isLoading,
        error,
        changeCurrentUser,
        updateUser,
        toggleJoinRPGTable,
        createRPGTable,
        addComment,
        toggleFollowUser,
        toggleReactionOnComment,
        addToReadBooks,
        removeFromReadBooks,
        toggleWishlist,
        setReadingNow,
        isInWishlist,
        isRead,
        isReadingNow,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserSession() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserSession deve ser usado dentro de um UserProvider");
  }
  return context;
}
