"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBooks } from "@/context/BookContext";
import { useUserSession } from "@/context/UserContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RecommendedSection from "@/components/RecommendedSection";
import { getRecommendations } from "@/utils/recommendations";
import { Book } from "@/context/BookContext";

type ContentTab = "todos" | "livros" | "contos";

export default function Home() {
  const router = useRouter();
  const { books, livros, contos, addBook } = useBooks();
  const { currentUser } = useUserSession();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [sortBy, setSortBy] = useState("year-desc");
  const [appTheme, setAppTheme] = useState<"dark" | "sepia" | "light">("light");
  const [activeTab, setActiveTab] = useState<ContentTab>("livros");
  const [userRegion, setUserRegion] = useState<"BR" | "PT">("BR");

  // Detect region upon login or browser language
  useEffect(() => {
    if (typeof window !== "undefined") {
      const lang = navigator.language || "";
      if (lang.toLowerCase().includes("pt-pt") || lang.toLowerCase().includes("es") || lang.toLowerCase().includes("de") || lang.toLowerCase().includes("gb") || lang.toLowerCase().includes("uk")) {
        setUserRegion("PT");
      } else {
        setUserRegion("BR");
      }
    }
  }, [currentUser]);

  // Curated book promotions database (Amazon Affiliate)
  const amazonPromotions = useMemo(() => {
    return [
      {
        id: "promo-1",
        title: "Drácula (Edição Especial)",
        author: "Bram Stoker",
        description: "O clássico supremo do terror gótico em edição de luxo com capa dura e ilustrações.",
        image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&auto=format&fit=crop&q=60",
        prices: {
          BR: { current: 49.90, original: 69.90, store: "Amazon BR", link: "https://www.amazon.com.br/s?k=Dracula+Bram+Stoker+Capa+Dura&tag=gargbooks-20" },
          PT: { current: 14.90, original: 19.90, store: "Amazon ES", link: "https://www.amazon.es/s?k=Dracula+Bram+Stoker+Tapa+Dura&tag=gargbookspt-21" }
        }
      },
      {
        id: "promo-2",
        title: "Neuromancer",
        author: "William Gibson",
        description: "A obra definitiva do Cyberpunk que inspirou Matrix e definiu a ficção científica moderna.",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60",
        prices: {
          BR: { current: 39.90, original: 55.00, store: "Amazon BR", link: "https://www.amazon.com.br/s?k=Neuromancer+William+Gibson&tag=gargbooks-20" },
          PT: { current: 12.50, original: 16.00, store: "Amazon ES", link: "https://www.amazon.es/s?k=Neuromancer+William+Gibson&tag=gargbookspt-21" }
        }
      },
      {
        id: "promo-3",
        title: "O Silmarillion",
        author: "J.R.R. Tolkien",
        description: "A cosmologia da Terra-média em uma edição ilustrada essencial para todo fã de fantasia.",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&auto=format&fit=crop&q=60",
        prices: {
          BR: { current: 59.90, original: 79.90, store: "Amazon BR", link: "https://www.amazon.com.br/s?k=O+Silmarillion+Tolkien+Ilustrado&tag=gargbooks-20" },
          PT: { current: 18.90, original: 24.90, store: "Amazon ES", link: "https://www.amazon.es/s?k=El+Silmarillion+Tolkien+Ilustrado&tag=gargbookspt-21" }
        }
      }
    ];
  }, []);

  const [promoList, setPromoList] = useState<any[]>(amazonPromotions);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  // Load banners from API
  useEffect(() => {
    async function loadPromos() {
      try {
        const res = await fetch("/api/banners");
        if (res.ok) {
          const data = await res.json();
          const activeBanners = data.filter((b: any) => b.active).sort((a: any, b: any) => a.order - b.order);
          if (activeBanners.length > 0) {
            const mapped = activeBanners.map((b: any) => ({
              id: b.id,
              title: b.title,
              author: b.author || "Curadoria Editorial",
              description: b.description || "Destaque selecionado por nossa curadoria literária. Clique para conferir.",
              image: b.imageUrl,
              prices: b.prices || {
                BR: { current: b.price || 49.90, original: b.originalPrice || 69.90, store: "Amazon BR", link: b.link },
                PT: { current: b.price_eur || 14.90, original: b.originalPrice_eur || 19.90, store: "Amazon ES", link: b.link }
              }
            }));
            setPromoList(mapped);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar banners dinâmicos:", err);
      }
    }
    loadPromos();
  }, [amazonPromotions]);

  // Auto-advance promotion carousel
  useEffect(() => {
    if (promoList.length === 0) return;
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [promoList]);

  // Project Gutenberg Global Search states
  const [gutenbergResults, setGutenbergResults] = useState<any[]>([]);
  const [loadingGutenberg, setLoadingGutenberg] = useState(false);
  const [hasSearchedGutenberg, setHasSearchedGutenberg] = useState(false);

  // Amazon Search states
  const [amazonResults, setAmazonResults] = useState<any[]>([]);
  const [loadingAmazon, setLoadingAmazon] = useState(false);
  const [hasSearchedAmazon, setHasSearchedAmazon] = useState(false);

  // Search Project Gutenberg (Gutendex API with CORS enabled)
  const handleGutenbergSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoadingGutenberg(true);
    setHasSearchedGutenberg(true);
    // Clear Amazon search results to avoid cluttering
    setAmazonResults([]);
    setHasSearchedAmazon(false);
    try {
      const response = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setGutenbergResults(data.results || []);
      } else {
        console.error("Erro na busca do Gutendex");
      }
    } catch (err) {
      console.error("Falha ao buscar no Gutenberg:", err);
    } finally {
      setLoadingGutenberg(false);
    }
  };

  // Search Amazon using our new Next.js route
  const handleAmazonSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoadingAmazon(true);
    setHasSearchedAmazon(true);
    // Clear Gutenberg search results to avoid cluttering
    setGutenbergResults([]);
    setHasSearchedGutenberg(false);
    try {
      const response = await fetch(`/api/amazon?q=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setAmazonResults(data.results || []);
      } else {
        console.error("Erro na busca da Amazon");
      }
    } catch (err) {
      console.error("Falha ao buscar na Amazon:", err);
    } finally {
      setLoadingAmazon(false);
    }
  };

  // Add Project Gutenberg book to local Context and route to reader
  const handleOpenGutenbergBook = (gbook: any) => {
    const bookId = `gutenberg-${gbook.id}`;
    const existing = books.find(b => b.id === bookId);
    
    if (!existing) {
      const coverImg = gbook.formats["image/jpeg"] || null;
      const authorName = gbook.authors && gbook.authors.length > 0 
        ? gbook.authors[0].name.split(',').reverse().join(' ').trim() 
        : "Autor Desconhecido";
      
      const newBook = {
        id: bookId,
        title: gbook.title,
        author: authorName,
        year: gbook.authors && gbook.authors.length > 0 && gbook.authors[0].birth_year 
          ? gbook.authors[0].birth_year + 25 
          : 1850,
        genres: gbook.subjects || ["Clássicos"],
        coverGradient: "from-stone-900 via-neutral-950 to-neutral-900",
        coverImage: coverImg,
        synopsis: `Obra clássica importada do acervo global do Project Gutenberg.`,
        fullText: "Carregando o texto completo do Project Gutenberg...",
        downloadFile: `/api/gutenberg?id=${gbook.id}`,
        type: "livro" as const,
        publicDomain: true,
        language: "en",
        editions: [],
        reviews: [],
        translations: {
          "en": {
            title: gbook.title,
            synopsis: `Classic work from Project Gutenberg.`,
            fullText: "Carregando...",
            downloadFile: `/api/gutenberg?id=${gbook.id}`
          },
          "pt-br": {
            title: gbook.title,
            synopsis: `Obra clássica importada do Project Gutenberg.`,
            fullText: "Carregando...",
            downloadFile: `/api/gutenberg?id=${gbook.id}`
          }
        }
      };
      
      addBook(newBook);
    }
    
    router.push(`/livros/${bookId}`);
  };

  // Catalog commercial book and route to details page
  const handleOpenAmazonBook = (aBook: any) => {
    const bookId = aBook.id;
    const existing = books.find(b => b.id === bookId);
    
    if (!existing) {
      addBook({
        ...aBook,
        isUserPublished: false
      });
    }
    
    router.push(`/livros/${bookId}`);
  };

  // Preloader state
  const [preloaderActive, setPreloaderActive] = useState(true);
  const [progress, setProgress] = useState(0);
  const [enterVisible, setEnterVisible] = useState(false);

  // Featured book reveal state
  const [featuredRevealed, setFeaturedRevealed] = useState(false);

  // Cursor coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [followerPos, setFollowerPos] = useState({ x: 0, y: 0 });

  // 1. Dynamic CSS Variables update for theme sync
  useEffect(() => {
    const bg = appTheme === "light" ? "#F0E3CF" : appTheme === "dark" ? "#121213" : "#EAE5DC";
    const fg = appTheme === "light" ? "#121213" : appTheme === "dark" ? "#F0E3CF" : "#3E3529";
    document.documentElement.style.setProperty('--background', bg);
    document.documentElement.style.setProperty('--foreground', fg);
  }, [appTheme]);

  // 2. Preloader simulated loading progress
  useEffect(() => {
    if (!preloaderActive) return;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setEnterVisible(true);
          return 100;
        }
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 120);
    return () => clearInterval(timer);
  }, [preloaderActive]);

  // 3. Custom Cursor Follower LERP effect
  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth <= 768) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    let frameId: number;
    const updateFollower = () => {
      setFollowerPos((prev) => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15,
        };
      });
      frameId = requestAnimationFrame(updateFollower);
    };
    frameId = requestAnimationFrame(updateFollower);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, [mousePos]);

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
    dark: "bg-[#121213] text-[#F0E3CF]",
    sepia: "bg-[#EAE5DC] text-[#121213]",
    light: "bg-[#F0E3CF] text-[#121213]",
  }[appTheme];

  const borderClasses = {
    dark: "border-[#F0E3CF]/15",
    sepia: "border-[#121213]/15",
    light: "border-[#121213]/15",
  }[appTheme];

  const mutedTextClasses = {
    dark: "text-stone-400",
    sepia: "text-stone-600",
    light: "text-stone-600",
  }[appTheme];

  const inputClasses = {
    dark: "bg-white/5 border-white/10 text-[#F0E3CF] focus:border-accent/60 placeholder-stone-500",
    sepia: "bg-black/5 border-black/10 text-[#121213] focus:border-accent/60 placeholder-stone-500",
    light: "bg-black/5 border-black/10 text-[#121213] focus:border-accent/60 placeholder-stone-500",
  }[appTheme];

  const selectClasses = {
    dark: "bg-neutral-900 border-white/10 text-[#F0E3CF] focus:border-accent",
    sepia: "bg-[#EAE5DC] border-black/10 text-[#121213] focus:border-accent",
    light: "bg-[#F0E3CF] border-black/10 text-[#121213] focus:border-accent",
  }[appTheme];

  const tabBadgeCount: Record<ContentTab, number> = {
    todos: books.length,
    livros: livros.length,
    contos: contos.length,
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-700 ${themeClasses}`}>
      <Header />

      {/* Preloader Overlay */}
      {preloaderActive && (
        <div id="preloader" style={{ opacity: enterVisible && !preloaderActive ? 0 : 1 }}>
          <div className="text-center flex flex-col items-center">
            <div className="loader-crest">
              <span className="font-serif text-2xl font-bold text-accent">G</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl tracking-[0.4rem] font-bold mb-2">GARGBOOKS</h1>
            <p className="font-script text-2xl text-accent mb-8">A Arte do Raciocínio e do Conto</p>
            
            {!enterVisible ? (
              <>
                <div className="w-60 h-[2px] bg-white/10 relative overflow-hidden mb-3">
                  <div 
                    className="h-full bg-accent transition-all duration-150" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <div className="font-mono text-xs tracking-widest text-white/50">{progress}%</div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/50 mb-2">
                  Escolha o seu caminho literário
                </span>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => {
                      setActiveTab("livros");
                      setPreloaderActive(false);
                    }}
                    className="font-serif text-xs tracking-[0.2rem] px-6 py-3.5 border border-accent text-accent hover:bg-accent hover:text-[#121213] transition-all duration-300 transform hover:scale-105 cursor-pointer w-48 font-bold"
                  >
                    EXPLORAR LIVROS
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("contos");
                      setPreloaderActive(false);
                    }}
                    className="font-serif text-xs tracking-[0.2rem] px-6 py-3.5 border border-accent text-accent hover:bg-accent hover:text-[#121213] transition-all duration-300 transform hover:scale-105 cursor-pointer w-48 font-bold"
                  >
                    LER CONTOS
                  </button>
                </div>
                 <button
                  onClick={() => {
                    setActiveTab("livros");
                    setPreloaderActive(false);
                  }}
                  className="font-mono text-[9px] uppercase tracking-[0.15rem] text-white/40 hover:text-white transition-colors duration-300 cursor-pointer mt-2 underline underline-offset-4"
                >
                  Ir para a estante
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Mouse Cursor elements */}
      {typeof window !== "undefined" && window.innerWidth > 768 && (
        <>
          <div
            id="custom-cursor"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
            }}
          />
          <div
            id="custom-cursor-follower"
            style={{
              left: `${followerPos.x}px`,
              top: `${followerPos.y}px`,
            }}
          />
        </>
      )}

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
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-4">
                Estante{" "}
                <span className="font-light italic text-accent font-serif">editorial</span> de obras
                e{" "}
                <span className="font-light italic text-accent font-serif">contos</span> literários.
              </h1>
              <span className="font-script text-accent text-3xl md:text-5xl block -mt-2 mb-6">A Curadoria da Escrita</span>
              <p className={`text-sm md:text-base max-w-2xl ${mutedTextClasses} leading-relaxed font-sans`}>
                Uma curadoria de livros clássicos, edições raras e contos contemporâneos. Explore,
                descubra e compre com links de afiliados curados pela nossa equipe editorial.
              </p>
            </div>

            {/* Theme switcher */}
            <div className="flex items-center gap-1 bg-current/5 p-1 rounded-full border border-current/10 self-start lg:self-end">
              {(["light", "dark"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setAppTheme(t)}
                  className={`px-4 py-2 text-[10px] uppercase tracking-wider font-mono font-bold rounded-full transition-all cursor-pointer ${
                    appTheme === t
                      ? "bg-accent text-white shadow-md shadow-accent/25"
                      : "text-current/60 hover:text-current"
                  }`}
                >
                  {t === "light" ? "Pergaminho" : "Antracite"}
                </button>
              ))}
            </div>
          </div>

          <div className="editorial-line mt-12" />
        </section>

        {/* ── Amazon Affiliate Promotion Carousel ── */}
        <section className="mb-24 rounded-3xl border border-accent/20 bg-current/3 p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden transition-all duration-500 shadow-md">
          {/* Subtle gold mesh backdrop */}
          <div className="absolute inset-0 bg-radial-gradient(circle at 90% 20%, rgba(var(--color-accent-rgb), 0.04) 0%, transparent 40%) pointer-events-none" />
          
          <div className="flex-1 z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[1.5px] w-6 bg-accent animate-pulse" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-accent font-bold">
                Oferta Exclusiva Amazon
              </span>
              <button 
                onClick={() => setUserRegion(prev => prev === "BR" ? "PT" : "BR")}
                className="px-2.5 py-1 border border-accent/30 text-accent/80 hover:text-accent hover:border-accent text-[8px] font-mono rounded font-bold uppercase transition-all cursor-pointer bg-transparent"
                title="Clique para alternar região de ofertas"
              >
                {userRegion === "BR" ? "🇧🇷 BRASIL" : "🇪🇺 EUROPA"}
              </button>
            </div>
            
            <div className="min-h-[120px] transition-all duration-500">
              <h3 className="font-serif text-2xl md:text-3xl font-bold tracking-tight mb-1 text-current">
                {promoList[currentPromoIndex]?.title}
              </h3>
              <p className="font-mono text-[10px] uppercase tracking-widest text-current/60 mb-4 font-semibold">
                por {promoList[currentPromoIndex]?.author}
              </p>
              <p className={`text-xs md:text-sm leading-relaxed max-w-2xl ${mutedTextClasses}`}>
                {promoList[currentPromoIndex]?.description}
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-6">
              <div className="font-serif text-2xl font-black text-accent">
                {userRegion === "BR" 
                  ? `R$ ${promoList[currentPromoIndex]?.prices.BR.current.toFixed(2)}`
                  : `€ ${promoList[currentPromoIndex]?.prices.PT.current.toFixed(2)}`
                }
              </div>
              <div className="font-mono text-xs line-through opacity-40">
                {userRegion === "BR"
                  ? `R$ ${promoList[currentPromoIndex]?.prices.BR.original.toFixed(2)}`
                  : `€ ${promoList[currentPromoIndex]?.prices.PT.original.toFixed(2)}`
                }
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-mono font-bold rounded uppercase tracking-wider">
                Economia Ativa
              </span>
            </div>

            {/* Navigation Dots */}
            <div className="flex items-center gap-2 mt-8">
              {promoList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPromoIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    currentPromoIndex === idx ? "bg-accent w-4" : "bg-current/15 hover:bg-current/35"
                  }`}
                  aria-label={`Slide de promoção ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 z-10 flex-shrink-0 w-full md:w-auto">
            <div className="w-[110px] h-[165px] bg-stone-800 rounded-lg shadow-xl overflow-hidden flex-shrink-0 relative border border-current/10 group">
              <img
                src={promoList[currentPromoIndex]?.image}
                alt={promoList[currentPromoIndex]?.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            
            <a
              href={userRegion === "BR" 
                ? promoList[currentPromoIndex]?.prices.BR.link
                : promoList[currentPromoIndex]?.prices.PT.link
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial px-6 py-4 bg-accent text-[#121213] rounded-full font-mono text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all text-center hover:bg-accent-hover font-bold"
            >
              Comprar na Amazon ↗
            </a>
          </div>
        </section>

        {/* ── Featured Book Reveal Section ── */}
        <section className="mb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center animate-fade-in-up">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[1px] w-8 bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold">
                Obra em Destaque
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {books[0]?.title || "A Divina Comédia"}
            </h2>
            <p className="font-mono text-xs uppercase tracking-widest text-current/60 mb-6 font-semibold">
              por {books[0]?.author || "Dante Alighieri"}
            </p>
            <p className={`text-sm md:text-base leading-relaxed mb-8 max-w-xl ${mutedTextClasses}`}>
              {books[0]?.synopsis || "Uma viagem alegórica pelo além-túmulo, que moldou a literatura ocidental. Nesta edição especial, explore os detalhes de sua estrutura narrativa de forma escultural."}
            </p>
            {featuredRevealed && (
              <Link
                href={`/livros/${books[0]?.id || "a-divina-comedia"}`}
                className="inline-block px-8 py-3 bg-accent text-white hover:bg-accent-hover text-xs uppercase tracking-widest font-mono font-bold transition-all duration-300 transform active:scale-95 shadow-lg shadow-accent/25 hover:shadow-accent/40"
              >
                Acessar Edição Luxo ↗
              </Link>
            )}
          </div>
          
          <div className="lg:col-span-5 flex justify-center">
            <div className="book-container rounded-2xl border border-current/15 bg-current/3">
              <div 
                className={`book-veil transition-all duration-1000 ${featuredRevealed ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'}`}
              >
                <div className="veil-pattern" />
                <button
                  onClick={() => setFeaturedRevealed(true)}
                  className="z-12 cursor-pointer relative px-6 py-3 font-serif text-[10px] font-bold uppercase tracking-[0.2rem] text-accent border border-accent hover:bg-accent hover:text-[#121213] transition-all duration-500"
                >
                  REVELAR DESTAQUE
                </button>
              </div>
              <div className={`w-full h-full p-6 flex flex-col justify-center items-center relative transition-all duration-700 ${featuredRevealed ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <img 
                  src="/book_cover.png" 
                  alt="Livro em Destaque" 
                  className="max-h-[85%] max-w-[85%] object-contain shadow-2xl rounded-md transition-transform duration-500 hover:scale-105 hover:-rotate-1"
                />
              </div>
            </div>
          </div>
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
            {searchTerm.trim().length > 1 && activeTab !== "contos" && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleGutenbergSearch}
                  className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest rounded-full border border-accent text-accent hover:bg-accent hover:text-[#121213] transition-all cursor-pointer font-bold flex items-center gap-1"
                >
                  Gutenberg 🌐
                </button>
                <button
                  onClick={handleAmazonSearch}
                  className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest rounded-full border border-emerald-500 text-emerald-450 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer font-bold flex items-center gap-1"
                >
                  Amazon 🛒
                </button>
              </div>
            )}
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

        {/* ── Project Gutenberg Global Search Results ── */}
        {(loadingGutenberg || (hasSearchedGutenberg && gutenbergResults.length > 0)) && (
          <section className="mb-24 mt-4 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-[1px] w-8 bg-accent" />
              <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
                Acervo Global (Project Gutenberg)
              </span>
            </div>
            
            {loadingGutenberg ? (
              <div className="text-center py-12">
                <div className="animate-spin text-accent text-3xl mb-2">⏳</div>
                <p className="font-mono text-xs opacity-60">Consultando base de 70.000+ livros do Project Gutenberg...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {gutenbergResults.map((gbook) => {
                  const coverImg = gbook.formats["image/jpeg"];
                  const author = gbook.authors && gbook.authors.length > 0 
                    ? gbook.authors[0].name.split(',').reverse().join(' ').trim() 
                    : "Autor Desconhecido";
                  
                  return (
                    <div 
                      key={gbook.id} 
                      onClick={() => handleOpenGutenbergBook(gbook)}
                      className={`border rounded-2xl p-6 flex flex-col justify-between items-center text-center cursor-pointer hover:border-accent hover:shadow-xl transition-all duration-300 ${borderClasses} bg-current/3`}
                    >
                      <div className="w-[120px] h-[175px] shadow-lg rounded-md overflow-hidden bg-stone-800 flex items-center justify-center mb-4 relative">
                        {coverImg ? (
                          <img src={coverImg} alt={gbook.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="p-3 text-[10px] text-white/60 font-serif font-bold uppercase">{gbook.title}</div>
                        )}
                        <div className="absolute top-2 right-2 bg-accent/85 text-[#121213] text-[8px] font-mono font-bold px-1.5 py-0.5 rounded">
                          GUTENBERG
                        </div>
                      </div>
                      <div>
                        <h3 className="font-serif text-xs font-bold line-clamp-2 mb-1">{gbook.title}</h3>
                        <p className="font-mono text-[9px] opacity-60 uppercase tracking-wider">{author}</p>
                      </div>
                      <button className="mt-4 px-4 py-2 bg-accent text-[#121213] rounded-full font-mono text-[9px] font-bold uppercase tracking-wider w-full cursor-pointer">
                        Ler Livro Completo
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="editorial-line mt-12" />
          </section>
        )}

        {/* ── Amazon Affiliate Catalog Search Results ── */}
        {(loadingAmazon || (hasSearchedAmazon && amazonResults.length > 0)) && (
          <section className="mb-24 mt-4 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-[1px] w-8 bg-emerald-500" />
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-450 font-semibold">
                Catálogo Comercial (Parceiro Amazon)
              </span>
            </div>
            
            {loadingAmazon ? (
              <div className="text-center py-12">
                <div className="animate-spin text-emerald-500 text-3xl mb-2">⏳</div>
                <p className="font-mono text-xs opacity-60">Pesquisando no catálogo completo comercial da Amazon BR e ES...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {amazonResults.map((aBook) => {
                  const coverImg = aBook.coverImage;
                  return (
                    <div 
                      key={aBook.id} 
                      onClick={() => handleOpenAmazonBook(aBook)}
                      className={`border rounded-2xl p-6 flex flex-col justify-between items-center text-center cursor-pointer hover:border-emerald-500 hover:shadow-xl transition-all duration-300 ${borderClasses} bg-current/3`}
                    >
                      <div className="w-[120px] h-[175px] shadow-lg rounded-md overflow-hidden bg-stone-800 flex items-center justify-center mb-4 relative">
                        {coverImg ? (
                          <img src={coverImg} alt={aBook.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="p-3 text-[10px] text-white/60 font-serif font-bold uppercase">{aBook.title}</div>
                        )}
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded">
                          COMERCIAL
                        </div>
                      </div>
                      <div>
                        <h3 className="font-serif text-xs font-bold line-clamp-2 mb-1">{aBook.title}</h3>
                        <p className="font-mono text-[9px] opacity-60 uppercase tracking-wider">{aBook.author}</p>
                      </div>
                      <button className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-full font-mono text-[9px] font-bold uppercase tracking-wider w-full cursor-pointer">
                        Ver Edição / Comprar 🛒
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="editorial-line mt-12" />
          </section>
        )}

        {/* ── Content Grid ─────────────────────────────────────────────── */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-24 border border-dashed rounded-3xl border-current/15">
            <span className="text-5xl block mb-4">
              {activeTab === "contos" ? "✍️" : "📖"}
            </span>
            <h3 className="font-serif text-xl font-bold mb-2">
              Nenhum {activeTab === "contos" ? "conto" : "livro"} encontrado localmente
            </h3>
            <p className={`text-xs ${mutedTextClasses} max-w-sm mx-auto mb-6`}>
              Tente redefinir seus filtros ou buscar por outros termos de pesquisa na estante.
            </p>
            {searchTerm.trim().length > 1 && activeTab !== "contos" && (
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleGutenbergSearch}
                  className="px-6 py-3 bg-accent text-[#121213] hover:bg-accent-hover text-xs uppercase tracking-widest font-mono font-bold transition-all duration-300 transform active:scale-95 shadow-lg shadow-accent/25 cursor-pointer rounded-full"
                >
                  Buscar no Project Gutenberg 🌐
                </button>
                <button
                  onClick={handleAmazonSearch}
                  className="px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 text-xs uppercase tracking-widest font-mono font-bold transition-all duration-300 transform active:scale-95 shadow-lg shadow-emerald-600/25 cursor-pointer rounded-full"
                >
                  Buscar no Catálogo Amazon 🛒
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-fade-in-up">
            {filteredBooks.map((book, idx) => {
              const isLivro = book.type === "livro";
              const hasBuyLink = isLivro && book.editions && book.editions.length > 0;

              return (
                <React.Fragment key={book.id}>
                  {/* Manifesto row after 2nd item */}
                  {idx === 2 && (
                    <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 my-8 border-y border-current/10 py-12 text-center w-full">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-accent mb-3 block font-bold">
                        O Manifesto Gargbooks
                      </span>
                      <p className="font-serif text-2xl md:text-3xl italic leading-relaxed text-current max-w-3xl mx-auto">
                        &ldquo;A leitura é a arquitetura da alma. Cada obra não é apenas um texto,
                        mas uma estrutura escultural que esculpe a mente e o espaço ao redor.&rdquo;
                      </p>
                      <div className="mt-6 flex justify-center gap-6 text-[10px] font-mono uppercase tracking-widest">
                        <span className="text-current/60">curadoria independente</span>
                        <span className="text-accent">•</span>
                        <span className="text-current/60">edições raras</span>
                      </div>
                    </div>
                  )}

                  {/* Philosophy block after 4th item */}
                  {idx === 4 && (
                    <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 my-8 grid grid-cols-1 md:grid-cols-2 gap-8 border border-current/10 p-8 rounded-2xl bg-current/3">
                      <div className="flex flex-col justify-between">
                        <h3 className="font-serif text-xl md:text-2xl font-bold tracking-tight">
                          Nossa{" "}
                          <span className="font-light italic text-accent font-serif">filosofia</span>{" "}
                          de design geométrico
                        </h3>
                        <p className={`text-xs leading-relaxed font-sans ${mutedTextClasses} max-w-sm mt-3`}>
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
                  <div className="group flex flex-col h-full bg-current/[0.02] border border-current/10 rounded-2xl p-5 hover:border-accent/40 hover:shadow-xl transition-all duration-500 ease-corto justify-between">
                    <div>
                      <Link
                        href={`/livros/${book.id}`}
                        className="flex flex-col hover:-translate-y-1 transition-all duration-500 ease-corto"
                      >
                        {/* Cover */}
                        <div
                          className="relative w-full overflow-hidden rounded-xl border border-current/8 group-hover:border-accent/40 shadow-sm group-hover:shadow-lg transition-all duration-500 ease-corto aspect-[2/3]"
                        >
                          {/* Background */}
                          <div
                            className="absolute inset-0 bg-gradient-to-tr transition-transform duration-500 ease-corto group-hover:scale-105"
                            style={
                              book.coverImage
                                ? {
                                    backgroundImage: `url(${book.coverImage})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                  }
                                : {
                                    backgroundColor: "#1c1917"
                                  }
                            }
                          />

                          {/* Geometric overlay */}
                          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay group-hover:opacity-20 transition-all duration-500">
                            <svg
                              viewBox="0 0 100 100"
                              className="w-full h-full stroke-white fill-none stroke-[0.8]"
                            >
                              <path d="M50,50 A0.5,0.5 0 0,1 50,50.1 A1,1 0 0,1 49,49 A2,2 0 0,1 51,47 A4,4 0 0,1 55,51 A8,8 0 0,1 47,59 A16,16 0 0,1 31,43 A32,32 0 0,1 63,11 A64,64 0 0,1 -1,75" />
                            </svg>
                          </div>

                          {/* Top overlay: type badge + rating */}
                          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                            {/* Type badge — visually distinct */}
                            <span
                              className={`px-2.5 py-0.5 text-[8px] font-mono uppercase tracking-widest border rounded-full font-bold ${
                                isLivro
                                  ? "bg-sky-950/80 border-sky-400/30 text-sky-300"
                                  : "bg-violet-950/80 border-violet-400/30 text-violet-300"
                              }`}
                            >
                              {isLivro ? "📚 Livro" : "✍️ Conto"}
                            </span>
                            <span className="font-mono text-[9px] tracking-wider text-accent font-bold drop-shadow">
                              ★ {book.rating}
                            </span>
                          </div>

                          {/* Buy badge (livros with editions only) */}
                          {hasBuyLink && (
                            <div className="absolute bottom-3 left-3 z-10">
                              <span className="px-2 py-0.5 text-[8px] font-bold font-mono uppercase tracking-widest rounded-full bg-emerald-900/80 border border-emerald-400/30 text-emerald-300">
                                🛒 Comprar
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Metadata */}
                      <div className="mt-4">
                        {/* Tags */}
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

                        {/* Title */}
                        <Link href={`/livros/${book.id}`}>
                          <h3 className="font-serif text-lg md:text-xl font-bold text-current leading-snug hover:text-accent transition-colors duration-300 line-clamp-2">
                            {book.title}
                          </h3>
                        </Link>
                        <p className="text-[9px] font-mono uppercase tracking-widest text-accent mt-0.5 font-bold">
                          {book.author}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono mt-4 pt-3 border-t border-current/10 text-current/40">
                      <div className="flex items-center gap-2">
                        <span>{book.year}</span>
                        <span>•</span>
                        {book.publicDomain === false ? (
                          <span className="text-red-400 font-bold uppercase tracking-wider text-[7px] border border-red-500/10 px-1 py-0.5 rounded bg-red-950/10">
                            © Copyright
                          </span>
                        ) : (
                          <span className="text-stone-400 font-bold uppercase tracking-wider text-[7px] border border-stone-400/10 px-1 py-0.5 rounded bg-stone-950/10">
                            Domínio Público
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {hasBuyLink && (
                          <a
                            href={book.editions[0].linkBR}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-450 uppercase tracking-widest font-bold hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Comprar ↗
                          </a>
                        )}
                        <Link
                          href={`/livros/${book.id}`}
                          className="text-accent uppercase tracking-widest font-bold hover:underline"
                        >
                          {isLivro ? "Acessar ↗" : "Ler ↗"}
                        </Link>
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
      <Footer borderClass={borderClasses} />
    </div>
  );
}
