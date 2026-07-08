"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserSession } from "@/context/UserContext";

interface AdultContentGuardProps {
  children: React.ReactNode;
  contentTitle?: string;
}

export default function AdultContentGuard({ children, contentTitle = "este conto" }: AdultContentGuardProps) {
  const { currentUser, updateUser, isLoading } = useUserSession();
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-400 font-mono text-xs">
        <span className="animate-spin text-xl mb-3">🌀</span>
        Verificando credenciais de acesso...
      </div>
    );
  }

  // Verifica as duas condições estritamente
  const hasAccess = currentUser?.age_verified === true && currentUser?.is_premium === true;

  if (!hasAccess) {
    // Handler para simular a validação com facilidade
    const handleQuickVerify = async () => {
      if (!currentUser) return;
      setUpdating(true);
      try {
        await updateUser(currentUser.id, {
          age_verified: true,
          is_premium: true
        });
      } catch (err) {
        console.error("Falha ao simular verificação:", err);
      } finally {
        setUpdating(false);
      }
    };

    return (
      <div className="w-full max-w-4xl mx-auto my-8 animate-fade-in">
        {/* Paywall Screen: Dark Premium, Glassmorphic border, glowing red-orange accent */}
        <div className="relative rounded-3xl bg-zinc-950 border border-red-500/20 p-8 md:p-12 text-center overflow-hidden shadow-[0_0_50px_rgba(255,90,43,0.1)]">
          {/* Fibonacci spiral watermark background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-white fill-none stroke-[2]">
              <path d="M50,50 A0.5,0.5 0 0,1 50,50.1 A1,1 0 0,1 49,49 A2,2 0 0,1 51,47 A4,4 0 0,1 55,51 A8,8 0 0,1 47,59 A16,16 0 0,1 31,43 A32,32 0 0,1 63,11 A64,64 0 0,1 -1,75" />
            </svg>
          </div>

          {/* Locked Icon with custom stylized geometric shield */}
          <div className="relative z-10 mx-auto w-20 h-20 bg-gradient-to-tr from-accent/20 to-red-600/10 rounded-full flex items-center justify-center border border-accent/30 mb-8 animate-pulse">
            <span className="text-3xl">🔞</span>
          </div>

          <div className="relative z-10 space-y-4 max-w-lg mx-auto">
            <span className="font-mono text-xs uppercase tracking-widest text-accent font-bold">
              Área Restrita +18
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-stone-100">
              Conteúdo Exclusivo Protegido
            </h2>
            <p className="text-xs md:text-sm text-stone-400 leading-relaxed">
              Você está tentando acessar <strong className="text-stone-200">{contentTitle}</strong>, classificado como impróprio para menores e exclusivo para assinantes.
            </p>

            {/* Missing badges list */}
            <div className="flex flex-wrap gap-2 justify-center py-4">
              <span className={`px-3 py-1.5 rounded-full text-xs font-mono border ${
                currentUser?.age_verified ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" : "bg-red-950/20 border-red-500/30 text-red-400"
              }`}>
                {currentUser?.age_verified ? "✓ Idade Confirmada (+18)" : "✗ Idade Não Verificada"}
              </span>
              <span className={`px-3 py-1.5 rounded-full text-xs font-mono border ${
                currentUser?.is_premium ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" : "bg-red-950/20 border-red-500/30 text-red-400"
              }`}>
                {currentUser?.is_premium ? "✓ Assinatura Premium Ativa" : "✗ Assinatura Premium Ausente"}
              </span>
            </div>

            {/* Current simulated user state info */}
            {currentUser && (
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-[11px] font-mono text-stone-500 text-left space-y-1">
                <p>Simulação Ativa: <strong className="text-stone-300">@{currentUser.username}</strong></p>
                <p>Nome: <span className="text-stone-400">{currentUser.name}</span></p>
                {currentUser.is_ai_persona && (
                  <p className="text-red-400 font-bold">⚠️ Atenção: Perfil Protegido de IA Persona.</p>
                )}
              </div>
            )}

            {/* Simulation controls / Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-neutral-900 border border-white/10 hover:bg-neutral-800 text-stone-300 rounded-full text-xs font-semibold transition-all active:scale-95"
              >
                Voltar para a Estante
              </button>

              {currentUser && (
                <button
                  onClick={handleQuickVerify}
                  disabled={updating}
                  className="px-6 py-3 bg-gradient-to-r from-accent to-red-500 hover:from-accent-hover hover:to-red-600 text-white rounded-full text-xs font-semibold shadow-lg shadow-accent/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {updating ? "Processando..." : "Simular Verificação Rápida ↗"}
                </button>
              )}
            </div>

            <p className="text-[10px] text-stone-600 font-mono pt-4 italic">
              * Nota: Em ambiente local, você pode alterar o perfil logado no painel da Comunidade ou forçar a validação acima.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Se verificado, renderiza o conto normalmente
  return <>{children}</>;
}
