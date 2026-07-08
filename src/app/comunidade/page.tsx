"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { useUserSession } from "@/context/UserContext";
import { matchTablesForUser } from "@/utils/rpgMatchmaker";
import { canEditProfile } from "@/utils/security";

export default function ComunidadeRPG() {
  const {
    users,
    currentUser,
    rpgTables,
    isLoading,
    changeCurrentUser,
    updateUser,
    toggleJoinRPGTable,
    createRPGTable,
  } = useUserSession();

  // Profile editing local states
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editTagsString, setEditTagsString] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState<{ success: boolean; text: string } | null>(null);

  // RPG creation local states
  const [rpgTitle, setRpgTitle] = useState("");
  const [rpgSystem, setRpgSystem] = useState("D&D 5e");
  const [rpgSlots, setRpgSlots] = useState(5);
  const [rpgTagsString, setRpgTagsString] = useState("");
  const [rpgDesc, setRpgDesc] = useState("");
  const [isCreatingRpg, setIsCreatingRpg] = useState(false);

  // Initialize edit form with current user data
  const handleStartEdit = () => {
    if (!currentUser) return;
    setEditName(currentUser.name);
    setEditBio(currentUser.bio);
    setEditTagsString(currentUser.interest_tags.join(", "));
    setIsEditing(true);
    setEditMessage(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Converte tags separadas por vírgula em array de strings limpas
    const newTags = editTagsString
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const result = await updateUser(currentUser.id, {
      name: editName,
      bio: editBio,
      interest_tags: newTags
    });

    setEditMessage({ success: result.success, text: result.message });
    if (result.success) {
      setTimeout(() => {
        setIsEditing(false);
        setEditMessage(null);
      }, 1500);
    }
  };

  const handleCreateRPG = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!rpgTitle || !rpgDesc) {
      alert("Por favor, preencha o título e a descrição da mesa.");
      return;
    }

    const tags = rpgTagsString
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    // Se a tag do próprio sistema não estiver inclusa, insere para consistência
    if (rpgSystem && !tags.some(t => t.toLowerCase() === rpgSystem.toLowerCase())) {
      tags.unshift(rpgSystem);
    }

    await createRPGTable({
      title: rpgTitle,
      system: rpgSystem,
      slots: Number(rpgSlots),
      vacancies: Number(rpgSlots),
      tags,
      description: rpgDesc,
      masterId: currentUser.id
    });

    // Reset form
    setRpgTitle("");
    setRpgTagsString("");
    setRpgDesc("");
    setIsCreatingRpg(false);

    // Toast alert
    alert("🎲 Mesa de RPG criada com sucesso e persistida no banco local!");
  };

  // Calcula mesas recomendadas e outras
  const recommendedTables = currentUser
    ? matchTablesForUser(currentUser.id, users, rpgTables)
    : [];

  const otherTables = rpgTables.filter(
    table => !recommendedTables.some(rt => rt.id === table.id)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-corto-dark text-stone-100 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 text-stone-400 font-mono text-xs">
          <span className="animate-spin text-2xl mb-4">🌀</span>
          Inicializando o ambiente de simulação e persistência...
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-corto-dark text-stone-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-16">
        {/* Page Title & Breadcrumb */}
        <section className="mb-12 border-b pb-6 border-white/5 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-[1px] w-6 bg-accent"></span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold">
              Espaço de RPG & Clube de Afinidades
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Comunidade & RPG Matchmaker
          </h1>
          <p className="text-xs md:text-sm text-stone-400 max-w-3xl leading-relaxed">
            Área social integrada. Simule usuários para testar o gatekeeping +18 de contos adultos, 
            respostas no fórum e o filtro de afinidades para mesas de RPG locais.
          </p>
        </section>

        {/* Master Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: Profile Simulator & Session Management (4 Cols) */}
          <div className="lg:col-span-4 space-y-8 animate-fade-in-up">
            
            {/* User Session Simulator Box */}
            <div className="bg-white/3 border border-white/5 rounded-3xl p-6 space-y-5">
              <h2 className="font-serif text-lg font-bold text-stone-200 flex items-center gap-2">
                👤 Simulador de Login
              </h2>
              
              <div className="space-y-3">
                <label className="block text-[9px] font-mono text-stone-400 uppercase tracking-widest">
                  Selecionar Usuário Ativo
                </label>
                <select
                  value={currentUser?.id || ""}
                  onChange={(e) => changeCurrentUser(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-2xl text-xs text-stone-250 focus:border-accent outline-none cursor-pointer font-mono"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} (@{u.username}) {u.is_ai_persona ? "🤖 IA" : ""} {u.is_premium ? "💎 Premium" : "✉️ Comum"}
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-stone-500 font-mono italic">
                  💡 Regra: Usuários comuns não podem simular perfis com selo de IA Persona (🤖).
                </p>
              </div>

              {/* Current Active Profile Details */}
              {currentUser && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-sm font-semibold text-stone-200">
                        {currentUser.name}
                      </h3>
                      <span className="text-[10px] font-mono text-stone-450">
                        @{currentUser.username}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      {currentUser.is_ai_persona && (
                        <span className="px-2 py-0.5 text-[8px] bg-red-950/40 border border-red-500/30 text-red-400 rounded-full font-mono font-bold">
                          🤖 IA PROTEGIDA
                        </span>
                      )}
                      {currentUser.is_premium && (
                        <span className="px-2 py-0.5 text-[8px] bg-amber-950/40 border border-amber-500/30 text-accent rounded-full font-mono font-bold animate-pulse">
                          💎 PREMIUM
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-stone-400 leading-relaxed font-sans">
                    {currentUser.bio || "Sem biografia."}
                  </p>

                  <div className="space-y-1.5">
                    <span className="block text-[8px] uppercase tracking-wider font-mono text-stone-500">
                      Gostos & Afinidades:
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentUser.interest_tags.map(t => (
                        <span key={t} className="px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-widest bg-accent/15 border border-accent/25 text-accent rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex gap-2 justify-between items-center text-[10px] font-mono text-stone-500">
                    <span>Idade Verificada: {currentUser.age_verified ? "Sim (🔞)" : "Não"}</span>
                    {!isEditing && (
                      <button
                        onClick={handleStartEdit}
                        className="text-xs text-accent hover:underline cursor-pointer"
                      >
                        Editar Perfil ⚙️
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Edit Form Section */}
            {isEditing && currentUser && (
              <form onSubmit={handleSaveProfile} className="bg-white/3 border border-white/5 rounded-3xl p-6 space-y-4 animate-fade-in">
                <h3 className="font-serif text-sm font-bold text-stone-200">
                  Editar Dados do Perfil
                </h3>

                {editMessage && (
                  <div className={`p-3 rounded-xl text-xs font-mono border ${
                    editMessage.success ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" : "bg-red-950/20 border-red-500/30 text-red-400"
                  }`}>
                    {editMessage.text}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-stone-400 uppercase tracking-widest">
                    Nome Exibido
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-2xl text-xs focus:border-accent outline-none text-stone-250 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-stone-400 uppercase tracking-widest">
                    Biografia
                  </label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-2xl text-xs focus:border-accent outline-none resize-none text-stone-250 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-stone-400 uppercase tracking-widest">
                    Tags de Afinidade (Separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={editTagsString}
                    onChange={(e) => setEditTagsString(e.target.value)}
                    placeholder="D&D 5e, Terror, Fantasia"
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-2xl text-xs focus:border-accent outline-none text-stone-250 font-sans"
                  />
                  <p className="text-[8px] text-stone-500 font-mono uppercase tracking-wider mt-1">
                    Atualiza o Matchmaker de RPG instantaneamente.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2 font-mono text-[10px] uppercase">
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setEditMessage(null); }}
                    className="px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-full text-stone-300 font-bold hover:bg-neutral-850 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-accent text-white rounded-full hover:bg-accent-hover font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            )}

            {/* Premium Verification Control Box */}
            {currentUser && (
              <div className="bg-white/3 border border-white/5 rounded-3xl p-6 space-y-4">
                <h3 className="font-serif text-sm font-bold text-stone-200">
                  🔐 Gatekeeping +18 (Simulador)
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed font-sans">
                  Controle as flags do usuário logado para simular o comportamento de bloqueio etário e paywall.
                </p>

                <div className="flex gap-4 font-mono text-[9px] uppercase tracking-wider">
                  <button
                    onClick={() => updateUser(currentUser.id, { age_verified: !currentUser.age_verified })}
                    className={`flex-1 py-3 px-3 font-bold rounded-full border transition-all cursor-pointer ${
                      currentUser.age_verified
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                        : "bg-red-950/20 border-red-500/30 text-red-400"
                    }`}
                  >
                    {currentUser.age_verified ? "🔞 Maior de Idade: Sim" : "🔞 Maior de Idade: Não"}
                  </button>

                  <button
                    onClick={() => updateUser(currentUser.id, { is_premium: !currentUser.is_premium })}
                    className={`flex-1 py-3 px-3 font-bold rounded-full border transition-all cursor-pointer ${
                      currentUser.is_premium
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                        : "bg-red-950/20 border-red-500/30 text-red-400"
                    }`}
                  >
                    {currentUser.is_premium ? "💎 Plano: Premium" : "✉️ Plano: Comum"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: RPG Matchmaker by Affinity & Table details (8 Cols) */}
          <div className="lg:col-span-8 space-y-8 animate-fade-in-up">
            
            {/* Header toolbar for RPG: Create Table button */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h2 className="font-serif text-xl font-bold text-stone-100 flex items-center gap-2.5">
                🎲 Matchmaker por Afinidade
              </h2>
              
              {!isCreatingRpg && (
                <button
                  onClick={() => setIsCreatingRpg(true)}
                  className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-full text-[10px] uppercase font-mono font-bold tracking-widest shadow-md shadow-accent/25 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>＋</span> Criar Mesa de RPG
                </button>
              )}
            </div>

            {/* Create RPG Table Form */}
            {isCreatingRpg && (
              <form onSubmit={handleCreateRPG} className="bg-white/3 rounded-3xl p-6 border border-accent/25 space-y-4 animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h3 className="font-serif text-base font-bold text-stone-250">
                    Novas Mesas e Campanhas
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCreatingRpg(false)}
                    className="text-stone-500 hover:text-stone-300 text-xs font-mono uppercase tracking-wider cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-[9px] font-mono text-stone-400 uppercase tracking-widest">
                      Título da Aventura *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Tumba da Aniquilação"
                      value={rpgTitle}
                      onChange={(e) => setRpgTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-2xl text-xs focus:border-accent outline-none text-stone-200 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-mono text-stone-400 uppercase tracking-widest">
                      Sistema de Regras
                    </label>
                    <select
                      value={rpgSystem}
                      onChange={(e) => setRpgSystem(e.target.value)}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-2xl text-xs focus:border-accent outline-none text-stone-300 cursor-pointer font-mono"
                    >
                      <option value="D&D 5e">D&D 5e</option>
                      <option value="Cyberpunk RED">Cyberpunk RED</option>
                      <option value="Call of Cthulhu 7th Ed">Chamado de Cthulhu</option>
                      <option value="Ordem Paranormal RPG">Ordem Paranormal</option>
                      <option value="Outros">Outros Sistemas</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-mono text-stone-400 uppercase tracking-widest">
                      Vagas Totais
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={rpgSlots}
                      onChange={(e) => setRpgSlots(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-2xl text-xs focus:border-accent outline-none text-stone-200"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-[9px] font-mono text-stone-400 uppercase tracking-widest">
                      Tags da Mesa (Separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      placeholder="Fantasia Sombria, Investigação, Iniciantes"
                      value={rpgTagsString}
                      onChange={(e) => setRpgTagsString(e.target.value)}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-2xl text-xs focus:border-accent outline-none text-stone-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-stone-400 uppercase tracking-widest">
                    Descrição da Mesa e Horários *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Conte um pouco sobre o estilo da campanha, o tom de narrativa, datas das sessões, etc."
                    value={rpgDesc}
                    onChange={(e) => setRpgDesc(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-2xl text-xs focus:border-accent outline-none resize-none font-sans text-stone-200"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2 font-mono text-[10px] uppercase">
                  <button
                    type="button"
                    onClick={() => setIsCreatingRpg(false)}
                    className="px-5 py-2.5 bg-neutral-900 border border-white/10 rounded-full text-stone-300 font-bold hover:bg-neutral-850 cursor-pointer"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-accent text-white rounded-full hover:bg-accent-hover font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Publicar Mesa 🎲
                  </button>
                </div>
              </form>
            )}

            {/* List Recommended Tables */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                <h3 className="font-serif text-base font-bold text-stone-200">
                  Mesas Recomendadas para Você ({recommendedTables.length})
                </h3>
              </div>

              {recommendedTables.length === 0 ? (
                <div className="p-8 text-center bg-white/3 border border-dashed border-white/10 rounded-3xl text-xs text-stone-500 leading-relaxed italic">
                  Nenhuma mesa correspondente com suas tags de afinidade atuais. 
                  Adicione tags como &quot;D&D 5e&quot; ou &quot;Fantasia Sombria&quot; ao seu perfil para encontrar mesas!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendedTables.map(table => (
                    <RPGTableCard key={table.id} table={table} users={users} currentUserId={currentUser?.id} onToggleJoin={toggleJoinRPGTable} isRecommended={true} />
                  ))}
                </div>
              )}
            </div>

            {/* List Other Tables */}
            <div className="space-y-4 pt-4">
              <h3 className="font-serif text-base font-bold text-stone-300">
                Outras Mesas Disponíveis ({otherTables.length})
              </h3>

              {otherTables.length === 0 ? (
                <div className="p-8 text-center bg-white/3 border border-white/5 rounded-3xl text-xs text-stone-500">
                  Não existem outras mesas cadastradas no momento.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {otherTables.map(table => (
                    <RPGTableCard key={table.id} table={table} users={users} currentUserId={currentUser?.id} onToggleJoin={toggleJoinRPGTable} isRecommended={false} />
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

// Sub-Component: RPG Table Card to avoid duplicated rendering logic
interface RPGTableCardProps {
  table: any;
  users: any[];
  currentUserId?: string;
  onToggleJoin: (id: string) => void;
  isRecommended: boolean;
}

function RPGTableCard({ table, users, currentUserId, onToggleJoin, isRecommended }: RPGTableCardProps) {
  const master = users.find(u => u.id === table.masterId);
  const isJoined = currentUserId ? table.participants.includes(currentUserId) : false;

  // Encontra os nomes dos outros participantes
  const participantNames = table.participants
    .map((pid: string) => {
      const u = users.find(user => user.id === pid);
      return u ? `@${u.username}` : "Leitor";
    })
    .join(", ");

  return (
    <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-350 relative ${
      isRecommended 
        ? "bg-gradient-to-tr from-accent/[0.04] via-white/3 to-white/3 border-accent/25 hover:border-accent/40 shadow-md" 
        : "bg-white/3 border-white/5 hover:border-white/10"
    }`}>
      
      {/* Recommended Tag */}
      {isRecommended && (
        <span className="absolute top-4 right-4 px-2.5 py-0.5 text-[8px] font-mono font-bold bg-accent text-white rounded-full">
          AFINIDADE ALTA
        </span>
      )}

      <div className="space-y-3">
        {/* System & Title */}
        <div>
          <span className="px-2.5 py-0.5 text-[8px] font-mono uppercase bg-black/50 border border-white/10 text-stone-400 rounded-full font-bold tracking-wider">
            {table.system}
          </span>
          <h4 className="font-serif text-lg font-bold text-stone-200 mt-2.5 leading-tight">
            {table.title}
          </h4>
        </div>

        {/* Master details */}
        <div className="flex items-center gap-1.5 text-[9px] text-stone-500 font-mono uppercase tracking-wider">
          <span>Narrador:</span>
          <span className="text-stone-300 font-bold">
            {master ? `${master.name} (@${master.username})` : "Mestre do Castelo"}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-400 leading-relaxed line-clamp-3 font-sans">
          {table.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {table.tags.map((tag: string) => (
            <span key={tag} className="px-2 py-0.5 text-[9px] font-medium font-mono uppercase tracking-wider bg-white/5 border border-white/5 text-stone-350 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer / Joining actions */}
      <div className="pt-4 border-t border-white/5 mt-5 flex items-center justify-between">
        <div>
          <span className="block text-[8px] uppercase tracking-wider text-stone-500 font-mono">
            Vagas Abertas
          </span>
          <span className="font-serif text-sm font-bold text-stone-200">
            {table.vacancies} / {table.slots}
          </span>
        </div>

        {currentUserId && (
          <button
            onClick={() => onToggleJoin(table.id)}
            className={`px-4 py-2.5 rounded-full text-[10px] uppercase font-mono font-bold tracking-wider transition-all active:scale-[0.97] cursor-pointer ${
              isJoined
                ? "bg-red-950/40 border border-red-500/25 text-red-400 hover:bg-red-950/65"
                : table.vacancies <= 0
                ? "bg-stone-850 border border-white/5 text-stone-600 cursor-not-allowed"
                : "bg-white text-black hover:bg-accent hover:text-white shadow"
            }`}
            disabled={table.vacancies <= 0 && !isJoined}
          >
            {isJoined ? "Sair da Mesa" : table.vacancies <= 0 ? "Esgotado" : "Entrar na Mesa"}
          </button>
        )}
      </div>

      {/* Participant List Summary */}
      {table.participants.length > 0 && (
        <div className="pt-2.5 text-[9px] font-mono text-stone-600 border-t border-white/5 mt-3.5">
          Membros: <span className="text-stone-400">{participantNames}</span>
        </div>
      )}
    </div>
  );
}
