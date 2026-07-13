"use client";

import React, { useState, useEffect, useRef, useMemo, startTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useBooks } from "@/context/BookContext";
import { useUserSession } from "@/context/UserContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdultContentGuard from "@/components/AdultContentGuard";

type ReaderTheme = "dark" | "sepia" | "light";

const LANG_OPTIONS = [
  { code: "pt-br", label: "Português (BR)", flag: "🇧🇷" },
  { code: "pt", label: "Português (PT)", flag: "🇵🇹" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

const REACTIONS_LIST = ["❤️", "🔥", "😢", "😱", "👍"];

export default function ContoReader() {
  const params = useParams();
  const router = useRouter();
  const { contos, toggleReactionOnBook, addBookmark } = useBooks();
  const { currentUser, toggleWishlist, isInWishlist, forumComments, addComment } = useUserSession();

  const contoId = params.id as string;
  const conto = contos.find((c) => c.id === contoId);

  const [currentLang, setCurrentLang] = useState("pt-br");
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>("dark");
  const [fontSize, setFontSize] = useState(18);
  const [useSerif, setUseSerif] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showSensitiveWarning, setShowSensitiveWarning] = useState(true);

  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Detect if conto has +18 or terror genres
  const isAdult = conto?.genres?.some(g =>
    g.toLowerCase().includes("erótico") || g.toLowerCase().includes("adulto") || g === "+18"
  ) ?? false;

  const isTerror = conto?.genres?.some(g =>
    g.toLowerCase().includes("terror") || g.toLowerCase().includes("horror")
  ) ?? false;

  // Current display text (translated or original)
  const displayText = useMemo(() => {
    if (translatedText) return translatedText;
    if (currentLang !== "pt-br" && conto?.translations?.[currentLang]?.fullText) {
      return conto.translations[currentLang].fullText;
    }
    return conto?.fullText || "";
  }, [conto, currentLang, translatedText]);

  const displayTitle = useMemo(() => {
    if (currentLang !== "pt-br" && conto?.translations?.[currentLang]?.title) {
      return conto.translations[currentLang].title;
    }
    return conto?.title || "";
  }, [conto, currentLang]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (!textRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const total = scrollHeight - clientHeight;
      if (total > 0) {
        const pct = Math.min(100, Math.round((scrollTop / total) * 100));
        setReadingProgress(pct);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Translate via Gemini API
  const handleTranslate = async (targetLang: string) => {
    if (!conto) return;
    setCurrentLang(targetLang);
    setShowLangPicker(false);

    // Check if translation already exists in the conto data
    if (conto.translations?.[targetLang]?.fullText) {
      setTranslatedText(null); // Will use cached translation
      return;
    }

    // If same as original, no translation needed
    if (targetLang === "pt-br") {
      setTranslatedText(null);
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: conto.fullText,
          targetLang,
          preserveMarkdown: true,
        }),
      });

      if (!res.ok) throw new Error("Falha na tradução");

      const data = await res.json();
      setTranslatedText(data.translated);
    } catch (err) {
      console.error("Erro ao traduzir:", err);
      // Fallback: try to use mock translation if available
      if (conto.translations?.[targetLang]?.fullText) {
        setTranslatedText(null);
      } else {
        alert("Falha ao traduzir. Verifique se a GEMINI_API_KEY está configurada.");
      }
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle reactions
  const handleReaction = (type: string) => {
    if (!conto || !currentUser) {
      alert("Faça login para reagir a contos.");
      return;
    }
    toggleReactionOnBook(conto.id, type, currentUser.id);
  };

  // Handle favorites
  const handleFavorite = () => {
    if (!conto || !currentUser) {
      alert("Faça login para favoritar contos.");
      return;
    }
    toggleWishlist(conto.id);
  };

  // Handle comment submission
  const handleComment = async () => {
    if (!conto || !currentUser || !commentText.trim()) return;
    await addComment(conto.id, replyingTo, commentText, isSpoiler);
    setCommentText("");
    setIsSpoiler(false);
    setReplyingTo(null);
  };

  // Get conto comments
  const contoComments = useMemo(() => {
    return forumComments.filter((c) => c.bookId === contoId);
  }, [forumComments, contoId]);

  // Reaction counts from conto
  const reactionCounts = useMemo(() => {
    return conto?.reactions ?? {};
  }, [conto?.reactions]);

  // Reader theme styles
  const themeStyles = {
    dark: { bg: "bg-zinc-950", text: "text-stone-200", accent: "text-accent" },
    sepia: { bg: "bg-amber-50", text: "text-stone-800", accent: "text-amber-700" },
    light: { bg: "bg-white", text: "text-zinc-800", accent: "text-zinc-600" },
  }[readerTheme];

  if (!conto) {
    return (
      <div className="min-h-screen bg-zinc-950 text-stone-100">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <span className="text-6xl block mb-6">📖</span>
          <h1 className="font-serif text-3xl font-bold mb-4">Conto não encontrado</h1>
          <p className="text-stone-400 mb-8">Este conto pode ter sido removido ou o link está incorreto.</p>
          <Link
            href="/"
            className="px-6 py-3 bg-accent text-zinc-950 rounded-full font-mono text-xs font-bold uppercase tracking-widest hover:bg-accent-hover transition-all"
          >
            ← Voltar para o Início
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const content = (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${themeStyles.bg} ${themeStyles.text}`}>
      <Header />

      {/* Reading Progress Bar */}
      <div ref={progressRef} className="fixed top-0 left-0 w-full h-1 z-50 bg-white/5">
        <div
          className="h-full bg-accent transition-all duration-200"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Sensitive Content Warning (Terror) */}
      {isTerror && showSensitiveWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[90%] bg-orange-950/90 border border-orange-500/30 rounded-2xl p-4 backdrop-blur-md shadow-xl">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <h4 className="font-bold text-orange-300 text-sm">Conteúdo Sensível</h4>
              <p className="text-orange-200/80 text-xs mt-1">
                Este conto contém temas de terror que podem ser perturbadores para alguns leitores.
              </p>
            </div>
            <button
              onClick={() => setShowSensitiveWarning(false)}
              className="text-orange-300 hover:text-orange-200 text-lg cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 hover:text-accent transition-colors mb-8">
          ← Voltar para Contos
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[1px] w-8 bg-accent" />
            <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
              {isAdult ? "🔞 Conteúdo Adulto" : "✍️ Conto"}
            </span>
          </div>

          <h1 className={`font-serif text-4xl md:text-5xl font-bold tracking-tight mb-2 ${themeStyles.text}`}>
            {displayTitle}
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-accent font-bold mb-4">
            por {conto.author} · {conto.year}
          </p>

          {/* Genre Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {conto.genres.map((g) => (
              <span
                key={g}
                className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-full border ${
                  isAdult && (g.toLowerCase().includes("erótico") || g === "+18")
                    ? "bg-red-900/20 border-red-500/30 text-red-400"
                    : isTerror && (g.toLowerCase().includes("terror") || g.toLowerCase().includes("horror"))
                    ? "bg-orange-900/20 border-orange-500/30 text-orange-400"
                    : "bg-accent/10 border-accent/20 text-accent"
                }`}
              >
                {g}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <p className="text-sm text-stone-400 italic border-l-2 border-accent/30 pl-4 mb-6">
            {conto.synopsis}
          </p>

          {/* Reader Controls Bar */}
          <div className="flex flex-wrap items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            {/* Translation */}
            <div className="relative">
              <button
                onClick={() => setShowLangPicker(!showLangPicker)}
                disabled={isTranslating}
                className="px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-mono font-bold text-accent hover:bg-accent/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                {isTranslating ? "🔄" : "🌐"} {LANG_OPTIONS.find(l => l.code === currentLang)?.flag || "🌐"} {LANG_OPTIONS.find(l => l.code === currentLang)?.label || currentLang}
              </button>

              {showLangPicker && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLangPicker(false)} />
                  <div className="absolute top-full left-0 mt-2 z-20 bg-zinc-900 border border-white/10 rounded-xl p-2 shadow-2xl min-w-[200px]">
                    {LANG_OPTIONS.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleTranslate(lang.code)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                          currentLang === lang.code
                            ? "bg-accent/20 text-accent"
                            : "text-stone-300 hover:bg-white/5"
                        }`}
                      >
                        {lang.flag} {lang.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            {([["dark", "🌙"], ["sepia", "📜"], ["light", "☀️"]] as const).map(([theme, icon]) => (
              <button
                key={theme}
                onClick={() => setReaderTheme(theme as ReaderTheme)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-mono transition-all cursor-pointer ${
                  readerTheme === theme
                    ? "bg-accent text-zinc-950 font-bold"
                    : "bg-white/5 text-stone-400 hover:bg-white/10"
                }`}
              >
                {icon}
              </button>
            ))}

            {/* Font Size */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => setFontSize(s => Math.max(14, s - 2))}
                className="w-7 h-7 rounded-full bg-white/5 text-xs text-stone-400 hover:bg-white/10 cursor-pointer"
              >
                A−
              </button>
              <span className="text-[10px] font-mono text-stone-500 w-6 text-center">{fontSize}</span>
              <button
                onClick={() => setFontSize(s => Math.min(28, s + 2))}
                className="w-7 h-7 rounded-full bg-white/5 text-xs text-stone-400 hover:bg-white/10 cursor-pointer"
              >
                A+
              </button>
            </div>

            {/* Serif Toggle */}
            <button
              onClick={() => setUseSerif(!useSerif)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-mono transition-all cursor-pointer ${
                useSerif ? "bg-accent/20 text-accent" : "bg-white/5 text-stone-400"
              }`}
            >
              {useSerif ? "📖 Serifada" : "📄 Sans-serif"}
            </button>
          </div>
        </header>

        {/* Reading Time Estimate */}
        <div className="mb-8 text-[10px] font-mono text-stone-500 flex items-center gap-4">
          <span>📏 {Math.ceil((displayText?.length || 0) / 1000)} min de leitura</span>
          <span>📊 {readingProgress}% lido</span>
        </div>

        {/* Conto Text */}
        <div
          ref={textRef}
          className={`prose prose-lg max-w-none leading-relaxed ${
            useSerif ? "font-serif" : "font-sans"
          } ${readerTheme === "dark" ? "prose-invert" : ""}`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {displayText.split("\n").map((paragraph, i) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return <br key={i} />;
            if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
              return (
                <h2 key={i} className={`text-xl font-bold mt-8 mb-4 ${themeStyles.accent}`}>
                  {trimmed.replace(/\*\*/g, "")}
                </h2>
              );
            }
            if (trimmed.startsWith("# ")) {
              return (
                <h2 key={i} className={`text-2xl font-bold mt-8 mb-4 ${themeStyles.accent}`}>
                  {trimmed.replace("# ", "")}
                </h2>
              );
            }
            return (
              <p key={i} className="mb-4 leading-relaxed">
                {trimmed}
              </p>
            );
          })}
        </div>

        {/* Gemini Translation Credit */}
        {translatedText && (
          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] font-mono text-stone-500">
              🌐 Traduzido via Google Gemini · Pode conter imprecisões
            </p>
          </div>
        )}

        {/* Reactions */}
        <section className="mt-12 pt-8 border-t border-white/10">
          <h3 className="font-mono text-xs uppercase tracking-widest text-stone-500 mb-4">
            Reações
          </h3>
          <div className="flex flex-wrap gap-3">
            {REACTIONS_LIST.map((reaction) => {
              const count = reactionCounts[reaction]?.length || 0;
              const hasReacted = currentUser && reactionCounts[reaction]?.includes(currentUser.id);
              return (
                <button
                  key={reaction}
                  onClick={() => handleReaction(reaction)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm transition-all cursor-pointer ${
                    hasReacted
                      ? "bg-accent/20 border-accent/40 scale-105"
                      : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  <span>{reaction}</span>
                  {count > 0 && (
                    <span className="text-[10px] font-mono text-stone-400">{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Favorite Button */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleFavorite}
              className={`flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isInWishlist(conto.id)
                  ? "bg-accent/20 border-accent/40 text-accent"
                  : "bg-white/5 border-white/10 text-stone-400 hover:border-white/30"
              }`}
            >
              {isInWishlist(conto.id) ? "⭐ Favoritado" : "☆ Favoritar"}
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copiado!");
              }}
              className="px-5 py-2 rounded-full border border-white/10 text-xs font-mono text-stone-400 hover:border-white/30 transition-all cursor-pointer"
            >
              🔗 Compartilhar
            </button>
          </div>
        </section>

        {/* Comments Section */}
        <section className="mt-12 pt-8 border-t border-white/10">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-xs font-mono text-stone-400 hover:text-accent transition-colors cursor-pointer"
          >
            {showComments ? "▼" : "▶"} Comentários ({contoComments.length})
          </button>

          {showComments && (
            <div className="mt-6 space-y-6">
              {/* Comment Form */}
              {currentUser ? (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={replyingTo ? "Escreva sua resposta..." : "Compartilhe sua opinião sobre este conto..."}
                    className="w-full bg-transparent border border-white/10 rounded-xl p-3 text-sm text-stone-200 placeholder-stone-500 outline-none focus:border-accent/40 resize-none min-h-[80px]"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <label className="flex items-center gap-2 text-[10px] font-mono text-stone-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSpoiler}
                        onChange={(e) => setIsSpoiler(e.target.checked)}
                        className="accent-accent"
                      />
                      Contém spoiler
                    </label>
                    <div className="flex gap-2">
                      {replyingTo && (
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="px-3 py-1.5 text-[10px] font-mono text-stone-500 hover:text-stone-300 cursor-pointer"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        onClick={handleComment}
                        disabled={!commentText.trim()}
                        className="px-4 py-1.5 bg-accent text-zinc-950 rounded-full text-[10px] font-mono font-bold hover:bg-accent-hover transition-all disabled:opacity-40 cursor-pointer"
                      >
                        Comentar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
                  <p className="text-sm text-stone-500 font-mono">
                    <Link href="/perfil" className="text-accent hover:underline">Faça login</Link> para comentar
                  </p>
                </div>
              )}

              {/* Comments List */}
              {contoComments.length === 0 ? (
                <p className="text-center text-sm text-stone-500 font-mono py-8">
                  Nenhum comentário ainda. Seja o primeiro!
                </p>
              ) : (
                <div className="space-y-4">
                  {contoComments
                    .filter(c => !c.parentId)
                    .map((comment) => (
                      <div key={comment.id} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-mono font-bold text-accent">
                            {comment.authorId.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="text-xs font-mono text-accent">@{comment.authorId}</span>
                          {comment.isSpoiler && (
                            <span className="px-2 py-0.5 text-[8px] font-mono bg-red-900/20 text-red-400 rounded-full border border-red-800/30">
                              SPOILER
                            </span>
                          )}
                          <span className="text-[9px] font-mono text-stone-600 ml-auto">
                            {new Date(comment.timestamp).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        {comment.isSpoiler ? (
                          <details className="group">
                            <summary className="cursor-pointer text-xs text-stone-500 hover:text-stone-300 font-mono">
                              🔍 Clique para revelar spoiler
                            </summary>
                            <p className="mt-2 text-sm leading-relaxed">{comment.content}</p>
                          </details>
                        ) : (
                          <p className="text-sm leading-relaxed">{comment.content}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3">
                          <button
                            onClick={() => {
                              setReplyingTo(comment.id);
                              setShowComments(true);
                            }}
                            className="text-[10px] font-mono text-stone-500 hover:text-accent transition-colors cursor-pointer"
                          >
                            ↩ Responder
                          </button>
                        </div>

                        {/* Replies */}
                        {contoComments
                          .filter(c => c.parentId === comment.id)
                          .map((reply) => (
                            <div key={reply.id} className="ml-8 mt-3 p-3 bg-white/5 rounded-xl border border-white/5">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-mono text-stone-400">@{reply.authorId}</span>
                                <span className="text-[8px] font-mono text-stone-600">
                                  {new Date(reply.timestamp).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                              <p className="text-sm">{reply.content}</p>
                            </div>
                          ))}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );

  // Wrap with AdultContentGuard if +18
  if (isAdult) {
    return <AdultContentGuard contentTitle={conto.title}>{content}</AdultContentGuard>;
  }

  return content;
}
