import { readFileSync, writeFileSync } from "fs";

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

function hashGradient(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function toSlug(title) {
  return title
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const SYNOPSES = {
  "Dom Casmurro": "Bentinho e Capitu vivem um dos maiores mistérios da literatura brasileira: teria ou não havido traição? Um romance de ciúme, dúvida e memória seleta.",
  "Memórias Póstumas de Brás Cubas": "Um defunto autor narra suas memórias com ironia mordaz, pessimismo filosófico e uma crítica implacável à sociedade carioca do século XIX.",
  "Quincas Borba": "O filósofo Quincas Borba e seu cachorro homônimo conduzem uma sátira brilhante sobre o positivismo e a ganância na corte imperial.",
  "O Alienista": "O dr. Simão Bacamarte funda um manicômio em Itaguaí e acaba questionando a própria sanidade ao diagnosticar toda a cidade como louca.",
  "Helena": "Um amor proibido e um segredo de família se entrelaçam nesta história de lealdade, sacrifício e convenções sociais do Rio oitocentista.",
  "Iaiá Garcia": "Os conflitos amorosos e sociais de Iaiá Garcia revelam as sutilezas psicológicas e as amarras do casamento na sociedade imperial.",
  "Esaú e Jacó": "Os gêmeos Pedro e Paulo são opostos em tudo — política, amor e visão de mundo — numa alegoria do Brasil dividido entre monarquia e república.",
  "Memorial de Aires": "O conselheiro Aires registra em seu diário as observações sobre a vida, o amor e a velhice na corte carioca com elegância e melancolia.",
  "Ressurreição": "Primeiro romance de Machado de Assis, narra a história de amor atormentada de Félix e Lívia, marcada pelo ciúme e pela indecisão.",
  "A Mão e a Luva": "Guiomar precisa escolher entre três pretendentes, cada um representando um caminho diferente para o amor e a ambição feminina.",
  "Várias Histórias": "Coletânea de contos machadianos que inclui clássicos como 'A Igreja do Diabo' e 'O Segredo do Bonzo', com ironia e profundidade.",
  "Páginas Recolhidas": "Reunião de contos e crônicas que revelam a versatilidade de Machado, do humor ao trágico, com a maestria de sempre.",
  "Relíquias de Casa Velha": "Última coletânea de contos publicada em vida por Machado, com narrativas que dialogam com a memória e o tempo.",
  "Iracema": "A virgem dos lábios de mel, Iracema, se apaixona pelo português Martim, simbolizando o mito de fundação do Ceará entre o amor e a guerra.",
  "O Guarani": "Peri, o índio guarani, protege a família de D. Antônio de Mariz e se apaixona por Cecília, numa epopeia de amor e honra.",
  "Senhora": "Aurélia Camargo compra o marido Fernando Seixas num casamento por interesse que se transforma numa crítica à mercantilização das relações.",
  "Lucíola": "Lúcia, uma cortesã de luxo, vive um amor arrebatador com Paulo, num romance que explora os limites entre o desejo e a sociedade hipócrita.",
  "Diva": "A volúvel e encantadora Emília é a diva que atormenta o coração de seu primo Afonso, num jogo de sedução e independência feminina.",
  "Til": "A ingênua Berta, conhecida como Til, vive no interior paulista cercada por segredos do passado e amores não correspondidos.",
  "O Sertanejo": "O sertanejo Arnaldo luta pelo amor de Flor e pela justiça no sertão cearense, numa narrativa de aventura e paixão.",
  "Ubirajara": "Romance indianista que narra a jornada do guerreiro Ubirajara em busca de glória e amor entre as tribos brasileiras pré-coloniais.",
  "As Minas de Prata": "Aventura histórica sobre a busca por riquezas na Bahia do século XVII, com conspirações, duelos e romances.",
  "Sonhos D'Ouro": "Ricardo e Guiomar vivem um romance em meio à alta sociedade fluminense, onde o amor é posto à prova pelo orgulho e pela ambição.",
  "Encarnação": "Romance póstumo de Alencar que explora o amor para além da morte, numa trama de reencarnação e paixão espiritual.",
  "O Cortiço": "A vida misera e vibrante de um cortiço carioca é o palco da luta pela sobrevivência, onde o ser humano é produto do meio.",
  "O Mulato": "Primeiro romance naturalista brasileiro, denuncia o preconceito racial na história do mulato Raimundo que se apaixona por Ana Rosa.",
  "Casa de Pensão": "O maranhense Amâncio deixa São Luís e se perde nos vícios e dívidas de uma pensão no Rio, num retrato do determinismo social.",
  "O Livro de uma Sogra": "Sátira bem-humorada sobre o casamento, narrada do ponto de vista da sogra, que tenta a todo custo atrapalhar a união dos noivos.",
  "O Navio Negreiro": "Poema épico que denuncia os horrores do tráfico negreiro, com imagens poderosas da travessia atlântica e da crueldade da escravidão.",
  "Espumas Flutuantes": "Primeiro livro de poemas de Castro Alves, oscila entre o lirismo amoroso e a poesia social abolicionista.",
  "Hinos do Equador": "Poesia vibrante que celebra a natureza brasileira e clama por liberdade, com versos de forte engajamento político e social.",
  "Gonzaga ou a Revolução de Minas": "Poema dramático sobre a Inconfidência Mineira e o amor de Gonzaga por Marília, entre a rebelião e o destino trágico.",
  "Noite na Taverna": "Contos góticos narrados por boêmios numa taverna, histórias de crime, amor macabro e fantasia sombria do Ultrarromantismo.",
  "Lira dos Vinte Anos": "Coletânea poética que alterna o lirismo amoroso e a ironia amarga, retrato da alma inquieta e tédio da juventude romântica.",
  "Macário": "Drama filosófico onde o protagonista vende a alma ao diabo em busca de prazer e conhecimento, diálogo entre o bem e o mal.",
  "A Moreninha": "Dois estudantes apostam sobre quem conquistará o coração da moreninha, numa das histórias de amor mais populares do Romantismo brasileiro.",
  "O Moço Loiro": "Romance de amor e intriga na corte de D. João VI, onde o misterioso moço loiro esconde segredos de família.",
  "Os Dois Amores": "Dois irmãos gêmeos se apaixonam pela mesma mulher, numa trama de identidade trocada e paixão proibida.",
  "Marília de Dirceu": "Liras inspiradas pelo amor de Gonzaga por sua Marília, obra-prima do Arcadismo brasileiro entre a pastoral e o trágico.",
  "Cartas Chilenas": "Sátira política em versos que critica o governador do Chile — alegoria para denunciar a corrupção na Capitania de Minas Gerais.",
  "O Uruguay": "Poema épico que narra a guerra entre portugueses, espanhóis e índios na região do Uruguai, com os indígenas como heróis trágicos.",
  "Caramuru": "Poema épico sobre o naufrágio de Diogo Álvares Correia na Bahia e sua história com a índia Moema, o fundador lendário do Brasil.",
  "I-Juca-Pirama": "Poema indianista que narra o drama de um guerreiro tupi capturado por tribo inimiga, disposto a morrer com dignidade.",
  "Os Timbiras": "Poema épico inconcluso que celebra a bravura dos índios timbiras e a beleza da paisagem brasileira pré-colonial.",
  "Primeiros Cantos": "Primeira obra de Gonçalves Dias, reúne poemas indianistas e líricos que fundaram o Romantismo no Brasil.",
  "As Primaveras": "Poesia leve e sentimental que celebra o amor juvenil, a natureza e a saudade, marca do lirismo de Casimiro de Abreu.",
  "Suspiros Poéticos e Saudades": "Marco inicial do Romantismo brasileiro, poemas que expressam nostalgia da pátria e exaltam a natureza nacional.",
  "A Confederação dos Tamoios": "Poema épico sobre a aliança dos índios tamoios contra os portugueses no século XVI, com heróis indígenas.",
  "A Escrava Isaura": "A bela escrava Isaura foge de seu cruel senhor, numa trama de amor e liberdade que se tornou um dos maiores clássicos da televisão brasileira.",
  "O Seminarista": "O jovem seminarista é forçado ao sacerdócio contra sua vontade, num drama de amor impossível e opressão familiar.",
  "Inocência": "No sertão de Mato Grosso, o médico Cirino se apaixona pela inocente Inocência, desafia o pai dela e enfrenta um destino trágico.",
  "O Ateneu": "Memórias de Sérgio sobre sua educação no colégio interno Ateneu, um microcosmo da sociedade brasileira com suas hipocrisias e violências.",
  "Canções Sem Palavras": "Contos e crônicas que revelam o talento de Raul Pompeia para a prosa poética e a observação psicológica aguda.",
};

const EXISTING_BOOK = {
  id: "memorias-postumas",
  dpId: "bn000068",
};

const FILE = "src/data/livros-mock.json";
const raw = readFileSync(FILE, "utf-8");
const data = JSON.parse(raw);

const existingIdx = data.findIndex((b) => b.id === EXISTING_BOOK.id);
if (existingIdx !== -1) {
  const existing = data[existingIdx];
  if (!existing.genres.includes("Clássicos Brasileiros")) {
    existing.genres = ["Clássicos Brasileiros", ...existing.genres.filter(g => g !== "Clássicos")];
  }
  existing.downloadFile = `/api/dominio-publico?id=${EXISTING_BOOK.dpId}`;
}

const existingIds = new Set(data.map((b) => b.id));

for (const work of DOMINIO_PUBLICO_WORKS) {
  const slug = toSlug(work.title);
  if (existingIds.has(slug)) continue;

  const entry = {
    id: slug,
    title: work.title,
    author: work.author,
    year: work.year,
    genres: ["Clássicos Brasileiros", ...work.genres],
    rating: +(4 + Math.random()).toFixed(1),
    coverGradient: hashGradient(work.title),
    synopsis: SYNOPSES[work.title] || `Obra clássica da literatura brasileira de ${work.author}.`,
    fullText: "",
    downloadFile: `/api/dominio-publico?id=${work.id}`,
    publicDomain: true,
    language: "pt-br",
    type: "livro",
    editions: [],
    reviews: [],
  };

  data.push(entry);
  existingIds.add(slug);
}

writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
console.log(`✅ Atualizado: memorias-postumas`);
console.log(`✅ Adicionados: ${DOMINIO_PUBLICO_WORKS.length - 1} novas obras`);
console.log(`📚 Total no arquivo: ${data.length} obras`);
