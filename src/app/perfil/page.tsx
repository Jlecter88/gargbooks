"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useUserSession } from "@/context/UserContext";
import { useBooks } from "@/context/BookContext";
import { getRecommendations } from "@/utils/recommendations";
import RecommendedSection from "@/components/RecommendedSection";
import { ReadBookEntry } from "@/utils/rpgMatchmaker";
import { compressImage } from "@/utils/imageCompressor";

// ─── Constants ────────────────────────────────────────────────────────────────

const LITERARY_STYLES = [
  "Gótico",
  "Dark Fantasy",
  "Realismo",
  "Cyberpunk",
  "Fantasia Épica",
  "Romance",
  "Terror",
  "Ficção Científica",
  "Mistério & Thriller",
  "Histórico",
  "Contemporâneo",
  "Surrealismo",
  "Distopia",
  "Aventura",
];

const ALL_GENRES = [
  "Terror Gótico",
  "Clássicos",
  "Fantasia",
  "Épico",
  "Realismo",
  "Ficção Científica",
  "Cyberpunk",
  "Romance Erótico",
  "Ficção Histórica",
  "Mistério",
  "Aventura",
  "Adulto +18",
  "Original",
  "Fantasia Sombria",
  "Distopia",
  "Steampunk",
  "Thriller",
  "Poesia",
  "Conto",
  "Geral",
];

type ProfileTab = "visao-geral" | "lidos" | "wishlist" | "recomendacoes";

// ─── Component ────────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const {
    currentUser,
    users,
    changeCurrentUser,
    updateUser,
    addToReadBooks,
    removeFromReadBooks,
    toggleWishlist,
    setReadingNow,
    isInWishlist,
    isRead,
    isReadingNow,
  } = useUserSession();

  const { books } = useBooks();

  const [activeTab, setActiveTab] = useState<ProfileTab>("visao-geral");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Editable fields state (mirrors currentUser)
  const [editBio, setEditBio] = useState(currentUser?.bio ?? "");
  const [editStyle, setEditStyle] = useState(currentUser?.favorite_style ?? "");
  const [editGenres, setEditGenres] = useState<string[]>(currentUser?.favorite_genres ?? []);
  const [editTags, setEditTags] = useState<string[]>(currentUser?.interest_tags ?? []);
  const [profilePic, setProfilePic] = useState(currentUser?.profile_picture ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [showAdultContent, setShowAdultContent] = useState(currentUser?.preferences?.showAdultContent ?? false);

  // Sync state with active user switch
  useEffect(() => {
    if (currentUser) {
      setEditBio(currentUser.bio ?? "");
      setEditStyle(currentUser.favorite_style ?? "");
      setEditGenres(currentUser.favorite_genres ?? []);
      setEditTags(currentUser.interest_tags ?? []);
      setProfilePic(currentUser.profile_picture ?? "");
      setShowAdultContent(currentUser.preferences?.showAdultContent ?? false);
    }
  }, [currentUser]);

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB limit
    if (file.size > maxSize) {
      alert("A imagem de perfil deve ter no máximo 10MB.");
      return;
    }

    setIsUploading(true);
    try {
      const result = await compressImage(file, 400, 400, 0.7);
      setProfilePic(result.base64);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Falha ao processar e comprimir imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  // Add-to-read form
  const [addReadBookId, setAddReadBookId] = useState("");
  const [addReadRating, setAddReadRating] = useState(5);
  const [addReadNote, setAddReadNote] = useState("");

  // Recommendations
  const recommendations = useMemo(() => {
    if (!currentUser || books.length === 0) return [];
    return getRecommendations(currentUser, books, 9);
  }, [currentUser, books]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-corto-dark text-stone-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl block mb-6">📖</span>
            <h2 className="font-serif text-3xl font-bold mb-3">Nenhum perfil ativo</h2>
            <p className="text-sm text-stone-400 font-mono mb-8">
              Selecione um usuário para visualizar o perfil.
            </p>
            <Link
              href="/"
              className="px-6 py-3 text-[11px] font-mono font-bold uppercase tracking-widest border border-accent text-accent rounded-full hover:bg-accent hover:text-white transition-all"
            >
              Voltar à Estante
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const readBooks = (currentUser.read_books ?? []).map((entry) => ({
    ...entry,
    book: books.find((b) => b.id === entry.bookId),
  }));

  const wishlistBooks = (currentUser.wishlist ?? [])
    .map((id) => books.find((b) => b.id === id))
    .filter(Boolean);

  const readingNowBook = currentUser.reading_now
    ? books.find((b) => b.id === currentUser.reading_now)
    : null;

  // Save profile edits
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    const result = await updateUser(currentUser.id, {
      bio: editBio,
      favorite_style: editStyle,
      favorite_genres: editGenres,
      interest_tags: editTags,
      profile_picture: profilePic,
      preferences: {
        ...currentUser.preferences,
        showAdultContent: showAdultContent,
      }
    });
    setIsSaving(false);
    setSaveMessage({ type: result.success ? "success" : "error", text: result.message });
    setTimeout(() => setSaveMessage(null), 4000);
  };

  const toggleEditGenre = (genre: string) => {
    setEditGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const toggleEditTag = (tag: string) => {
    setEditTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddRead = async () => {
    if (!addReadBookId) return;
    const book = books.find((b) => b.id === addReadBookId);
    if (!book) return;
    await addToReadBooks({
      bookId: book.id,
      bookTitle: book.title,
      readAt: new Date().toISOString().split("T")[0],
      rating: addReadRating,
      note: addReadNote || undefined,
    });
    setAddReadBookId("");
    setAddReadNote("");
    setAddReadRating(5);
  };

  const avatarInitial =
    currentUser.avatar_initial ?? currentUser.name.charAt(0).toUpperCase();

  const tabs: { id: ProfileTab; label: string; icon: string }[] = [
    { id: "visao-geral", label: "Visão Geral", icon: "◈" },
    { id: "lidos", label: `Lidos (${readBooks.length})`, icon: "✓" },
    { id: "wishlist", label: `Quero Ler (${wishlistBooks.length})`, icon: "♡" },
    { id: "recomendacoes", label: "Recomendações", icon: "✦" },
  ];

  return (
    <div className="min-h-screen bg-corto-dark text-stone-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 md:py-20">

        {/* ── Profile Hero ──────────────────────────────────────────────── */}
        <section className="mb-12 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-8">
            <span className="h-[1px] w-8 bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold">
              Perfil Literário
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {currentUser.profile_picture ? (
                <div
                  className="w-24 h-24 rounded-2xl border border-accent/30 shadow-xl shadow-accent/10 overflow-hidden bg-cover bg-center"
                  style={{ backgroundImage: `url(${currentUser.profile_picture})` }}
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent via-stone-800 to-corto-stone flex items-center justify-center border border-accent/30 shadow-xl shadow-accent/10">
                  <span className="font-serif text-4xl font-bold text-white">{avatarInitial}</span>
                </div>
              )}
              {currentUser.is_premium && (
                <span className="absolute -top-1.5 -right-1.5 text-[8px] font-mono font-bold bg-accent text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                  Premium
                </span>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1">
              <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-1">
                {currentUser.name}
              </h1>
              <p className="font-mono text-[11px] uppercase tracking-widest text-accent mb-3">
                @{currentUser.username}
              </p>
              <p className="text-sm text-stone-400 font-sans leading-relaxed max-w-xl">
                {currentUser.bio}
              </p>

              {/* Style badge */}
              {currentUser.favorite_style && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-stone-500">
                    Estilo:
                  </span>
                  <span className="px-3 py-1 text-[9px] font-bold font-mono uppercase tracking-widest bg-accent/15 border border-accent/30 text-accent rounded-full">
                    {currentUser.favorite_style}
                  </span>
                </div>
              )}

              {/* Reading stats row */}
              <div className="mt-5 flex flex-wrap gap-4">
                {[
                  { label: "Lidos", value: readBooks.length, icon: "📚" },
                  { label: "Quero Ler", value: wishlistBooks.length, icon: "♡" },
                  { label: "Seguidores", value: currentUser.followers?.length ?? 0, icon: "👥" },
                  { label: "Seguindo", value: currentUser.following?.length ?? 0, icon: "👉" },
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

            {/* User switcher (dev tool) */}
            <div className="self-start">
              <select
                onChange={(e) => changeCurrentUser(e.target.value)}
                value={currentUser.id}
                className="px-3 py-2 text-[9px] font-mono bg-white/5 border border-white/10 text-stone-400 rounded-xl outline-none hover:border-accent/40 transition-all cursor-pointer"
                title="Simular outro usuário (dev)"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.is_ai_persona ? "[IA]" : ""}
                  </option>
                ))}
              </select>
              <p className="text-[8px] font-mono text-stone-600 mt-1 text-right">Dev · Simular usuário</p>
            </div>
          </div>

          {/* Reading now banner */}
          {readingNowBook && (
            <div className="mt-8 flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-accent/10 to-transparent border border-accent/20">
              <div
                className={`w-12 h-16 rounded-lg bg-gradient-to-tr ${readingNowBook.coverGradient} flex-shrink-0`}
                style={
                  readingNowBook.coverImage
                    ? { backgroundImage: `url(${readingNowBook.coverImage})`, backgroundSize: "cover" }
                    : undefined
                }
              />
              <div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-accent mb-0.5">
                  📖 Lendo agora
                </p>
                <p className="font-serif text-lg font-bold">{readingNowBook.title}</p>
                <p className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">
                  {readingNowBook.author}
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <Link
                  href={`/livros/${readingNowBook.id}`}
                  className="px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest border border-accent/40 text-accent rounded-full hover:bg-accent hover:text-white transition-all"
                >
                  Continuar ↗
                </Link>
                <button
                  onClick={() => setReadingNow(null)}
                  className="px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest border border-white/10 text-stone-400 rounded-full hover:border-red-400/40 hover:text-red-400 transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </section>

        <div className="editorial-line mb-12" />

        {/* ── Profile Tabs ──────────────────────────────────────────────── */}
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

        {/* ── TAB: Visão Geral (Edit Profile) ──────────────────────────── */}
        {activeTab === "visao-geral" && (
          <section className="max-w-3xl animate-fade-in-up">
            <h2 className="font-serif text-2xl font-bold mb-8">
              Editar <span className="font-light italic text-accent">Perfil Literário</span>
            </h2>

            <div className="space-y-10">
              {/* Foto de Perfil & Preferências de Imagem */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 rounded-2xl border border-white/5 bg-white/3">
                <div className="md:col-span-3 flex justify-center">
                  {profilePic ? (
                    <div
                      className="w-20 h-20 rounded-2xl border border-accent/30 shadow-lg bg-cover bg-center"
                      style={{ backgroundImage: `url(${profilePic})` }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-stone-800 flex items-center justify-center border border-white/10">
                      <span className="font-serif text-3xl font-bold text-white/50">{avatarInitial}</span>
                    </div>
                  )}
                </div>
                <div className="md:col-span-9 space-y-2">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-stone-500">
                    Foto de Perfil (Até 10MB, compressão automática)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="text-xs text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-mono file:font-bold file:uppercase file:bg-white/5 file:text-stone-300 file:cursor-pointer hover:file:bg-white/10"
                  />
                  {isUploading && <p className="text-[10px] font-mono text-accent animate-pulse">Otimizando foto de perfil...</p>}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-stone-500 mb-3">
                  Biografia
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  placeholder="Escreva algo sobre você como leitor..."
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 text-stone-100 text-sm font-sans rounded-2xl outline-none focus:border-accent/60 resize-none transition-all placeholder-stone-600"
                />
              </div>

              {/* Preferências Globais */}
              <div className="p-6 rounded-2xl border border-white/5 bg-white/3 space-y-4">
                <h4 className="font-serif text-sm font-bold text-stone-250">Configurações & Preferências</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-[11px] font-semibold text-stone-200">Exibir Conteúdo Adulto (+18)</span>
                    <span className="block text-[9px] font-mono text-stone-500">Permitir visualização e leitura de contos adultos e explícitos.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdultContent(!showAdultContent)}
                    className={`px-4 py-2 text-[10px] font-mono font-bold uppercase rounded-full border transition-all ${
                      showAdultContent
                        ? "bg-accent border-accent text-white shadow shadow-accent/25"
                        : "bg-white/5 border-white/10 text-stone-450 hover:border-white/20"
                    }`}
                  >
                    {showAdultContent ? "Ativo" : "Bloqueado"}
                  </button>
                </div>
              </div>

              {/* Favorite Style */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-stone-500 mb-3">
                  Estilo Literário Favorito
                </label>
                <div className="flex flex-wrap gap-2">
                  {LITERARY_STYLES.map((style) => (
                    <button
                      key={style}
                      onClick={() => setEditStyle(style === editStyle ? "" : style)}
                      className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full border transition-all cursor-pointer ${
                        editStyle === style
                          ? "bg-accent border-accent text-white shadow-md shadow-accent/20"
                          : "border-white/10 bg-white/5 text-stone-400 hover:border-accent/40 hover:text-stone-200"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Favorite Genres */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-stone-500 mb-3">
                  Gêneros Favoritos{" "}
                  <span className="text-accent">({editGenres.length} selecionados)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GENRES.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleEditGenre(genre)}
                      className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full border transition-all cursor-pointer ${
                        editGenres.includes(genre)
                          ? "bg-accent/20 border-accent/60 text-accent"
                          : "border-white/10 bg-white/5 text-stone-400 hover:border-accent/30"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interest Tags */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-stone-500 mb-3">
                  Tags de Interesse{" "}
                  <span className="text-accent">({editTags.length} selecionadas)</span>
                </label>
                <p className="text-[9px] font-mono text-stone-600 mb-3">
                  Usadas para matchmaking de mesas RPG e recomendações personalizadas.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[...ALL_GENRES, "D&D 5e", "Cyberpunk RED", "Vampiro: A Máscara", "Pathfinder", "Iniciantes", "Colecionador"].map(
                    (tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleEditTag(tag)}
                        className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full border transition-all cursor-pointer ${
                          editTags.includes(tag)
                            ? "bg-sky-900/40 border-sky-400/50 text-sky-300"
                            : "border-white/8 bg-white/3 text-stone-500 hover:border-sky-400/30 hover:text-stone-300"
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Lendo agora */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-stone-500 mb-3">
                  Lendo Agora
                </label>
                <select
                  value={currentUser.reading_now ?? ""}
                  onChange={(e) => setReadingNow(e.target.value || null)}
                  className="w-full px-5 py-3 bg-white/5 border border-white/10 text-stone-300 text-[11px] font-mono rounded-2xl outline-none focus:border-accent/60 transition-all cursor-pointer"
                >
                  <option value="">— Nenhum —</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.type === "livro" ? "📚" : "✍️"} {b.title} · {b.author}
                    </option>
                  ))}
                </select>
              </div>

              {/* Save button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-8 py-3 text-[11px] font-mono font-bold uppercase tracking-widest bg-accent text-white rounded-full hover:bg-accent-hover active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving ? "Salvando..." : "Salvar Perfil"}
                </button>
                {saveMessage && (
                  <p
                    className={`text-[10px] font-mono ${
                      saveMessage.type === "success" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {saveMessage.type === "success" ? "✓" : "✕"} {saveMessage.text}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── TAB: Lidos ───────────────────────────────────────────────── */}
        {activeTab === "lidos" && (
          <section className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl font-bold">
                Histórico de <span className="font-light italic text-accent">Leitura</span>
              </h2>
              <span className="font-mono text-[10px] text-stone-500 uppercase tracking-widest">
                {readBooks.length} obra{readBooks.length !== 1 ? "s" : ""} lida{readBooks.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Add book form */}
            <div className="mb-10 p-6 rounded-2xl border border-white/8 bg-white/3">
              <p className="text-[9px] font-mono uppercase tracking-widest text-accent mb-4 font-bold">
                + Registrar Leitura
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={addReadBookId}
                  onChange={(e) => setAddReadBookId(e.target.value)}
                  className="col-span-1 sm:col-span-2 px-4 py-2.5 bg-white/5 border border-white/10 text-stone-300 text-[11px] font-mono rounded-xl outline-none focus:border-accent/60 transition-all cursor-pointer"
                >
                  <option value="">Selecionar obra...</option>
                  {books
                    .filter((b) => !isRead(b.id))
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.type === "livro" ? "📚" : "✍️"} {b.title} · {b.author}
                      </option>
                    ))}
                </select>
                <div className="flex gap-2">
                  <select
                    value={addReadRating}
                    onChange={(e) => setAddReadRating(Number(e.target.value))}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-stone-300 text-[11px] font-mono rounded-xl outline-none focus:border-accent/60 cursor-pointer"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {"★".repeat(r)} {r}/5
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  value={addReadNote}
                  onChange={(e) => setAddReadNote(e.target.value)}
                  placeholder="Nota pessoal (opcional)..."
                  className="col-span-1 sm:col-span-2 px-4 py-2.5 bg-white/5 border border-white/10 text-stone-100 text-[11px] font-mono rounded-xl outline-none focus:border-accent/60 placeholder-stone-600 transition-all"
                />
                <button
                  onClick={handleAddRead}
                  disabled={!addReadBookId}
                  className="px-4 py-2.5 text-[10px] font-mono font-bold uppercase tracking-widest bg-accent text-white rounded-xl hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
                >
                  Registrar
                </button>
              </div>
            </div>

            {readBooks.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
                <span className="text-5xl block mb-4">📖</span>
                <p className="font-serif text-xl text-stone-400">Nenhuma leitura registrada ainda.</p>
                <p className="text-xs text-stone-600 font-mono mt-2">
                  Use o formulário acima para registrar um livro ou conto que você já leu.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {readBooks.map(({ bookId, bookTitle, readAt, rating, note, book }) => (
                  <div
                    key={bookId}
                    className="flex items-center gap-5 p-5 rounded-2xl border border-white/8 bg-white/3 hover:border-accent/20 transition-all group"
                  >
                    {/* Cover mini */}
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
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-base font-bold truncate">{bookTitle}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">
                          {new Date(readAt).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-accent text-[10px] font-mono">
                          {"★".repeat(rating)}{"☆".repeat(5 - rating)}
                        </span>
                      </div>
                      {note && (
                        <p className="text-[10px] font-sans text-stone-500 italic mt-1 line-clamp-1">
                          &ldquo;{note}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {book && (
                        <Link
                          href={`/livros/${bookId}`}
                          className="px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-widest border border-white/10 rounded-full hover:border-accent/40 hover:text-accent transition-all"
                        >
                          Ver ↗
                        </Link>
                      )}
                      <button
                        onClick={() => removeFromReadBooks(bookId)}
                        className="px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-widest border border-red-400/20 text-red-400/60 rounded-full hover:border-red-400/60 hover:text-red-400 transition-all cursor-pointer"
                      >
                        Remover
                      </button>
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
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl font-bold">
                Lista de <span className="font-light italic text-accent">Desejos</span>
              </h2>
              <span className="font-mono text-[10px] text-stone-500 uppercase tracking-widest">
                {wishlistBooks.length} obra{wishlistBooks.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Add to wishlist */}
            <div className="mb-10 p-6 rounded-2xl border border-white/8 bg-white/3">
              <p className="text-[9px] font-mono uppercase tracking-widest text-accent mb-4 font-bold">
                + Adicionar à Lista
              </p>
              <div className="flex gap-3">
                <select
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-stone-300 text-[11px] font-mono rounded-xl outline-none focus:border-accent/60 transition-all cursor-pointer"
                  onChange={(e) => {
                    if (e.target.value) toggleWishlist(e.target.value);
                    e.target.value = "";
                  }}
                >
                  <option value="">Selecionar obra para adicionar...</option>
                  {books
                    .filter((b) => !isInWishlist(b.id))
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.type === "livro" ? "📚" : "✍️"} {b.title} · {b.author}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {wishlistBooks.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
                <span className="text-5xl block mb-4">♡</span>
                <p className="font-serif text-xl text-stone-400">Lista de desejos vazia.</p>
                <p className="text-xs text-stone-600 font-mono mt-2">
                  Adicione obras acima ou clique em ♡ nas páginas de livros e contos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlistBooks.map((book) => {
                  if (!book) return null;
                  const isLivro = book.type === "livro";
                  const hasBuy = isLivro && book.editions && book.editions.length > 0;
                  return (
                    <div
                      key={book.id}
                      className="group relative rounded-2xl border border-white/8 hover:border-accent/30 bg-white/3 transition-all duration-500 overflow-hidden flex flex-col"
                    >
                      <div
                        className={`h-28 w-full bg-gradient-to-tr ${book.coverGradient}`}
                        style={
                          book.coverImage
                            ? { backgroundImage: `url(${book.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                            : undefined
                        }
                      >
                        <span
                          className={`inline-block mt-3 ml-3 px-2.5 py-0.5 text-[8px] font-bold font-mono uppercase tracking-widest rounded-full border ${
                            isLivro
                              ? "bg-sky-950/80 border-sky-400/30 text-sky-300"
                              : "bg-violet-950/80 border-violet-400/30 text-violet-300"
                          }`}
                        >
                          {isLivro ? "📚 Livro" : "✍️ Conto"}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-serif text-base font-bold mb-0.5">{book.title}</h3>
                        <p className="text-[9px] font-mono uppercase tracking-widest text-stone-500 mb-3">
                          {book.author}
                        </p>
                        <div className="mt-auto flex gap-2">
                          <Link
                            href={`/livros/${book.id}`}
                            className="flex-1 text-center px-3 py-2 text-[9px] font-mono font-bold uppercase tracking-widest border border-white/10 rounded-xl hover:border-accent/40 hover:text-accent transition-all"
                          >
                            Ver ↗
                          </Link>
                          {hasBuy && (
                            <a
                              href={book.editions[0].linkBR}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center px-3 py-2 text-[9px] font-mono font-bold uppercase tracking-widest bg-accent text-white rounded-xl hover:bg-accent-hover transition-all"
                            >
                              🛒 Comprar
                            </a>
                          )}
                          <button
                            onClick={() => toggleWishlist(book.id)}
                            className="px-3 py-2 text-[9px] font-mono font-bold uppercase tracking-widest border border-red-400/20 text-red-400/50 rounded-xl hover:border-red-400/60 hover:text-red-400 transition-all cursor-pointer"
                            title="Remover da wishlist"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── TAB: Recomendações ───────────────────────────────────────── */}
        {activeTab === "recomendacoes" && (
          <section className="animate-fade-in-up">
            {currentUser.favorite_genres && currentUser.favorite_genres.length > 0 ? (
              <RecommendedSection
                recommendations={recommendations}
                region="BR"
                title="Recomendações Personalizadas"
                subtitle={`${recommendations.length} obras selecionadas com base no seu perfil literário`}
              />
            ) : (
              <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl">
                <span className="text-5xl block mb-4">✦</span>
                <h3 className="font-serif text-2xl font-bold mb-3">
                  Perfil literário incompleto
                </h3>
                <p className="text-sm text-stone-400 font-sans max-w-md mx-auto mb-8 leading-relaxed">
                  Para receber recomendações personalizadas, vá à aba{" "}
                  <strong>Visão Geral</strong> e preencha seus gêneros favoritos e estilo
                  literário.
                </p>
                <button
                  onClick={() => setActiveTab("visao-geral")}
                  className="px-6 py-3 text-[11px] font-mono font-bold uppercase tracking-widest border border-accent text-accent rounded-full hover:bg-accent hover:text-white transition-all cursor-pointer"
                >
                  Completar Perfil →
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/10 py-10 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-[9px] font-mono text-stone-600">
          <span className="uppercase tracking-widest">Gargbooks por Creative Pash</span>
          <Link href="/" className="hover:text-accent transition-colors uppercase tracking-widest">
            ← Estante
          </Link>
        </div>
      </footer>
    </div>
  );
}
