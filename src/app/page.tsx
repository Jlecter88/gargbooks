"use client";

import React, { useState, useMemo, useEffect, startTransition } from "react";
import Link from "next/link";
import { useBooks } from "@/context/BookContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import initialUsers from "@/data/users-mock.json";

type ContentTab = "contos" | "populares" | "terror" | "eroticos" | "recentes";

export default function Home() {
  const { contos } = useBooks();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [activeTab, setActiveTab] = useState<ContentTab>("contos");
  const [mounted, setMounted] = useState(false);
  const [activeAuthor, setActiveAuthor] = useState<string | null>(null);

  useEffect(() => {
    startTransition(() => setMounted(true));
  }, []);

  const genres = useMemo(() => {
    const allGenres = contos.flatMap((b) => b.genres);
    return ["Todos", ...Array.from(new Set(allGenres))];
  }, [contos]);

  const authors = useMemo(() => {
    return initialUsers.filter(u => u.is_ai_persona);
  }, []);

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

    // Author filter
    if (activeAuthor) {
      pool = pool.filter(c => c.author.toLowerCase() === activeAuthor.toLowerCase());
    }

    return pool;
  }, [contos, activeTab, searchTerm, selectedGenre, activeAuthor]);

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

        {/* ── Autoras em Destaque ── */}
        <section className="mb-12 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-[1px] w-8 bg-accent" />
            <span className="font-mono text-xs uppercase tracking-widest text-accent font-bold">
              Autoras em Destaque
            </span>
          </div>
          
          <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {/* "Todas" button */}
            <button
              onClick={() => setActiveAuthor(null)}
              className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
            >
              <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                activeAuthor === null
                  ? "border-accent shadow-[0_0_15px_rgba(167,139,250,0.4)] scale-105"
                  : "border-white/10 bg-white/5 text-stone-400 group-hover:border-accent/40"
              }`}>
                <span className="text-xl">👥</span>
              </div>
              <span className={`text-[10px] font-mono font-medium transition-colors ${
                activeAuthor === null ? "text-stone-100" : "text-stone-400 group-hover:text-stone-200"
              }`}>
                Todas
              </span>
            </button>

            {authors.map((auth) => {
              const isActive = activeAuthor === auth.name;
              const avatarPath = auth.avatar_url ? `/${auth.avatar_url}` : `https://api.dicebear.com/7.x/initials/svg?seed=${auth.name}`;
              
              return (
                <div
                  key={auth.id}
                  className="relative group/item shrink-0"
                >
                  <button
                    onClick={() => setActiveAuthor(isActive ? null : auth.name)}
                    className="flex flex-col items-center gap-2 cursor-pointer group/btn"
                  >
                    <div className={`w-14 h-14 rounded-full border-2 overflow-hidden relative transition-all ${
                      isActive
                        ? "border-accent shadow-[0_0_15px_rgba(167,139,250,0.4)] scale-105"
                        : "border-white/10 group-hover/btn:border-accent/40 group-hover/btn:scale-105"
                    }`}>
                      <img
                        src={avatarPath}
                        alt={auth.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-cyan-400 border border-zinc-950 rounded-full flex items-center justify-center text-[6px] text-zinc-950 font-bold" title="Perfil Verificado">
                        ✓
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono font-medium transition-colors ${
                      isActive ? "text-stone-100 font-bold" : "text-stone-400 group-hover/btn:text-stone-200"
                    }`}>
                      {auth.name.split(" ")[0]}
                    </span>
                  </button>

                  {/* Profile Card Tooltip */}
                  <div className="absolute top-[75px] left-1/2 -translate-x-1/2 w-64 bg-zinc-900/95 border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 z-50 pointer-events-none translate-y-2 group-hover/item:translate-y-0">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={avatarPath}
                        alt={auth.name}
                        className="w-10 h-10 rounded-full object-cover border border-accent/40"
                      />
                      <div>
                        <h5 className="font-serif text-xs font-bold text-stone-100 flex items-center gap-1">
                          {auth.name}
                          <span className="text-[10px] text-cyan-400" title="Perfil Verificado">✓</span>
                        </h5>
                        <span className="text-[9px] font-mono text-stone-500">
                          @{auth.username}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-stone-300 font-serif leading-relaxed italic mb-2">
                      &ldquo;{auth.bio}&rdquo;
                    </p>
                    <div className="flex items-center justify-between text-[8px] font-mono text-accent uppercase tracking-wider">
                      <span>Estilo: {auth.favorite_style}</span>
                      <span>Verificada</span>
                    </div>
                  </div>
                </div>
              );
            })}
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
              <div className="flex flex-wrap gap-4 justify-center items-center">
                <Link
                  href="/publicar"
                  className="inline-block px-6 py-3 bg-accent text-zinc-950 rounded-full font-mono text-xs font-bold uppercase tracking-widest hover:bg-accent-hover transition-all"
                >
                  ✍️ Seja o primeiro a publicar
                </Link>
                <button
                  onClick={() => {
                    setSelectedGenre("Todos");
                    setActiveTab("contos");
                    setSearchTerm("");
                    setActiveAuthor(null);
                  }}
                  className="px-6 py-3 border border-white/10 bg-white/5 text-stone-300 rounded-full font-mono text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer"
                >
                  Limpar Filtros
                </button>
              </div>
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
