"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserSession } from "@/context/UserContext";

interface AdultContentGuardProps {
  children: React.ReactNode;
  contentTitle?: string;
}

const ADULT_CONSENT_KEY = "gargbooks_adult_consent";

export default function AdultContentGuard({ children, contentTitle = "este conteúdo" }: AdultContentGuardProps) {
  const { currentUser, updateUser, isLoading } = useUserSession();
  const router = useRouter();
  const [showConsent, setShowConsent] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  // Check localStorage for anonymous consent
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedConsent = localStorage.getItem(ADULT_CONSENT_KEY);
      if (storedConsent === "true") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConsentChecked(true);
      } else if (!currentUser) {
        // No user and no stored consent — show the modal
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowConsent(true);
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConsentChecked(true);
      }
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-400 font-mono text-xs min-h-screen bg-zinc-950">
        <span className="animate-spin text-xl mb-3">🌀</span>
        Verificando credenciais de acesso...
      </div>
    );
  }

  // Anonymous consent modal (no user logged in)
  if (showConsent) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-zinc-900/80 border border-red-500/20 rounded-3xl p-8 md:p-12 text-center shadow-[0_0_50px_rgba(255,90,43,0.08)]">
          <span className="text-5xl block mb-6">🔞</span>
          <h2 className="font-serif text-2xl font-bold text-stone-100 mb-3">
            Conteúdo para Maiores de 18 Anos
          </h2>
          <p className="text-sm text-stone-400 mb-8 leading-relaxed">
            Você está tentando acessar <strong className="text-stone-200">{contentTitle}</strong>, 
            classificado como impróprio para menores de 18 anos.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                localStorage.setItem(ADULT_CONSENT_KEY, "true");
                setShowConsent(false);
                setConsentChecked(true);
              }}
              className="w-full px-6 py-3 bg-accent text-zinc-950 rounded-full text-xs font-bold font-mono uppercase tracking-widest hover:bg-accent-hover transition-all active:scale-95"
            >
              Sim, tenho 18 anos ou mais
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full px-6 py-3 bg-neutral-900 border border-white/10 text-stone-400 rounded-full text-xs font-mono hover:bg-neutral-800 transition-all active:scale-95"
            >
              Voltar para o Início
            </button>
          </div>

          <p className="text-[9px] text-stone-600 font-mono mt-6 leading-relaxed">
            Ao clicar em &quot;Sim&quot;, você confirma ter 18 anos ou mais e assume 
            a responsabilidade pelo acesso a este conteúdo. Esta informação fica salva 
            no seu navegador.
          </p>
        </div>
      </div>
    );
  }

  // For logged-in users: check age_verified
  if (currentUser) {
    const hasAccess = currentUser.age_verified === true;

    if (!hasAccess && consentChecked) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-zinc-900/80 border border-red-500/20 rounded-3xl p-8 md:p-12 text-center">
            <span className="text-5xl block mb-6">🔞</span>
            <h2 className="font-serif text-2xl font-bold text-stone-100 mb-3">
              Verificação de Idade Necessária
            </h2>
            <p className="text-sm text-stone-400 mb-8 leading-relaxed">
              Para acessar conteúdo +18, você precisa verificar sua idade no perfil.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  if (!currentUser) return;
                  setUpdating(true);
                  try {
                    await updateUser(currentUser.id, { age_verified: true });
                  } catch (err) {
                    console.error("Erro ao verificar idade:", err);
                  } finally {
                    setUpdating(false);
                  }
                }}
                disabled={updating}
                className="w-full px-6 py-3 bg-accent text-zinc-950 rounded-full text-xs font-bold font-mono uppercase tracking-widest hover:bg-accent-hover transition-all disabled:opacity-50 active:scale-95"
              >
                {updating ? "Verificando..." : "✓ Verificar minha idade"}
              </button>
              <button
                onClick={() => router.push("/perfil")}
                className="w-full px-6 py-3 bg-neutral-900 border border-white/10 text-stone-400 rounded-full text-xs font-mono hover:bg-neutral-800 transition-all"
              >
                Ir para meu perfil
              </button>
              <button
                onClick={() => router.push("/")}
                className="text-xs font-mono text-stone-600 hover:text-stone-400 transition-colors cursor-pointer"
              >
                Voltar para o Início
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!hasAccess) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-zinc-900/80 border border-red-500/20 rounded-3xl p-8 md:p-12 text-center">
            <span className="text-5xl block mb-6">🔞</span>
            <h2 className="font-serif text-2xl font-bold text-stone-100 mb-3">
              Acesso Restrito
            </h2>
            <p className="text-sm text-stone-400 mb-8">
              Faça login e verifique sua idade para acessar este conteúdo.
            </p>
            <button
              onClick={() => router.push("/perfil")}
              className="px-6 py-3 bg-accent text-zinc-950 rounded-full text-xs font-bold font-mono uppercase tracking-widest hover:bg-accent-hover transition-all"
            >
              Ir para o Perfil
            </button>
          </div>
        </div>
      );
    }
  }

  // User is verified or anonymous consented — show content
  return <>{children}</>;
}
