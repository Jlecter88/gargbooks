export interface TextLoadProgress {
  percent: number;
  message: string;
}

export interface TextLoadResult {
  text: string;
  source: "chunks" | "file" | "fallback";
  totalChunks?: number;
}

async function chunkExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

async function discoverChunkCount(baseUrl: string): Promise<number> {
  const BATCH_SIZE = 50;
  let total = 0;

  while (true) {
    const batch = Array.from({ length: BATCH_SIZE }, (_, i) => i + total);
    const results = await Promise.all(
      batch.map((i) => chunkExists(`${baseUrl}.chunk.${i}.txt`))
    );

    const found = results.filter(Boolean).length;
    total += found;
    if (found < BATCH_SIZE) break;
  }

  return total;
}

async function loadFromChunks(
  baseUrl: string,
  onProgress?: (p: TextLoadProgress) => void
): Promise<TextLoadResult> {
  onProgress?.({ percent: 5, message: "Identificando partes do texto..." });

  const totalChunks = await discoverChunkCount(baseUrl);

  onProgress?.({ percent: 10, message: `Baixando ${totalChunks} partes...` });

  let completed = 0;
  const chunkTexts = await Promise.all(
    Array.from({ length: totalChunks }, (_, i) =>
      fetch(`${baseUrl}.chunk.${i}.txt`)
        .then((r) => {
          if (!r.ok) throw new Error(`Falha ao baixar parte ${i}`);
          return r.text();
        })
        .then((text) => {
          completed++;
          const pct = Math.round((completed / totalChunks) * 90) + 10;
          onProgress?.({
            percent: pct,
            message: `Carregando texto completo... (${Math.round((completed / totalChunks) * 100)}%)`,
          });
          return text;
        })
    )
  );

  return { text: chunkTexts.join(""), source: "chunks", totalChunks };
}

async function loadSingleFile(
  baseUrl: string,
  fallbackText?: string,
  onProgress?: (p: TextLoadProgress) => void
): Promise<TextLoadResult> {
  onProgress?.({ percent: 40, message: "Carregando arquivo completo..." });

  try {
    const response = await fetch(`${baseUrl}.txt`);
    if (response.ok) {
      const text = await response.text();
      if (text && text.trim().length > 100) {
        onProgress?.({ percent: 100, message: "Texto carregado!" });
        return { text, source: "file" };
      }
    }
  } catch {
    // fall through to fallback
  }

  if (fallbackText) {
    onProgress?.({ percent: 100, message: "Texto carregado (fallback)!" });
    return { text: fallbackText, source: "fallback" };
  }

  throw new Error("Não foi possível carregar o texto da obra.");
}

export async function loadBookText(
  downloadFile: string,
  fallbackText?: string,
  onProgress?: (p: TextLoadProgress) => void
): Promise<TextLoadResult> {
  const baseUrl = downloadFile.replace(/\.txt$/, "");

  onProgress?.({ percent: 0, message: "Verificando disponibilidade do texto..." });

  const hasChunks = await chunkExists(`${baseUrl}.chunk.0.txt`);

  if (hasChunks) {
    try {
      return await loadFromChunks(baseUrl, onProgress);
    } catch (err) {
      console.warn("Falha ao carregar chunks, tentando arquivo único:", err);
    }
  }

  return loadSingleFile(baseUrl, fallbackText, onProgress);
}
