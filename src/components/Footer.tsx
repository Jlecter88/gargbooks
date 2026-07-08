"use client";

import React from "react";
import Link from "next/link";

interface FooterProps {
  borderClass?: string;
  textClass?: string;
}

export default function Footer({ 
  borderClass = "border-white/10", 
  textClass = "text-stone-500" 
}: FooterProps) {
  return (
    <footer className={`mt-28 border-t ${borderClass} py-16 px-6 transition-colors duration-700`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 text-[10px] font-mono text-current/55">
        
        {/* Branding & Logo */}
        <div className="flex items-center gap-3 group">
          <svg viewBox="0 0 100 100" className="w-5 h-5 stroke-accent fill-none stroke-[2] group-hover:scale-110 transition-transform duration-500">
            <path d="M50,50 A0.5,0.5 0 0,1 50,50.1 A1,1 0 0,1 49,49 A2,2 0 0,1 51,47 A4,4 0 0,1 55,51 A8,8 0 0,1 47,59 A16,16 0 0,1 31,43 A32,32 0 0,1 63,11 A64,64 0 0,1 -1,75" />
          </svg>
          <span className="uppercase tracking-widest font-bold text-current group-hover:text-accent transition-colors duration-300">
            GARGBOOKS por Creative Pash
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-8 uppercase tracking-widest">
          <Link href="/" className="hover:text-accent transition-colors">
            Estante
          </Link>
          <Link href="/perfil" className="hover:text-accent transition-colors">
            Perfil
          </Link>
          <Link href="/comunidade" className="hover:text-accent transition-colors">
            Comunidade & RPG
          </Link>
          <Link href="/publicar" className="hover:text-accent transition-colors">
            Publicar
          </Link>
          <Link href="/faq" className="hover:text-accent text-accent font-bold transition-colors flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
            FAQ & Legislação
          </Link>
        </div>

      </div>
    </footer>
  );
}
