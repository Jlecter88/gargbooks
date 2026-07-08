import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "users-mock.json");

export async function GET() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("Erro ao ler users-mock.json:", error);
    return NextResponse.json({ error: "Falha ao ler os dados do usuário." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const updatedUsers = await request.json();
    
    // Valida se os dados enviados são um array válido
    if (!Array.isArray(updatedUsers)) {
      return NextResponse.json({ error: "Dados inválidos. Esperava-se um array." }, { status: 400 });
    }

    await fs.writeFile(filePath, JSON.stringify(updatedUsers, null, 2), "utf-8");
    return NextResponse.json({ success: true, message: "Usuários atualizados com sucesso." });
  } catch (error) {
    console.error("Erro ao salvar users-mock.json:", error);
    return NextResponse.json({ error: "Falha ao salvar os dados do usuário." }, { status: 500 });
  }
}
