"use client";

import React, { useState, useMemo, useEffect, startTransition } from "react";
import Link from "next/link";
import { useBooks, Book } from "@/context/BookContext";
import { useUserSession } from "@/context/UserContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type ContentTab = "contos" | "populares" | "terror" | "eroticos" | "recentes";

interface EnhancedBook extends Book {
  reactionCount?: number;
}

export default function Home() {
  const { books, contos } = useBooks();
  const { currentUser } = useUserSession();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [activeTab, setActiveTab] = useState<ContentTab>("contos");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => setMounted(true));
  }, []);

  // Get all unique genres from contos
  const genres = useMemo(() => {
    const allGenres = contos.flatMap((b) => b.genres);
    return ["Todos", ...Array.from(new Set(allGenres))];
  }, [contos]);

  // Filter and sort contos
  const filteredContos = useMemo(() => {
    let pool = contos;
    
    // Tab-based filtering
    if (activeTab === "terror") {
      pool = pool.filter(c => 
        c.genres.some(g => g.toLowerCase().includes("terror") || g.toLowerCase().includes("horror"))
      );
    } else if (activeTab === "eroticos") {
      pool = pool.filter(c => 
        c.genres.some(g => g.toLowerCase().includes("erótico") || g.toLowerCase().includes("adulto") || g === "+18")
      );
    } else if (activeTab === "populares") {
      pool = [...pool].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (activeTab === "recentes") {
      pool = [...pool].sort((a, b) => b.year - a.year);
    }

    // Search filter
    if (searchTerm.trim()) {
      pool = pool.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Genre filter
    if (selectedGenre !== "Todos") {
      pool = pool.filter(c => c.genres.includes(selectedGenre));
    }

    return pool;
  }, [contos, activeTab, searchTerm, selectedGenre]);

  // Categorias de contos para a landing
  const categories = [
    { id: "terror", label: "Terror 👻", desc: "Contos de arrepiar", color: "from-red-900/40 to-orange-900/20" },
    { id: "romance", label: "Romance ❤️", desc: "Paixão e sentimentos", color: "from-pink-900/40 to-rose-900/20" },
    { id: "fantasia", label: "Fantasia 🧙", desc: "Mundos imaginários", color: "from-violet-900/40 to-purple-900/20" },
    { id: "ficcao", label: "Ficção 🤖", desc: "Futuro e tecnologia", color: "from-cyan-900/40 to-blue-900/20" },
    { id: "eroticos", label: "+18 🔞", desc: "Conteúdo adulto", color: "from-red-950/40 to-rose-950/30" },
  ];

  const getContoUrl = (bookId: string) => `/contos/${bookId}`;

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-stone-100">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-20">
        
        {/* ── Hero Section ── */}
        <section className="mb-16 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-[1px] w-8 bg-accent" />
            <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
              Gargbooks — Portal de Contos
            </span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div className="max-w-4xl">
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-4">
                Contos{" "}
                <span className="font-light italic text-accent font-serif">que</span>{" "}
                atravessam{" "}
                <span className="font-light italic text-accent font-serif">fronteiras</span>
              </h1>
              <span className="font-script text-accent text-3xl md:text-5xl block -mt-2 mb-6">Tradução automática via IA</span>
              <p className="text-sm md:text-base max-w-2xl text-stone-400 leading-relaxed font-sans">
                Publique seus contos, leia histórias do mundo inteiro e conecte-se com 
                leitores e escritores. Tradução instantânea para qualquer idioma.
              </p>
            </div>

            <Link
              href="/publicar"
              className="px-6 py-3 bg-accent text-zinc-950 rounded-full font-mono text-xs font-bold uppercase tracking-widest hover:bg-accent-hover transition-all hover:scale-105 active:scale-95"
            >
              ✍️ Escrever Conto
            </Link>
          </div>

          <div className="editorial-line mt-12" />
        </section>

        {/* ── Categories Grid ── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="h-[1px] w-8 bg-accent" />
            <span className="font-mono text-xs uppercase tracking-widest text-accent font-bold">
              Categorias
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === "terror") setActiveTab("terror");
                  else if (cat.id === "eroticos") setActiveTab("eroticos");
                  else setSelectedGenre(cat.label.split(" ")[0]);
                }}
                className={`relative rounded-2xl p-6 text-left border transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-gradient-to-br ${cat.color} border-white/10 hover:border-accent/40`}
              >
                <h3 className="font-serif text-lg font-bold mb-1">{cat.label}</h3>
                <p className="text-xs text-stone-400 font-mono">{cat.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ── Genre Filter Pills ── */}
        <section className="mb-10">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`whitespace-nowrap px-5 py-2 text-[10px] font-semibold font-mono uppercase tracking-widest rounded-full border transition-all active:scale-95 cursor-pointer ${
                  selectedGenre === genre
                    ? "bg-accent border-accent text-zinc-950 shadow-sm"
                    : "border-white/10 bg-white/5 text-stone-300 hover:border-accent/40"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mt-6 max-w-md">
            <input
              type="text"
              placeholder="Buscar conto ou autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-2.5 pl-10 text-sm font-mono rounded-full border border-white/10 bg-white/5 text-stone-100 focus:border-accent/60 placeholder-stone-500 outline-none transition-all"
            />
            <span className="absolute left-4 top-3 text-sm opacity-60">🔍</span>
          </div>
        </section>

        {/* ── Tab Navigation ── */}
        <section className="mb-10">
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-0">
            {[
              { id: "contos" as ContentTab, label: "📖 Todos os Contos" },
              { id: "recentes" as ContentTab, label: "🆕 Recentes" },
              { id: "populares" as ContentTab, label: "🔥 Populares" },
              { id: "terror" as ContentTab, label: "👻 Terror" },
              { id: "eroticos" as ContentTab, label: "🔞 +18" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-[11px] font-mono font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 border-b-2 ${
                  activeTab === tab.id
                    ? "border-accent text-accent"
                    : "border-transparent text-stone-500 hover:text-stone-300 hover:border-white/20"
                }`}
              >
                {tab.label}
                {tab.id === "eroticos" && (
                  <span className="ml-2 px-1.5 py-0.5 text-[8px] bg-red-900/30 text-red-400 rounded-full border border-red-800/30">
                    +18
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ── Contos Grid ── */}
        <section>
          {filteredContos.length === 0 ? (
            <div className="text-center py-24 border border-dashed rounded-3xl border-white/10">
              <span className="text-6xl block mb-4">✍️</span>
              <h3 className="font-serif text-2xl font-bold mb-2">Nenhum conto encontrado</h3>
              <p className="text-sm text-stone-500 max-w-sm mx-auto mb-6">
                Nenhum conto corresponde aos filtros selecionados.
              </p>
              <Link
                href="/publicar"
                className="inline-block px-6 py-3 bg-accent text-zinc-950 rounded-full font-mono text-xs font-bold uppercase tracking-widest hover:bg-accent-hover transition-all"
              >
                ✍️ Seja o primeiro a publicar
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-fade-in-up">
              {filteredContos.map((book) => {
                const isErotic = book.genres.some(g => 
                  g.toLowerCase().includes("erótico") || g.toLowerCase().includes("adulto") || g === "+18"
                );
                const isTerror = book.genres.some(g => 
                  g.toLowerCase().includes("terror") || g.toLowerCase().includes("horror")
                );

                return (
                  <Link
                    key={book.id}
                    href={getContoUrl(book.id)}
                    className="group flex flex-col h-full bg-white/[0.02] border border-white/10 rounded-2xl p-5 hover:border-accent/40 hover:shadow-xl transition-all duration-500 justify-between"
                  >
                    <div>
                      {/* Cover / Gradient */}
                      <div className="relative w-full overflow-hidden rounded-xl border border-white/8 group-hover:border-accent/40 shadow-sm group-hover:shadow-lg transition-all duration-500 aspect-[2/3]">
                        <div
                          className="absolute inset-0 bg-gradient-to-tr transition-transform duration-500 group-hover:scale-105"
                          style={
                            book.coverImage
                              ? { backgroundImage: `url(${book.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                              : { background: `linear-gradient(135deg, ${book.coverGradient || "from-stone-900 via-neutral-800 to-stone-900"})` }
                          }
                        />
                        {/* Top badges */}
                        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                          {isErotic && (
                            <span className="px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest rounded-full bg-red-900/80 border border-red-400/30 text-red-300">
                              🔞 +18
                            </span>
                          )}
                          {isTerror && !isErotic && (
                            <span className="px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest rounded-full bg-orange-900/80 border border-orange-400/30 text-orange-300">
                              👻 Terror
                            </span>
                          )}
                          <span className="font-mono text-[9px] tracking-wider text-accent font-bold drop-shadow ml-auto">
                            ★ {book.rating || 5}
                          </span>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="mt-4">
                        <div className="flex items-center gap-1 flex-wrap mb-2">
                          {book.genres.slice(0, 3).map((g) => (
                            <span
                              key={g}
                              className="px-2 py-0.5 text-[8px] font-semibold font-mono uppercase tracking-wider bg-accent/10 text-accent rounded border border-accent/10"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                        <h3 className="font-serif text-lg font-bold text-stone-100 leading-snug hover:text-accent transition-colors duration-300 line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-[9px] font-mono uppercase tracking-widest text-accent mt-0.5 font-bold">
                          {book.author}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono mt-4 pt-3 border-t border-white/10 text-stone-500">
                      <span>{book.year}</span>
                      <span className="text-accent uppercase tracking-widest font-bold group-hover:underline">
                        Ler Conto ↗
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Call to Action ── */}
        <section className="mt-24 rounded-3xl border border-accent/20 bg-white/[0.02] p-12 text-center">
          <span className="font-script text-4xl text-accent block mb-4">✍️</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Tem uma história para contar?
          </h2>
          <p className="text-stone-400 max-w-lg mx-auto mb-8 text-sm">
            Publique seus contos gratuitamente e alcance leitores do mundo inteiro 
            com tradução automática. Crie seu perfil de escritor e construa sua audiência.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/publicar"
              className="px-8 py-3 bg-accent text-zinc-950 rounded-full font-mono text-xs font-bold uppercase tracking-widest hover:bg-accent-hover transition-all hover:scale-105 active:scale-95"
            >
              Publicar Conto
            </Link>
            <Link
              href="/perfil"
              className="px-8 py-3 border border-white/20 text-stone-300 rounded-full font-mono text-xs font-bold uppercase tracking-widest hover:border-accent/40 transition-all"
            >
              Criar Perfil
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
