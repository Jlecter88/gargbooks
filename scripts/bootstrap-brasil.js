/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

// ============================================================================
// CONSTANTES
// ============================================================================

const DOWNLOADS_DIR = path.join(__dirname, "..", "public", "downloads");
const MOCK_PATH = path.join(__dirname, "..", "src", "data", "livros-mock.json");
const PROGRESS_PATH = path.join(__dirname, "progress.json");

const DP_URL_TEMPLATE = "http://www.dominiopublico.gov.br/download/texto/{id}.txt";

const DOMINIO_PUBLICO_WORKS = [
  { id: "bn000067", title: "Dom Casmurro",                    author: "Machado de Assis",      year: 1899, genres: ["Romance", "Realismo"] },
  { id: "bn000068", title: "Memórias Póstumas de Brás Cubas", author: "Machado de Assis",      year: 1881, genres: ["Romance", "Realismo"] },
  { id: "bn000069", title: "Quincas Borba",                   author: "Machado de Assis",      year: 1891, genres: ["Romance", "Realismo"] },
  { id: "bn000070", title: "O Alienista",                     author: "Machado de Assis",      year: 1882, genres: ["Conto", "Realismo"] },
  { id: "bn000082", title: "Helena",                          author: "Machado de Assis",      year: 1876, genres: ["Romance", "Realismo"] },
  { id: "bn000083", title: "Iaiá Garcia",                     author: "Machado de Assis",      year: 1878, genres: ["Romance", "Realismo"] },
  { id: "bn000084", title: "Esaú e Jacó",                     author: "Machado de Assis",      year: 1904, genres: ["Romance", "Realismo"] },
  { id: "bn000085", title: "Memorial de Aires",               author: "Machado de Assis",      year: 1908, genres: ["Romance", "Realismo"] },
  { id: "bn000086", title: "Ressurreição",                    author: "Machado de Assis",      year: 1872, genres: ["Romance", "Romantismo"] },
  { id: "bn000087", title: "A Mão e a Luva",                  author: "Machado de Assis",      year: 1874, genres: ["Romance", "Romantismo"] },
  { id: "bn000088", title: "Várias Histórias",                author: "Machado de Assis",      year: 1896, genres: ["Conto", "Realismo"] },
  { id: "bn000089", title: "Páginas Recolhidas",              author: "Machado de Assis",      year: 1899, genres: ["Conto", "Realismo"] },
  { id: "bn000090", title: "Relíquias de Casa Velha",         author: "Machado de Assis",      year: 1906, genres: ["Conto", "Realismo"] },
  { id: "bn000071", title: "Iracema",                         author: "José de Alencar",       year: 1865, genres: ["Romance", "Indianismo"] },
  { id: "bn000072", title: "O Guarani",                       author: "José de Alencar",       year: 1857, genres: ["Romance", "Indianismo"] },
  { id: "bn000073", title: "Senhora",                         author: "José de Alencar",       year: 1875, genres: ["Romance"] },
  { id: "bn000078", title: "Lucíola",                         author: "José de Alencar",       year: 1862, genres: ["Romance", "Romantismo"] },
  { id: "bn000079", title: "Diva",                            author: "José de Alencar",       year: 1864, genres: ["Romance", "Romantismo"] },
  { id: "bn000080", title: "Til",                             author: "José de Alencar",       year: 1872, genres: ["Romance", "Regionalismo"] },
  { id: "bn000081", title: "O Sertanejo",                     author: "José de Alencar",       year: 1875, genres: ["Romance", "Regionalismo"] },
  { id: "bn000091", title: "Ubirajara",                       author: "José de Alencar",       year: 1874, genres: ["Romance", "Indianismo"] },
  { id: "bn000092", title: "As Minas de Prata",               author: "José de Alencar",       year: 1865, genres: ["Romance", "Histórico"] },
  { id: "bn000093", title: "Sonhos D'Ouro",                   author: "José de Alencar",       year: 1872, genres: ["Romance", "Romantismo"] },
  { id: "bn000094", title: "Encarnação",                      author: "José de Alencar",       year: 1877, genres: ["Romance", "Romantismo"] },
  { id: "bn000074", title: "O Cortiço",                       author: "Aluísio Azevedo",       year: 1890, genres: ["Romance", "Naturalismo"] },
  { id: "bn000095", title: "O Mulato",                        author: "Aluísio Azevedo",       year: 1881, genres: ["Romance", "Naturalismo"] },
  { id: "bn000096", title: "Casa de Pensão",                  author: "Aluísio Azevedo",       year: 1884, genres: ["Romance", "Naturalismo"] },
  { id: "bn000097", title: "O Livro de uma Sogra",            author: "Aluísio Azevedo",       year: 1895, genres: ["Romance", "Humor"] },
  { id: "bn000075", title: "O Navio Negreiro",                author: "Castro Alves",          year: 1880, genres: ["Poesia", "Abolicionista"] },
  { id: "bn000098", title: "Espumas Flutuantes",              author: "Castro Alves",          year: 1870, genres: ["Poesia", "Romantismo"] },
  { id: "bn000099", title: "Hinos do Equador",                author: "Castro Alves",          year: 1875, genres: ["Poesia", "Abolicionista"] },
  { id: "bn000100", title: "Gonzaga ou a Revolução de Minas", author: "Castro Alves",          year: 1875, genres: ["Poesia", "Histórico"] },
  { id: "bn000076", title: "Noite na Taverna",                author: "Álvares de Azevedo",    year: 1855, genres: ["Conto", "Romantismo Gótico"] },
  { id: "bn000101", title: "Lira dos Vinte Anos",             author: "Álvares de Azevedo",    year: 1853, genres: ["Poesia", "Romantismo"] },
  { id: "bn000102", title: "Macário",                         author: "Álvares de Azevedo",    year: 1855, genres: ["Drama", "Romantismo"] },
  { id: "bn000077", title: "A Moreninha",                     author: "Joaquim Manuel de Macedo", year: 1844, genres: ["Romance", "Romantismo"] },
  { id: "bn000103", title: "O Moço Loiro",                    author: "Joaquim Manuel de Macedo", year: 1845, genres: ["Romance", "Romantismo"] },
  { id: "bn000104", title: "Os Dois Amores",                  author: "Joaquim Manuel de Macedo", year: 1848, genres: ["Romance", "Romantismo"] },
  { id: "bn000105", title: "Marília de Dirceu",               author: "Tomás Antônio Gonzaga",  year: 1792, genres: ["Poesia", "Arcadismo"] },
  { id: "bn000106", title: "Cartas Chilenas",                 author: "Tomás Antônio Gonzaga",  year: 1789, genres: ["Poesia", "Sátira"] },
  { id: "bn000107", title: "O Uruguay",                       author: "Basílio da Gama",        year: 1769, genres: ["Poesia", "Épico"] },
  { id: "bn000108", title: "Caramuru",                        author: "Frei José de Santa Rita Durão", year: 1781, genres: ["Poesia", "Épico"] },
  { id: "bn000109", title: "I-Juca-Pirama",                   author: "Gonçalves Dias",         year: 1851, genres: ["Poesia", "Indianismo"] },
  { id: "bn000110", title: "Os Timbiras",                     author: "Gonçalves Dias",         year: 1857, genres: ["Poesia", "Épico"] },
  { id: "bn000111", title: "Primeiros Cantos",                author: "Gonçalves Dias",         year: 1846, genres: ["Poesia", "Romantismo"] },
  { id: "bn000112", title: "As Primaveras",                   author: "Casimiro de Abreu",      year: 1859, genres: ["Poesia", "Romantismo"] },
  { id: "bn000113", title: "Suspiros Poéticos e Saudades",    author: "Gonçalves de Magalhães", year: 1836, genres: ["Poesia", "Romantismo"] },
  { id: "bn000114", title: "A Confederação dos Tamoios",      author: "Gonçalves de Magalhães", year: 1856, genres: ["Poesia", "Épico"] },
  { id: "bn000115", title: "A Escrava Isaura",                author: "Bernardo Guimarães",     year: 1875, genres: ["Romance", "Romantismo"] },
  { id: "bn000116", title: "O Seminarista",                   author: "Bernardo Guimarães",     year: 1872, genres: ["Romance", "Romantismo"] },
  { id: "bn000117", title: "Inocência",                       author: "Visconde de Taunay",     year: 1872, genres: ["Romance", "Regionalismo"] },
  { id: "bn000118", title: "O Ateneu",                        author: "Raul Pompeia",           year: 1888, genres: ["Romance", "Realismo"] },
  { id: "bn000119", title: "Canções Sem Palavras",            author: "Raul Pompeia",           year: 1881, genres: ["Conto", "Realismo"] },
];

const GRADIENTS = [
  "from-stone-900 via-red-950 to-neutral-900",
  "from-emerald-950 via-teal-900 to-zinc-950",
  "from-amber-950 via-stone-900 to-zinc-950",
  "from-cyan-950 via-zinc-900 to-emerald-950",
  "from-orange-950 via-amber-900 to-stone-950",
];

const SYNOPSES = {
  "dom-casmurro": "Bentinho e Capitu vivem um dos maiores mistérios da literatura brasileira: teria ou não havido traição? Um romance de ciúme, dúvida e memória seleta.",
  "memorias-postumas-de-bras-cubas": "Um defunto autor narra suas memórias com ironia mordaz, pessimismo filosófico e uma crítica implacável à sociedade carioca do século XIX.",
  "quincas-borba": "O filósofo Quincas Borba e seu cachorro homônimo conduzem uma sátira brilhante sobre o positivismo e a ganância na corte imperial.",
  "o-alienista": "O dr. Simão Bacamarte funda um manicômio em Itaguaí e acaba questionando a própria sanidade ao diagnosticar toda a cidade como louca.",
  "helena": "Um amor proibido e um segredo de família se entrelaçam nesta história de lealdade, sacrifício e convenções sociais do Rio oitocentista.",
  "iaia-garcia": "Os conflitos amorosos e sociais de Iaiá Garcia revelam as sutilezas psicológicas e as amarras do casamento na sociedade imperial.",
  "esau-e-jaco": "Os gêmeos Pedro e Paulo são opostos em tudo — política, amor e visão de mundo — numa alegoria do Brasil dividido entre monarquia e república.",
  "memorial-de-aires": "O conselheiro Aires registra em seu diário as observações sobre a vida, o amor e a velhice na corte carioca com elegância e melancolia.",
  "ressurreicao": "Primeiro romance de Machado de Assis, narra a história de amor atormentada de Félix e Lívia, marcada pelo ciúme e pela indecisão.",
  "a-mao-e-a-luva": "Guiomar precisa escolher entre três pretendentes, cada um representando um caminho diferente para o amor e a ambição feminina.",
  "varias-historias": "Coletânea de contos machadianos que inclui clássicos como 'A Igreja do Diabo' e 'O Segredo do Bonzo', com ironia e profundidade.",
  "paginas-recolhidas": "Reunião de contos e crônicas que revelam a versatilidade de Machado, do humor ao trágico, com a maestria de sempre.",
  "reliquias-de-casa-velha": "Última coletânea de contos publicada em vida por Machado, com narrativas que dialogam com a memória e o tempo.",
  "iracema": "A virgem dos lábios de mel, Iracema, se apaixona pelo português Martim, simbolizando o mito de fundação do Ceará entre o amor e a guerra.",
  "o-guarani": "Peri, o índio guarani, protege a família de D. Antônio de Mariz e se apaixona por Cecília, numa epopeia de amor e honra.",
  "senhora": "Aurélia Camargo compra o marido Fernando Seixas num casamento por interesse que se transforma numa crítica à mercantilização das relações.",
  "luciola": "Lúcia, uma cortesã de luxo, vive um amor arrebatador com Paulo, num romance que explora os limites entre o desejo e a sociedade hipócrita.",
  "diva": "A volúvel e encantadora Emília é a diva que atormenta o coração de seu primo Afonso, num jogo de sedução e independência feminina.",
  "til": "A ingênua Berta, conhecida como Til, vive no interior paulista cercada por segredos do passado e amores não correspondidos.",
  "o-sertanejo": "O sertanejo Arnaldo luta pelo amor de Flor e pela justiça no sertão cearense, numa narrativa de aventura e paixão.",
  "ubirajara": "Romance indianista que narra a jornada do guerreiro Ubirajara em busca de glória e amor entre as tribos brasileiras pré-coloniais.",
  "as-minas-de-prata": "Aventura histórica sobre a busca por riquezas na Bahia do século XVII, com conspirações, duelos e romances.",
  "sonhos-d-ouro": "Ricardo e Guiomar vivem um romance em meio à alta sociedade fluminense, onde o amor é posto à prova pelo orgulho e pela ambição.",
  "encarnacao": "Romance póstumo de Alencar que explora o amor para além da morte, numa trama de reencarnação e paixão espiritual.",
  "o-cortico": "A vida misera e vibrante de um cortiço carioca é o palco da luta pela sobrevivência, onde o ser humano é produto do meio.",
  "o-mulato": "Primeiro romance naturalista brasileiro, denuncia o preconceito racial na história do mulato Raimundo que se apaixona por Ana Rosa.",
  "casa-de-pensao": "O maranhense Amâncio deixa São Luís e se perde nos vícios e dívidas de uma pensão no Rio, num retrato do determinismo social.",
  "o-livro-de-uma-sogra": "Sátira bem-humorada sobre o casamento, narrada do ponto de vista da sogra, que tenta a todo custo atrapalhar a união dos noivos.",
  "o-navio-negreiro": "Poema épico que denuncia os horrores do tráfico negreiro, com imagens poderosas da travessia atlântica e da crueldade da escravidão.",
  "espumas-flutuantes": "Primeiro livro de poemas de Castro Alves, oscila entre o lirismo amoroso e a poesia social abolicionista.",
  "hinos-do-equador": "Poesia vibrante que celebra a natureza brasileira e clama por liberdade, com versos de forte engajamento político e social.",
  "gonzaga-ou-a-revolucao-de-minas": "Poema dramático sobre a Inconfidência Mineira e o amor de Gonzaga por Marília, entre a rebelião e o destino trágico.",
  "noite-na-taverna": "Contos góticos narrados por boêmios numa taverna, histórias de crime, amor macabro e fantasia sombria do Ultrarromantismo.",
  "lira-dos-vinte-anos": "Coletânea poética que alterna o lirismo amoroso e a ironia amarga, retrato da alma inquieta e tédio da juventude romântica.",
  "macario": "Drama filosófico onde o protagonista vende a alma ao diabo em busca de prazer e conhecimento, diálogo entre o bem e o mal.",
  "a-moreninha": "Dois estudantes apostam sobre quem conquistará o coração da moreninha, numa das histórias de amor mais populares do Romantismo brasileiro.",
  "o-moco-loiro": "Romance de amor e intriga na corte de D. João VI, onde o misterioso moço loiro esconde segredos de família.",
  "os-dois-amores": "Dois irmãos gêmeos se apaixonam pela mesma mulher, numa trama de identidade trocada e paixão proibida.",
  "marilia-de-dirceu": "Liras inspiradas pelo amor de Gonzaga por sua Marília, obra-prima do Arcadismo brasileiro entre a pastoral e o trágico.",
  "cartas-chilenas": "Sátira política em versos que critica o governador do Chile — alegoria para denunciar a corrupção na Capitania de Minas Gerais.",
  "o-uruguay": "Poema épico que narra a guerra entre portugueses, espanhóis e índios na região do Uruguai, com os indígenas como heróis trágicos.",
  "caramuru": "Poema épico sobre o naufrágio de Diogo Álvares Correia na Bahia e sua história com a índia Moema, o fundador lendário do Brasil.",
  "i-juca-pirama": "Poema indianista que narra o drama de um guerreiro tupi capturado por tribo inimiga, disposto a morrer com dignidade.",
  "os-timbiras": "Poema épico inconcluso que celebra a bravura dos índios timbiras e a beleza da paisagem brasileira pré-colonial.",
  "primeiros-cantos": "Primeira obra de Gonçalves Dias, reúne poemas indianistas e líricos que fundaram o Romantismo no Brasil.",
  "as-primaveras": "Poesia leve e sentimental que celebra o amor juvenil, a natureza e a saudade, marca do lirismo de Casimiro de Abreu.",
  "suspiros-poeticos-e-saudades": "Marco inicial do Romantismo brasileiro, poemas que expressam nostalgia da pátria e exaltam a natureza nacional.",
  "a-confederacao-dos-tamoios": "Poema épico sobre a aliança dos índios tamoios contra os portugueses no século XVI, com heróis indígenas.",
  "a-escrava-isaura": "A bela escrava Isaura foge de seu cruel senhor, numa trama de amor e liberdade que se tornou um dos maiores clássicos da televisão brasileira.",
  "o-seminarista": "O jovem seminarista é forçado ao sacerdócio contra sua vontade, num drama de amor impossível e opressão familiar.",
  "inocencia": "No sertão de Mato Grosso, o médico Cirino se apaixona pela inocente Inocência, desafia o pai dela e enfrenta um destino trágico.",
  "o-ateneu": "Memórias de Sérgio sobre sua educação no colégio interno Ateneu, um microcosmo da sociedade brasileira com suas hipocrisias e violências.",
  "cancoes-sem-palavras": "Contos e crônicas que revelam o talento de Raul Pompeia para a prosa poética e a observação psicológica aguda.",
};

// ============================================================================
// HELPERS
// ============================================================================

function toSlug(title) {
  return title
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function hashGradient(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function hashRating(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return +(4.0 + (Math.abs(hash) % 10) / 10).toFixed(1);
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanDominioPublicoText(rawText) {
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
      (trimmed.includes("---") && trimmed.length < 20)
    ) {
      const nextNonEmpty = lines.slice(i + 1).findIndex((l) => l.trim().length > 0);
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
      (trimmed.includes("formato") && trimmed.includes("texto")) ||
      trimmed.includes("http://www.dominiopublico.gov.br")
    ) {
      endIdx = i;
    }
  }

  return lines.slice(startIdx, endIdx).join("\n").trim();
}

// ============================================================================
// DOWNLOAD
// ============================================================================

async function downloadBook(id, slug) {
  const url = DP_URL_TEMPLATE.replace("{id}", id);
  const filePath = path.join(DOWNLOADS_DIR, `${slug}.txt`);

  const response = await fetch(url, {
    signal: AbortSignal.timeout(30000),
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const rawText = await response.text();
  const cleaned = cleanDominioPublicoText(rawText);
  fs.writeFileSync(filePath, cleaned, "utf-8");

  return cleaned.length;
}

// ============================================================================
// GERAÇÃO DE ENTRY
// ============================================================================

function generateEntry(work, size) {
  const slug = toSlug(work.title);
  const query = encodeURIComponent(`${work.title} ${work.author}`);

  return {
    id: slug,
    title: work.title,
    author: work.author,
    year: work.year,
    genres: ["Clássicos Brasileiros", ...work.genres],
    rating: hashRating(work.title),
    coverGradient: hashGradient(work.title),
    synopsis: SYNOPSES[slug] || `Obra clássica da literatura brasileira de ${work.author}.`,
    fullText: "",
    downloadFile: `/api/dominio-publico?id=${work.id}`,
    editions: [
      {
        id: `ed-${slug}-amazon`,
        publisher: "Edição Amazon",
        year: work.year,
        isbn: "978-0000000000",
        pages: 0,
        coverType: "Digital",
        priceBR: 0,
        pricePT: 0,
        linkBR: `https://www.amazon.com.br/s?k=${query}&tag=gargbooks-20`,
        linkPT: `https://www.amazon.es/s?k=${query}&tag=gargbookspt-21`,
      },
    ],
    reviews: [
      {
        id: `rev-${slug}-1`,
        username: "leitor_brasil",
        rating: 5,
        date: today(),
        text: `Clássico imperdível da literatura brasileira. ${work.author} entrega uma obra-prima que atravessa gerações. Leitura obrigatória!`,
      },
    ],
    publicDomain: true,
    language: "pt-br",
    type: "livro",
  };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("═".repeat(56));
  console.log("  BOOTSTRAP — Domínio Público Brasileiro");
  console.log(`  ${DOMINIO_PUBLICO_WORKS.length} obras para processar`);
  console.log("═".repeat(56));
  console.log();

  // Garantir que diretório de downloads existe
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }

  // Carregar progresso
  let progress = {};
  if (fs.existsSync(PROGRESS_PATH)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf-8"));
  }
  if (!progress.dominioPublico) {
    progress.dominioPublico = {};
  }

  // Carregar mock data
  let mockData = [];
  if (fs.existsSync(MOCK_PATH)) {
    mockData = JSON.parse(fs.readFileSync(MOCK_PATH, "utf-8"));
  }

  // FASE 1: DOWNLOAD
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < DOMINIO_PUBLICO_WORKS.length; i++) {
    const work = DOMINIO_PUBLICO_WORKS[i];
    const slug = toSlug(work.title);
    const record = progress.dominioPublico[work.id];

    if (record && record.downloaded === true) {
      console.log(`[${String(i + 1).padStart(2, "0")}/${DOMINIO_PUBLICO_WORKS.length}] [${work.id}] ${work.title}`);
      console.log(`  ↪ Já baixado (${(record.size / 1024).toFixed(1)} KB), pulando.`);
      ok++;
      continue;
    }

    process.stdout.write(`[${String(i + 1).padStart(2, "0")}/${DOMINIO_PUBLICO_WORKS.length}] [${work.id}] ${work.title}... `);

    try {
      const size = await downloadBook(work.id, slug);
      progress.dominioPublico[work.id] = {
        downloaded: true,
        size,
        date: today(),
      };
      console.log(`✓ ${(size / 1024).toFixed(1)} KB`);
      ok++;
      await sleep(1500);
    } catch (err) {
      progress.dominioPublico[work.id] = {
        downloaded: false,
        error: err.message,
        date: today(),
      };
      console.log(`✗ ERRO: ${err.message}`);
      fail++;
    }

    fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), "utf-8");
  }

  // FASE 2: MERGE NO MOCK DATA
  console.log();
  console.log("═".repeat(56));
  console.log("  Atualizando livros-mock.json...");
  console.log("═".repeat(56));

  let added = 0;
  let replaced = 0;

  for (const work of DOMINIO_PUBLICO_WORKS) {
    const slug = toSlug(work.title);
    const record = progress.dominioPublico[work.id];

    // Só substitui se o download foi bem-sucedido
    if (record && record.downloaded === true) {
      const idx = mockData.findIndex((b) => b.id === slug);
      if (idx !== -1) {
        mockData.splice(idx, 1);
        replaced++;
      }
      const entry = generateEntry(work, record.size);
      mockData.push(entry);
      added++;
    }
  }

  fs.writeFileSync(MOCK_PATH, JSON.stringify(mockData, null, 2), "utf-8");

  // RESUMO
  console.log();
  console.log("═".repeat(56));
  console.log("  RESUMO FINAL");
  console.log("═".repeat(56));
  console.log(`  ✅ ${ok} de ${DOMINIO_PUBLICO_WORKS.length} obras baixadas com sucesso`);
  if (fail > 0) console.log(`  ❌ ${fail} falhas`);
  console.log(`  📚 ${added} entries em livros-mock.json (${replaced} substituídas)`);
  console.log(`  📁 ${ok} arquivos em public/downloads/`);
  console.log(`  💾 Progresso salvo em scripts/progress.json`);
  console.log();
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
