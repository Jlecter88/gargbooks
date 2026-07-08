"use client";

import React, { useState, useEffect, useRef } from "react";

// --- TYPES & INTERFACES ---
export interface Sender {
  name: string;
  avatarColor: string; // Gradient color for the avatar
  role: "player" | "master" | "system";
}

export interface RollDetail {
  expression: string; // e.g. "3d6+4"
  rolls: number[];    // individual results: [5, 2, 6]
  modifier: number;   // e.g. +4
  total: number;      // e.g. 17
  isCriticalSuccess?: boolean; // natural max on d20
  isCriticalFailure?: boolean; // natural 1 on d20
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  timestamp: string; // formatted HH:MM:SS
  type: "text" | "roll" | "system";
  content: string;
  rollDetail?: RollDetail;
}

// Default initial chat history to set up an immersive campaign start
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: {
      name: "Narrador (Mestre)",
      avatarColor: "from-rose-800 to-red-950",
      role: "master",
    },
    timestamp: "12:00:15",
    type: "text",
    content: "Vocês adentram a cripta esquecida sob as ruínas do Castelo de Otranto. O ar é pesado, gélido e cheira a poeira centenária. A luz de suas tochas projeta sombras alongadas e distorcidas contra as paredes de pedra rústica. À frente, uma pesada porta de ferro reforçada com runas antigas barra o caminho.",
  },
  {
    id: "msg-2",
    sender: {
      name: "Alistair (Guerreiro)",
      avatarColor: "from-amber-600 to-amber-950",
      role: "player",
    },
    timestamp: "12:01:40",
    type: "text",
    content: "Eu me aproximo cautelosamente da porta de ferro. Coloco a mão sobre o punho da minha espada e tento empurrar a porta para ver se ela está trancada ou se cede ao peso.",
  },
  {
    id: "msg-3",
    sender: {
      name: "Narrador (Mestre)",
      avatarColor: "from-rose-800 to-red-950",
      role: "master",
    },
    timestamp: "12:02:10",
    type: "text",
    content: "A porta está lacrada. Para tentar forçá-la ou decifrar o mecanismo, role um teste de **Força (Atletismo)** ou **Inteligência (Arcanismo)**. A Dificuldade (CD) é 15.",
  },
  {
    id: "msg-4",
    sender: {
      name: "Alistair (Guerreiro)",
      avatarColor: "from-amber-600 to-amber-950",
      role: "player",
    },
    timestamp: "12:03:02",
    type: "roll",
    content: "rolou um teste de Atletismo para abrir a porta",
    rollDetail: {
      expression: "1d20+5",
      rolls: [14],
      modifier: 5,
      total: 19,
    },
  },
  {
    id: "msg-5",
    sender: {
      name: "Narrador (Mestre)",
      avatarColor: "from-rose-800 to-red-950",
      role: "master",
    },
    timestamp: "12:03:20",
    type: "text",
    content: "Com um rangido estridente de metal oxidado contra pedra, a porta cede à força de Alistair e se abre lentamente, revelando um lance de escadas espirais que descem rumo à escuridão profunda.",
  },
];

// Preset players for simulated real-time messages
const MOCK_PLAYERS: Sender[] = [
  {
    name: "Narrador (Mestre)",
    avatarColor: "from-rose-800 to-red-950",
    role: "master",
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

const MOCK_RESPONSES = [
  {
    sender: MOCK_PLAYERS[1], // Morgana
    type: "text" as const,
    content: "Eu sinto uma assinatura mágica oscilando lá embaixo. Vou sussurrar as palavras de 'Detectar Magia' e guiar o grupo com meus olhos brilhando em azul arcano.",
  },
  {
    sender: MOCK_PLAYERS[2], // Valerius
    type: "roll" as const,
    content: "rolou Investigação para buscar armadilhas nos primeiros degraus",
    rollDetail: {
      expression: "1d20+7",
      rolls: [18],
      modifier: 7,
      total: 25,
      isCriticalSuccess: false,
    },
  },
  {
    sender: MOCK_PLAYERS[0], // Mestre
    type: "text" as const,
    content: "Valerius, seus olhos afiados percebem um fio de nylon quase invisível esticado na altura do segundo degrau. Conectado a um bloco de pedra solto acima de vocês. Excelente percepção!",
  },
  {
    sender: MOCK_PLAYERS[1], // Morgana
    type: "roll" as const,
    content: "lançou Projétil Mágico em um vulto que se moveu nas sombras!",
    rollDetail: {
      expression: "3d4+3",
      rolls: [3, 4, 2],
      modifier: 3,
      total: 12,
    },
  },
  {
    sender: MOCK_PLAYERS[0], // Mestre
    type: "text" as const,
    content: "Os projéteis de pura energia teleguiados iluminam a escadaria e atingem um morcego gigante com impacto certeiro. O bicho cai guinchando no chão de pedra.",
  },
];

interface RPGChatProps {
  currentUser?: Sender;
  onSendMessage?: (message: ChatMessage) => void;
}

export default function RPGChat({ currentUser, onSendMessage }: RPGChatProps) {
  // Configurações do usuário ativo padrão caso nenhum seja fornecido
  const activeUser: Sender = currentUser || {
    name: "Alistair (Guerreiro)",
    avatarColor: "from-amber-600 to-amber-950",
    role: "player",
  };

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Regex to validate dice rolls: "/roll [quantity]d[faces] [+/- modifier]"
  // Quantity (match 1) is optional, faces (match 2) is required, modifier operator (match 3) and value (match 4) are optional.
  const ROLL_REGEX = /^\/roll\s*(\d+)?d(\d+)(?:\s*([+-])\s*(\d+))?$/i;

  // Auto-scroll logic when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Command Parser Logic
  const handleRoll = (text: string): RollDetail | null => {
    const match = text.match(ROLL_REGEX);
    if (!match) return null;

    const qty = match[1] ? parseInt(match[1], 10) : 1;
    const faces = parseInt(match[2], 10);
    const operator = match[3];
    const modValue = match[4] ? parseInt(match[4], 10) : 0;
    const modifier = operator === "-" ? -modValue : modValue;

    if (qty > 50) {
      throw new Error("Muitos dados! O limite máximo é de 50 dados por rolagem.");
    }
    if (faces > 1000) {
      throw new Error("Muitas faces! O limite máximo é de 1000 faces por dado.");
    }
    if (qty <= 0 || faces <= 0) {
      throw new Error("Valores inválidos. Insira números inteiros maiores que zero.");
    }

    const rolls: number[] = [];
    let sum = 0;
    for (let i = 0; i < qty; i++) {
      const roll = Math.floor(Math.random() * faces) + 1;
      rolls.push(roll);
      sum += roll;
    }

    const total = sum + modifier;
    const expression = `${qty}d${faces}${operator ? ` ${operator} ${modValue}` : ""}`;

    // Critical success/failure condition for d20 rolls
    const isCriticalSuccess = qty === 1 && faces === 20 && rolls[0] === 20;
    const isCriticalFailure = qty === 1 && faces === 20 && rolls[0] === 1;

    return {
      expression,
      rolls,
      modifier,
      total,
      isCriticalSuccess,
      isCriticalFailure,
    };
  };

  const getFormattedTime = (): string => {
    const now = new Date();
    return now.toTimeString().split(" ")[0];
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setErrorMessage(null);
    const text = inputText.trim();

    try {
      let newMessage: ChatMessage;

      if (text.toLowerCase().startsWith("/roll")) {
        const rollDetail = handleRoll(text);
        if (rollDetail) {
          newMessage = {
            id: `msg-${Date.now()}`,
            sender: activeUser,
            timestamp: getFormattedTime(),
            type: "roll",
            content: `rolou os dados: ${rollDetail.expression}`,
            rollDetail,
          };
        } else {
          // If typed /roll but format was wrong
          throw new Error("Comando inválido. Use o formato: `/roll 1d20+5` ou `/roll 3d6`.");
        }
      } else {
        // Normal text message
        newMessage = {
          id: `msg-${Date.now()}`,
          sender: activeUser,
          timestamp: getFormattedTime(),
          type: "text",
          content: text,
        };
      }

      setMessages((prev) => [...prev, newMessage]);
      setInputText("");

      if (onSendMessage) {
        onSendMessage(newMessage);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao processar comando.");
    }
  };

  // Quick Action Buttons
  const handleQuickAction = (action: string) => {
    setInputText(action);
  };

  // Mock Simulated Real-time interaction
  const [responseIndex, setResponseIndex] = useState(0);
  const simulateIncomingMessage = () => {
    if (responseIndex >= MOCK_RESPONSES.length) {
      // Loop responses
      setResponseIndex(0);
    }
    
    const mock = MOCK_RESPONSES[responseIndex];
    const newMockMsg: ChatMessage = {
      id: `mock-${Date.now()}`,
      sender: mock.sender,
      timestamp: getFormattedTime(),
      type: mock.type,
      content: mock.content,
      rollDetail: mock.rollDetail,
    };

    setMessages((prev) => [...prev, newMockMsg]);
    setResponseIndex((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-[650px] w-full rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl shadow-black overflow-hidden select-none">
      
      {/* HEADER DO CHAT RPG */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Animated Dice SVG Icon */}
          <div className="p-2.5 bg-gradient-to-br from-amber-600/25 to-rose-700/25 border border-amber-600/30 rounded-xl animate-pulse">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-amber-500 stroke-[1.5]">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold tracking-wide text-zinc-100">Câmara do Destino</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">Sessão RPG Ativa</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Real-time simulation trigger */}
          <button
            onClick={simulateIncomingMessage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-amber-500 rounded-lg active:scale-95 transition-all cursor-pointer"
            title="Simula a chegada de mensagens em tempo real de outros jogadores/mestre"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-[2]">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Simular Concorrência
          </button>
        </div>
      </div>

      {/* FEED DE MENSAGENS */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-5 bg-radial-gradient from-zinc-950 via-zinc-950 to-black/80"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#27272a transparent"
        }}
      >
        {messages.map((msg) => {
          const isMaster = msg.sender.role === "master";
          const isSelf = msg.sender.name === activeUser.name;
          const isRoll = msg.type === "roll";

          return (
            <div 
              key={msg.id}
              className={`flex flex-col max-w-[85%] group animate-fade-in ${
                isSelf ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              {/* SENDER INFO */}
              <div className="flex items-center gap-2 mb-1.5 px-1">
                {!isSelf && (
                  <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${msg.sender.avatarColor} border border-white/10 text-[9px] font-bold flex items-center justify-center`}>
                    {msg.sender.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className={`text-xs font-semibold ${
                  isMaster ? "text-rose-500 font-serif" : "text-zinc-300"
                }`}>
                  {msg.sender.name}
                </span>
                <span className="text-[10px] text-zinc-600 font-mono">{msg.timestamp}</span>
              </div>

              {/* MESSAGE CONTENT */}
              {!isRoll ? (
                // Text Message
                <div 
                  className={`px-4 py-3 text-sm leading-relaxed rounded-2xl select-text border transition-all ${
                    isSelf 
                      ? "bg-zinc-900 border-zinc-800 text-zinc-200 rounded-tr-none hover:border-zinc-700" 
                      : "bg-zinc-950/70 border-zinc-900 text-zinc-300 rounded-tl-none hover:border-zinc-850"
                  }`}
                >
                  <p className={isMaster ? "font-serif italic text-zinc-200" : "font-sans"}>
                    {msg.content}
                  </p>
                </div>
              ) : (
                // ROLL CARD COMPONENT
                msg.rollDetail && (
                  <div 
                    className={`w-full max-w-[420px] p-5 rounded-2xl border shadow-xl transition-all hover:scale-[1.01] ${
                      msg.rollDetail.isCriticalSuccess
                        ? "bg-gradient-to-br from-amber-600/15 via-orange-900/25 to-zinc-950 border-amber-500/40 shadow-amber-950/20"
                        : msg.rollDetail.isCriticalFailure
                        ? "bg-gradient-to-br from-rose-950/30 via-red-950/15 to-zinc-950 border-rose-700/40 shadow-red-950/20"
                        : "bg-gradient-to-br from-purple-900/15 via-zinc-900/30 to-zinc-950 border-purple-900/30 shadow-purple-950/10"
                    }`}
                  >
                    {/* Roll header */}
                    <div className="flex justify-between items-start border-b border-zinc-850 pb-2.5 mb-3">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                          Teste de RPG
                        </span>
                        <h4 className="text-xs font-medium text-zinc-300 mt-0.5">
                          {msg.content}
                        </h4>
                      </div>
                      <div className="px-2 py-1 bg-black/40 border border-zinc-800 rounded font-mono text-xs text-amber-500 font-bold">
                        {msg.rollDetail.expression}
                      </div>
                    </div>

                    {/* Roll details (individual dice) */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 block mb-1">
                          Dados Individuais:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {msg.rollDetail.rolls.map((r, index) => (
                            <div 
                              key={index} 
                              className="relative w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-100 shadow-inner group/die hover:border-zinc-600 transition-colors"
                            >
                              {r}
                              {/* Dice face shape representation */}
                              <div className="absolute inset-0.5 border border-dashed border-zinc-800/60 rounded group-hover/die:border-zinc-700/60 transition-colors pointer-events-none" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Modifier display */}
                      {msg.rollDetail.modifier !== 0 && (
                        <div className="flex justify-between items-center text-xs text-zinc-400 font-mono bg-black/20 px-3 py-1.5 rounded-lg border border-zinc-900">
                          <span>Modificador</span>
                          <span className={msg.rollDetail.modifier > 0 ? "text-emerald-500" : "text-rose-500"}>
                            {msg.rollDetail.modifier > 0 ? `+${msg.rollDetail.modifier}` : msg.rollDetail.modifier}
                          </span>
                        </div>
                      )}

                      {/* Roll Total Result */}
                      <div className="relative overflow-hidden flex items-center justify-between mt-4 p-4 rounded-xl bg-black/40 border border-zinc-850">
                        {/* Background flare decorations */}
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-amber-600/5 to-transparent pointer-events-none" />
                        
                        <div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">
                            Resultado Final
                          </span>
                          {msg.rollDetail.isCriticalSuccess && (
                            <span className="block text-[10px] font-serif italic text-amber-500 font-bold mt-0.5 animate-pulse">
                              ★ Crítico Natural! ★
                            </span>
                          )}
                          {msg.rollDetail.isCriticalFailure && (
                            <span className="block text-[10px] font-serif italic text-rose-500 font-bold mt-0.5 animate-pulse">
                              💀 Falha Crítica! 💀
                            </span>
                          )}
                          {!msg.rollDetail.isCriticalSuccess && !msg.rollDetail.isCriticalFailure && (
                            <span className="block text-[10px] font-serif text-zinc-400 italic mt-0.5">
                              Rolagem Completa
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <span className={`font-serif text-3xl font-extrabold tracking-tight ${
                            msg.rollDetail.isCriticalSuccess 
                              ? "text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                              : msg.rollDetail.isCriticalFailure
                              ? "text-rose-600 drop-shadow-[0_0_12px_rgba(220,38,38,0.5)]"
                              : "text-zinc-100"
                          }`}>
                            {msg.rollDetail.total}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* ERROR IN COMMAND / INSTRUCTION ALERT */}
      {errorMessage && (
        <div className="px-6 py-2 bg-rose-950/80 border-t border-rose-900/60 text-xs text-rose-300 flex justify-between items-center transition-all">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[2] shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </div>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="text-rose-300 hover:text-white font-mono text-[10px] uppercase font-bold pl-3 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* QUICK PRESET SHELF (DICE ROLLS SHORTCUTS) */}
      <div className="flex items-center gap-2 px-6 py-2 border-t border-zinc-900 bg-zinc-950/40 overflow-x-auto select-none">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider shrink-0 mr-1.5">
          Dados Rápidos:
        </span>
        <button
          type="button"
          onClick={() => handleQuickAction("/roll 1d20")}
          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-amber-600/30 text-xs text-zinc-300 hover:text-amber-500 rounded font-mono transition-colors active:scale-95 shrink-0 cursor-pointer"
        >
          d20
        </button>
        <button
          type="button"
          onClick={() => handleQuickAction("/roll 3d6+4")}
          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-amber-600/30 text-xs text-zinc-300 hover:text-amber-500 rounded font-mono transition-colors active:scale-95 shrink-0 cursor-pointer"
        >
          3d6+4
        </button>
        <button
          type="button"
          onClick={() => handleQuickAction("/roll 2d10+2")}
          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-amber-600/30 text-xs text-zinc-300 hover:text-amber-500 rounded font-mono transition-colors active:scale-95 shrink-0 cursor-pointer"
        >
          2d10+2
        </button>
        <button
          type="button"
          onClick={() => handleQuickAction("/roll 1d100")}
          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-amber-600/30 text-xs text-zinc-300 hover:text-amber-500 rounded font-mono transition-colors active:scale-95 shrink-0 cursor-pointer"
        >
          d100
        </button>
        <button
          type="button"
          onClick={() => handleQuickAction("/roll 4d4")}
          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-amber-600/30 text-xs text-zinc-300 hover:text-amber-500 rounded font-mono transition-colors active:scale-95 shrink-0 cursor-pointer"
        >
          4d4
        </button>
      </div>

      {/* INPUT FORM */}
      <form 
        onSubmit={handleSend}
        className="px-6 py-4 border-t border-zinc-900 bg-zinc-950"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="Digite sua mensagem ou digite '/roll 1d20+5' para rolar..."
            className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-850 rounded-xl text-sm font-sans focus:border-amber-600/40 focus:outline-none transition-all placeholder-zinc-650 focus:bg-zinc-900/80 focus:shadow-[0_0_15px_rgba(245,158,11,0.03)]"
          />
          <button
            type="submit"
            className="px-5 bg-gradient-to-r from-amber-600 to-rose-700 text-white rounded-xl text-xs font-semibold hover:brightness-110 transition-all duration-300 active:scale-95 shadow-md shadow-amber-950/20 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Enviar</span>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div className="flex justify-between items-center mt-2 px-1 text-[10px] text-zinc-600 font-mono">
          <span>Formatos: /roll [dados]d[faces]+[mod]</span>
          <span>Dica: Tente d20 ou d100 clicando nos dados rápidos</span>
        </div>
      </form>

    </div>
  );
}
