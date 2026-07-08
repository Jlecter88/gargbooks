"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBooks } from "@/context/BookContext";
import Header from "@/components/Header";
import { useUserSession } from "@/context/UserContext";
import { compressImage, CompressionResult } from "@/utils/imageCompressor";

const GRADIENT_PRESETS = [
  { name: "Sombra Gótica", value: "from-stone-900 via-red-950 to-neutral-900" },
  { name: "Floresta Épica", value: "from-emerald-950 via-teal-900 to-zinc-950" },
  { name: "Âmbar Realista", value: "from-amber-950 via-stone-900 to-zinc-950" },
  { name: "Neon Cyberpunk", value: "from-cyan-950 via-zinc-900 to-emerald-950" },
  { name: "Fogo Criativo", value: "from-orange-950 via-amber-900 to-stone-950" },
];

const GENRE_OPTIONS = [
  "Terror Gótico",
  "Clássicos",
  "Fantasia",
  "Épico",
  "Realismo",
  "Ficção Científica",
  "Cyberpunk",
  "Adulto +18",
];

export default function PublicarLivro() {
  const router = useRouter();
  const { addBook } = useBooks();
  const { currentUser } = useUserSession();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [synopsis, setSynopsis] = useState("");
  const [fullText, setFullText] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0].value);
  const [coverImage, setCoverImage] = useState<string>("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const [publishWithRealPhoto, setPublishWithRealPhoto] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setTimeout(() => {
        setAuthor(currentUser.name);
      }, 0);
    }
  }, [currentUser]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("O arquivo de imagem deve ter no máximo 10MB.");
      return;
    }

    setIsCompressing(true);
    setError("");
    setCompressionInfo(null);

    try {
      const result = await compressImage(file, 800, 1000, 0.7);
      setCoverImage(result.base64);
      setCompressionInfo(result);
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Erro ao compactar a imagem.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !synopsis || !fullText) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    if (selectedGenres.length === 0) {
      setError("Por favor, selecione pelo menos um gênero.");
      return;
    }

    const isAdult = selectedGenres.includes("Adulto +18");

    addBook({
      title,
      author: isAdult && !publishWithRealPhoto ? "Autor Anônimo" : author,
      authorId: currentUser?.id,
      year: Number(year),
      genres: selectedGenres,
      coverGradient: selectedGradient,
      coverImage: coverImage || undefined,
      synopsis,
      fullText,
      editions: [], // User-published works don't have physical editions initially
      type: "conto", // User-published originals are short stories
      publishWithRealPhoto: isAdult ? publishWithRealPhoto : undefined,
    });

    setSuccess(true);
    setError("");

    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-stone-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-[1px] w-6 bg-accent"></span>
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            Escritório do Autor
          </span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-8">
          Publicar Obra
        </h1>

        {success ? (
          <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 p-8 rounded-3xl text-center max-w-xl mx-auto my-12 animate-fade-in">
            <span className="text-4xl block mb-4">🎉</span>
            <h3 className="font-serif text-xl font-bold mb-2">Obra publicada com sucesso!</h3>
            <p className="text-xs text-emerald-400/80">
              Sua obra foi adicionada à Estante Virtual. Redirecionando...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Live Preview on Left */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <h3 className="font-mono text-xs text-stone-500 uppercase tracking-widest">
                Pré-visualização da Capa
              </h3>
              <div
                className={`w-full aspect-[2/3] rounded-3xl bg-gradient-to-tr ${selectedGradient} p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-white/10`}
                style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
              >
                {/* Spiral decorative watermark */}
                <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
                  <svg viewBox="0 0 100 100" className="w-full h-full stroke-white fill-none stroke-[1]">
                    <path d="M50,50 A0.5,0.5 0 0,1 50,50.1 A1,1 0 0,1 49,49 A2,2 0 0,1 51,47 A4,4 0 0,1 55,51 A8,8 0 0,1 47,59 A16,16 0 0,1 31,43 A32,32 0 0,1 63,11 A64,64 0 0,1 -1,75" />
                  </svg>
                </div>
                <div className="flex justify-between items-start z-10">
                  <span className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider bg-black/45 border border-white/10 text-stone-200 rounded-full">
                    Conto Novo
                  </span>
                  <span className="font-mono text-xs text-accent font-bold">★ 5.0</span>
                </div>
                <div className="z-10 mt-auto">
                  <h3 className="font-serif text-2xl font-bold text-white leading-tight mb-1">
                    {title || "Título da Obra"}
                  </h3>
                  <p className="text-xs text-white/80 font-medium font-sans">
                    {author || "Nome do Autor"}
                  </p>
                </div>
              </div>
            </div>

            {/* Publishing Form on Right */}
            <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-200 rounded-2xl text-xs font-medium">
                  ⚠️ {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title input */}
                <div>
                  <label className="block text-xs font-mono text-stone-400 uppercase tracking-wider mb-2">
                    Título da Obra *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: O Corvo"
                    className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-2xl text-sm focus:border-accent outline-none transition-all"
                  />
                </div>

                {/* Author input */}
                <div>
                  <label className="block text-xs font-mono text-stone-400 uppercase tracking-wider mb-2">
                    Autor / Pseudônimo *
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Ex: Edgar Allan Poe"
                    className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-2xl text-sm focus:border-accent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Year Input */}
                <div>
                  <label className="block text-xs font-mono text-stone-400 uppercase tracking-wider mb-2">
                    Ano de Criação
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-2xl text-sm focus:border-accent outline-none transition-all"
                  />
                </div>

                {/* Cover Gradient Presets */}
                <div>
                  <label className="block text-xs font-mono text-stone-400 uppercase tracking-wider mb-2">
                    Fundo da Capa (Gradiente Padrão)
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {GRADIENT_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setSelectedGradient(preset.value)}
                        className={`w-8 h-8 rounded-full bg-gradient-to-tr ${preset.value} border-2 transition-all ${
                          selectedGradient === preset.value
                            ? "border-accent scale-110 shadow-lg shadow-accent/20"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-4">
                {/* File Upload for Cover Image */}
                <div>
                  <label className="block text-xs font-mono text-stone-400 uppercase tracking-wider mb-2">
                    Imagem de Capa Personalizada (Até 10MB)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-xs text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-mono file:font-bold file:uppercase file:bg-white/5 file:text-stone-300 file:cursor-pointer hover:file:bg-white/10 file:transition-all"
                  />
                  {isCompressing && (
                    <p className="text-[10px] font-mono text-accent animate-pulse mt-1.5">
                      🌀 Compactando e otimizando imagem de capa...
                    </p>
                  )}
                  {compressionInfo && (
                    <p className="text-[10px] font-mono text-emerald-400 mt-1.5 bg-emerald-950/20 border border-emerald-500/20 p-2 rounded-xl">
                      ✓ Redução de {(compressionInfo.sizeOriginal / 1024 / 1024).toFixed(2)}MB para {(compressionInfo.sizeCompressed / 1024).toFixed(0)}KB (-{compressionInfo.ratio}%)
                    </p>
                  )}
                </div>

                {/* +18 Privacy Toggle Option */}
                {selectedGenres.includes("Adulto +18") && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-mono text-stone-400 uppercase tracking-wider mb-2">
                      Privacidade do Autor (+18)
                    </label>
                    <div className="flex gap-4 items-center h-[42px]">
                      <button
                        type="button"
                        onClick={() => setPublishWithRealPhoto(true)}
                        className={`flex-1 py-2 px-3 text-[10px] font-mono font-bold uppercase rounded-xl border transition-all ${
                          publishWithRealPhoto
                            ? "bg-accent/20 border-accent text-accent"
                            : "bg-neutral-900 border-white/10 text-stone-500 hover:border-white/20"
                        }`}
                      >
                        Identidade Real
                      </button>
                      <button
                        type="button"
                        onClick={() => setPublishWithRealPhoto(false)}
                        className={`flex-1 py-2 px-3 text-[10px] font-mono font-bold uppercase rounded-xl border transition-all ${
                          !publishWithRealPhoto
                            ? "bg-red-950/20 border-red-500/30 text-red-400"
                            : "bg-neutral-900 border-white/10 text-stone-500 hover:border-white/20"
                        }`}
                      >
                        Anonimizar Foto/Nome
                      </button>
                    </div>
                    <p className="text-[9px] font-sans text-stone-550 leading-tight mt-1.5">
                      {publishWithRealPhoto
                        ? "Sua foto de perfil e nome real serão exibidos na capa e leitura deste conto."
                        : "O conto será publicado sob a alcunha de 'Autor Anônimo' e usará um avatar mascarado genérico."}
                    </p>
                  </div>
                )}
              </div>

              {/* Genre Checkboxes */}
              <div>
                <label className="block text-xs font-mono text-stone-400 uppercase tracking-wider mb-2">
                  Gêneros Literários *
                </label>
                <div className="flex gap-2 flex-wrap">
                  {GENRE_OPTIONS.map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleGenreToggle(genre)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                          isSelected
                            ? "bg-accent/20 border-accent text-accent"
                            : "bg-neutral-900 border-white/10 text-stone-400 hover:border-white/20"
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Synopsis Input */}
              <div>
                <label className="block text-xs font-mono text-stone-400 uppercase tracking-wider mb-2">
                  Sinopse / Resumo *
                </label>
                <textarea
                  required
                  rows={3}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Escreva uma breve sinopse para capturar a atenção dos leitores..."
                  className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-2xl text-sm focus:border-accent outline-none transition-all resize-none"
                />
              </div>

              {/* Full Text Editor Simulation */}
              <div>
                <label className="block text-xs font-mono text-stone-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                  <span>Corpo do Texto / Capítulos *</span>
                  <span className="text-[10px] text-stone-500 font-sans normal-case">
                    Suporta formatação simples em texto corrido
                  </span>
                </label>
                <textarea
                  required
                  rows={8}
                  value={fullText}
                  onChange={(e) => setFullText(e.target.value)}
                  placeholder="Comece a digitar seu conto ou o primeiro capítulo do seu livro aqui..."
                  className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-2xl text-sm font-sans focus:border-accent outline-none transition-all resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4 border-t border-white/5 justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="px-6 py-3 bg-neutral-900 border border-white/10 text-stone-300 rounded-full hover:bg-neutral-800 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-accent text-white rounded-full hover:bg-accent-hover text-xs font-semibold transition-all active:scale-95 shadow-lg shadow-accent/20"
                >
                  Publicar Obra ↗
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
