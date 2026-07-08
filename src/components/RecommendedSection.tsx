"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RecommendedBook, getBestAffiliateLink, getBestPrice } from "@/utils/recommendations";

interface Props {
  recommendations: RecommendedBook[];
  region?: "BR" | "PT";
  title?: string;
  subtitle?: string;
}

export default function RecommendedSection({
  recommendations,
  region = "BR",
  title = "Recomendado para você",
  subtitle = "Baseado no seu estilo literário e histórico de leitura",
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (recommendations.length === 0) return null;

  const currencySymbol = region === "BR" ? "R$" : "€";

  return (
    <section className="mb-20 animate-fade-in-up">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-[1px] w-8 bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold">
              Curadoria Personalizada
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
          <p className="text-xs text-current/50 font-sans mt-1 font-mono">{subtitle}</p>
        </div>
        <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[9px] font-mono uppercase tracking-widest text-accent font-bold">
          ✦ IA
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendations.map(({ book, reasons }) => {
          const price = getBestPrice(book, region);
          const affiliateLink = getBestAffiliateLink(book, region);
          const hasEditions = book.editions && book.editions.length > 0;
          const isExpanded = expandedId === book.id;

          return (
            <div
              key={book.id}
              className="group relative flex flex-col rounded-2xl border border-current/8 hover:border-accent/30 bg-current/3 hover:bg-current/5 transition-all duration-500 overflow-hidden"
            >
              {/* Cover strip */}
              <div
                className={`relative h-32 w-full overflow-hidden bg-gradient-to-tr ${book.coverGradient} flex-shrink-0`}
                style={
                  book.coverImage
                    ? {
                        backgroundImage: `url(${book.coverImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                {/* Type badge */}
                <span
                  className={`absolute top-3 left-3 px-2.5 py-0.5 text-[8px] font-bold font-mono uppercase tracking-widest rounded-full border ${
                    book.type === "livro"
                      ? "bg-sky-950/80 border-sky-400/30 text-sky-300"
                      : "bg-violet-950/80 border-violet-400/30 text-violet-300"
                  }`}
                >
                  {book.type === "livro" ? "📚 Livro" : "✍️ Conto"}
                </span>

                {/* Score badge */}
                <span className="absolute top-3 right-3 px-2.5 py-0.5 text-[8px] font-bold font-mono bg-black/60 border border-white/10 text-accent rounded-full">
                  ★ {book.rating}
                </span>

                {/* Discount badge */}
                {hasEditions && price && (
                  <span className="absolute bottom-3 left-3 px-2.5 py-0.5 text-[8px] font-bold font-mono uppercase tracking-widest rounded-full bg-emerald-900/80 border border-emerald-400/30 text-emerald-300">
                    🛒 {currencySymbol} {price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 p-5">
                {/* Genre tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {book.genres.slice(0, 3).map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 text-[7px] font-bold font-mono uppercase tracking-widest bg-accent/10 text-accent rounded border border-accent/20"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                {/* Title & Author */}
                <h3 className="font-serif text-lg font-bold leading-tight mb-0.5 group-hover:text-accent transition-colors duration-300">
                  {book.title}
                </h3>
                <p className="text-[9px] font-mono uppercase tracking-widest text-current/50 mb-3 font-semibold">
                  {book.author}
                </p>

                {/* Recommendation reasons */}
                {reasons.length > 0 && (
                  <div className="flex flex-col gap-1 mb-4">
                    {reasons.slice(0, 2).map((reason, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 text-[9px] font-mono text-current/60"
                      >
                        <span className="text-accent">✦</span>
                        {reason}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-auto flex flex-col gap-2">
                  <Link
                    href={`/livros/${book.id}`}
                    className="w-full text-center px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest border border-current/20 rounded-xl hover:border-accent/60 hover:text-accent transition-all duration-300"
                  >
                    Ler Agora ↗
                  </Link>

                  {hasEditions && affiliateLink && (
                    <a
                      href={affiliateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest bg-accent text-white rounded-xl hover:bg-accent-hover active:scale-95 transition-all duration-300"
                    >
                      🛒 Comprar {price ? `· ${currencySymbol} ${price.toFixed(2)}` : ""}
                    </a>
                  )}
                </div>
              </div>

              {/* Expanded editions panel */}
              {hasEditions && (
                <div className="px-5 pb-4">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : book.id)}
                    className="w-full text-[9px] font-mono uppercase tracking-widest text-current/40 hover:text-accent transition-colors py-1 cursor-pointer"
                  >
                    {isExpanded ? "▲ Ocultar edições" : `▼ Ver ${book.editions.length} edição(ões)`}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-2">
                      {book.editions.map((ed) => (
                        <div
                          key={ed.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-current/5 border border-current/8 text-[9px] font-mono"
                        >
                          <div>
                            <p className="font-bold text-current/80">{ed.publisher}</p>
                            <p className="text-current/40">
                              {ed.coverType} · {ed.pages}p · {ed.year}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-accent font-bold">
                              {region === "BR"
                                ? `R$ ${ed.priceBR.toFixed(2)}`
                                : `€ ${ed.pricePT.toFixed(2)}`}
                            </p>
                            <a
                              href={region === "BR" ? ed.linkBR : ed.linkPT}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent/70 hover:text-accent underline transition-colors"
                            >
                              Amazon ↗
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
