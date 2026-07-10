import { NextResponse } from "next/server";

function cleanDominioPublicoText(rawText: string): string {
  const lines = rawText.split("\n");
  let startIdx = 0;
  let endIdx = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim().toLowerCase();
    if (
      trimmed.includes("domínio público") ||
      trimmed.includes("ministerio da educacao") ||
      trimmed.includes("ministerio da educação") ||
      trimmed.includes("fundação biblioteca nacional") ||
      trimmed.includes("fundacao biblioteca nacional") ||
      trimmed.includes("====") ||
      trimmed.includes("---") && trimmed.length < 20
    ) {
      const nextNonEmpty = lines.slice(i + 1).findIndex(l => l.trim().length > 0);
      if (nextNonEmpty !== -1 && nextNonEmpty < 5) {
        startIdx = i + nextNonEmpty + 1;
        break;
      }
    }
  }

  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim().toLowerCase();
    if (
      trimmed.includes("====") ||
      trimmed.includes("este texto foi digitalizado") ||
      trimmed.includes("obtido em") ||
      trimmed.includes("domínio público") ||
      trimmed.includes("formato") && trimmed.includes("texto") ||
      trimmed.includes("http://www.dominiopublico.gov.br")
    ) {
      endIdx = i;
    }
  }

  return lines.slice(startIdx, endIdx).join("\n").trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID da obra não fornecido." }, { status: 400 });
  }

  const url = `http://www.dominiopublico.gov.br/download/texto/${id}.txt`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro ao buscar obra no Domínio Público (status ${response.status}).` },
        { status: response.status }
      );
    }

    const rawText = await response.text();
    const cleanedText = cleanDominioPublicoText(rawText);

    return new NextResponse(cleanedText, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400"
      }
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Tempo limite excedido ao conectar ao Domínio Público." },
        { status: 504 }
      );
    }
    console.error(`Erro ao obter obra Domínio Público ID ${id}:`, error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao carregar a obra." },
      { status: 500 }
    );
  }
}
