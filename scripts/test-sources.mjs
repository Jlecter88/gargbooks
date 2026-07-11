const tests = [
  { title: "Memorial de Aires", author: "Machado de Assis" },
  { title: "Ressurreição", author: "Machado de Assis" },
  { title: "A Moreninha", author: "Joaquim Manuel de Macedo" },
  { title: "Marília de Dirceu", author: "Tomás Antônio Gonzaga" },
  { title: "O Ateneu", author: "Raul Pompeia" },
  { title: "Noite na Taverna", author: "Álvares de Azevedo" },
  { title: "Macário", author: "Álvares de Azevedo" },
  { title: "Casa de Pensão", author: "Aluísio Azevedo" },
];

async function tryInternetArchive(title) {
  const q = '("' + encodeURIComponent(title) + '") AND (texts OR ebook) AND language:por';
  try {
    const url = "https://archive.org/advancedsearch.php?q=" + encodeURIComponent(q) + "&fl[]=identifier&fl[]=title&rows=3&output=json";
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) return null;
    const data = await r.json();
    const docs = data.response?.docs || [];
    if (docs.length === 0) return null;
    return docs.map(d => d.identifier + " (" + (d.title || "").substring(0, 40) + ")").join(", ");
  } catch { return null; }
}

async function tryProjectGutenbergDirect(title) {
  try {
    const q = encodeURIComponent(title.split(" ").slice(0, 3).join(" "));
    const r = await fetch("https://gutendex.com/books/?search=" + q, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const data = await r.json();
    if (!data.results?.length) return null;
    const found = data.results.map(b => "#" + b.id + " [" + (b.languages || []).join(",") + "]").join(", ");
    return found;
  } catch { return null; }
}

for (const t of tests) {
  process.stdout.write(t.title.padEnd(35));
  const gut = await tryProjectGutenbergDirect(t.title);
  if (gut) { process.stdout.write("GUT: " + gut + "\n"); continue; }
  const ia = await tryInternetArchive(t.title);
  if (ia) { process.stdout.write("IA: " + ia + "\n"); continue; }
  process.stdout.write("NENHUMA FONTE\n");
}
