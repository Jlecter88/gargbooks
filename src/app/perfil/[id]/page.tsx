"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useUserSession } from "@/context/UserContext";
import { useBooks } from "@/context/BookContext";

type ProfileTab = "visao-geral" | "lidos" | "wishlist" | "obras";

export default function PerfilPublicoPage() {
  const params = useParams();
  const router = useRouter();
  const targetId = params.id as string;

  const { users, currentUser, toggleFollowUser } = useUserSession();
  const { books } = useBooks();
  const [activeTab, setActiveTab] = useState<ProfileTab>("visao-geral");

  // Localiza o perfil de destino por ID ou por username
  const targetUser = useMemo(() => {
    return users.find((u) => u.id === targetId || u.username === targetId);
  }, [users, targetId]);

  const isMe = currentUser && targetUser && currentUser.id === targetUser.id;

  const isFollowing = useMemo(() => {
    if (!currentUser || !targetUser) return false;
    return (currentUser.following ?? []).includes(targetUser.id);
  }, [currentUser, targetUser]);

  const readBooks = useMemo(() => {
    if (!targetUser) return [];
    return (targetUser.read_books ?? []).map((entry) => ({
      ...entry,
      book: books.find((b) => b.id === entry.bookId),
    }));
  }, [targetUser, books]);

  const wishlistBooks = useMemo(() => {
    if (!targetUser) return [];
    return (targetUser.wishlist ?? [])
      .map((id) => books.find((b) => b.id === id))
      .filter(Boolean);
  }, [targetUser, books]);

  const publishedContos = useMemo(() => {
    if (!targetUser) return [];
    // Busca contos publicados por este usuário específico
    return books.filter(
      (b) =>
        b.authorId === targetUser.id ||
        (b.isUserPublished && b.author === targetUser.name)
    );
  }, [targetUser, books]);

  if (!targetUser) {
    return (
      <div className="min-h-screen bg-corto-dark text-stone-100 flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-6xl mb-4">🔍</span>
          <h1 className="font-serif text-2xl font-bold mb-2">Perfil não encontrado</h1>
          <p className="text-xs text-stone-500 mb-6 font-mono">
            O usuário especificado não existe ou a identidade foi removida.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-accent text-white font-semibold rounded-full text-xs hover:bg-accent-hover transition-all cursor-pointer"
          >
            Voltar para Estante
          </button>
        </div>
      </div>
    );
  }

  const handleFollowClick = async () => {
    if (!currentUser) {
      alert("Você precisa fazer login para seguir outros usuários.");
      router.push("/comunidade");
      return;
    }
    await toggleFollowUser(targetUser.id);
  };

  const avatarInitial = targetUser.avatar_initial ?? targetUser.name.charAt(0).toUpperCase();

  const tabs: { id: ProfileTab; label: string; icon: string }[] = [
    { id: "visao-geral", label: "Visão Geral", icon: "◈" },
    { id: "obras", label: `Obras (${publishedContos.length})`, icon: "✍️" },
    { id: "lidos", label: `Lidos (${readBooks.length})`, icon: "✓" },
    { id: "wishlist", label: `Quero Ler (${wishlistBooks.length})`, icon: "♡" },
  ];

  return (
    <div className="min-h-screen bg-corto-dark text-stone-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 md:py-20">
        
        {/* ── Profile Hero ──────────────────────────────────────────────── */}
        <section className="mb-12 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-8">
            <span className="h-[1px] w-8 bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold">
              Perfil Público
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {targetUser.profile_picture ? (
                <div
                  className="w-24 h-24 rounded-2xl border border-accent/30 shadow-xl shadow-accent/10 overflow-hidden bg-cover bg-center"
                  style={{ backgroundImage: `url(${targetUser.profile_picture})` }}
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent via-stone-800 to-corto-stone flex items-center justify-center border border-accent/30 shadow-xl shadow-accent/10">
                  <span className="font-serif text-4xl font-bold text-white">{avatarInitial}</span>
                </div>
              )}
              {targetUser.is_premium && (
                <span className="absolute -top-1.5 -right-1.5 text-[8px] font-mono font-bold bg-accent text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                  Premium
                </span>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1">
              <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-1">
                {targetUser.name}
              </h1>
              <p className="font-mono text-[11px] uppercase tracking-widest text-accent mb-3">
                @{targetUser.username} {targetUser.is_ai_persona && "🤖 IA Persona"}
              </p>
              <p className="text-sm text-stone-400 font-sans leading-relaxed max-w-xl">
                {targetUser.bio}
              </p>

              {/* Style badge */}
              {targetUser.favorite_style && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-stone-500">
                    Estilo:
                  </span>
                  <span className="px-3 py-1 text-[9px] font-bold font-mono uppercase tracking-widest bg-accent/15 border border-accent/30 text-accent rounded-full">
                    {targetUser.favorite_style}
                  </span>
                </div>
              )}

              {/* Stats Row */}
              <div className="mt-5 flex flex-wrap gap-4">
                {[
                  { label: "Lidos", value: readBooks.length, icon: "📚" },
                  { label: "Seguidores", value: targetUser.followers?.length ?? 0, icon: "👥" },
                  { label: "Seguindo", value: targetUser.following?.length ?? 0, icon: "👉" },
                  { label: "Contos", value: publishedContos.length, icon: "✍️" },
                ].map(({ label, value, icon }) => (
                  <div
                    key={label}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-center min-w-[80px]"
                  >
                    <span className="block text-lg mb-0.5">{icon}</span>
                    <span className="block font-mono text-lg font-bold text-accent">{value}</span>
                    <span className="block text-[8px] font-mono uppercase tracking-widest text-stone-500">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow Action Button */}
            {!isMe && (
              <button
                onClick={handleFollowClick}
                className={`px-8 py-3 text-[11px] font-mono font-bold uppercase tracking-widest rounded-full transition-all active:scale-95 cursor-pointer border ${
                  isFollowing
                    ? "bg-red-950/20 border-red-500/30 text-red-400 hover:bg-red-950/40"
                    : "bg-accent border-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20"
                }`}
              >
                {isFollowing ? "Deixar de Seguir" : "Seguir Autor"}
              </button>
            )}

            {isMe && (
              <Link
                href="/perfil"
                className="px-8 py-3 text-[11px] font-mono font-bold uppercase tracking-widest border border-white/10 text-stone-300 rounded-full hover:bg-white/5 transition-all text-center"
              >
                Editar Meu Perfil ⚙️
              </Link>
            )}
          </div>
        </section>

        <div className="editorial-line mb-12" />

        {/* ── Tabs Navigation ───────────────────────────────────────────── */}
        <div className="flex items-center gap-1 border-b border-white/8 mb-12 overflow-x-auto scrollbar-none pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-[10px] font-mono font-bold uppercase tracking-widest whitespace-nowrap cursor-pointer transition-all duration-300 border-b-2 ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-stone-500 hover:text-stone-300 hover:border-white/20"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB: Visão Geral ─────────────────────────────────────────── */}
        {activeTab === "visao-geral" && (
          <section className="max-w-3xl animate-fade-in-up space-y-8">
            {/* Preferred genres */}
            {targetUser.favorite_genres && targetUser.favorite_genres.length > 0 && (
              <div className="p-6 rounded-2xl border border-white/5 bg-white/3">
                <h3 className="font-serif text-lg font-bold mb-4">Gêneros Preferidos</h3>
                <div className="flex flex-wrap gap-2">
                  {targetUser.favorite_genres.map((g) => (
                    <span
                      key={g}
                      className="px-4 py-2 text-[9px] font-mono font-bold uppercase bg-accent/15 border border-accent/25 text-accent rounded-full"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interest Tags */}
            {targetUser.interest_tags && targetUser.interest_tags.length > 0 && (
              <div className="p-6 rounded-2xl border border-white/5 bg-white/3">
                <h3 className="font-serif text-lg font-bold mb-4">Interesses & Campanhas</h3>
                <div className="flex flex-wrap gap-2">
                  {targetUser.interest_tags.map((t) => (
                    <span
                      key={t}
                      className="px-4 py-2 text-[9px] font-mono font-bold uppercase bg-sky-950/40 border border-sky-400/30 text-sky-300 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── TAB: Published Contos ─────────────────────────────────────── */}
        {activeTab === "obras" && (
          <section className="animate-fade-in-up">
            <h2 className="font-serif text-2xl font-bold mb-8">Contos Publicados</h2>
            {publishedContos.length === 0 ? (
              <div className="text-center py-20 border border-dashed rounded-3xl border-white/10">
                <span className="text-5xl block mb-4">✍️</span>
                <p className="font-serif text-lg text-stone-400">Nenhum conto publicado ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedContos.map((book) => (
                  <div
                    key={book.id}
                    className="group relative rounded-2xl border border-white/8 hover:border-accent/30 bg-white/3 transition-all duration-500 overflow-hidden flex flex-col"
                  >
                    <div
                      className={`h-36 w-full bg-gradient-to-tr ${book.coverGradient} relative`}
                      style={
                        book.coverImage
                          ? { backgroundImage: `url(${book.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                          : undefined
                      }
                    />
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-serif text-base font-bold mb-1 line-clamp-1">{book.title}</h3>
                      <p className="text-[11px] text-stone-450 leading-relaxed line-clamp-2 mb-4">
                        {book.synopsis}
                      </p>
                      <div className="mt-auto flex gap-2">
                        <Link
                          href={`/livros/${book.id}`}
                          className="w-full text-center py-2 text-[10px] font-mono font-bold uppercase tracking-widest bg-accent text-white rounded-xl hover:bg-accent-hover transition-all"
                        >
                          Ler Conto ↗
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── TAB: Lidos ───────────────────────────────────────────────── */}
        {activeTab === "lidos" && (
          <section className="animate-fade-in-up">
            <h2 className="font-serif text-2xl font-bold mb-8">Estante de Lidos</h2>
            {readBooks.length === 0 ? (
              <div className="text-center py-20 border border-dashed rounded-3xl border-white/10">
                <span className="text-5xl block mb-4">📚</span>
                <p className="font-serif text-lg text-stone-400">Nenhuma leitura registrada ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {readBooks.map(({ bookId, bookTitle, rating, note, book }) => (
                  <div
                    key={bookId}
                    className="flex items-center gap-5 p-5 rounded-2xl border border-white/8 bg-white/3"
                  >
                    {book && (
                      <div
                        className={`w-10 h-14 rounded-lg bg-gradient-to-tr ${book.coverGradient} flex-shrink-0`}
                        style={
                          book.coverImage
                            ? { backgroundImage: `url(${book.coverImage})`, backgroundSize: "cover" }
                            : undefined
                        }
                      />
                    )}
                    <div>
                      <p className="font-serif text-base font-bold">{bookTitle}</p>
                      <span className="text-accent text-[10px] font-mono">
                        {"★".repeat(rating)}{"☆".repeat(5 - rating)}
                      </span>
                      {note && <p className="text-xs text-stone-500 italic mt-1">&ldquo;{note}&rdquo;</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── TAB: Wishlist ─────────────────────────────────────────────── */}
        {activeTab === "wishlist" && (
          <section className="animate-fade-in-up">
            <h2 className="font-serif text-2xl font-bold mb-8">Lista de Desejos</h2>
            {wishlistBooks.length === 0 ? (
              <div className="text-center py-20 border border-dashed rounded-3xl border-white/10">
                <span className="text-5xl block mb-4">♡</span>
                <p className="font-serif text-lg text-stone-400">Lista de desejos vazia.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlistBooks.map((book) => {
                  if (!book) return null;
                  return (
                    <div
                      key={book.id}
                      className="group rounded-2xl border border-white/8 hover:border-accent/30 bg-white/3 p-4 flex gap-4 items-center"
                    >
                      <div
                        className={`w-12 h-16 rounded-lg bg-gradient-to-tr ${book.coverGradient} flex-shrink-0`}
                        style={
                          book.coverImage
                            ? { backgroundImage: `url(${book.coverImage})`, backgroundSize: "cover" }
                            : undefined
                        }
                      />
                      <div>
                        <h4 className="font-serif text-sm font-bold">{book.title}</h4>
                        <p className="text-[9px] font-mono uppercase tracking-widest text-stone-550 mb-2">
                          {book.author}
                        </p>
                        <Link
                          href={`/livros/${book.id}`}
                          className="text-[9px] font-mono font-bold text-accent uppercase tracking-widest hover:underline"
                        >
                          Ver Obra ↗
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
