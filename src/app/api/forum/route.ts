import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "forum-mock.json");

export async function GET() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("Erro ao ler forum-mock.json:", error);
    return NextResponse.json({ error: "Falha ao ler os dados do fórum." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const updatedComments = await request.json();
    
    if (!Array.isArray(updatedComments)) {
      return NextResponse.json({ error: "Dados inválidos. Esperava-se um array." }, { status: 400 });
    }

    await fs.writeFile(filePath, JSON.stringify(updatedComments, null, 2), "utf-8");
    return NextResponse.json({ success: true, message: "Fórum atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao salvar forum-mock.json:", error);
    return NextResponse.json({ error: "Falha ao salvar os dados do fórum." }, { status: 500 });
  }
}
