"use client";

import React, { useState, useEffect, useRef, useMemo, startTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useBooks, Edition } from "@/context/BookContext";
import Header from "@/components/Header";
import AdultContentGuard from "@/components/AdultContentGuard";
import { useUserSession, ForumComment } from "@/context/UserContext";
import { User } from "@/utils/rpgMatchmaker";
import { loadBookText } from "@/utils/textLoader";

type ThemeMode = "premium-dark" | "sepia" | "pure-black" | "light-cream";

export default function DetalheLivro() {
  const params = useParams();
  const router = useRouter();
  const { books, addReview, addBookmark, toggleReactionOnBook, toggleReactionOnReview } = useBooks();
  const { currentUser, users, forumComments, addComment } = useUserSession();

  const bookId = params.id as string;
  const book = books.find((b) => b.id === bookId);

  const [currentLang, setCurrentLang] = useState<string>("pt-br");

  // Determine current language text
  const translation = book?.translations?.[currentLang];
  const displayTitle = translation?.title || book?.title || "";
  const displaySynopsis = translation?.synopsis || book?.synopsis || "";
  const displayFullText = translation?.fullText || book?.fullText || "";
  const displayDownloadFile = translation?.downloadFile || book?.downloadFile || (book ? `/downloads/${book.id}.txt` : "");

  // Persist language preference across visits
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gargbooks_language");
      if (saved && ["en", "pt-br", "pt-pt", "es", "fr"].includes(saved)) {
        startTransition(() => setCurrentLang(saved));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gargbooks_language", currentLang);
    }
  }, [currentLang]);

  // Tabs state
  const [activeTab, setActiveTab] = useState<"reader" | "editions" | "forum" | "reviews">("reader");

  // Find author profile
  const authorUser = useMemo(() => {
    if (!book) return null;
    if (book.authorId) {
      return users.find((u) => u.id === book.authorId);
    }
    return users.find((u) => u.name === book.author || u.username === book.author);
  }, [users, book]);

  // Forum thread states
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyingToUsername, setReplyingToUsername] = useState<string | null>(null);
  const [isSpoilerComment, setIsSpoilerComment] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [forumText, setForumText] = useState("");

  // Reader settings states
  const [readerTheme, setReaderTheme] = useState<ThemeMode>("premium-dark");
  const [fontSize, setFontSize] = useState<number>(18); // default size in pixels
  const [serifFont, setSerifFont] = useState<boolean>(true);

  // Selection / Highlight states
  const [selectedText, setSelectedText] = useState("");
  const [selectionCoords, setSelectionCoords] = useState<{ x: number; y: number } | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Affiliate link location state (BR or PT)
  const [userRegion, setUserRegion] = useState<"BR" | "PT">("BR");

  // Form states for reviews
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Auto-detect region on mount
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.language) {
      const language = navigator.language.toLowerCase();
      setTimeout(() => {
        if (language.includes("pt-pt")) {
          setUserRegion("PT");
        } else {
          setUserRegion("BR");
        }
      }, 0);
    }
  }, []);

  const [savedParagraphIdx, setSavedParagraphIdx] = useState<number | null>(null);

  // Load reader style preferences and reading progress on mount/bookId change
  useEffect(() => {
    if (!book) return;
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("gargbooks_reader_theme") as ThemeMode | null;
      const savedSize = localStorage.getItem("gargbooks_reader_fontsize");
      const savedSerif = localStorage.getItem("gargbooks_reader_seriffont");
      const savedProgress = localStorage.getItem(`gargbooks_progress_${book.id}`);

      setTimeout(() => {
        if (savedTheme) setReaderTheme(savedTheme);
        if (savedSize) setFontSize(Number(savedSize));
        if (savedSerif) setSerifFont(savedSerif === "true");
        
        if (savedProgress) {
          setSavedParagraphIdx(Number(savedProgress));
        } else {
          setSavedParagraphIdx(null);
        }
      }, 0);
    }
  }, [book]);

  // Reset language dynamically on book load
  useEffect(() => {
    if (!book) return;
    const availableLangs = book.translations && Object.keys(book.translations).length > 0
      ? Object.keys(book.translations)
      : [book.language || "pt-br"];
      
    if (!availableLangs.includes(currentLang)) {
      startTransition(() => {
        if (availableLangs.includes("pt-br")) {
          setCurrentLang("pt-br");
        } else if (availableLangs.length > 0) {
          setCurrentLang(availableLangs[0]);
        }
      });
    }
  }, [book, currentLang]);

  // Persist style preferences on changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gargbooks_reader_theme", readerTheme);
    }
  }, [readerTheme]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gargbooks_reader_fontsize", fontSize.toString());
    }
  }, [fontSize]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gargbooks_reader_seriffont", serifFont.toString());
    }
  }, [serifFont]);

  // Handler to set reading progress (bookmark) at paragraph index
  const handleMarkPage = (idx: number) => {
    if (!book) return;
    if (typeof window !== "undefined") {
      localStorage.setItem(`gargbooks_progress_${book.id}`, idx.toString());
      setSavedParagraphIdx(idx);
      
      const toast = document.createElement("div");
      toast.className = "fixed bottom-6 right-6 z-50 bg-accent text-white px-5 py-3 rounded-full text-xs font-semibold shadow-xl border border-white/10 animate-slide-in";
      toast.innerText = `🔖 Marcador de página salvo no parágrafo ${idx + 1}!`;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add("opacity-0", "transition-opacity", "duration-500");
        setTimeout(() => toast.remove(), 500);
      }, 2500);
    }
  };

  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [fullTextContent, setFullTextContent] = useState<string>("");
  const [textLoading, setTextLoading] = useState<boolean>(false);
  const [textLoadProgress, setTextLoadProgress] = useState<number>(0);
  const [hasLoadedFullText, setHasLoadedFullText] = useState<boolean>(false);
  const [textLoadError, setTextLoadError] = useState<string>("");
  const textLoadToken = useRef(0);

  // Determine if displayFullText is a short preview or full content
  const isPreview = useMemo(() => {
    return displayFullText.length > 0 && displayFullText.length < 5000;
  }, [displayFullText]);

  // Load text: if preview exists, use it immediately; otherwise fetch from downloadFile
  useEffect(() => {
    if (!book) return;
    startTransition(() => {
      setHasLoadedFullText(false);
      setTextLoadError("");
    });
    const token = ++textLoadToken.current;

    if (displayFullText && displayFullText.length > 0) {
      startTransition(() => setFullTextContent(displayFullText));
      return;
    }

    const loadText = async () => {
      setTextLoading(true);
      setTextLoadProgress(0);

      try {
        const result = await loadBookText(
          displayDownloadFile,
          undefined,
          (p) => setTextLoadProgress(p.percent)
        );
        if (token !== textLoadToken.current) return;
        setFullTextContent(result.text);
      } catch (err) {
        if (token !== textLoadToken.current) return;
        console.warn("Could not load book text:", err);
        setTextLoadError("Não foi possível carregar o texto da obra. Verifique sua conexão.");
      } finally {
        if (token === textLoadToken.current) {
          setTextLoading(false);
        }
      }
    };

    loadText();
  }, [book?.id, currentLang, displayFullText, displayDownloadFile]);

  const handleLoadFullText = async () => {
    setTextLoading(true);
    setTextLoadProgress(0);
    setTextLoadError("");
    const token = ++textLoadToken.current;

    try {
      const result = await loadBookText(
        displayDownloadFile,
        undefined,
        (p) => setTextLoadProgress(p.percent)
      );
      if (token !== textLoadToken.current) return;
      setFullTextContent(result.text);
      setHasLoadedFullText(true);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`gargbooks_fulltext_${book?.id}_${currentLang}`, result.text);
        } catch { /* quota exceeded, ignore */ }
      }
    } catch (err) {
      if (token !== textLoadToken.current) return;
      console.warn("Could not load full text:", err);
      setTextLoadError("Não foi possível carregar o texto completo. Verifique sua conexão ou tente novamente.");
    } finally {
      if (token === textLoadToken.current) {
        setTextLoading(false);
      }
    }
  };

  // Create runtime text download url using Blob based on loaded full text
  useEffect(() => {
    if (!fullTextContent) return;
    const blob = new Blob([fullTextContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    startTransition(() => setDownloadUrl(url));

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [fullTextContent]);


  if (!book) {
    return (
      <div className="min-h-screen bg-corto-dark text-stone-100 flex flex-col items-center justify-center p-6 font-mono">
        <span className="text-5xl mb-4">🔍</span>
        <h1 className="font-serif text-2xl font-bold mb-2">Obra não encontrada</h1>
        <p className="text-xs text-stone-500 mb-6 max-w-xs text-center">
          O link acessado é inválido ou a obra foi removida do sistema local.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2.5 bg-accent text-white font-semibold rounded-full text-xs hover:bg-accent-hover transition-all cursor-pointer"
        >
          Voltar para a Estante
        </button>
      </div>
    );
  }

  // Handle Text Selection for bookmarks
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection) return;

    const text = selection.toString().trim();
    if (text.length > 5) {
      setSelectedText(text);
      
      // Calculate coordinates for the popup button
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = textContainerRef.current?.getBoundingClientRect();
        const containerLeft = containerRect ? containerRect.left : 0;
        const containerTop = containerRect ? containerRect.top : 0;
        
        setSelectionCoords({
          x: rect.left + rect.width / 2 + window.scrollX - containerLeft - 60,
          y: rect.top - 40 + window.scrollY - containerTop - 20,
        });
      } catch {
        setSelectionCoords(null);
      }
    } else {
      setSelectedText("");
      setSelectionCoords(null);
    }
  };

  const handleSaveHighlight = () => {
    if (selectedText) {
      addBookmark(book.id, selectedText);
      // Clear selection
      setSelectedText("");
      setSelectionCoords(null);
      window.getSelection()?.removeAllRanges();
      
      // Temporary UI toast alert
      const alertDiv = document.createElement("div");
      alertDiv.className = "fixed bottom-6 right-6 z-50 bg-accent text-white px-5 py-3 rounded-full text-xs font-semibold shadow-xl border border-white/10 animate-slide-in";
      alertDiv.innerText = "🔖 Marcador salvo com sucesso!";
      document.body.appendChild(alertDiv);
      setTimeout(() => {
        alertDiv.classList.add("opacity-0", "transition-opacity", "duration-500");
        setTimeout(() => alertDiv.remove(), 500);
      }, 2500);
    }
  };

  // Forum Form Submit Handler
  const handleForumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumText.trim() || !currentUser) return;

    await addComment(book.id, replyingToId, forumText, isSpoilerComment);
    setForumText("");
    setReplyingToId(null);
    setReplyingToUsername(null);
    setIsSpoilerComment(false);
  };

  // Dynamic colors for the E-reader content box based on chosen readerTheme
  const readerThemeClasses = {
    "premium-dark": "bg-neutral-900 text-stone-150 border-white/5",
    "sepia": "bg-sepia-bg text-sepia-text border-sepia-text/10",
    "pure-black": "bg-black text-stone-200 border-white/5",
    "light-cream": "bg-corto-cream text-corto-charcoal border-corto-charcoal/10",
  }[readerTheme];

  return (
    <div className="min-h-screen bg-corto-dark text-stone-100 flex flex-col font-sans">
      <Header />

      {/* Book Hero Summary Banner */}
      <section className="bg-current/[0.02] border-b border-white/5 py-16 px-6">
        <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row gap-10 items-start">
          
          {/* Mock cover matching listing */}
          <div
            className={`w-44 aspect-[2/3] shrink-0 rounded-2xl bg-gradient-to-tr ${book.coverGradient} p-5 flex flex-col justify-between relative overflow-hidden shadow-xl border border-white/10`}
            style={book.coverImage ? { backgroundImage: `url(${book.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          >
            <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
              <svg viewBox="0 0 100 100" className="w-full h-full stroke-white fill-none stroke-[1]">
                <path d="M50,50 A0.5,0.5 0 0,1 50,50.1 A1,1 0 0,1 49,49 A2,2 0 0,1 51,47 A4,4 0 0,1 55,51 A8,8 0 0,1 47,59 A16,16 0 0,1 31,43 A32,32 0 0,1 63,11 A64,64 0 0,1 -1,75" />
              </svg>
            </div>
            <span className={`px-3 py-0.5 text-[8px] font-mono uppercase tracking-wider self-start border rounded-full ${
              book.publicDomain === false 
                ? "bg-red-950/60 border-red-500/30 text-red-200"
                : "bg-black/60 border border-white/10 text-stone-300"
            }`}>
              {book.publicDomain === false ? "© Direitos Reservados" : (book.isUserPublished ? "Original" : "Coleção")}
            </span>
            <div className="z-10 mt-auto">
              <h2 className="font-serif text-sm font-bold text-white leading-tight">
                {displayTitle}
              </h2>
            </div>
          </div>

          {/* Book Info Metadata */}
          <div className="flex-1 space-y-5">
            <button
              onClick={() => router.push("/")}
              className="text-[10px] text-accent hover:underline flex items-center gap-1 font-mono uppercase tracking-widest cursor-pointer"
            >
              ← Voltar para Estante
            </button>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-[1.0] tracking-tight">
              {displayTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-mono uppercase tracking-wider text-stone-400 border-y border-white/5 py-3 w-full">
              <span className="flex items-center gap-1.5">
                Autor:{" "}
                {book.genres.includes("Adulto +18") && book.publishWithRealPhoto === false ? (
                  <span className="flex items-center gap-1">
                    <span className="w-5 h-5 rounded-full bg-stone-800 text-[8px] font-mono font-bold flex items-center justify-center text-stone-500">?</span>
                    <strong className="text-stone-400 font-medium font-sans">Autor Anônimo</strong>
                  </span>
                ) : authorUser ? (
                  <Link
                    href={`/perfil/${authorUser.id}`}
                    className="flex items-center gap-1.5 hover:underline text-stone-250 transition-colors"
                  >
                    {authorUser.profile_picture ? (
                      <span
                        className="w-5 h-5 rounded-full bg-cover bg-center border border-accent/20 block"
                        style={{ backgroundImage: `url(${authorUser.profile_picture})` }}
                      />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-accent/20 border border-accent/20 text-[8px] font-mono font-bold flex items-center justify-center text-accent">
                        {authorUser.avatar_initial}
                      </span>
                    )}
                    <strong className="text-stone-200">{book.author}</strong>
                  </Link>
                ) : (
                  <strong className="text-stone-200">{book.author}</strong>
                )}
              </span>
              <span>•</span>
              <span>Ano: <strong className="text-stone-200">{book.year}</strong></span>
              <span>•</span>
              <span className="text-accent font-bold">★ {book.rating} / 5.0</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {book.genres.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 text-[9px] font-mono uppercase tracking-wider bg-accent/15 border border-accent/25 text-accent rounded-full font-bold"
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-3xl font-sans pt-2">
              {displaySynopsis}
            </p>

            {/* Story Reactions Bar */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
              <span className="text-[9px] font-mono uppercase tracking-widest text-stone-550">Reações:</span>
              <div className="flex gap-2">
                {["❤️", "🔥", "👏", "🤯"].map((type) => {
                  const userList = book.reactions?.[type] ?? [];
                  const hasReacted = currentUser ? userList.includes(currentUser.id) : false;
                  return (
                    <button
                      key={type}
                      onClick={() => toggleReactionOnBook(book.id, type, currentUser?.id || "")}
                      disabled={!currentUser}
                      className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-[10px] border transition-all ${
                        hasReacted
                          ? "bg-accent/20 border-accent text-accent font-bold scale-105"
                          : "bg-white/5 border-white/10 text-stone-400 hover:border-white/20 hover:text-white"
                      } disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer`}
                      title={currentUser ? "Clique para reagir" : "Faça login para reagir"}
                    >
                      <span>{type}</span>
                      {userList.length > 0 && <span className="font-mono text-[9px]">{userList.length}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs navigation bar */}
      <section className="bg-corto-dark/95 border-b border-white/5 sticky top-[72px] z-30 px-6 backdrop-blur-md">
        <div className="max-w-6xl w-full mx-auto flex font-mono text-xs uppercase tracking-widest font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("reader")}
            className={`py-4 px-6 border-b transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "reader"
                ? "border-accent text-accent"
                : "border-transparent text-stone-400 hover:text-stone-250"
            }`}
          >
            01/ Leitor Integrado
          </button>
          <button
            onClick={() => setActiveTab("editions")}
            className={`py-4 px-6 border-b transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "editions"
                ? "border-accent text-accent"
                : "border-transparent text-stone-400 hover:text-stone-250"
            }`}
          >
            02/ Edições & Físico
          </button>
          <button
            onClick={() => setActiveTab("forum")}
            className={`py-4 px-6 border-b transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "forum"
                ? "border-accent text-accent"
                : "border-transparent text-stone-400 hover:text-stone-250"
            }`}
          >
            03/ Fórum ({forumComments.filter((c) => c.bookId === book.id).length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`py-4 px-6 border-b transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "reviews"
                ? "border-accent text-accent"
                : "border-transparent text-stone-400 hover:text-stone-250"
            }`}
          >
            04/ Resenhas ({book.reviews?.length ?? 0})
          </button>
        </div>
      </section>

      {/* Tab Panels */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        
        {/* TAB 1: E-READER VIEW */}
        {activeTab === "reader" && (() => {
          const isAdult = book.genres.includes("+18") || book.genres.includes("Adulto");
          const readerContent = (
            <div className="space-y-8 animate-fade-in">
              {/* E-reader Controls */}
              <div className="bg-white/3 rounded-2xl p-5 flex flex-wrap gap-6 justify-between items-center text-[10px] font-mono text-stone-400 border border-white/5">
                
                {/* Font controls */}
                <div className="flex items-center gap-4">
                  <span className="uppercase tracking-widest">Fonte:</span>
                  <div className="flex bg-white/5 rounded-full p-0.5 border border-white/10 items-center">
                    <button
                      onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                      className="w-8 h-8 flex items-center justify-center hover:text-white hover:bg-white/5 rounded-full font-bold cursor-pointer"
                      title="Diminuir"
                    >
                      A-
                    </button>
                    <span className="px-3 text-stone-200 font-bold">{fontSize}px</span>
                    <button
                      onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                      className="w-8 h-8 flex items-center justify-center hover:text-white hover:bg-white/5 rounded-full font-bold cursor-pointer"
                      title="Aumentar"
                    >
                      A+
                    </button>
                  </div>
                  <button
                    onClick={() => setSerifFont(!serifFont)}
                    className={`px-4 py-2 rounded-full border transition-all uppercase tracking-widest font-bold cursor-pointer ${
                      serifFont
                        ? "border-accent/40 bg-accent/15 text-accent font-serif"
                        : "border-white/10 bg-white/5 text-stone-300 font-sans"
                    }`}
                  >
                    {serifFont ? "Serifada" : "Sem-Serifa"}
                  </button>
                </div>

                {/* Reader mode theme triggers */}
                <div className="flex items-center gap-3">
                  <span className="uppercase tracking-widest">Esquema:</span>
                  <div className="flex gap-2">
                    {(["premium-dark", "sepia", "pure-black", "light-cream"] as ThemeMode[]).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setReaderTheme(theme)}
                        className={`w-7 h-7 rounded-full border transition-all cursor-pointer ${
                          theme === "premium-dark"
                            ? "bg-neutral-850 border-white/20"
                            : theme === "sepia"
                            ? "bg-sepia-bg border-sepia-text/20"
                            : theme === "pure-black"
                            ? "bg-black border-white/20"
                            : "bg-[#FAF7F2] border-corto-charcoal/20"
                        } ${readerTheme === theme ? "ring-2 ring-accent scale-110" : "opacity-60 hover:opacity-100"}`}
                        title={theme.replace("-", " ")}
                      />
                    ))}
                  </div>
                </div>

                {/* Language Selector */}
                <div className="flex items-center gap-3">
                  <span className="uppercase tracking-widest">Idioma:</span>
                  <div className="flex bg-white/5 rounded-full p-0.5 border border-white/10 items-center gap-1">
                    {[
                      { code: 'en', flag: '🇬🇧', label: 'EN' },
                      { code: 'pt-br', flag: '🇧🇷', label: 'PT-BR' },
                      { code: 'pt-pt', flag: '🇵🇹', label: 'PT-PT' },
                      { code: 'es', flag: '🇪🇸', label: 'ES' },
                      { code: 'fr', flag: '🇫🇷', label: 'FR' }
                    ].map((lang) => {
                      const translations = book?.translations;
                      const hasTranslations = translations && Object.keys(translations).length > 0;
                      const isAvailable = hasTranslations
                        ? !!translations[lang.code]
                        : true;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => setCurrentLang(lang.code)}
                          disabled={!isAvailable}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer ${
                            currentLang === lang.code
                              ? "bg-accent text-white font-bold ring-2 ring-accent/50 scale-105"
                              : isAvailable
                              ? "opacity-60 hover:opacity-100 hover:bg-white/5"
                              : "opacity-30 border border-dashed border-white/20 cursor-not-allowed"
                          }`}
                          title={`${lang.label} - ${isAvailable ? 'Disponível' : 'Em breve'}`}
                        >
                          {lang.flag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Download option */}
                {book.publicDomain !== false && (
                  <a
                    href={downloadUrl || displayDownloadFile}
                    download={`${displayTitle}.txt`}
                    className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-accent hover:text-white transition-all uppercase tracking-widest font-mono font-bold cursor-pointer text-stone-300 hover:border-accent/40 text-[10px] flex items-center gap-1.5"
                    title="Baixar obra completa em formato TXT"
                  >
                    <span>📥</span> Baixar TXT Integral
                  </a>
                  )}
                </div>

              {/* Instruction tooltip */}
              <p className="text-[10px] text-center text-stone-500 font-mono italic tracking-wide">
                💡 Dica de Leitura: Selecione qualquer frase do texto abaixo para salvar um Marcador. Ou clique no marcador discreto ao lado do parágrafo para marcar sua posição.
              </p>

              {/* Continuar Lendo Banner */}
              {savedParagraphIdx !== null && (
                <div className="bg-accent/10 border border-accent/25 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between animate-fade-in text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔖</span>
                    <span className="text-stone-300">
                      Você possui um marcador de página no parágrafo <strong>#{savedParagraphIdx + 1}</strong>.
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const el = document.getElementById(`para-${savedParagraphIdx}`);
                        if (el) {
                          el.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                          });
                          el.classList.add("ring-2", "ring-accent/50", "ring-offset-2", "ring-offset-neutral-900", "rounded-xl", "transition-all", "duration-1000");
                          setTimeout(() => {
                            el.classList.remove("ring-2", "ring-accent/50", "ring-offset-2", "ring-offset-neutral-900");
                          }, 3000);
                        }
                      }}
                      className="px-4 py-2 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-all cursor-pointer"
                    >
                      Continuar Lendo ➔
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem(`gargbooks_progress_${book.id}`);
                        setSavedParagraphIdx(null);
                      }}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white rounded-xl transition-all cursor-pointer"
                      title="Remover Marcador"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              )}

              {/* E-reader Book Text Container */}
              {book.publicDomain === false ? (
                <div className={`rounded-3xl p-12 md:p-20 border transition-all duration-300 shadow-inner flex flex-col items-center justify-center text-center space-y-6 max-w-3xl mx-auto ${readerThemeClasses}`}>
                  <span className="text-6xl animate-pulse">🔒</span>
                  <h2 className="font-serif text-2xl font-bold">Obra sob Direitos Autorais Reservados</h2>
                  <p className="text-xs max-w-md leading-relaxed opacity-85 font-mono">
                    Esta obra comercial está protegida por leis de propriedade intelectual. A leitura online ou download do texto integral não estão autorizados.
                  </p>
                  <button
                    onClick={() => setActiveTab("editions")}
                    className="px-6 py-3 bg-accent text-white font-mono text-xs uppercase tracking-widest font-bold rounded-full hover:bg-accent-hover transition-all active:scale-95 shadow-md shadow-accent/25 cursor-pointer"
                  >
                    Ver Edições Disponíveis na Amazon ➔
                  </button>
                </div>
              ) : (
                <div
                  ref={textContainerRef}
                  onMouseUp={handleTextSelection}
                  className={`rounded-3xl p-8 md:p-14 border leading-[2.0] transition-all duration-300 relative select-text shadow-inner ${readerThemeClasses} ${
                    serifFont ? "font-serif" : "font-sans"
                  }`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {/* Highlight Save Trigger Floating Button */}
                  {selectedText && selectionCoords && (
                    <button
                      onClick={handleSaveHighlight}
                      className="absolute z-40 bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-full text-xs font-bold font-sans shadow-xl border border-white/10 flex items-center gap-1.5 cursor-pointer"
                      style={{
                        left: `${selectionCoords.x}px`,
                        top: `${selectionCoords.y}px`,
                      }}
                    >
                      🔖 Salvar Marcador
                    </button>
                  )}

                  {textLoading ? (
                    <div className="py-20 text-center space-y-4 font-mono text-xs opacity-60">
                      <span className="block animate-spin text-2xl text-accent">🌀</span>
                      <span className="block uppercase tracking-widest">
                        {textLoadProgress > 0 && textLoadProgress < 100
                          ? `Carregando texto completo... (${textLoadProgress}%)`
                          : "Carregando obra completa hospedada no servidor..."}
                      </span>
                      {textLoadProgress > 0 && (
                        <div className="w-64 h-1 bg-current/10 rounded-full mx-auto mt-3 overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all duration-300 rounded-full"
                            style={{ width: `${textLoadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ) : textLoadError ? (
                    <div className="py-20 text-center space-y-4 font-mono text-xs">
                      <span className="block text-3xl">⚠️</span>
                      <span className="block text-red-400 font-bold uppercase tracking-widest">
                        Erro ao carregar texto
                      </span>
                      <span className="block text-stone-400 max-w-md mx-auto">
                        {textLoadError}
                      </span>
                      <button
                        onClick={() => {
                          setTextLoadError("");
                          setHasLoadedFullText(false);
                        }}
                        className="px-6 py-3 bg-accent text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-accent-hover transition-all cursor-pointer mt-4"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  ) : (
                    <div>
                      {fullTextContent.split("\n\n").map((para, idx) => {
                      const isHighlighted = savedParagraphIdx === idx;
                      const isHeading2 = para.startsWith("##");
                      const isHeading3 = para.startsWith("###");

                      const markButton = (
                        <button
                          onClick={() => handleMarkPage(idx)}
                          className={`opacity-0 group-hover/para:opacity-100 transition-opacity duration-300 p-1.5 rounded-xl hover:bg-white/5 text-stone-500 hover:text-accent cursor-pointer text-xs`}
                          title="Marcar página aqui"
                        >
                          {isHighlighted ? "🔖" : "🏷️"}
                        </button>
                      );

                      if (isHeading2) {
                        return (
                          <div key={idx} className="group/para flex items-center justify-between gap-4 mt-8 mb-5 border-b border-current/10 pb-2">
                            <h2 id={`para-${idx}`} className="font-bold text-2xl md:text-3xl leading-snug font-serif text-accent flex-1">
                              {para.replace(/##\s*/, "")}
                            </h2>
                            {markButton}
                          </div>
                        );
                      }
                      if (isHeading3) {
                        return (
                          <div key={idx} className="group/para flex items-center justify-between gap-4 mt-6 mb-4">
                            <h3 id={`para-${idx}`} className="font-semibold text-lg md:text-xl leading-snug font-serif text-accent/80 flex-1">
                              {para.replace(/###\s*/, "")}
                            </h3>
                            {markButton}
                          </div>
                        );
                      }
                      return (
                        <div
                          key={idx}
                          className={`group/para flex gap-4 items-start py-2.5 rounded-2xl transition-all duration-300 ${
                            isHighlighted
                              ? "bg-accent/10 border border-accent/25 px-5 my-3 shadow-sm shadow-accent/5"
                              : "hover:bg-white/[0.01] px-5 -mx-5"
                          }`}
                        >
                          <p id={`para-${idx}`} className="mb-0 indent-8 text-justify flex-1">
                            {para}
                          </p>
                          <div className="pt-0.5 select-none">
                            {markButton}
                          </div>
                        </div>
                      );
                    })}
                    {isPreview && !hasLoadedFullText && (
                      <div className="text-center py-12 border-t border-current/10 mt-12">
                        <button
                          onClick={handleLoadFullText}
                          disabled={textLoading}
                          className={`px-8 py-4 rounded-full font-mono text-xs uppercase tracking-widest font-bold transition-all cursor-pointer ${
                            textLoading
                              ? "bg-current/10 text-current/40 cursor-not-allowed"
                              : "bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20"
                          }`}
                        >
                          {textLoading ? (
                            <span className="flex items-center gap-2">
                              <span className="animate-spin">🌀</span>
                              {textLoadProgress > 0
                                ? `Carregando... ${textLoadProgress}%`
                                : "Carregando..."}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              📖 Ler restante do livro em{" "}
                              {currentLang === "pt-br"
                                ? "Português 🇧🇷"
                                : currentLang === "en"
                                  ? "Inglês 🇬🇧"
                                  : currentLang === "pt-pt"
                                    ? "Português 🇵🇹"
                                    : currentLang === "es"
                                      ? "Espanhol 🇪🇸"
                                      : "Francês 🇫🇷"}
                            </span>
                          )}
                        </button>
                        {textLoadProgress > 0 && (
                          <div className="w-64 h-1 bg-current/10 rounded-full mx-auto mt-3 overflow-hidden">
                            <div
                              className="h-full bg-accent transition-all duration-300 rounded-full"
                              style={{ width: `${textLoadProgress}%` }}
                            />
                          </div>
                        )}
                        {textLoadError && (
                          <div className="mt-4 px-6 py-3 bg-red-950/30 border border-red-500/30 rounded-xl text-xs text-red-300 font-mono inline-flex items-center gap-2">
                            <span>⚠️</span> {textLoadError}
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );

          return isAdult ? (
            <AdultContentGuard contentTitle={book.title}>
              {readerContent}
            </AdultContentGuard>
          ) : (
            readerContent
          );
        })()}

        {/* TAB 2: EDITIONS VIEW (Editorial catalog) */}
        {activeTab === "editions" && (
          <div className="space-y-10 animate-fade-in">
            {/* Geolocation selector panel */}
            <div className="bg-white/3 rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row gap-6 items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold mb-1">Localizador de Preços e Afiliados</h3>
                <p className="text-xs text-stone-400 max-w-lg leading-relaxed">
                  Detectamos seu país automaticamente. Você pode alternar manualmente a geolocalização abaixo para visualizar ofertas adequadas em sua região.
                </p>
              </div>

              {/* Country select badges */}
              <div className="flex gap-1.5 p-1 bg-white/5 rounded-full border border-white/10 shrink-0">
                <button
                  onClick={() => setUserRegion("BR")}
                  className={`px-5 py-2.5 rounded-full text-[10px] uppercase font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    userRegion === "BR" ? "bg-accent text-white shadow" : "text-stone-400 hover:text-white"
                  }`}
                >
                  <span>🇧🇷</span> Brasil (R$)
                </button>
                <button
                  onClick={() => setUserRegion("PT")}
                  className={`px-5 py-2.5 rounded-full text-[10px] uppercase font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    userRegion === "PT" ? "bg-accent text-white shadow" : "text-stone-400 hover:text-white"
                  }`}
                >
                  <span>🇵🇹</span> Portugal (€)
                </button>
              </div>
            </div>

            {/* List of Editions */}
            {book.editions.length === 0 ? (
              <div className="text-center py-20 border border-dashed rounded-3xl border-white/10">
                <span className="text-4xl block mb-3">📱</span>
                <h4 className="font-serif text-lg font-bold text-stone-300">Esta é uma obra digital original</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mt-2 leading-relaxed">
                  Esta obra foi publicada digitalmente pelo autor e está disponível gratuitamente apenas no nosso leitor integrado. Nenhuma edição física de sebo catalogada.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {book.editions.map((ed: Edition) => (
                  <div
                    key={ed.id}
                    className="bg-white/3 rounded-3xl p-6 border border-white/5 hover:border-accent/35 transition-all duration-500 flex gap-6 items-start"
                  >
                    {/* Catalog Edition shape mockup */}
                    <div className="w-24 aspect-[2/3] shrink-0 bg-neutral-900 border border-white/10 rounded-xl relative p-3 flex flex-col justify-between overflow-hidden shadow-lg shadow-black/40">
                      {/* Barcode drawing */}
                      <div className="h-6 w-full flex items-center gap-[1px] opacity-45 bg-white p-1 rounded-sm mt-1">
                        <span className="w-[1px] h-full bg-black"></span>
                        <span className="w-[2px] h-full bg-black"></span>
                        <span className="w-[1px] h-full bg-black"></span>
                        <span className="w-[3px] h-full bg-black"></span>
                        <span className="w-[1px] h-full bg-black"></span>
                        <span className="w-[2px] h-full bg-black"></span>
                      </div>
                      <span className="text-[7px] font-mono text-stone-500 block break-all">
                        {ed.isbn}
                      </span>
                    </div>

                    {/* Metadata & Pricing details */}
                    <div className="flex-1 flex flex-col justify-between h-full space-y-4">
                      <div>
                        <h4 className="font-serif text-lg font-bold text-stone-200 leading-tight">
                          Edição {ed.publisher} ({ed.year})
                        </h4>
                        <ul className="text-[10px] font-mono text-stone-400 mt-2 space-y-1">
                          <li>ISBN: <span className="text-stone-200 font-bold">{ed.isbn}</span></li>
                          <li>Páginas: <span className="text-stone-200 font-bold">{ed.pages} págs</span></li>
                          <li>Tipo: <span className="text-stone-200 font-bold">{ed.coverType}</span></li>
                        </ul>
                      </div>

                      {/* Region Aware Pricing and Affiliate Link */}
                      <div className="pt-3 flex items-center justify-between border-t border-white/10">
                        <div>
                          <span className="block text-[8px] uppercase tracking-widest text-stone-500 font-mono">
                            Preço Recomendado
                          </span>
                          <span className="font-serif text-lg font-bold text-accent">
                            {userRegion === "BR"
                              ? `R$ ${ed.priceBR.toFixed(2).replace(".", ",")}`
                              : `${ed.pricePT.toFixed(2).replace(".", ",")} €`}
                          </span>
                        </div>
                        
                        <a
                          href={userRegion === "BR" ? ed.linkBR : ed.linkPT}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 bg-white text-black hover:bg-accent hover:text-white rounded-full text-[10px] uppercase font-mono font-bold tracking-widest transition-all active:scale-95 shadow-md cursor-pointer"
                        >
                          Ir para Loja ↗
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DISCUSSION FORUM / COMMUNITY CLUB */}
        {activeTab === "forum" && (
          <div className="space-y-10 animate-fade-in max-w-3xl mx-auto">
            <h3 className="font-serif text-2xl font-bold border-b border-white/5 pb-3">
              Clube de Leitura Digital
            </h3>

            {/* Write a Comment Form */}
            {currentUser ? (
              <form onSubmit={handleForumSubmit} className="bg-white/3 rounded-3xl p-6 border border-white/5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="font-serif text-sm font-semibold text-stone-250">
                    {replyingToId ? `Responder a @${replyingToUsername}` : "Escrever no Clube de Leitura"}
                  </h4>
                  {replyingToId && (
                    <button
                      type="button"
                      onClick={() => { setReplyingToId(null); setReplyingToUsername(null); }}
                      className="text-xs text-red-400 hover:underline cursor-pointer font-mono uppercase tracking-wider"
                    >
                      Cancelar
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[10px] font-mono text-stone-400">
                  <span>Autor:</span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 text-stone-200 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    @{currentUser.username} {currentUser.is_ai_persona ? "(🤖 IA)" : ""}
                  </span>
                </div>

                <div>
                  <textarea
                    required
                    rows={4}
                    value={forumText}
                    onChange={(e) => setForumText(e.target.value)}
                    placeholder={replyingToId ? "Escreva sua resposta..." : "Compartilhe suas ideias sobre a atmosfera da obra..."}
                    className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-2xl text-xs focus:border-accent outline-none resize-none font-sans text-stone-200"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <label className="flex items-center gap-2.5 text-[10px] font-mono text-stone-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSpoilerComment}
                      onChange={(e) => setIsSpoilerComment(e.target.checked)}
                      className="accent-accent cursor-pointer"
                    />
                    <span>Contém Spoilers sobre a trama? (Ocultar texto)</span>
                  </label>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-accent text-white rounded-full text-[10px] uppercase font-mono font-bold tracking-widest hover:bg-accent-hover active:scale-95 transition-all shadow-md shadow-accent/20 cursor-pointer self-end sm:self-auto"
                  >
                    {replyingToId ? "Enviar Resposta ↩" : "Publicar Comentário ↗"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 bg-white/3 rounded-3xl border border-white/5 text-center text-xs text-stone-500 font-mono italic">
                🔒 Simule um login na aba <a href="/comunidade" className="text-accent underline">Comunidade</a> para poder interagir e publicar no fórum.
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {forumComments.filter(c => c.bookId === book.id && c.parentId === null).length === 0 ? (
                <p className="text-xs text-stone-550 italic text-center py-10">
                  Ninguém comentou sobre esta obra ainda. Seja o primeiro a opinar!
                </p>
              ) : (
                forumComments
                  .filter(c => c.bookId === book.id && c.parentId === null)
                  .map(c => (
                    <CommentNode
                      key={c.id}
                      comment={c}
                      allComments={forumComments.filter(com => com.bookId === book.id)}
                      users={users}
                      currentUser={currentUser}
                      revealedSpoilers={revealedSpoilers}
                      setRevealedSpoilers={setRevealedSpoilers}
                      onReply={(commentId, username) => {
                        setReplyingToId(commentId);
                        setReplyingToUsername(username);
                        // Foca no textarea
                        const textarea = document.querySelector("textarea");
                        if (textarea) {
                          textarea.scrollIntoView({ behavior: "smooth" });
                          textarea.focus();
                        }
                      }}
                    />
                  ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: REVIEWS SECTION */}
        {activeTab === "reviews" && (
          <div className="space-y-10 animate-fade-in max-w-3xl mx-auto">
            <h3 className="font-serif text-2xl font-bold border-b border-white/5 pb-3">
              Resenhas & Críticas Literárias
            </h3>

            {/* Review Submission Form */}
            {currentUser ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!reviewText.trim()) return;
                  addReview(book.id, currentUser.name, reviewRating, reviewText);
                  setReviewText("");
                  setReviewSubmitted(true);
                  setTimeout(() => setReviewSubmitted(false), 3000);
                }}
                className="bg-white/3 rounded-3xl p-6 border border-white/5 space-y-4"
              >
                <h4 className="font-serif text-sm font-semibold text-stone-250">Escrever Resenha</h4>
                {reviewSubmitted && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl">
                    ✓ Resenha publicada com sucesso!
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span>Avaliação:</span>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="px-3 py-1 bg-neutral-900 border border-white/10 text-accent rounded-xl font-bold outline-none cursor-pointer"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {"★".repeat(r)} ({r}/5)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-[10px] font-mono text-stone-500">
                    Resenhando como: <strong className="text-stone-300">@{currentUser.username}</strong>
                  </div>
                </div>
                <textarea
                  required
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Escreva sua opinião crítica sobre esta obra..."
                  className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-2xl text-xs focus:border-accent outline-none resize-none font-sans text-stone-200"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-accent text-white rounded-full text-[10px] uppercase font-mono font-bold tracking-widest hover:bg-accent-hover active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    Publicar Resenha ↗
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 bg-white/3 rounded-3xl border border-white/5 text-center text-xs text-stone-500 font-mono italic">
                🔒 Faça login na aba <a href="/comunidade" className="text-accent underline">Comunidade</a> para poder avaliar e resenhar.
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {!book.reviews || book.reviews.length === 0 ? (
                <p className="text-xs text-stone-550 italic text-center py-10">
                  Nenhuma resenha escrita ainda. Seja o primeiro a avaliar!
                </p>
              ) : (
                book.reviews.map((rev) => {
                  const revAuthor = users.find((u) => u.name === rev.username || u.username === rev.username);
                  const revReactions = rev.reactions ?? {};
                  return (
                    <div
                      key={rev.id}
                      className="p-6 bg-white/3 border border-white/5 rounded-3xl text-sm space-y-3 hover:border-accent/30 transition-all duration-300"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          {revAuthor && revAuthor.profile_picture ? (
                            <span
                              className="w-7 h-7 rounded-full bg-cover bg-center border border-accent/20 block"
                              style={{ backgroundImage: `url(${revAuthor.profile_picture})` }}
                            />
                          ) : (
                            <span className="w-7 h-7 rounded-full bg-accent/15 border border-accent/20 text-accent text-[10px] font-bold flex items-center justify-center">
                              {rev.username.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                          {revAuthor ? (
                            <Link
                              href={`/perfil/${revAuthor.id}`}
                              className="font-semibold text-stone-200 hover:underline"
                            >
                              {rev.username}
                            </Link>
                          ) : (
                            <span className="font-semibold text-stone-200">{rev.username}</span>
                          )}
                          <span className="text-accent ml-2 text-[10px] font-mono">
                            {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                          </span>
                        </div>
                        <span className="font-mono text-stone-500 text-[10px]">{rev.date}</span>
                      </div>
                      <p className="text-stone-300 text-xs md:text-sm leading-relaxed font-sans pl-9">
                        {rev.text}
                      </p>

                      {/* Reactions bar for Review */}
                      <div className="flex gap-2.5 pt-2 border-t border-white/5 mt-2 pl-9">
                        {["❤️", "👍", "💡", "😮"].map((type) => {
                          const userList = revReactions[type] ?? [];
                          const hasReacted = currentUser ? userList.includes(currentUser.id) : false;
                          return (
                            <button
                              key={type}
                              onClick={() => toggleReactionOnReview(book.id, rev.id, type, currentUser?.id || "")}
                              disabled={!currentUser}
                              className={`flex items-center gap-1 py-1 px-2.5 rounded-full text-[10px] font-mono border transition-all cursor-pointer ${
                                hasReacted
                                  ? "bg-accent/10 border-accent/30 text-accent font-bold"
                                  : "bg-white/3 border-white/5 text-stone-500 hover:border-white/10 hover:text-stone-300"
                              } disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
                              <span>{type}</span>
                              {userList.length > 0 && <span>{userList.length}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-componente para renderizar cada nó de comentário (recursivo para respostas aninhadas)
interface CommentNodeProps {
  comment: ForumComment;
  allComments: ForumComment[];
  users: User[];
  currentUser: User | null;
  revealedSpoilers: Record<string, boolean>;
  setRevealedSpoilers: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onReply: (commentId: string, username: string) => void;
}

function CommentNode({
  comment,
  allComments,
  users,
  currentUser,
  revealedSpoilers,
  setRevealedSpoilers,
  onReply
}: CommentNodeProps) {
  const author = users.find(u => u.id === comment.authorId);
  const replies = allComments.filter(c => c.parentId === comment.id);
  const { toggleReactionOnComment } = useUserSession();
  
  const isSpoiler = comment.isSpoiler;
  const isRevealed = revealedSpoilers[comment.id] || false;

  const dateFormatted = new Date(comment.timestamp).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const commentReactions = comment.reactions ?? {};

  return (
    <div className="space-y-4">
      {/* Box do Comentário */}
      <div className="p-6 bg-white/3 border border-white/5 rounded-3xl text-sm space-y-3 hover:border-accent/30 transition-all duration-300">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            {author && author.profile_picture ? (
              <span
                className="w-7 h-7 rounded-full bg-cover bg-center border border-accent/20 block animate-fade-in"
                style={{ backgroundImage: `url(${author.profile_picture})` }}
              />
            ) : (
              <span className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center border ${
                author?.is_ai_persona 
                  ? "bg-red-950/45 border-red-500/30 text-red-400" 
                  : "bg-accent/25 border-accent/25 text-accent"
              }`}>
                {(author?.name || "Leitor").slice(0, 2).toUpperCase()}
              </span>
            )}
            {author ? (
              <Link href={`/perfil/${author.id}`} className="font-semibold text-stone-200 hover:underline">
                {author.name}
              </Link>
            ) : (
              <span className="font-semibold text-stone-200">Leitor Anônimo</span>
            )}
            <span className="text-[10px] font-mono text-stone-500">
              @{author?.username || "anonimo"}
            </span>
            {author?.is_ai_persona && (
              <span className="px-2 py-0.5 text-[8px] bg-red-950/40 border border-red-500/30 text-red-400 rounded font-mono font-bold uppercase tracking-wider">
                🤖 Persona IA
              </span>
            )}
          </div>
          <span className="font-mono text-stone-500 text-[10px]">{dateFormatted}</span>
        </div>

        {/* Corpo do comentário com lógica de spoiler */}
        <div className="relative pt-1">
          <p className={`text-stone-300 text-xs md:text-sm leading-relaxed font-sans ${
            isSpoiler && !isRevealed ? "blur-md select-none pointer-events-none" : ""
          }`}>
            {comment.content}
          </p>
          {isSpoiler && !isRevealed && (
            <button
              onClick={() => setRevealedSpoilers(prev => ({ ...prev, [comment.id]: true }))}
              className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/50 hover:bg-black/75 rounded-xl text-[10px] font-mono text-accent font-bold tracking-wider uppercase transition-all cursor-pointer pointer-events-auto"
            >
              ⚠️ Contém Spoiler (Clique para Revelar)
            </button>
          )}
        </div>

        {/* Reações e Responder */}
        <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2">
          {/* Reactions bar for comments */}
          <div className="flex gap-2">
            {["❤️", "👍", "💡", "😮"].map((type) => {
              const userList = commentReactions[type] ?? [];
              const hasReacted = currentUser ? userList.includes(currentUser.id) : false;
              return (
                <button
                  key={type}
                  onClick={() => toggleReactionOnComment(comment.id, type)}
                  className={`flex items-center gap-1 py-1 px-2 rounded-full text-[10px] font-mono border transition-all cursor-pointer ${
                    hasReacted
                      ? "bg-accent/15 border-accent/35 text-accent font-bold"
                      : "bg-white/3 border-white/5 text-stone-500 hover:border-white/10 hover:text-stone-300"
                  }`}
                  title={`${userList.length} reações`}
                >
                  <span>{type}</span>
                  {userList.length > 0 && <span>{userList.length}</span>}
                </button>
              );
            })}
          </div>

          {currentUser && (
            <button
              onClick={() => onReply(comment.id, author?.username || "anonimo")}
              className="text-[10px] font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              ↩ Responder
            </button>
          )}
        </div>
      </div>

      {/* Respostas Aninhadas (Recursivo) */}
      {replies.length > 0 && (
        <div className="ml-6 md:ml-10 border-l border-white/5 pl-4 md:pl-6 space-y-4">
          {replies.map(reply => (
            <CommentNode
              key={reply.id}
              comment={reply}
              allComments={allComments}
              users={users}
              currentUser={currentUser}
              revealedSpoilers={revealedSpoilers}
              setRevealedSpoilers={setRevealedSpoilers}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
