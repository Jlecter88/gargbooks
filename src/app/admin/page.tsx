"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User } from "@/utils/rpgMatchmaker";

// Custom SVG Icons matching the brand aesthetics
const IconArrowLeft = () => (
  <svg className="w-4 h-4 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const IconPlus = () => (
  <svg className="w-4 h-4 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const IconTrash = () => (
  <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
  </svg>
);

const IconEdit = () => (
  <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconUsers = () => (
  <svg className="w-4 h-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconBanners = () => (
  <svg className="w-4 h-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const IconAds = () => (
  <svg className="w-4 h-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
    <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12a10 10 0 0 1 10-10zm0 3v7m0 4h.01" />
  </svg>
);

const IconAffiliates = () => (
  <svg className="w-4 h-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12M9 9h6M9 15h6" />
  </svg>
);

const IconLoader = () => (
  <svg className="w-6 h-6 stroke-accent fill-none stroke-[2] animate-spin" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeDasharray="32" />
  </svg>
);

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  order: number;
  active: boolean;
}

interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  location: string;
  active: boolean;
  impressions: number;
  clicks: number;
}

interface Affiliate {
  id: string;
  name: string;
  code: string;
  conversions: number;
  balance: number;
  active: boolean;
}

type TabType = "users" | "banners" | "ads" | "affiliates";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  
  // Database States
  const [usersList, setUsersList] = useState<User[]>([]);
  const [bannersList, setBannersList] = useState<Banner[]>([]);
  const [adsList, setAdsList] = useState<Ad[]>([]);
  const [affiliatesList, setAffiliatesList] = useState<Affiliate[]>([]);

  // Loaders
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [loadingAds, setLoadingAds] = useState(true);
  const [loadingAffiliates, setLoadingAffiliates] = useState(true);

  // Forms Visibility
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [showAdForm, setShowAdForm] = useState(false);
  const [showAffiliateForm, setShowAffiliateForm] = useState(false);

  // Form Fields: Banners
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bannerLink, setBannerLink] = useState("");
  const [bannerOrder, setBannerOrder] = useState(1);
  const [bannerActive, setBannerActive] = useState(true);

  // Form Fields: Ads
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [adTitle, setAdTitle] = useState("");
  const [adImageUrl, setAdImageUrl] = useState("");
  const [adLink, setAdLink] = useState("");
  const [adLocation, setAdLocation] = useState("sidebar");
  const [adActive, setAdActive] = useState(true);

  // Form Fields: Affiliates
  const [editingAffiliateId, setEditingAffiliateId] = useState<string | null>(null);
  const [affiliateName, setAffiliateName] = useState("");
  const [affiliateCode, setAffiliateCode] = useState("");
  const [affiliateConversions, setAffiliateConversions] = useState(0);
  const [affiliateBalance, setAffiliateBalance] = useState(0);
  const [affiliateActive, setAffiliateActive] = useState(true);

  // Users Search
  const [searchQuery, setSearchQuery] = useState("");

  // Initial Fetches
  useEffect(() => {
    fetchUsers();
    fetchBanners();
    fetchAds();
    fetchAffiliates();
  }, []);

  // --- Fetch Methods ---
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchBanners = async () => {
    try {
      setLoadingBanners(true);
      const res = await fetch("/api/banners");
      if (res.ok) {
        const data = await res.json();
        setBannersList(data);
      }
    } catch (err) {
      console.error("Erro ao carregar banners:", err);
    } finally {
      setLoadingBanners(false);
    }
  };

  const fetchAds = async () => {
    try {
      setLoadingAds(true);
      const res = await fetch("/api/ads");
      if (res.ok) {
        const data = await res.json();
        setAdsList(data);
      }
    } catch (err) {
      console.error("Erro ao carregar propagandas:", err);
    } finally {
      setLoadingAds(false);
    }
  };

  const fetchAffiliates = async () => {
    try {
      setLoadingAffiliates(true);
      const res = await fetch("/api/affiliates");
      if (res.ok) {
        const data = await res.json();
        setAffiliatesList(data);
      }
    } catch (err) {
      console.error("Erro ao carregar afiliados:", err);
    } finally {
      setLoadingAffiliates(false);
    }
  };

  // --- Save / Write Methods ---
  const saveUsersList = async (updated: User[]) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setUsersList(updated);
      }
    } catch (err) {
      console.error("Erro ao salvar lista de usuários:", err);
    }
  };

  const saveBannersList = async (updated: Banner[]) => {
    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setBannersList(updated);
        resetBannerForm();
      }
    } catch (err) {
      console.error("Erro ao salvar banners:", err);
    }
  };

  const saveAdsList = async (updated: Ad[]) => {
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setAdsList(updated);
        resetAdForm();
      }
    } catch (err) {
      console.error("Erro ao salvar propagandas:", err);
    }
  };

  const saveAffiliatesList = async (updated: Affiliate[]) => {
    try {
      const res = await fetch("/api/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setAffiliatesList(updated);
        resetAffiliateForm();
      }
    } catch (err) {
      console.error("Erro ao salvar afiliados:", err);
    }
  };

  // --- User Premium Trigger ---
  const handleTogglePremium = async (userId: string, currentStatus: boolean) => {
    const updated = usersList.map((u) => {
      if (u.id === userId) {
        return { ...u, is_premium: !currentStatus };
      }
      return u;
    });
    await saveUsersList(updated);
  };

  // --- Banner Actions ---
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim() || !bannerImageUrl.trim()) return;

    let updated: Banner[];
    if (editingBannerId) {
      updated = bannersList.map((b) =>
        b.id === editingBannerId
          ? { ...b, title: bannerTitle, imageUrl: bannerImageUrl, link: bannerLink, order: Number(bannerOrder), active: bannerActive }
          : b
      );
    } else {
      const newBanner: Banner = {
        id: `banner-${Date.now()}`,
        title: bannerTitle,
        imageUrl: bannerImageUrl,
        link: bannerLink,
        order: Number(bannerOrder),
        active: bannerActive,
      };
      updated = [...bannersList, newBanner];
    }
    await saveBannersList(updated);
  };

  const handleEditBannerClick = (b: Banner) => {
    setEditingBannerId(b.id);
    setBannerTitle(b.title);
    setBannerImageUrl(b.imageUrl);
    setBannerLink(b.link);
    setBannerOrder(b.order);
    setBannerActive(b.active);
    setShowBannerForm(true);
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este banner?")) return;
    const updated = bannersList.filter((b) => b.id !== id);
    await saveBannersList(updated);
  };

  const handleToggleBannerActive = async (id: string, current: boolean) => {
    const updated = bannersList.map((b) => (b.id === id ? { ...b, active: !current } : b));
    await saveBannersList(updated);
  };

  const resetBannerForm = () => {
    setEditingBannerId(null);
    setBannerTitle("");
    setBannerImageUrl("");
    setBannerLink("");
    setBannerOrder(bannersList.length + 1);
    setBannerActive(true);
    setShowBannerForm(false);
  };

  // --- Ad Actions ---
  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adImageUrl.trim()) return;

    let updated: Ad[];
    if (editingAdId) {
      updated = adsList.map((a) =>
        a.id === editingAdId
          ? { ...a, title: adTitle, imageUrl: adImageUrl, link: adLink, location: adLocation, active: adActive }
          : a
      );
    } else {
      const newAd: Ad = {
        id: `ad-${Date.now()}`,
        title: adTitle,
        imageUrl: adImageUrl,
        link: adLink,
        location: adLocation,
        active: adActive,
        impressions: 0,
        clicks: 0,
      };
      updated = [...adsList, newAd];
    }
    await saveAdsList(updated);
  };

  const handleEditAdClick = (a: Ad) => {
    setEditingAdId(a.id);
    setAdTitle(a.title);
    setAdImageUrl(a.imageUrl);
    setAdLink(a.link);
    setAdLocation(a.location);
    setAdActive(a.active);
    setShowAdForm(true);
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta propaganda?")) return;
    const updated = adsList.filter((a) => a.id !== id);
    await saveAdsList(updated);
  };

  const handleToggleAdActive = async (id: string, current: boolean) => {
    const updated = adsList.map((a) => (a.id === id ? { ...a, active: !current } : a));
    await saveAdsList(updated);
  };

  const resetAdForm = () => {
    setEditingAdId(null);
    setAdTitle("");
    setAdImageUrl("");
    setAdLink("");
    setAdLocation("sidebar");
    setAdActive(true);
    setShowAdForm(false);
  };

  // --- Affiliate Actions ---
  const handleSaveAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliateName.trim() || !affiliateCode.trim()) return;

    // Guard: prevent duplicate code
    const duplicate = affiliatesList.some(
      (a) => a.code.toLowerCase() === affiliateCode.trim().toLowerCase() && a.id !== editingAffiliateId
    );
    if (duplicate) {
      alert("⚠️ Erro: Já existe um afiliado com este cupom/código de indicação!");
      return;
    }

    let updated: Affiliate[];
    if (editingAffiliateId) {
      updated = affiliatesList.map((a) =>
        a.id === editingAffiliateId
          ? {
              ...a,
              name: affiliateName,
              code: affiliateCode.trim().toUpperCase(),
              conversions: Number(affiliateConversions),
              balance: Number(affiliateBalance),
              active: affiliateActive,
            }
          : a
      );
    } else {
      const newAff: Affiliate = {
        id: `aff-${Date.now()}`,
        name: affiliateName,
        code: affiliateCode.trim().toUpperCase(),
        conversions: Number(affiliateConversions),
        balance: Number(affiliateBalance),
        active: affiliateActive,
      };
      updated = [...affiliatesList, newAff];
    }
    await saveAffiliatesList(updated);
  };

  const handleEditAffiliateClick = (a: Affiliate) => {
    setEditingAffiliateId(a.id);
    setAffiliateName(a.name);
    setAffiliateCode(a.code);
    setAffiliateConversions(a.conversions);
    setAffiliateBalance(a.balance);
    setAffiliateActive(a.active);
    setShowAffiliateForm(true);
  };

  const handleDeleteAffiliate = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este afiliado?")) return;
    const updated = affiliatesList.filter((a) => a.id !== id);
    await saveAffiliatesList(updated);
  };

  const handleToggleAffiliateActive = async (id: string, current: boolean) => {
    const updated = affiliatesList.map((a) => (a.id === id ? { ...a, active: !current } : a));
    await saveAffiliatesList(updated);
  };

  const resetAffiliateForm = () => {
    setEditingAffiliateId(null);
    setAffiliateName("");
    setAffiliateCode("");
    setAffiliateConversions(0);
    setAffiliateBalance(0);
    setAffiliateActive(true);
    setShowAffiliateForm(false);
  };

  // --- Filtering ---
  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0E0E0C] text-[#ECE8E1] font-sans relative overflow-hidden">
      {/* Editorial Decorative Noise Overlay is handled in globals.css */}
      
      {/* Top Banner / Breadcrumb */}
      <header className="border-b border-white/5 py-4 px-8 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#ECE8E1]/60 hover:text-accent font-mono transition-colors"
        >
          <IconArrowLeft /> Voltar para o Sebo
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-widest bg-accent/10 border border-accent/20 text-accent px-3 py-1 rounded-full">
          Modo Administrador
        </span>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
        
        {/* Editorial Heading */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl md:text-4xl font-light tracking-wide text-accent">
            Curadoria & Controle
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#ECE8E1]/50 font-mono">
            Painel Geral do Gargbooks • Gestão de Assinaturas, Destaques e Monetização
          </p>
          <div className="editorial-line mt-4"></div>
        </div>

        {/* Status Dashboard Row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#ECE8E1]/40">Leitoras Ativas</span>
            <strong className="text-2xl font-serif mt-2 font-normal text-accent">{usersList.length}</strong>
          </div>
          <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#ECE8E1]/40">Assinaturas Premium</span>
            <strong className="text-2xl font-serif mt-2 font-normal text-emerald-400">
              {usersList.filter((u) => u.is_premium).length}
            </strong>
          </div>
          <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#ECE8E1]/40">Banners no Topo</span>
            <strong className="text-2xl font-serif mt-2 font-normal text-accent">
              {bannersList.filter((b) => b.active).length} / {bannersList.length}
            </strong>
          </div>
          <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#ECE8E1]/40">Saldo de Afiliados</span>
            <strong className="text-2xl font-serif mt-2 font-normal text-accent">
              R$ {affiliatesList.reduce((sum, a) => sum + a.balance, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </section>

        {/* Tab Switcher */}
        <nav className="flex border-b border-white/5 gap-2 md:gap-4 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab("users")}
            className={`py-3 px-4 flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest transition-all duration-300 border-b-2 cursor-pointer ${
              activeTab === "users"
                ? "border-accent text-accent font-bold"
                : "border-transparent text-[#ECE8E1]/50 hover:text-[#ECE8E1]"
            }`}
          >
            <IconUsers /> Usuárias
          </button>
          <button
            onClick={() => setActiveTab("banners")}
            className={`py-3 px-4 flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest transition-all duration-300 border-b-2 cursor-pointer ${
              activeTab === "banners"
                ? "border-accent text-accent font-bold"
                : "border-transparent text-[#ECE8E1]/50 hover:text-[#ECE8E1]"
            }`}
          >
            <IconBanners /> Carrossel Banner
          </button>
          <button
            onClick={() => setActiveTab("ads")}
            className={`py-3 px-4 flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest transition-all duration-300 border-b-2 cursor-pointer ${
              activeTab === "ads"
                ? "border-accent text-accent font-bold"
                : "border-transparent text-[#ECE8E1]/50 hover:text-[#ECE8E1]"
            }`}
          >
            <IconAds /> Propagandas (Ads)
          </button>
          <button
            onClick={() => setActiveTab("affiliates")}
            className={`py-3 px-4 flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest transition-all duration-300 border-b-2 cursor-pointer ${
              activeTab === "affiliates"
                ? "border-accent text-accent font-bold"
                : "border-transparent text-[#ECE8E1]/50 hover:text-[#ECE8E1]"
            }`}
          >
            <IconAffiliates /> Afiliados
          </button>
        </nav>

        {/* Tab 1: Users */}
        {activeTab === "users" && (
          <div className="bg-[#121213]/40 border border-white/5 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-serif text-xl font-light text-accent">Controle de Assinaturas</h3>
                <p className="text-[10px] text-[#ECE8E1]/40 uppercase tracking-widest font-mono mt-1">
                  Ativação manual de status Premium e consulta de perfis
                </p>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome ou @username..."
                className="w-full sm:max-w-xs px-4 py-2 bg-[#121213] border border-white/10 focus:border-accent text-[#ECE8E1] rounded-full text-xs font-mono outline-none transition-colors"
              />
            </div>

            {loadingUsers ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <IconLoader />
                <span className="text-xs text-[#ECE8E1]/40 font-mono uppercase">Carregando usuárias...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16 text-[#ECE8E1]/40 font-mono text-xs italic">
                Nenhum usuário encontrado na busca.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-[#ECE8E1]/40">
                      <th className="pb-3">Usuária</th>
                      <th className="pb-3">Estilo Favorito</th>
                      <th className="pb-3">Idade Verificada</th>
                      <th className="pb-3">Status Assinatura</th>
                      <th className="pb-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[#ECE8E1]/85">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center font-serif text-accent text-sm">
                              {user.avatar_initial || user.name.charAt(0)}
                            </div>
                            <div>
                              <span className="block font-semibold text-[#ECE8E1]">{user.name}</span>
                              <span className="block text-[10px] text-[#ECE8E1]/45">@{user.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-[#ECE8E1]/60">
                          {user.favorite_style || "Não informado"}
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            user.age_verified 
                              ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400" 
                              : "bg-amber-500/10 border border-amber-500/25 text-amber-400"
                          }`}>
                            {user.age_verified ? "Verificada (+18)" : "Não verif."}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                            user.is_premium 
                              ? "bg-accent/10 border border-accent/30 text-accent" 
                              : "bg-white/5 border border-white/10 text-[#ECE8E1]/40"
                          }`}>
                            {user.is_premium ? "⭐ Premium VIP" : "Leitora Comum"}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleTogglePremium(user.id, user.is_premium)}
                            className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer border ${
                              user.is_premium
                                ? "bg-white/5 border-white/10 text-white hover:bg-[#C5A880]/15 hover:text-accent hover:border-accent"
                                : "bg-accent text-[#0E0E0C] border-accent hover:bg-white hover:border-white"
                            }`}
                          >
                            {user.is_premium ? "Remover Premium" : "Dar Premium"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Banners */}
        {activeTab === "banners" && (
          <div className="bg-[#121213]/40 border border-white/5 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-serif text-xl font-light text-accent">Slides do Carrossel</h3>
                <p className="text-[10px] text-[#ECE8E1]/40 uppercase tracking-widest font-mono mt-1">
                  Gerenciar anúncios e campanhas rotativas no topo do Sebo
                </p>
              </div>
              <button
                onClick={() => { resetBannerForm(); setShowBannerForm(true); }}
                className="py-2 px-5 bg-accent text-[#0E0E0C] hover:bg-[#ECE8E1] rounded-full text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
              >
                <IconPlus /> Novo Banner
              </button>
            </div>

            {/* Banner Form Panel */}
            {showBannerForm && (
              <form onSubmit={handleSaveBanner} className="p-6 bg-[#121213]/80 border border-white/10 rounded-2xl space-y-4">
                <h4 className="font-serif text-sm font-semibold text-accent">
                  {editingBannerId ? "Editar Banner" : "Cadastrar Novo Banner"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#ECE8E1]/40 font-mono">Título do Slide</label>
                    <input
                      type="text"
                      required
                      value={bannerTitle}
                      onChange={(e) => setBannerTitle(e.target.value)}
                      placeholder="Ex: Coleção Gótica Capa Dura"
                      className="w-full px-4 py-2 bg-[#0E0E0C] border border-white/10 focus:border-accent rounded-xl text-xs text-[#ECE8E1] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#ECE8E1]/40 font-mono">URL da Imagem</label>
                    <input
                      type="url"
                      required
                      value={bannerImageUrl}
                      onChange={(e) => setBannerImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2 bg-[#0E0E0C] border border-white/10 focus:border-accent rounded-xl text-xs text-[#ECE8E1] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#ECE8E1]/40 font-mono">Link de Ação</label>
                    <input
                      type="text"
                      value={bannerLink}
                      onChange={(e) => setBannerLink(e.target.value)}
                      placeholder="Ex: /livros ou rota externa"
                      className="w-full px-4 py-2 bg-[#0E0E0C] border border-white/10 focus:border-accent rounded-xl text-xs text-[#ECE8E1] outline-none font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-[#ECE8E1]/40 font-mono">Ordem de Exibição</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={bannerOrder}
                        onChange={(e) => setBannerOrder(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-[#0E0E0C] border border-white/10 focus:border-accent rounded-xl text-xs text-[#ECE8E1] outline-none font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="banner-active"
                        checked={bannerActive}
                        onChange={(e) => setBannerActive(e.target.checked)}
                        className="w-4 h-4 accent-accent bg-[#0E0E0C] border-white/10 rounded"
                      />
                      <label htmlFor="banner-active" className="text-xs text-[#ECE8E1]/80 cursor-pointer select-none font-mono">Ativo no Carrossel</label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetBannerForm}
                    className="py-1.5 px-4 border border-white/10 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-[#ECE8E1] hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-1.5 px-5 bg-accent text-[#0E0E0C] rounded-full text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-white transition-colors"
                  >
                    Salvar Slide
                  </button>
                </div>
              </form>
            )}

            {/* Banners Grid */}
            {loadingBanners ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <IconLoader />
                <span className="text-xs text-[#ECE8E1]/40 font-mono uppercase">Carregando banners...</span>
              </div>
            ) : bannersList.length === 0 ? (
              <div className="text-center py-16 text-[#ECE8E1]/40 font-mono text-xs italic">
                Nenhum banner cadastrado.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...bannersList].sort((a, b) => a.order - b.order).map((banner) => (
                  <div key={banner.id} className="bg-[#121213] border border-white/5 rounded-2xl overflow-hidden flex flex-col hover:border-white/10 transition-colors">
                    <div className="h-44 bg-zinc-900 relative overflow-hidden">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover opacity-80"
                        onError={(e: any) => {
                          e.target.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80";
                        }}
                      />
                      <span className={`absolute top-4 right-4 px-2.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest border ${
                        banner.active 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        {banner.active ? "Visível" : "Inativo"}
                      </span>
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between gap-4 font-mono">
                      <div>
                        <h4 className="text-xs font-bold text-[#ECE8E1] tracking-wide">{banner.title}</h4>
                        <p className="text-[10px] text-[#ECE8E1]/40 truncate mt-1">Link: {banner.link || "Sem link"}</p>
                        <p className="text-[10px] text-accent font-semibold mt-1">Ordem: #{banner.order}</p>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <button
                          onClick={() => handleToggleBannerActive(banner.id, banner.active)}
                          className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                            banner.active
                              ? "bg-white/5 border-white/10 text-white hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                              : "bg-accent/10 border-accent/20 text-accent hover:bg-accent hover:text-[#0E0E0C]"
                          }`}
                        >
                          {banner.active ? "Ocultar" : "Exibir"}
                        </button>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEditBannerClick(banner)}
                            className="p-2 border border-white/5 hover:border-accent rounded-lg bg-[#0E0E0C] text-[#ECE8E1] hover:text-accent transition-colors"
                          >
                            <IconEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="p-2 border border-white/5 hover:border-red-400 rounded-lg bg-[#0E0E0C] text-[#ECE8E1] hover:text-red-400 transition-colors"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Ads */}
        {activeTab === "ads" && (
          <div className="bg-[#121213]/40 border border-white/5 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-serif text-xl font-light text-accent">Anúncios & Patrocínios</h3>
                <p className="text-[10px] text-[#ECE8E1]/40 uppercase tracking-widest font-mono mt-1">
                  Espaços publicitários e banners de parceiros comerciais
                </p>
              </div>
              <button
                onClick={() => { resetAdForm(); setShowAdForm(true); }}
                className="py-2 px-5 bg-accent text-[#0E0E0C] hover:bg-[#ECE8E1] rounded-full text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
              >
                <IconPlus /> Novo Anúncio
              </button>
            </div>

            {/* Ad Form Panel */}
            {showAdForm && (
              <form onSubmit={handleSaveAd} className="p-6 bg-[#121213]/80 border border-white/10 rounded-2xl space-y-4">
                <h4 className="font-serif text-sm font-semibold text-accent">
                  {editingAdId ? "Editar Propaganda" : "Cadastrar Nova Propaganda"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#ECE8E1]/40 font-mono">Título da Campanha</label>
                    <input
                      type="text"
                      required
                      value={adTitle}
                      onChange={(e) => setAdTitle(e.target.value)}
                      placeholder="Ex: Patrocínio Clube dos Mistérios"
                      className="w-full px-4 py-2 bg-[#0E0E0C] border border-white/10 focus:border-accent rounded-xl text-xs text-[#ECE8E1] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#ECE8E1]/40 font-mono">URL da Imagem</label>
                    <input
                      type="url"
                      required
                      value={adImageUrl}
                      onChange={(e) => setAdImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2 bg-[#0E0E0C] border border-white/10 focus:border-accent rounded-xl text-xs text-[#ECE8E1] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#ECE8E1]/40 font-mono">Link de Destino</label>
                    <input
                      type="url"
                      required
                      value={adLink}
                      onChange={(e) => setAdLink(e.target.value)}
                      placeholder="https://parceiro.com"
                      className="w-full px-4 py-2 bg-[#0E0E0C] border border-white/10 focus:border-accent rounded-xl text-xs text-[#ECE8E1] outline-none font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-[#ECE8E1]/40 font-mono">Posicionamento</label>
                      <select
                        value={adLocation}
                        onChange={(e) => setAdLocation(e.target.value)}
                        className="w-full px-4 py-2 bg-[#0E0E0C] border border-white/10 focus:border-accent rounded-xl text-xs text-[#ECE8E1] outline-none font-mono"
                      >
                        <option value="sidebar">Barra Lateral (Sidebar)</option>
                        <option value="top">Topo da Página (Top)</option>
                        <option value="inline">No Conteúdo (Inline Feed)</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="ad-active"
                        checked={adActive}
                        onChange={(e) => setAdActive(e.target.checked)}
                        className="w-4 h-4 accent-accent bg-[#0E0E0C] border-white/10 rounded"
                      />
                      <label htmlFor="ad-active" className="text-xs text-[#ECE8E1]/80 cursor-pointer select-none font-mono">Ativo / Exibindo</label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetAdForm}
                    className="py-1.5 px-4 border border-white/10 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-[#ECE8E1] hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-1.5 px-5 bg-accent text-[#0E0E0C] rounded-full text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-white transition-colors"
                  >
                    Salvar Anúncio
                  </button>
                </div>
              </form>
            )}

            {/* Ads List */}
            {loadingAds ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <IconLoader />
                <span className="text-xs text-[#ECE8E1]/40 font-mono uppercase">Carregando anúncios...</span>
              </div>
            ) : adsList.length === 0 ? (
              <div className="text-center py-16 text-[#ECE8E1]/40 font-mono text-xs italic">
                Nenhum anúncio configurado.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {adsList.map((ad) => {
                  const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : "0.0";
                  const positionLabels: any = {
                    sidebar: "Barra Lateral",
                    top: "Topo do Site",
                    inline: "Feed / Conteúdo"
                  };
                  return (
                    <div key={ad.id} className="bg-[#121213] border border-white/5 rounded-2xl overflow-hidden flex flex-col hover:border-white/10 transition-colors">
                      <div className="h-32 bg-zinc-900 relative overflow-hidden">
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="w-full h-full object-cover opacity-75"
                          onError={(e: any) => {
                            e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80";
                          }}
                        />
                        <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest border ${
                          ad.active 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-[#ECE8E1]/10 border-white/10 text-[#ECE8E1]/40"
                        }`}>
                          {ad.active ? "Ativo" : "Pausado"}
                        </span>
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between gap-3 font-mono">
                        <div>
                          <h4 className="text-xs font-bold text-[#ECE8E1] truncate">{ad.title}</h4>
                          <span className="text-[8px] tracking-widest uppercase text-accent border border-accent/25 px-2 py-0.5 rounded bg-accent/5 mt-1 inline-block">
                            {positionLabels[ad.location] || ad.location}
                          </span>

                          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5 text-[9px]">
                            <div>
                              <span className="text-[#ECE8E1]/40 block">Visualiz.</span>
                              <strong className="text-sm font-serif font-light text-accent">{ad.impressions || 0}</strong>
                            </div>
                            <div>
                              <span className="text-[#ECE8E1]/40 block">Cliques</span>
                              <strong className="text-sm font-serif font-light text-accent">{ad.clicks || 0}</strong>
                            </div>
                            <div>
                              <span className="text-[#ECE8E1]/40 block">CTR</span>
                              <strong className="text-sm font-serif font-light text-emerald-400">{ctr}%</strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <button
                            onClick={() => handleToggleAdActive(ad.id, ad.active)}
                            className={`px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                              ad.active
                                ? "bg-white/5 border-white/10 text-white hover:bg-accent/15 hover:text-accent hover:border-accent"
                                : "bg-accent/10 border-accent/20 text-accent hover:bg-accent hover:text-[#0E0E0C]"
                            }`}
                          >
                            {ad.active ? "Pausar" : "Ativar"}
                          </button>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditAdClick(ad)}
                              className="p-1.5 border border-white/5 hover:border-accent rounded-lg bg-[#0E0E0C] text-[#ECE8E1] hover:text-accent transition-colors"
                            >
                              <IconEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteAd(ad.id)}
                              className="p-1.5 border border-white/5 hover:border-red-400 rounded-lg bg-[#0E0E0C] text-[#ECE8E1] hover:text-red-400 transition-colors"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Affiliates */}
        {activeTab === "affiliates" && (
          <div className="bg-[#121213]/40 border border-white/5 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-serif text-xl font-light text-accent">Afiliados & Indicações</h3>
                <p className="text-[10px] text-[#ECE8E1]/40 uppercase tracking-widest font-mono mt-1">
                  Gerenciamento de comissões, vendas e cupons de criadoras
                </p>
              </div>
              <button
                onClick={() => { resetAffiliateForm(); setShowAffiliateForm(true); }}
                className="py-2 px-5 bg-accent text-[#0E0E0C] hover:bg-[#ECE8E1] rounded-full text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
              >
                <IconPlus /> Novo Afiliado
              </button>
            </div>

            {/* Affiliate Form Panel */}
            {showAffiliateForm && (
              <form onSubmit={handleSaveAffiliate} className="p-6 bg-[#121213]/80 border border-white/10 rounded-2xl space-y-4">
                <h4 className="font-serif text-sm font-semibold text-accent">
                  {editingAffiliateId ? "Editar Cadastro de Afiliado" : "Cadastrar Novo Afiliado"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#ECE8E1]/40">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={affiliateName}
                      onChange={(e) => setAffiliateName(e.target.value)}
                      placeholder="Nome do parceiro comercial"
                      className="w-full px-4 py-2 bg-[#0E0E0C] border border-white/10 focus:border-accent rounded-xl text-xs text-[#ECE8E1] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#ECE8E1]/40">Cupom / Código</label>
                    <input
                      type="text"
                      required
                      value={affiliateCode}
                      onChange={(e) => setAffiliateCode(e.target.value)}
                      placeholder="Ex: CORTOLIVRO10"
                      className="w-full px-4 py-2 bg-[#0E0E0C] border border-white/10 focus:border-accent rounded-xl text-xs text-[#ECE8E1] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#ECE8E1]/40">Conversões</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={affiliateConversions}
                      onChange={(e) => setAffiliateConversions(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-[#0E0E0C] border border-white/10 focus:border-accent rounded-xl text-xs text-[#ECE8E1] outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-[#ECE8E1]/40">Saldo Comissões (R$)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={affiliateBalance}
                        onChange={(e) => setAffiliateBalance(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-[#0E0E0C] border border-white/10 focus:border-accent rounded-xl text-xs text-[#ECE8E1] outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="aff-active"
                        checked={affiliateActive}
                        onChange={(e) => setAffiliateActive(e.target.checked)}
                        className="w-4 h-4 accent-accent bg-[#0E0E0C] border-white/10 rounded"
                      />
                      <label htmlFor="aff-active" className="text-xs text-[#ECE8E1]/80 cursor-pointer select-none font-mono">Ativo</label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 font-mono">
                  <button
                    type="button"
                    onClick={resetAffiliateForm}
                    className="py-1.5 px-4 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#ECE8E1] hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-1.5 px-5 bg-accent text-[#0E0E0C] rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-white transition-colors"
                  >
                    Salvar Afiliado
                  </button>
                </div>
              </form>
            )}

            {/* Affiliates List */}
            {loadingAffiliates ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <IconLoader />
                <span className="text-xs text-[#ECE8E1]/40 font-mono uppercase">Carregando afiliados...</span>
              </div>
            ) : affiliatesList.length === 0 ? (
              <div className="text-center py-16 text-[#ECE8E1]/40 font-mono text-xs italic">
                Nenhum parceiro cadastrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-[#ECE8E1]/40">
                      <th className="pb-3">Parceiro</th>
                      <th className="pb-3">Cupom</th>
                      <th className="pb-3">Vendas / Conversões</th>
                      <th className="pb-3">Comissão Acumulada</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[#ECE8E1]/85">
                    {affiliatesList.map((aff) => (
                      <tr key={aff.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 font-semibold text-[#ECE8E1]">{aff.name}</td>
                        <td className="py-3.5">
                          <code className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-accent font-bold">
                            {aff.code}
                          </code>
                        </td>
                        <td className="py-3.5 text-[#ECE8E1]/60">{aff.conversions}</td>
                        <td className="py-3.5 font-semibold text-emerald-400">
                          R$ {Number(aff.balance).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5">
                          <button
                            onClick={() => handleToggleAffiliateActive(aff.id, aff.active)}
                            className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border cursor-pointer ${
                              aff.active
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-white/5 border-white/10 text-[#ECE8E1]/40 hover:bg-white/10"
                            }`}
                          >
                            {aff.active ? "Ativo" : "Suspenso"}
                          </button>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleEditAffiliateClick(aff)}
                              className="p-1.5 border border-white/5 hover:border-accent rounded-lg bg-[#0E0E0C] text-[#ECE8E1] hover:text-accent transition-colors"
                            >
                              <IconEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteAffiliate(aff.id)}
                              className="p-1.5 border border-white/5 hover:border-red-400 rounded-lg bg-[#0E0E0C] text-[#ECE8E1] hover:text-red-400 transition-colors"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="py-8 text-center text-[10px] text-[#ECE8E1]/40 tracking-wider font-mono border-t border-white/5 mt-12">
        <p className="font-light">© {new Date().getFullYear()} Gargbooks Curadoria Literária</p>
      </footer>
    </div>
  );
}
