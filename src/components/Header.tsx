"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useBooks } from "@/context/BookContext";
import { useUserSession } from "@/context/UserContext";

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { bookmarks, removeBookmark } = useBooks();
  const { currentUser } = useUserSession();

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-transparent backdrop-blur-md border-b border-current/10 px-6 py-4 flex items-center justify-between transition-all duration-300">
        {/* Logo / Branding */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Fibonacci Spiral SVG Logo - Refined styling */}
          <div className="relative w-8 h-8 flex items-center justify-center border border-current/10 rounded-lg overflow-hidden p-1.5 group-hover:border-accent transition-all duration-500">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none stroke-[1.5] group-hover:stroke-accent transition-colors duration-300">
              <path d="M50,50 A0.5,0.5 0 0,1 50,50.1 A1,1 0 0,1 49,49 A2,2 0 0,1 51,47 A4,4 0 0,1 55,51 A8,8 0 0,1 47,59 A16,16 0 0,1 31,43 A32,32 0 0,1 63,11 A64,64 0 0,1 -1,75" />
            </svg>
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-widest text-current group-hover:text-accent transition-colors duration-300">
              GARG<span className="font-sans font-light">BOOKS</span>
            </span>
            <span className="block text-[8px] uppercase tracking-widest text-current/60 font-mono">
              editorial curadoria
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-mono font-semibold">
          <Link href="/" className="corto-underline py-1 text-current/80 hover:text-current transition-colors">
            Estante
          </Link>
          <Link href="/comunidade" className="corto-underline py-1 text-current/80 hover:text-current transition-colors flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-accent animate-pulse"></span>
            Comunidade & RPG
          </Link>
          <Link href="/publicar" className="corto-underline py-1 text-current/80 hover:text-current transition-colors">
            Publicar
          </Link>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="corto-underline py-1 text-current/80 hover:text-current transition-colors flex items-center gap-2 cursor-pointer"
          >
            Marcadores
            {bookmarks.length > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-accent text-white rounded-full">
                {bookmarks.length}
              </span>
            )}
          </button>
        </nav>

        {/* Action Button & Menu Trigger */}
        <div className="flex items-center gap-4">
          {currentUser && (
            <>
              <Link
                href="/perfil"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-current/5 border border-current/10 rounded-full text-[10px] font-mono text-current/80 hover:border-accent transition-all"
                title="Meu Perfil"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                @{currentUser.username}
              </Link>
              <Link
                href="/admin"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-mono text-accent hover:bg-accent/20 transition-all"
                title="Painel Admin"
              >
                ⚙️ Admin
              </Link>
            </>
          )}
          <Link
            href="/publicar"
            className="hidden sm:inline-block px-4 py-2 text-[10px] uppercase tracking-widest font-mono font-bold border border-current/25 text-current rounded-full hover:bg-current hover:text-background active:scale-95 transition-all duration-300"
          >
            Escrever Conto
          </Link>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-10 h-10 rounded-full flex flex-col items-center justify-center gap-1 hover:bg-current/5 active:scale-90 transition-all border border-current/10 cursor-pointer animate-pulse"
            aria-label="Abrir Menu"
          >
            <span className="w-5 h-[1px] bg-current rounded"></span>
            <span className="w-5 h-[1px] bg-current rounded"></span>
          </button>
        </div>
      </header>

      {/* Sidebar Drawer Menu Overlay */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-500"
        />
      )}

      {/* Sidebar Drawer Panel - Adapts to Light/Dark theme */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-[var(--background)] text-[var(--foreground)] border-l border-current/15 shadow-2xl p-8 flex flex-col justify-between transition-transform duration-500 ease-out transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          {/* Close Button */}
          <div className="flex justify-between items-center mb-10">
            <span className="font-serif text-lg tracking-widest uppercase text-current/80">Coleção</span>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-8 h-8 rounded-full border border-current/15 flex items-center justify-center hover:bg-current/5 active:scale-90 transition-all font-mono text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-6 text-sm font-mono uppercase tracking-widest font-semibold text-current/80">
            <Link
              href="/"
              onClick={() => setIsDrawerOpen(false)}
              className="hover:text-accent flex items-center gap-3 transition-colors duration-200"
            >
              <span className="text-[10px] text-accent">01/</span> Estante Virtual
            </Link>
            <Link
              href="/perfil"
              onClick={() => setIsDrawerOpen(false)}
              className="hover:text-accent flex items-center gap-3 transition-colors duration-200"
            >
              <span className="text-[10px] text-accent">02/</span> Meu Perfil
            </Link>
            <Link
              href="/comunidade"
              onClick={() => setIsDrawerOpen(false)}
              className="hover:text-accent flex items-center gap-3 transition-colors duration-200"
            >
              <span className="text-[10px] text-accent">03/</span> Comunidade & RPG
            </Link>
            <Link
              href="/publicar"
              onClick={() => setIsDrawerOpen(false)}
              className="hover:text-accent flex items-center gap-3 transition-colors duration-200"
            >
              <span className="text-[10px] text-accent">04/</span> Publicar Obra
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsDrawerOpen(false)}
              className="hover:text-accent flex items-center gap-3 transition-colors duration-200 text-accent font-semibold"
            >
              <span className="text-[10px] text-accent">05/</span> Painel Admin
            </Link>
          </nav>

          {/* Saved Bookmarks Section */}
          <div className="mt-12 border-t border-current/15 pt-8">
            <h3 className="font-mono text-[10px] text-accent uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Seus Marcadores ({bookmarks.length})</span>
            </h3>
            {bookmarks.length === 0 ? (
              <p className="text-xs text-current/50 leading-relaxed italic bg-current/5 p-4 rounded-2xl border border-current/5 font-sans">
                Nenhum trecho salvo. Abra uma obra para salvar marcadores de leitura.
              </p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {bookmarks.map((bm, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-current/5 rounded-2xl border border-current/5 text-xs relative group/item hover:border-accent/40 transition-all duration-300"
                  >
                    <p className="text-current/80 font-serif italic line-clamp-3 mb-2 leading-relaxed">
                      &ldquo;{bm.text}&rdquo;
                    </p>
                    <div className="flex justify-between items-center text-[9px] text-current/45 font-mono">
                      <span>Ref: {bm.bookId}</span>
                      <button
                        onClick={() => removeBookmark(bm.bookId, bm.text)}
                        className="text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity hover:underline cursor-pointer"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Brand Info */}
        <div className="border-t border-current/15 pt-6 text-[10px] font-mono text-current/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span>© 2026 Gargbooks</span>
            <span className="text-accent uppercase tracking-wider font-bold">Aesthetics by Capitolium</span>
          </div>
          <div className="text-[9px] text-current/40 leading-relaxed">
            Marketplace de edições raras e clube de leitura com curadoria focada em design escultural.
          </div>
        </div>
      </div>
    </>
  );
}
