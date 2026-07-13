import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

interface TranslateRequest {
  text: string;
  targetLang: string;
  sourceLang?: string;
  preserveMarkdown?: boolean;
}

interface TranslateResponse {
  translated: string;
  model: string;
  sourceLang: string;
  targetLang: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TranslateRequest;
    const { text, targetLang, sourceLang = "auto", preserveMarkdown = false } = body;

    if (!text || !text.trim()) {
      return Response.json(
        { error: "O texto para tradução é obrigatório." },
        { status: 400 }
      );
    }

    if (!targetLang) {
      return Response.json(
        { error: "O idioma de destino (targetLang) é obrigatório." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "sua_chave_aqui") {
      // Fallback: retorna o texto original se não houver chave configurada
      console.warn("GEMINI_API_KEY não configurada. Retornando texto original.");
      return Response.json({
        translated: text,
        model: "fallback",
        sourceLang,
        targetLang,
      } as TranslateResponse);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const languageNames: Record<string, string> = {
      "pt-br": "Português Brasileiro",
      "pt": "Português",
      "en": "Inglês",
      "es": "Espanhol",
      "fr": "Francês",
      "de": "Alemão",
      "it": "Italiano",
      "ja": "Japonês",
      "zh": "Chinês",
      "ru": "Russo",
      "ar": "Árabe",
      "ko": "Coreano",
      "nl": "Holandês",
      "pl": "Polonês",
      "sv": "Sueco",
      "tr": "Turco",
    };

    const targetName = languageNames[targetLang] || targetLang;
    const sourceInfo = sourceLang !== "auto"
      ? ` do ${languageNames[sourceLang] || sourceLang}`
      : "";

    const formatInstruction = preserveMarkdown
      ? "Preserve toda a formatação Markdown do texto original (negrito, itálico, títulos, etc)."
      : "Preserve parágrafos e quebras de linha, mas traduza naturalmente.";

    const prompt = `Você é um tradutor literário especializado em contos e narrativas curtas.
Traduza o texto abaixo${sourceInfo} para ${targetName}.
${formatInstruction}
Mantenha o tom literário, o estilo narrativo e as emoções do texto original.
Preserve nomes próprios, lugares e referências culturais sem traduzir.
Apenas traduza o texto — não adicione explicações, comentários ou notas.

TEXTO PARA TRADUÇÃO:
${text}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const translated = response.text();

    return Response.json({
      translated,
      model: "gemini-2.0-flash",
      sourceLang,
      targetLang,
    } as TranslateResponse);

  } catch (error) {
    console.error("Erro na tradução via Gemini:", error);
    return Response.json(
      { error: "Falha ao traduzir o texto. Tente novamente." },
      { status: 500 }
    );
  }
}
