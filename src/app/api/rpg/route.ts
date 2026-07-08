import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "rpg-mock.json");

export async function GET() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("Erro ao ler rpg-mock.json:", error);
    return NextResponse.json({ error: "Falha ao ler as mesas de RPG." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const updatedTables = await request.json();
    
    if (!Array.isArray(updatedTables)) {
      return NextResponse.json({ error: "Dados inválidos. Esperava-se um array." }, { status: 400 });
    }

    await fs.writeFile(filePath, JSON.stringify(updatedTables, null, 2), "utf-8");
    return NextResponse.json({ success: true, message: "Mesas de RPG atualizadas com sucesso." });
  } catch (error) {
    console.error("Erro ao salvar rpg-mock.json:", error);
    return NextResponse.json({ error: "Falha ao salvar as mesas de RPG." }, { status: 500 });
  }
}
