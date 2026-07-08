"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useBooks } from "@/context/BookContext";
import { useUserSession } from "@/context/UserContext";
import Header from "@/components/Header";
import RecommendedSection from "@/components/RecommendedSection";
import { getRecommendations } from "@/utils/recommendations";
import { Book } from "@/context/BookContext";

type ContentTab = "todos" | "livros" | "contos";

export default function Home() {
  const { books, livros, contos } = useBooks();
  const { currentUser } = useUserSession();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [sortBy, setSortBy] = useState("year-desc");
  const [appTheme, setAppTheme] = useState<"dark" | "sepia" | "light">("dark");
  const [activeTab, setActiveTab] = useState<ContentTab>("todos");
  const [userRegion] = useState<"BR" | "PT">("BR");

  // Recommendations (computed only when user is logged in)
  const recommendations = useMemo(() => {
    if (!currentUser || books.length === 0) return [];
    return getRecommendations(currentUser, books, 6);
  }, [currentUser, books]);

  // Active pool based on tab
  const activePool: Book[] = useMemo(() => {
    if (activeTab === "livros") return livros;
    if (activeTab === "contos") return contos;
    return books;
  }, [activeTab, books, livros, contos]);

  // Get all unique genres from current pool
  const genres = useMemo(() => {
    const allGenres = activePool.flatMap((b) => b.genres);
    return ["Todos", ...Array.from(new Set(allGenres))];
  }, [activePool]);

  // Filter and sort
  const filteredBooks = useMemo(() => {
    return activePool
      .filter((book) => {
        const matchesSearch =
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = selectedGenre === "Todos" || book.genres.includes(selectedGenre);
        return matchesSearch && matchesGenre;
      })
      .sort((a, b) => {
        if (sortBy === "title-asc") return a.title.localeCompare(b.title);
        if (sortBy === "year-desc") return b.year - a.year;
        if (sortBy === "year-asc") return a.year - b.year;
        if (sortBy === "rating-desc") return b.rating - a.rating;
        return 0;
      });
  }, [activePool, searchTerm, selectedGenre, sortBy]);

  // When tab changes, reset genre filter
  const handleTabChange = (tab: ContentTab) => {
    setActiveTab(tab);
    setSelectedGenre("Todos");
  };

  // Theme classes
  const themeClasses = {
    dark: "bg-corto-dark text-stone-100",
    sepia: "bg-sepia-bg text-sepia-text",
    light: "bg-corto-cream text-corto-charcoal",
  }[appTheme];

  const borderClasses = {
    dark: "border-white/10",
    sepia: "border-sepia-text/10",
    light: "border-corto-charcoal/10",
  }[appTheme];

  const mutedTextClasses = {
    dark: "text-stone-400",
    sepia: "text-sepia-muted",
    light: "text-corto-stone/70",
  }[appTheme];

  const inputClasses = {
    dark: "bg-white/5 border-white/10 text-stone-100 focus:border-accent/60",
    sepia: "bg-sepia-text/5 border-sepia-text/20 text-sepia-text focus:border-accent/60 placeholder-sepia-muted",
    light: "bg-corto-charcoal/5 border-corto-charcoal/10 text-corto-charcoal focus:border-accent/60 placeholder-corto-stone/50",
  }[appTheme];

  const selectClasses = {
    dark: "bg-neutral-900 border-white/10 text-stone-100 focus:border-accent",
    sepia: "bg-sepia-bg border-sepia-text/20 text-sepia-text focus:border-accent",
    light: "bg-corto-cream border-corto-charcoal/10 text-corto-charcoal focus:border-accent",
  }[appTheme];

  const tabBadgeCount: Record<ContentTab, number> = {
    todos: books.length,
    livros: livros.length,
    contos: contos.length,
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-700 ${themeClasses}`}>
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-20">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="mb-16 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-[1px] w-8 bg-accent" />
            <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
              Gargbooks Editorial / Curadoria
            </span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div className="max-w-4xl">
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-6">
                Estante{" "}
                <span className="font-light italic text-accent font-serif">editorial</span> de obras
                e{" "}
                <span className="font-light italic text-accent font-serif">contos</span> literários.
              </h1>
              <p className={`text-sm md:text-base max-w-2xl ${mutedTextClasses} leading-relaxed font-sans`}>
                Uma curadoria de livros clássicos, edições raras e contos contemporâneos. Explore,
                descubra e compre com links de afiliados curados pela nossa equipe editorial.
              </p>
            </div>

            {/* Theme switcher */}
            <div className="flex items-center gap-1 bg-current/5 p-1 rounded-full border border-current/10 self-start lg:self-end">
              {(["dark", "sepia", "light"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setAppTheme(t)}
                  className={`px-4 py-2 text-[10px] uppercase tracking-wider font-mono font-bold rounded-full transition-all cursor-pointer ${
                    appTheme === t
                      ? "bg-accent text-white shadow-md shadow-accent/25"
                      : "text-current/60 hover:text-current"
                  }`}
                >
                  {t === "dark" ? "Obsidian" : t === "sepia" ? "Linen" : "Toscana"}
                </button>
              ))}
            </div>
          </div>

          <div className="editorial-line mt-12" />
        </section>

        {/* ── Personalized Recommendations ─────────────────────────────── */}
        {recommendations.length > 0 && currentUser && (
          <RecommendedSection
            recommendations={recommendations}
            region={userRegion}
            title={`Recomendado para @${currentUser.username}`}
            subtitle={`Com base no seu estilo ${currentUser.favorite_style ?? "literário"} e histórico de leitura`}
          />
        )}

        {/* ── Content Type Tabs ────────────────────────────────────────── */}
        <section className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-2 border-b border-current/10 pb-0">
            {(
              [
                {
                  id: "todos",
                  label: "Tudo",
                  icon: "🔮",
                  description: "Livros e contos",
                },
                {
                  id: "livros",
                  label: "Livros",
                  icon: "📚",
                  description: "Edições físicas com links para compra",
                },
                {
                  id: "contos",
                  label: "Contos",
                  icon: "✍️",
                  description: "Histórias curtas originais",
                },
              ] as { id: ContentTab; label: string; icon: string; description: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                title={tab.description}
                className={`relative flex items-center gap-2 px-5 py-3 text-[11px] font-mono font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 border-b-2 ${
                  activeTab === tab.id
                    ? "border-accent text-accent"
                    : "border-transparent text-current/50 hover:text-current/80 hover:border-current/20"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 text-[8px] rounded-full font-bold ${
                    activeTab === tab.id
                      ? "bg-accent text-white"
                      : "bg-current/10 text-current/60"
                  }`}
                >
                  {tabBadgeCount[tab.id]}
                </span>
              </button>
            ))}
          </div>

          {/* Tab description */}
          <p className={`mt-3 text-[10px] font-mono ${mutedTextClasses} tracking-wide`}>
            {activeTab === "livros" &&
              "📚 Livros clássicos e edições raras — com links de afiliados para compra no Brasil e em Portugal."}
            {activeTab === "contos" &&
              "✍️ Contos originais gerados por escritores da comunidade e personas da IA editorial Gargbooks."}
            {activeTab === "todos" &&
              "🔮 Toda a estante — livros clássicos, edições raras e contos originais em um só lugar."}
          </p>
        </section>

        {/* ── Filter Toolbar ───────────────────────────────────────────── */}
        <section className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center justify-between animate-fade-in-up">
          {/* Genre badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-6 px-6 lg:mx-0 lg:px-0 scrollbar-none">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`whitespace-nowrap px-5 py-2 text-[10px] font-semibold font-mono uppercase tracking-widest rounded-full border transition-all active:scale-95 cursor-pointer ${
                  selectedGenre === genre
                    ? "bg-accent border-accent text-white shadow-sm"
                    : appTheme === "dark"
                    ? "border-white/10 bg-white/5 text-stone-300 hover:border-accent/40"
                    : appTheme === "sepia"
                    ? "border-sepia-text/20 bg-sepia-text/5 text-sepia-text hover:border-accent/40"
                    : "border-corto-charcoal/10 bg-corto-charcoal/5 text-corto-charcoal hover:border-accent/40"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-72">
              <input
                type="text"
                placeholder={activeTab === "contos" ? "Buscar conto ou autor..." : "Buscar livro ou autor..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-5 py-2.5 pl-10 text-[11px] font-mono rounded-full border outline-none transition-all ${inputClasses}`}
              />
              <span className="absolute left-4 top-3 text-[11px] opacity-60">🔍</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-5 py-2.5 text-[11px] font-mono uppercase tracking-widest rounded-full border outline-none cursor-pointer transition-all ${selectClasses}`}
            >
              <option value="year-desc">Mais Recentes</option>
              <option value="year-asc">Mais Antigos</option>
              <option value="title-asc">Título (A-Z)</option>
              <option value="rating-desc">Melhor Avaliados</option>
            </select>
          </div>
        </section>

        {/* ── Content Grid ─────────────────────────────────────────────── */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-24 border border-dashed rounded-3xl border-current/15">
            <span className="text-5xl block mb-4">
              {activeTab === "contos" ? "✍️" : "📖"}
            </span>
            <h3 className="font-serif text-xl font-bold mb-2">
              Nenhum {activeTab === "contos" ? "conto" : "livro"} encontrado
            </h3>
            <p className={`text-xs ${mutedTextClasses} max-w-sm mx-auto`}>
              Tente redefinir seus filtros ou buscar por outros termos de pesquisa na estante.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-28 gap-x-12 animate-fade-in-up">
            {filteredBooks.map((book, idx) => {
              const isWide = idx % 4 === 0 || idx % 4 === 3;
              const colSpanClass = isWide ? "md:col-span-7" : "md:col-span-5";
              const offsetClass =
                idx % 4 === 1 ? "md:mt-24" : idx % 4 === 2 ? "md:mt-12" : "";
              const aspectClass =
                idx % 4 === 0
                  ? "aspect-[4/5]"
                  : idx % 4 === 1
                  ? "aspect-[3/4]"
                  : idx % 4 === 2
                  ? "aspect-[4/3]"
                  : "aspect-[16/10]";

              const isLivro = book.type === "livro";
              const hasBuyLink = isLivro && book.editions && book.editions.length > 0;

              return (
                <React.Fragment key={book.id}>
                  {/* Manifesto row after 2nd item */}
                  {idx === 2 && (
                    <div className="col-span-1 md:col-span-12 my-12 border-y border-current/10 py-16 text-center max-w-4xl mx-auto w-full">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-accent mb-4 block font-bold">
                        O Manifesto Gargbooks
                      </span>
                      <p className="font-serif text-3xl md:text-4xl italic leading-relaxed text-current max-w-3xl mx-auto">
                        &ldquo;A leitura é a arquitetura da alma. Cada obra não é apenas um texto,
                        mas uma estrutura escultural que esculpe a mente e o espaço ao redor.&rdquo;
                      </p>
                      <div className="mt-8 flex justify-center gap-6 text-[10px] font-mono uppercase tracking-widest">
                        <span className="text-current/60">curadoria independente</span>
                        <span className="text-accent">•</span>
                        <span className="text-current/60">edições raras</span>
                      </div>
                    </div>
                  )}

                  {/* Philosophy block after 4th item */}
                  {idx === 4 && (
                    <div className="col-span-1 md:col-span-12 my-12 grid grid-cols-1 md:grid-cols-2 gap-8 border border-current/10 p-10 rounded-2xl bg-current/3">
                      <div className="flex flex-col justify-between">
                        <h3 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
                          Nossa{" "}
                          <span className="font-light italic text-accent font-serif">filosofia</span>{" "}
                          de design geométrico
                        </h3>
                        <p className={`text-xs leading-relaxed font-sans ${mutedTextClasses} max-w-sm mt-4`}>
                          Cada elemento do Gargbooks é regido por proporções visuais de equilíbrio,
                          buscando criar um refúgio visual para leitores que apreciam a tipografia
                          clássica, o minimalismo e a beleza estrutural das palavras.
                        </p>
                      </div>
                      <div className="flex flex-col justify-end items-start md:items-end mt-4 md:mt-0 font-mono text-[9px] uppercase tracking-widest gap-2 text-current/60">
                        <span>📐 Grade Proporcional</span>
                        <span>🌿 Tons Orgânicos</span>
                        <span>🔒 Proteção Intelectual</span>
                      </div>
                    </div>
                  )}

                  {/* Book / Conto Card */}
                  <div className={`group flex flex-col h-full ${colSpanClass} ${offsetClass}`}>
                    <Link
                      href={`/livros/${book.id}`}
                      className="flex flex-col flex-1 hover:-translate-y-2 transition-all duration-700 ease-corto"
                    >
                      {/* Cover */}
                      <div
                        className={`relative w-full overflow-hidden rounded-2xl border border-current/8 group-hover:border-accent/40 shadow-sm group-hover:shadow-lg transition-all duration-700 ease-corto ${aspectClass}`}
                      >
                        {/* Background */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-tr ${book.coverGradient} transition-transform duration-700 ease-corto group-hover:scale-105`}
                          style={
                            book.coverImage
                              ? {
                                  backgroundImage: `url(${book.coverImage})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }
                              : undefined
                          }
                        />

                        {/* Geometric overlay */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay group-hover:opacity-20 transition-all duration-750">
                          <svg
                            viewBox="0 0 100 100"
                            className="w-full h-full stroke-white fill-none stroke-[0.8]"
                          >
                            <path d="M50,50 A0.5,0.5 0 0,1 50,50.1 A1,1 0 0,1 49,49 A2,2 0 0,1 51,47 A4,4 0 0,1 55,51 A8,8 0 0,1 47,59 A16,16 0 0,1 31,43 A32,32 0 0,1 63,11 A64,64 0 0,1 -1,75" />
                          </svg>
                        </div>

                        {/* Top overlay: type badge + rating */}
                        <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
                          {/* Type badge — visually distinct */}
                          <span
                            className={`px-3 py-1 text-[9px] font-mono uppercase tracking-widest border rounded-full font-bold ${
                              isLivro
                                ? "bg-sky-950/80 border-sky-400/30 text-sky-300"
                                : "bg-violet-950/80 border-violet-400/30 text-violet-300"
                            }`}
                          >
                            {isLivro ? "📚 Livro" : "✍️ Conto"}
                          </span>
                          <span className="font-mono text-[10px] tracking-wider text-accent font-bold drop-shadow">
                            ★ {book.rating}
                          </span>
                        </div>

                        {/* Buy badge (livros with editions only) */}
                        {hasBuyLink && (
                          <div className="absolute bottom-4 left-4 z-10">
                            <span className="px-3 py-1 text-[8px] font-bold font-mono uppercase tracking-widest rounded-full bg-emerald-900/80 border border-emerald-400/30 text-emerald-300">
                              🛒 Comprar
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Metadata */}
                    <div className="mt-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Tags */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-3">
                          {book.genres.map((g) => (
                            <span
                              key={g}
                              className="px-2.5 py-0.5 text-[8px] font-bold font-mono uppercase tracking-widest bg-accent/10 text-accent rounded border border-accent/20"
                            >
                              {g}
                            </span>
                          ))}
                        </div>

                        {/* Title */}
                        <Link href={`/livros/${book.id}`}>
                          <h3 className="font-serif text-2xl md:text-3xl font-bold text-current leading-tight hover:text-accent transition-colors duration-300">
                            {book.title}
                          </h3>
                        </Link>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-current/60 mt-1 font-semibold">
                          {book.author}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono mt-4 pt-3 border-t border-current/10 text-current/40">
                        <span>{book.year}</span>
                        <div className="flex items-center gap-3">
                          {hasBuyLink && (
                            <a
                              href={book.editions[0].linkBR}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 uppercase tracking-widest font-bold hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Comprar ↗
                            </a>
                          )}
                          <Link
                            href={`/livros/${book.id}`}
                            className="text-accent uppercase tracking-widest font-bold hover:underline"
                          >
                            {isLivro ? "Acessar Livro ↗" : "Ler Conto ↗"}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className={`mt-28 border-t ${borderClasses} py-16 px-6`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 text-[10px] font-mono text-current/55">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 100 100" className="w-5 h-5 stroke-accent fill-none stroke-[2]">
              <path d="M50,50 A0.5,0.5 0 0,1 50,50.1 A1,1 0 0,1 49,49 A2,2 0 0,1 51,47 A4,4 0 0,1 55,51 A8,8 0 0,1 47,59 A16,16 0 0,1 31,43 A32,32 0 0,1 63,11 A64,64 0 0,1 -1,75" />
            </svg>
            <span className="uppercase tracking-widest font-bold">GARGBOOKS por Creative Pash</span>
          </div>
          <div className="flex gap-8 uppercase tracking-widest">
            <Link href="/perfil" className="hover:text-accent transition-colors">
              Perfil
            </Link>
            <Link href="/publicar" className="hover:text-accent transition-colors">
              Publicar
            </Link>
            <a href="#" className="hover:text-accent transition-colors">
              Termos
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              Contato
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
