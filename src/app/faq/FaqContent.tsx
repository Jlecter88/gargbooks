"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type TabType = "faq" | "legislacao" | "verificacao";

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

export default function FaqContent() {
  const [activeTab, setActiveTab] = useState<TabType>("faq");
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const faqItems: FAQItem[] = [
    {
      question: "O que é o Gargbooks?",
      answer: (
        <p className="leading-relaxed">
          O <strong className="text-accent">Gargbooks</strong> é um sebo literário digital premium e um clube de leitura digital. Fazemos uma curadoria minuciosa de edições clássicas e raras (com links de afiliados para compra no Brasil e Portugal) e fornecemos um espaço de publicação para escritores independentes divulgarem seus contos e organizarem mesas de RPG literário.
        </p>
      ),
    },
    {
      question: "Como funcionam os links de afiliados?",
      answer: (
        <p className="leading-relaxed">
          Nossa equipe editorial pesquisa as melhores edições físicas de grandes obras. Ao clicar em &quot;Comprar&quot; na nossa estante, você é redirecionado para a respectiva loja afiliada. Se você realizar a compra, nós ganhamos uma pequena porcentagem da venda como comissão, sem custo adicional para você. Isso financia o desenvolvimento e a infraestrutura da plataforma.
        </p>
      ),
    },
    {
      question: "O site é seguro para crianças e adolescentes?",
      answer: (
        <p className="leading-relaxed">
          Sim! O Gargbooks foi projetado sob os princípios de <strong className="text-emerald-400">Safety by Design</strong>. Embora o site seja aberto para amantes da leitura de todas as idades, todas as páginas ou contos que possuem classificação indicativa restrita (+18) ou salas de RPG com temáticas de horror são protegidas por um sistema avançado de restrição etária (Gatekeeper Digital).
        </p>
      ),
    },
    {
      question: "Como funciona a proteção de dados na verificação de idade?",
      answer: (
        <p className="leading-relaxed">
          Sua privacidade é nossa prioridade absoluta. Em conformidade com a <strong className="text-sky-400">LGPD</strong> no Brasil e o <strong className="text-sky-400">GDPR</strong> na Europa, nós não armazenamos fotos de seus documentos pessoais em nossos servidores. O fluxo de verificação de identidade é gerenciado por plataformas parceiras de e-KYC (Know Your Customer) totalmente homologadas e criptografadas.
        </p>
      ),
    },
    {
      question: "É obrigatório verificar a idade?",
      answer: (
        <p className="leading-relaxed">
          A verificação só é exigida quando você tenta acessar contos marcados com a etiqueta <span className="text-red-400 font-semibold">Adulto +18</span> ou participar de mesas de RPG de fantasia sombria e terror. Para navegar pela estante geral de livros e contos livres, nenhuma verificação de documento é necessária.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-stone-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 md:py-20">
        
        {/* ── Header Section ───────────────────────────────────────────── */}
        <section className="mb-16 text-center animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-[1px] w-8 bg-accent" />
            <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
              Suporte & Conformidade Legal
            </span>
            <span className="h-[1px] w-8 bg-accent" />
          </div>
          
          <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Dúvidas Frequentes & <span className="font-light italic text-accent font-serif">Legislação</span>
          </h1>
          <p className="text-xs md:text-sm text-stone-400 max-w-2xl mx-auto leading-relaxed">
            Entenda como operamos, quais as leis que regem a proteção de menores online e as regras aplicadas em cada país sobre a leitura de contos adultos e salas de RPG.
          </p>
        </section>

        {/* ── Tabs Navigation ──────────────────────────────────────────── */}
        <section className="mb-12 flex justify-center animate-fade-in-up">
          <div className="inline-flex flex-wrap md:flex-nowrap p-1 bg-white/5 border border-white/10 rounded-2xl md:rounded-full">
            {(
              [
                { id: "faq", label: "Perguntas Frequentes", icon: "🔮" },
                { id: "legislacao", label: "Legislação por País", icon: "🌍" },
                { id: "verificacao", label: "Lei FELCA & Verificação", icon: "🛡️" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setOpenAccordion(null);
                }}
                className={`flex items-center gap-2 px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest rounded-xl md:rounded-full transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Content Section ──────────────────────────────────────────── */}
        <section className="min-h-[400px]">
          
          {/* TAB 1: FAQ ACCORDIONS */}
          {activeTab === "faq" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-serif text-2xl font-bold mb-6 text-stone-200">
                Respostas às <span className="font-light italic text-accent font-serif">Principais Questões</span>
              </h2>
              
              <div className="divide-y divide-white/5 border-y border-white/5">
                {faqItems.map((item, idx) => (
                  <div key={idx} className="py-5">
                    <button
                      onClick={() => toggleAccordion(idx)}
                      className="w-full flex items-center justify-between text-left font-serif text-lg font-semibold text-stone-200 hover:text-accent transition-colors cursor-pointer group"
                    >
                      <span>{item.question}</span>
                      <span className={`text-xs text-accent font-mono transition-transform duration-300 ${openAccordion === idx ? "rotate-45" : "rotate-0"}`}>
                        ✕
                      </span>
                    </button>
                    
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        openAccordion === idx ? "max-h-[300px] mt-4 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="text-xs md:text-sm text-stone-450 leading-relaxed font-sans bg-white/3 p-5 rounded-2xl border border-white/5">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LEGISLATION BY COUNTRY */}
          {activeTab === "legislacao" && (
            <div className="space-y-10 animate-fade-in">
              <h2 className="font-serif text-2xl font-bold mb-6 text-stone-200">
                Regulamentos de Proteção de <span className="font-light italic text-accent font-serif">Menores no Mundo</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* BRASIL */}
                <div className="p-6 rounded-2xl border border-white/5 bg-white/3 flex flex-col justify-between hover:border-accent/30 transition-colors">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <h3 className="font-serif text-xl font-bold text-stone-200">Brasil</h3>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">ECA Digital</span>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      A conformidade brasileira é regida pelo <strong className="text-stone-300">ECA (Estatuto da Criança e do Adolescente)</strong> e pela recente <strong className="text-accent">Lei nº 15.211/2025</strong>. 
                    </p>
                    <ul className="text-[11px] text-stone-450 font-mono space-y-2 list-disc list-inside">
                      <li>Barreira de autodeclaração simples proibida.</li>
                      <li>Veto a perfilamento para publicidade de menores.</li>
                      <li>Veto a loot boxes para crianças.</li>
                      <li>Responsabilidade preventiva (*Safety by Design*).</li>
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-white/5 mt-6 text-[9px] font-mono text-stone-500 uppercase tracking-widest">
                    Vigente desde: Março/2026
                  </div>
                </div>

                {/* UNIÃO EUROPEIA & PORTUGAL */}
                <div className="p-6 rounded-2xl border border-white/5 bg-white/3 flex flex-col justify-between hover:border-accent/30 transition-colors">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <h3 className="font-serif text-xl font-bold text-stone-200">UE & Portugal</h3>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-500/30">GDPR & AVMSD</span>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Regido pela diretiva <strong className="text-stone-300">AVMSD</strong>, a <strong className="text-stone-300">Lei de Serviços Digitais (DSA)</strong> e o <strong className="text-sky-400">GDPR</strong> da UE.
                    </p>
                    <ul className="text-[11px] text-stone-450 font-mono space-y-2 list-disc list-inside">
                      <li>Consentimento parental obrigatório sob 13-16 anos.</li>
                      <li>Bloqueio robusto de mídias prejudiciais (terror/sexual).</li>
                      <li>Publicidade comportamental e ads direcionados proibidos.</li>
                      <li>Agências CNPD e reguladores monitoram conformidade.</li>
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-white/5 mt-6 text-[9px] font-mono text-stone-500 uppercase tracking-widest">
                    Padrão Europeu Estrito
                  </div>
                </div>

                {/* ESTADOS UNIDOS */}
                <div className="p-6 rounded-2xl border border-white/5 bg-white/3 flex flex-col justify-between hover:border-accent/30 transition-colors">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <h3 className="font-serif text-xl font-bold text-stone-200">Estados Unidos</h3>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30">COPPA & Leis Estaduais</span>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      A lei federal <strong className="text-stone-300">COPPA</strong> protege dados de crianças, enquanto estados individuais exigem verificação rígida para conteúdo adulto.
                    </p>
                    <ul className="text-[11px] text-stone-450 font-mono space-y-2 list-disc list-inside">
                      <li>COPPA exige consentimento parental sob 13 anos.</li>
                      <li>Leis estaduais (ex: Texas) exigem verificação por ID.</li>
                      <li>Risco de pesadas multas pela FTC para dados de crianças.</li>
                      <li>Checagem por cartão ou banco de dados oficiais.</li>
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-white/5 mt-6 text-[9px] font-mono text-stone-500 uppercase tracking-widest">
                    Leis de ID por Estado
                  </div>
                </div>

              </div>

              <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-950/10 text-amber-300 text-xs leading-relaxed space-y-2">
                <h4 className="font-bold flex items-center gap-2">⚠️ Nota de Isenção de Responsabilidade Jurídica:</h4>
                <p>
                  As informações disponibilizadas nesta página têm fins exclusivamente informativos e educacionais e não constituem assessoria jurídica formal. Recomendamos que os autores de campanhas e leitores consultem a legislação local vigente de seus países e entrem em contato com conselhos legais para conformidades contratuais específicas.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: LEI FELCA & AGE VERIFICATION */}
          {activeTab === "verificacao" && (
            <div className="space-y-8 animate-fade-in">
              
              <div className="flex flex-col lg:flex-row gap-10 items-center mb-10">
                <div className="flex-1 space-y-4">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-200">
                    O ECA Digital: <span className="font-light italic text-accent font-serif">A Lei FELCA no Brasil</span>
                  </h2>
                  <p className="text-xs md:text-sm text-stone-400 leading-relaxed">
                    Sancionada como a <strong className="text-stone-350">Lei nº 15.211/2025</strong> e batizada popularmente pela repercussão das denúncias de Felca sobre a exploração de menores online, a lei pune severamente plataformas digitais que permitem o livre trânsito de menores de idade em áreas inadequadas.
                  </p>
                  <p className="text-xs md:text-sm text-stone-400 leading-relaxed">
                    Ela define que sistemas baseados puramente no clique do próprio usuário (&quot;Sim, tenho 18 anos&quot;) são inválidos e passíveis de penalidade administrativa. As plataformas de RPG e marketplaces literários devem integrar provedores homologados de identificação.
                  </p>
                </div>
                <div className="w-full max-w-sm p-6 bg-gradient-to-tr from-accent/20 to-red-600/10 rounded-3xl border border-accent/25 flex items-center justify-center text-center flex-shrink-0 relative overflow-hidden shadow-lg shadow-accent/5">
                  <div className="space-y-2 z-10">
                    <span className="text-5xl block animate-pulse">🔞</span>
                    <h3 className="font-serif text-lg font-bold text-stone-200">Verificação Estrita</h3>
                    <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">Fim do checkbox auto-declarativo</p>
                  </div>
                  {/* Fibonacci spiral watermark */}
                  <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full stroke-white fill-none stroke-[2]">
                      <path d="M50,50 A0.5,0.5 0 0,1 50,50.1 A1,1 0 0,1 49,49 A2,2 0 0,1 51,47 A4,4 0 0,1 55,51 A8,8 0 0,1 47,59 A16,16 0 0,1 31,43 A32,32 0 0,1 63,11 A64,64 0 0,1 -1,75" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="editorial-line my-8" />

              <h3 className="font-serif text-xl font-bold mb-4 text-stone-200">
                Como funciona a <span className="font-light italic text-accent font-serif">Verificação de Idade</span>?
              </h3>
              <p className="text-xs md:text-sm text-stone-455 leading-relaxed max-w-3xl mb-8">
                Para atender às exigências da lei FELCA, plataformas modernas como o Gargbooks podem adotar sistemas integrados que atestam a maioridade sem violar a privacidade de dados regulamentada pela LGPD:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Metodo 1 */}
                <div className="bg-white/3 border border-white/5 rounded-2xl p-6 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/35 flex items-center justify-center font-serif font-bold text-accent">1</div>
                  <h4 className="font-serif text-base font-bold text-stone-200">Reconhecimento Facial IA (Facial Age Estimation)</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Uso de algoritmos homologados (ex: Yoti) que analisam a geometria facial por meio de uma selfie rápida tirada na hora. O sistema calcula a idade aproximada do usuário em segundos e, em seguida, <strong className="text-stone-300">exclui permanentemente a imagem</strong> para proteção de dados, atestando apenas a resposta (&quot;Menor de Idade&quot; ou &quot;Maior de Idade&quot;).
                  </p>
                </div>

                {/* Metodo 2 */}
                <div className="bg-white/3 border border-white/5 rounded-2xl p-6 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/35 flex items-center justify-center font-serif font-bold text-accent">2</div>
                  <h4 className="font-serif text-base font-bold text-stone-200">Verificação por Documento Oficial (e-KYC)</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Validação em bancos de dados oficiais por meio do CPF ou escaneamento de RG/CNH usando serviços de OCR (Reconhecimento de Caracteres). O sistema cruza os dados com o cadastro da Receita Federal para validar se a data de nascimento confere com o usuário real, confirmando a idade sem reter arquivos de imagem localmente.
                  </p>
                </div>

                {/* Metodo 3 */}
                <div className="bg-white/3 border border-white/5 rounded-2xl p-6 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/35 flex items-center justify-center font-serif font-bold text-accent">3</div>
                  <h4 className="font-serif text-base font-bold text-stone-200">Validação Transacional de Cartão de Crédito</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Uso de um cartão de crédito em nome do usuário para cobrar e estornar imediatamente um valor simbólico (ex: R$ 0,10). Uma vez que apenas pessoas civilmente capazes de possuir cartões de crédito efetuam transações, isso serve como atestado secundário de maioridade, muito comum em conformidades americanas.
                  </p>
                </div>

                {/* Metodo 4 */}
                <div className="bg-white/3 border border-white/5 rounded-2xl p-6 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/35 flex items-center justify-center font-serif font-bold text-accent">4</div>
                  <h4 className="font-serif text-base font-bold text-stone-200">Controle de Responsável Legal (Parental Link)</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Para usuários entre 13 e 16 anos que desejam participar de campanhas literárias gerais permitidas a menores, o sistema gera um convite que exige a vinculação da conta de um responsável legal. O responsável faz a verificação rápida e passa a monitorar ou autorizar a navegação de forma restrita.
                  </p>
                </div>

              </div>

              <div className="mt-10 p-6 rounded-2xl border border-white/5 bg-white/3 space-y-4">
                <h4 className="font-serif text-base font-bold text-stone-200">Como é feita a verificação no Gargbooks?</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Atualmente, simulamos as validações da Lei FELCA em nosso ambiente local. Ao acessar o <strong className="text-accent">Espaço da Comunidade RPG</strong> ou ao tentar visualizar um conto restrito, nosso painel de controle permite que você ligue e desligue o selo de maioridade do seu perfil simulado. No ambiente de produção, este selo será atestado por meio de integrações diretas com plataformas líderes de verificação no Brasil, como a <strong className="text-stone-300">Legitimuz</strong> ou <strong className="text-stone-300">Yoti</strong>.
                </p>
              </div>

            </div>
          )}

        </section>

      </main>

      <Footer />
    </div>
  );
}
