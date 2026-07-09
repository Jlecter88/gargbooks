import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "ads-mock.json");

export async function GET() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("Erro ao ler ads-mock.json:", error);
    return NextResponse.json({ error: "Falha ao ler os dados das propagandas." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const updatedAds = await request.json();
    
    if (!Array.isArray(updatedAds)) {
      return NextResponse.json({ error: "Dados inválidos. Esperava-se um array." }, { status: 400 });
    }

    await fs.writeFile(filePath, JSON.stringify(updatedAds, null, 2), "utf-8");
    return NextResponse.json({ success: true, message: "Propagandas atualizadas com sucesso." });
  } catch (error) {
    console.error("Erro ao salvar ads-mock.json:", error);
    return NextResponse.json({ error: "Falha ao salvar os dados das propagandas." }, { status: 500 });
  }
}
