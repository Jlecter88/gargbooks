"use client";

import React, { useState } from "react";
import Link from "next/link";
import RPGChat, { Sender } from "@/components/RPGChat";
import Header from "@/components/Header";

// Preset players that the user can switch between to test
const CHARACTER_PROFILES: Sender[] = [
  {
    name: "Alistair (Guerreiro)",
    avatarColor: "from-amber-600 to-amber-950",
    role: "player",
  },
  {
    name: "Morgana (Maga)",
    avatarColor: "from-purple-600 to-purple-950",
    role: "player",
  },
  {
    name: "Valerius (Ladino)",
    avatarColor: "from-teal-600 to-teal-950",
    role: "player",
  },
];

export default function RPGPage() {
  const [selectedProfile, setSelectedProfile] = useState<Sender>(CHARACTER_PROFILES[0]);

  return (
    <div className="min-h-screen bg-corto-dark text-stone-100 flex flex-col font-sans select-none">
      {/* Header */}
      <Header />

      {/* Decorative Top Glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-96 bg-gradient-to-b from-accent/5 via-accent/[0.02] to-transparent blur-[120px] pointer-events-none z-0" />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 z-10 relative">
        
        {/* PANEL ESQUERDO: INFO DA CAMPANHA (4 Cols) */}
        <section className="lg:col-span-4 flex flex-col gap-8 animate-fade-in-up">
          
          {/* CARD DE DETALHES DA MESA */}
          <div className="p-6 bg-white/3 border border-white/5 rounded-3xl shadow-xl backdrop-blur-md">
            <span className="text-[9px] font-mono tracking-widest text-accent uppercase font-bold">
              Campanha Ativa
            </span>
            <h1 className="font-serif text-2xl font-bold text-stone-150 mt-2 mb-3">
              As Catacumbas de Otranto
            </h1>
            <p className="text-xs text-stone-400 leading-relaxed font-sans mb-5">
              Uma expedição sombria sob as ruínas medievais do antigo forte, onde segredos arcanos e criaturas das sombras guardam o repouso eterno do príncipe Conrado.
            </p>

            <div className="border-t border-white/5 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500 font-mono">Sistema:</span>
                <span className="px-3 py-0.5 bg-white/5 border border-white/10 text-stone-300 rounded font-mono text-[9px] uppercase font-bold tracking-wider">
                  D&D 5e / Gótico
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500 font-mono">Mestre:</span>
                <span className="text-accent font-serif italic font-semibold">Narrador (IA)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500 font-mono">Dificuldade:</span>
                <span className="text-accent/80 font-semibold font-mono text-[10px]">Alta (Tomb of Horrors vibe)</span>
              </div>
            </div>
          </div>

          {/* SIMULADOR DE PERFIS (Troca de Personagem) */}
          <div className="p-6 bg-white/3 border border-white/5 rounded-3xl shadow-xl backdrop-blur-md">
            <span className="text-[9px] font-mono tracking-widest text-accent uppercase font-bold">
              Simulador de Perfil
            </span>
            <h2 className="font-serif text-lg font-bold text-stone-150 mt-2 mb-2">
              Escolha seu Personagem
            </h2>
            <p className="text-xs text-stone-400 leading-relaxed font-sans mb-5">
              Altere o emissor das mensagens para simular a interação de diferentes membros do grupo de RPG no feed.
            </p>

            <div className="space-y-3">
              {CHARACTER_PROFILES.map((profile) => {
                const isActive = selectedProfile.name === profile.name;
                return (
                  <button
                    key={profile.name}
                    onClick={() => setSelectedProfile(profile)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
                      isActive
                        ? "bg-white/8 border-accent/40 shadow-inner"
                        : "bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full bg-gradient-to-br ${profile.avatarColor} border border-white/5 flex items-center justify-center text-xs font-bold text-white shadow`}>
                        {profile.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div>
                        <h4 className={`text-xs font-semibold ${isActive ? "text-accent" : "text-stone-300"}`}>
                          {profile.name}
                        </h4>
                        <span className="text-[8px] text-stone-500 font-mono uppercase tracking-wider block mt-0.5">
                          Jogador
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(197,90,55,0.6)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* GUIA DE COMANDOS DE DADOS */}
          <div className="p-6 bg-white/3 border border-white/5 rounded-3xl shadow-xl backdrop-blur-md">
            <span className="text-[9px] font-mono tracking-widest text-accent uppercase font-bold">
              Grimório de Comandos
            </span>
            <h3 className="font-serif text-base font-bold text-stone-150 mt-2 mb-2">
              Interpretador de Rolagens
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed font-sans mb-4">
              O chat intercepta o comando `/roll` seguido da expressão dos dados. Exemplos aceitos:
            </p>
            <ul className="space-y-2 font-mono text-[10px] uppercase tracking-wider text-stone-300">
              <li className="p-3 bg-black/45 border border-white/5 rounded-xl flex justify-between">
                <span>/roll d20</span>
                <span className="text-stone-500">1 dado d20</span>
              </li>
              <li className="p-3 bg-black/45 border border-white/5 rounded-xl flex justify-between">
                <span>/roll 3d6 + 4</span>
                <span className="text-stone-500">Soma mod</span>
              </li>
              <li className="p-3 bg-black/45 border border-white/5 rounded-xl flex justify-between">
                <span>/roll 1d100 - 5</span>
                <span className="text-stone-500">Subtrai val</span>
              </li>
            </ul>
          </div>

        </section>

        {/* PANEL DIREITO: CONTAINER DO CHAT (8 Cols) */}
        <section className="lg:col-span-8 flex flex-col justify-center animate-fade-in-up">
          <div className="relative">
            {/* Ambient shadow back drop for the chat */}
            <div className="absolute -inset-2 bg-gradient-to-r from-accent/5 via-accent/[0.02] to-transparent rounded-3xl blur-2xl opacity-60 pointer-events-none" />
            
            {/* RPG Chat Component */}
            <RPGChat currentUser={selectedProfile} />
          </div>

          {/* Back link */}
          <div className="mt-6 flex justify-between items-center px-2 text-[10px] font-mono uppercase tracking-widest text-stone-500">
            <span>Para retornar à curadoria:</span>
            <Link href="/" className="text-accent hover:underline flex items-center gap-1">
              Voltar ao Início ↗
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
