import { NextResponse } from "next/server";

function cleanGutenbergText(rawText: string): string {
  let cleanText = rawText;
  const startIdx = rawText.indexOf("*** START OF THE PROJECT GUTENBERG");
  const endIdx = rawText.indexOf("*** END OF THE PROJECT GUTENBERG");
  if (startIdx !== -1) {
    const startLineEnd = rawText.indexOf("\n", startIdx);
    cleanText = rawText.substring(startLineEnd !== -1 ? startLineEnd : startIdx);
  }
  if (endIdx !== -1) {
    cleanText = cleanText.substring(0, cleanText.indexOf("*** END OF THE PROJECT GUTENBERG"));
  }
  return cleanText.trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("ID do livro não fornecido.", { status: 400 });
  }

  const url = `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return new Response(`Erro ao buscar livro no Gutenberg (status ${response.status}).`, { status: response.status });
    }

    const rawText = await response.text();
    const cleanedText = cleanGutenbergText(rawText);

    return new Response(cleanedText, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400" // cache for 1 day
      }
    });
  } catch (error) {
    console.error(`Erro ao obter livro Gutenberg ID ${id}:`, error);
    return new Response("Erro interno do servidor ao carregar o livro.", { status: 500 });
  }
}
