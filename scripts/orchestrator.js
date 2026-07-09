/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');


// ============================================================================
// CONFIGURAÇÕES OBRIGATÓRIAS DE AMBIENTE LOCAL
// ============================================================================
const LM_STUDIO_URL = 'http://localhost:1234/v1/chat/completions';
const MODEL_NAME = 'gemma-4-e4b-uncensored-hauhaucs-aggressive';
const SD_API_URL = 'http://localhost:7860/sdapi/v1/txt2img';

// Caminhos locais do projeto Next.js
const LIVROS_MOCK_PATH = path.join(__dirname, '..', 'src', 'data', 'livros-mock.json');
const CONTOS_MOCK_PATH = path.join(__dirname, '..', 'src', 'data', 'contos-mock.json');
const COVERS_DIR = path.join(__dirname, '..', 'public', 'covers');
const DOWNLOADS_DIR = path.join(__dirname, '..', 'public', 'downloads');
const PROGRESS_PATH = path.join(__dirname, 'progress.json');

// Configuração de Tags de Afiliado (Substitua pelos seus tags reais da Amazon)
const AMAZON_TAG_BR = 'gargbooks-20';
const AMAZON_TAG_PT = 'gargbookspt-21';

// Intervalo de execução (10 minutos por padrão)
const ORCHESTRATOR_INTERVAL = 10 * 60 * 1000;

// ============================================================================
// IDIOMAS SUPORTADOS
// ============================================================================
const LANGUAGES = [
  { code: 'en',    name: 'English',           flag: '🇬🇧', translateFrom: null },
  { code: 'pt-br', name: 'Português (BR)',     flag: '🇧🇷', translateFrom: 'inglês para o português brasileiro' },
  { code: 'pt-pt', name: 'Português (PT)',     flag: '🇵🇹', translateFrom: 'inglês para o português europeu' },
  { code: 'es',    name: 'Español',            flag: '🇪🇸', translateFrom: 'inglés al español' },
  { code: 'fr',    name: 'Français',           flag: '🇫🇷', translateFrom: "l'anglais vers le français" }
];

// Mapa de títulos traduzidos para cada idioma
const TITLE_MAP = {
  "The Metamorphosis":          { "en": "The Metamorphosis",          "pt-br": "A Metamorfose",                   "pt-pt": "A Metamorfose",                  "es": "La Metamorfosis",                "fr": "La Métamorphose" },
  "Frankenstein":               { "en": "Frankenstein",               "pt-br": "Frankenstein",                    "pt-pt": "Frankenstein",                   "es": "Frankenstein",                   "fr": "Frankenstein" },
  "Alice's Adventures in Wonderland": { "en": "Alice's Adventures in Wonderland", "pt-br": "Alice no País das Maravilhas", "pt-pt": "Alice no País das Maravilhas", "es": "Alicia en el País de las Maravillas", "fr": "Alice au Pays des Merveilles" },
  "Dracula":                    { "en": "Dracula",                    "pt-br": "Drácula",                         "pt-pt": "Drácula",                        "es": "Drácula",                        "fr": "Dracula" },
  "Pride and Prejudice":        { "en": "Pride and Prejudice",        "pt-br": "Orgulho e Preconceito",            "pt-pt": "Orgulho e Preconceito",           "es": "Orgullo y Prejuicio",             "fr": "Orgueil et Préjugés" },
  "Moby Dick":                  { "en": "Moby Dick",                  "pt-br": "Moby Dick",                       "pt-pt": "Moby Dick",                      "es": "Moby Dick",                      "fr": "Moby Dick" },
  "A Tale of Two Cities":       { "en": "A Tale of Two Cities",       "pt-br": "Um Conto de Duas Cidades",         "pt-pt": "Um Conto de Duas Cidades",        "es": "Historia de Dos Ciudades",        "fr": "Le Conte de Deux Cités" },
  "The Picture of Dorian Gray": { "en": "The Picture of Dorian Gray", "pt-br": "O Retrato de Dorian Gray",         "pt-pt": "O Retrato de Dorian Gray",        "es": "El Retrato de Dorian Gray",       "fr": "Le Portrait de Dorian Gray" },
  "The War of the Worlds":      { "en": "The War of the Worlds",      "pt-br": "A Guerra dos Mundos",              "pt-pt": "A Guerra dos Mundos",             "es": "La Guerra de los Mundos",         "fr": "La Guerre des Mondes" },
  "Dr Jekyll and Mr Hyde":      { "en": "Dr Jekyll and Mr Hyde",      "pt-br": "O Médico e o Monstro",             "pt-pt": "O Estranho Caso do Dr. Jekyll e Mr. Hyde", "es": "El Extraño Caso del Dr. Jekyll y Mr. Hyde", "fr": "L'Étrange Cas du Dr Jekyll et de Mr Hyde" },
  "Heart of Darkness":          { "en": "Heart of Darkness",          "pt-br": "Coração das Trevas",               "pt-pt": "Coração das Trevas",              "es": "El Corazón de las Tinieblas",     "fr": "Au Cœur des Ténèbres" },
  "The Time Machine":           { "en": "The Time Machine",           "pt-br": "A Máquina do Tempo",               "pt-pt": "A Máquina do Tempo",              "es": "La Máquina del Tiempo",           "fr": "La Machine à Explorer le Temps" },
  "Romeo and Juliet":           { "en": "Romeo and Juliet",           "pt-br": "Romeu e Julieta",                  "pt-pt": "Romeu e Julieta",                 "es": "Romeo y Julieta",                "fr": "Roméo et Juliette" },
  "Crime and Punishment":       { "en": "Crime and Punishment",       "pt-br": "Crime e Castigo",                  "pt-pt": "Crime e Castigo",                 "es": "Crimen y Castigo",               "fr": "Crime et Châtiment" },
  "The Adventures of Sherlock Holmes": { "en": "The Adventures of Sherlock Holmes", "pt-br": "As Aventuras de Sherlock Holmes", "pt-pt": "As Aventuras de Sherlock Holmes", "es": "Las Aventuras de Sherlock Holmes", "fr": "Les Aventures de Sherlock Holmes" },
  "Treasure Island":            { "en": "Treasure Island",            "pt-br": "A Ilha do Tesouro",                "pt-pt": "A Ilha do Tesouro",               "es": "La Isla del Tesoro",              "fr": "L'Île au Trésor" },
  "The Jungle Book":            { "en": "The Jungle Book",            "pt-br": "O Livro da Selva",                 "pt-pt": "O Livro da Selva",                "es": "El Libro de la Selva",            "fr": "Le Livre de la Jungle" },
  "The Count of Monte Cristo":  { "en": "The Count of Monte Cristo",  "pt-br": "O Conde de Monte Cristo",          "pt-pt": "O Conde de Monte Cristo",         "es": "El Conde de Montecristo",         "fr": "Le Comte de Monte-Cristo" },
  "The Odyssey":                { "en": "The Odyssey",                "pt-br": "A Odisseia",                       "pt-pt": "A Odisseia",                      "es": "La Odisea",                       "fr": "L'Odyssée" },
  "Don Quixote":                { "en": "Don Quixote",                "pt-br": "Dom Quixote",                      "pt-pt": "Dom Quixote",                     "es": "Don Quijote de la Mancha",        "fr": "Don Quichotte" },
  "Neuromancer":                { "en": "Neuromancer",                "pt-br": "Neuromancer",                      "pt-pt": "Neuromancer",                     "es": "Neuromante",                      "fr": "Neuromancien" },
  // === DOMÍNIO PÚBLICO (obras brasileiras em português) ===
  "Dom Casmurro":               { "en": "Dom Casmurro",              "pt-br": "Dom Casmurro",                     "pt-pt": "Dom Casmurro",                    "es": "Dom Casmurro",                   "fr": "Dom Casmurro" },
  "Memórias Póstumas de Brás Cubas": { "en": "The Posthumous Memoirs of Brás Cubas", "pt-br": "Memórias Póstumas de Brás Cubas", "pt-pt": "Memórias Póstumas de Brás Cubas", "es": "Memorias Póstumas de Blas Cubas", "fr": "Mémoires posthumes de Bras Cubas" },
  "Quincas Borba":              { "en": "Quincas Borba",             "pt-br": "Quincas Borba",                    "pt-pt": "Quincas Borba",                   "es": "Quincas Borba",                  "fr": "Quincas Borba" },
  "O Alienista":                { "en": "The Alienist",              "pt-br": "O Alienista",                      "pt-pt": "O Alienista",                     "es": "El Alienista",                   "fr": "L'Alieniste" },
  "Iracema":                    { "en": "Iracema",                   "pt-br": "Iracema",                          "pt-pt": "Iracema",                         "es": "Iracema",                        "fr": "Iracema" },
  "O Guarani":                  { "en": "The Guarani",               "pt-br": "O Guarani",                        "pt-pt": "O Guarani",                       "es": "El Guaraní",                     "fr": "Le Guarani" },
  "Senhora":                    { "en": "Senhora",                   "pt-br": "Senhora",                          "pt-pt": "Senhora",                         "es": "Señora",                         "fr": "Senhora" },
  "O Cortiço":                  { "en": "The Slum",                  "pt-br": "O Cortiço",                        "pt-pt": "O Cortiço",                       "es": "El Cortijo",                     "fr": "Le Taudis" },
  "O Navio Negreiro":           { "en": "The Slave Ship",            "pt-br": "O Navio Negreiro",                  "pt-pt": "O Navio Negreiro",                 "es": "El Buque Negrero",               "fr": "Le Navire Négrier" },
  "Noite na Taverna":           { "en": "Night in the Tavern",       "pt-br": "Noite na Taverna",                  "pt-pt": "Noite na Taverna",                 "es": "Noche en la Taberna",             "fr": "Nuit à la Taverne" },
  "A Moreninha":                { "en": "The Little Brunette",       "pt-br": "A Moreninha",                      "pt-pt": "A Moreninha",                     "es": "La Morenita",                    "fr": "La Brune" },
  "O Sertanejo":                { "en": "The Backlander",            "pt-br": "O Sertanejo",                      "pt-pt": "O Sertanejo",                     "es": "El Sertanejo",                   "fr": "Le Sertanejo" },
  "Lucíola":                    { "en": "Lucíola",                   "pt-br": "Lucíola",                          "pt-pt": "Lucíola",                         "es": "Lucíola",                        "fr": "Lucíola" },
  "Diva":                       { "en": "Diva",                      "pt-br": "Diva",                             "pt-pt": "Diva",                            "es": "Diva",                           "fr": "Diva" },
  "Til":                        { "en": "Til",                       "pt-br": "Til",                              "pt-pt": "Til",                             "es": "Til",                            "fr": "Til" }
};

// ============================================================================
// 10 PERSONAS EDITORIAIS (Incluindo as de romance/contos eróticos +18)
// ============================================================================
const PERSONAS = [
  {
    name: "Elena Thorne",
    genre: "Romance Erótico",
    theme: "romance contemporâneo adulto, paixão intensa e tramas passionais",
    isAdult: true,
    style: "lírico, altamente sensual, focado na tensão física e psicológica entre os personagens"
  },
  {
    name: "Alistair Vance",
    genre: "Terror Gótico",
    theme: "rituais obscuros, mansões decadentes e possessões misteriosas",
    isAdult: true,
    style: "sombrio, visceral, descrições ricas, focado no terror anatômico e na loucura"
  },
  {
    name: "Luna Novak",
    genre: "Cyberpunk",
    theme: "transumanismo, corporações controladoras e crimes na Matrix sob chuva ácida",
    isAdult: false,
    style: "acelerado, repleto de gírias de hacker e jargão tecnológico, tom noir futurista"
  },
  {
    name: "Thomas Kael",
    genre: "Fantasia Épica",
    theme: "conquistas de impérios, relíquias mágicas esquecidas e dragões ancestrais",
    isAdult: false,
    style: "majestoso, descritivo, tom mitológico, heróico e lendário"
  },
  {
    name: "Chloe Mercier",
    genre: "Drama Romântico",
    theme: "reconciliações, segundas chances e amores impossíveis entre classes sociais",
    isAdult: false,
    style: "delicado, profundo, focado em diálogos emocionais e atmosferas intensas"
  },
  {
    name: "Rex Obsidian",
    genre: "Sci-Fi Militar",
    theme: "tropas intergalácticas, invasões alienígenas, sacrifício e honra sob fogo cruzado",
    isAdult: false,
    style: "brutal, direto, repleto de ação militar, jargão tático e descrições de armamento"
  },
  {
    name: "Isabela Requena",
    genre: "Realismo Mágico",
    theme: "vilas latino-americanas, fenômenos sobrenaturais cotidianos, memórias ancestrais",
    isAdult: false,
    style: "poético, cadenciado, com descrições oníricas e realidade fluida como a de Gabriel García Márquez"
  },
  {
    name: "Viktor Draum",
    genre: "Horror Psicológico",
    theme: "insônia, figuras distorcidas em espelhos, pesadelos lúcidos e pacientes de sanatórios",
    isAdult: true,
    style: "claustrofóbico, perturbador, com frases curtas e ritmo crescente de tensão"
  },
  {
    name: "Satoshi Kurogane",
    genre: "Thriller de Espionagem",
    theme: "conspirações geopolíticas, IA usada para controle global e agentes duplos",
    isAdult: false,
    style: "calculista, com reviravoltas frequentes e descrições frias e técnicas"
  },
  {
    name: "Jax Mercer",
    genre: "Noir Thriller",
    theme: "submundos de cidades portuárias, contrabandistas, tráfico de relíquias e prostituição de luxo",
    isAdult: true,
    style: "áspero, dinâmico, focado na resiliência física e em descrições de sucatas tecnológicas"
  }
];

// ============================================================================
// CATÁLOGO DE OBRAS CLÁSSICAS DO GUTENBERG (20 obras)
// ============================================================================
const GUTENBERG_WORKS = [
  { id: 345,  title: "Dracula",                          author: "Bram Stoker",           year: 1897, genres: ["Terror Gótico", "Clássicos"] },
  { id: 5200, title: "The Metamorphosis",                author: "Franz Kafka",           year: 1915, genres: ["Ficção Absurda", "Clássicos"] },
  { id: 84,   title: "Frankenstein",                     author: "Mary Shelley",          year: 1818, genres: ["Terror Gótico", "Ficção Científica"] },
  { id: 11,   title: "Alice's Adventures in Wonderland", author: "Lewis Carroll",         year: 1865, genres: ["Fantasia", "Clássicos"] },
  { id: 1342, title: "Pride and Prejudice",              author: "Jane Austen",           year: 1813, genres: ["Romance", "Clássicos"] },
  { id: 2701, title: "Moby Dick",                        author: "Herman Melville",       year: 1851, genres: ["Aventura", "Clássicos"] },
  { id: 98,   title: "A Tale of Two Cities",             author: "Charles Dickens",       year: 1859, genres: ["Drama Histórico", "Clássicos"] },
  { id: 174,  title: "The Picture of Dorian Gray",       author: "Oscar Wilde",           year: 1890, genres: ["Ficção Filosófica", "Clássicos"] },
  { id: 36,   title: "The War of the Worlds",            author: "H.G. Wells",            year: 1898, genres: ["Ficção Científica", "Clássicos"] },
  { id: 43,   title: "Dr Jekyll and Mr Hyde",            author: "R.L. Stevenson",        year: 1886, genres: ["Terror Gótico", "Ficção Científica"] },
  { id: 219,  title: "Heart of Darkness",                author: "Joseph Conrad",         year: 1899, genres: ["Drama", "Clássicos"] },
  { id: 35,   title: "The Time Machine",                 author: "H.G. Wells",            year: 1895, genres: ["Ficção Científica", "Clássicos"] },
  { id: 1513, title: "Romeo and Juliet",                 author: "William Shakespeare",   year: 1597, genres: ["Tragédia", "Romance"] },
  { id: 2554, title: "Crime and Punishment",             author: "Fyodor Dostoevsky",     year: 1866, genres: ["Drama Psicológico", "Clássicos"] },
  { id: 1661, title: "The Adventures of Sherlock Holmes",author: "Arthur Conan Doyle",    year: 1892, genres: ["Mistério", "Detetive"] },
  { id: 120,  title: "Treasure Island",                  author: "R.L. Stevenson",        year: 1883, genres: ["Aventura", "Clássicos"] },
  { id: 236,  title: "The Jungle Book",                  author: "Rudyard Kipling",       year: 1894, genres: ["Aventura", "Fantasia"] },
  { id: 1184, title: "The Count of Monte Cristo",        author: "Alexandre Dumas",       year: 1844, genres: ["Aventura", "Drama"] },
  { id: 1727, title: "The Odyssey",                      author: "Homer",                 year: -800, genres: ["Épico", "Mitologia"] },
  { id: 996,  title: "Don Quixote",                      author: "Miguel de Cervantes",   year: 1605, genres: ["Aventura", "Sátira"] }
];

// ============================================================================
// CATÁLOGO DE OBRAS DO DOMÍNIO PÚBLICO BRASILEIRO (obras em pt-br)
// Os arquivos TXT são baixados de http://www.dominiopublico.gov.br/download/texto/<id>.txt
// Com fallback para Gutendex (pt) se o DP estiver indisponível
// ============================================================================
const DOMINIO_PUBLICO_WORKS = [
  // Machado de Assis (1839-1908)
  { id: "bn000067", title: "Dom Casmurro",                    author: "Machado de Assis",      year: 1899, genres: ["Romance", "Clássicos Brasileiros", "Realismo"] },
  { id: "bn000068", title: "Memórias Póstumas de Brás Cubas", author: "Machado de Assis",      year: 1881, genres: ["Romance", "Clássicos Brasileiros", "Realismo"] },
  { id: "bn000069", title: "Quincas Borba",                   author: "Machado de Assis",      year: 1891, genres: ["Romance", "Clássicos Brasileiros", "Realismo"] },
  { id: "bn000070", title: "O Alienista",                     author: "Machado de Assis",      year: 1882, genres: ["Conto", "Clássicos Brasileiros", "Realismo"] },
  { id: "bn000082", title: "Helena",                          author: "Machado de Assis",      year: 1876, genres: ["Romance", "Clássicos Brasileiros", "Realismo"] },
  { id: "bn000083", title: "Iaiá Garcia",                     author: "Machado de Assis",      year: 1878, genres: ["Romance", "Clássicos Brasileiros", "Realismo"] },
  { id: "bn000084", title: "Esaú e Jacó",                     author: "Machado de Assis",      year: 1904, genres: ["Romance", "Clássicos Brasileiros", "Realismo"] },
  { id: "bn000085", title: "Memorial de Aires",               author: "Machado de Assis",      year: 1908, genres: ["Romance", "Clássicos Brasileiros", "Realismo"] },
  { id: "bn000086", title: "Ressurreição",                    author: "Machado de Assis",      year: 1872, genres: ["Romance", "Clássicos Brasileiros", "Romantismo"] },
  { id: "bn000087", title: "A Mão e a Luva",                  author: "Machado de Assis",      year: 1874, genres: ["Romance", "Clássicos Brasileiros", "Romantismo"] },
  { id: "bn000088", title: "Várias Histórias",                author: "Machado de Assis",      year: 1896, genres: ["Conto", "Clássicos Brasileiros", "Realismo"] },
  { id: "bn000089", title: "Páginas Recolhidas",              author: "Machado de Assis",      year: 1899, genres: ["Conto", "Clássicos Brasileiros", "Realismo"] },
  { id: "bn000090", title: "Relíquias de Casa Velha",         author: "Machado de Assis",      year: 1906, genres: ["Conto", "Clássicos Brasileiros", "Realismo"] },
  // José de Alencar (1829-1877)
  { id: "bn000071", title: "Iracema",                         author: "José de Alencar",       year: 1865, genres: ["Romance", "Clássicos Brasileiros", "Indianismo"] },
  { id: "bn000072", title: "O Guarani",                       author: "José de Alencar",       year: 1857, genres: ["Romance", "Clássicos Brasileiros", "Indianismo"] },
  { id: "bn000073", title: "Senhora",                         author: "José de Alencar",       year: 1875, genres: ["Romance", "Clássicos Brasileiros"] },
  { id: "bn000078", title: "Lucíola",                         author: "José de Alencar",       year: 1862, genres: ["Romance", "Clássicos Brasileiros", "Romantismo"] },
  { id: "bn000079", title: "Diva",                            author: "José de Alencar",       year: 1864, genres: ["Romance", "Clássicos Brasileiros", "Romantismo"] },
  { id: "bn000080", title: "Til",                             author: "José de Alencar",       year: 1872, genres: ["Romance", "Clássicos Brasileiros", "Regionalismo"] },
  { id: "bn000081", title: "O Sertanejo",                     author: "José de Alencar",       year: 1875, genres: ["Romance", "Clássicos Brasileiros", "Regionalismo"] },
  { id: "bn000091", title: "Ubirajara",                       author: "José de Alencar",       year: 1874, genres: ["Romance", "Clássicos Brasileiros", "Indianismo"] },
  { id: "bn000092", title: "As Minas de Prata",               author: "José de Alencar",       year: 1865, genres: ["Romance", "Clássicos Brasileiros", "Histórico"] },
  { id: "bn000093", title: "Sonhos D'Ouro",                   author: "José de Alencar",       year: 1872, genres: ["Romance", "Clássicos Brasileiros", "Romantismo"] },
  { id: "bn000094", title: "Encarnação",                      author: "José de Alencar",       year: 1877, genres: ["Romance", "Clássicos Brasileiros", "Romantismo"] },
  // Aluísio Azevedo (1857-1913)
  { id: "bn000074", title: "O Cortiço",                       author: "Aluísio Azevedo",       year: 1890, genres: ["Romance", "Clássicos Brasileiros", "Naturalismo"] },
  { id: "bn000095", title: "O Mulato",                        author: "Aluísio Azevedo",       year: 1881, genres: ["Romance", "Clássicos Brasileiros", "Naturalismo"] },
  { id: "bn000096", title: "Casa de Pensão",                  author: "Aluísio Azevedo",       year: 1884, genres: ["Romance", "Clássicos Brasileiros", "Naturalismo"] },
  { id: "bn000097", title: "O Livro de uma Sogra",            author: "Aluísio Azevedo",       year: 1895, genres: ["Romance", "Clássicos Brasileiros", "Humor"] },
  // Castro Alves (1847-1871)
  { id: "bn000075", title: "O Navio Negreiro",                author: "Castro Alves",          year: 1880, genres: ["Poesia", "Clássicos Brasileiros", "Abolicionista"] },
  { id: "bn000098", title: "Espumas Flutuantes",              author: "Castro Alves",          year: 1870, genres: ["Poesia", "Clássicos Brasileiros", "Romantismo"] },
  { id: "bn000099", title: "Hinos do Equador",                author: "Castro Alves",          year: 1875, genres: ["Poesia", "Clássicos Brasileiros", "Abolicionista"] },
  { id: "bn000100", title: "Gonzaga ou a Revolução de Minas", author: "Castro Alves",          year: 1875, genres: ["Poesia", "Clássicos Brasileiros", "Histórico"] },
  // Álvares de Azevedo (1831-1852)
  { id: "bn000076", title: "Noite na Taverna",                author: "Álvares de Azevedo",    year: 1855, genres: ["Conto", "Clássicos Brasileiros", "Romantismo Gótico"] },
  { id: "bn000101", title: "Lira dos Vinte Anos",             author: "Álvares de Azevedo",    year: 1853, genres: ["Poesia", "Clássicos Brasileiros", "Romantismo"] },
  { id: "bn000102", title: "Macário",                         author: "Álvares de Azevedo",    year: 1855, genres: ["Drama", "Clássicos Brasileiros", "Romantismo"] },
  // Outros autores brasileiros
  { id: "bn000077", title: "A Moreninha",                     author: "Joaquim Manuel de Macedo", year: 1844, genres: ["Romance", "Clássicos Brasileiros", "Romantismo"] },
  { id: "bn000103", title: "O Moço Loiro",                    author: "Joaquim Manuel de Macedo", year: 1845, genres: ["Romance", "Clássicos Brasileiros", "Romantismo"] },
  { id: "bn000104", title: "Os Dois Amores",                  author: "Joaquim Manuel de Macedo", year: 1848, genres: ["Romance", "Clássicos Brasileiros", "Romantismo"] },
  { id: "bn000105", title: "Marília de Dirceu",               author: "Tomás Antônio Gonzaga",  year: 1792, genres: ["Poesia", "Clássicos Brasileiros", "Arcadismo"] },
  { id: "bn000106", title: "Cartas Chilenas",                 author: "Tomás Antônio Gonzaga",  year: 1789, genres: ["Poesia", "Clássicos Brasileiros", "Sátira"] },
  { id: "bn000107", title: "O Uruguay",                       author: "Basílio da Gama",        year: 1769, genres: ["Poesia", "Clássicos Brasileiros", "Épico"] },
  { id: "bn000108", title: "Caramuru",                        author: "Frei José de Santa Rita Durão", year: 1781, genres: ["Poesia", "Clássicos Brasileiros", "Épico"] },
  { id: "bn000109", title: "I-Juca-Pirama",                   author: "Gonçalves Dias",         year: 1851, genres: ["Poesia", "Clássicos Brasileiros", "Indianismo"] },
  { id: "bn000110", title: "Os Timbiras",                     author: "Gonçalves Dias",         year: 1857, genres: ["Poesia", "Clássicos Brasileiros", "Épico"] },
  { id: "bn000111", title: "Primeiros Cantos",                author: "Gonçalves Dias",         year: 1846, genres: ["Poesia", "Clássicos Brasileiros", "Romantismo"] },
  { id: "bn000112", title: "As Primaveras",                   author: "Casimiro de Abreu",      year: 1859, genres: ["Poesia", "Clássicos Brasileiros", "Romantismo"] },
  { id: "bn000113", title: "Suspiros Poéticos e Saudades",    author: "Gonçalves de Magalhães", year: 1836, genres: ["Poesia", "Clássicos Brasileiros", "Romantismo"] },
  { id: "bn000114", title: "A Confederação dos Tamoios",      author: "Gonçalves de Magalhães",  year: 1856, genres: ["Poesia", "Clássicos Brasileiros", "Épico"] },
  { id: "bn000115", title: "A Escrava Isaura",                author: "Bernardo Guimarães",     year: 1875, genres: ["Romance", "Clássicos Brasileiros", "Romantismo"] },
  { id: "bn000116", title: "O Seminarista",                   author: "Bernardo Guimarães",     year: 1872, genres: ["Romance", "Clássicos Brasileiros", "Romantismo"] },
  { id: "bn000117", title: "Inocência",                       author: "Visconde de Taunay",     year: 1872, genres: ["Romance", "Clássicos Brasileiros", "Regionalismo"] },
  { id: "bn000118", title: "O Ateneu",                        author: "Raul Pompeia",           year: 1888, genres: ["Romance", "Clássicos Brasileiros", "Realismo"] },
  { id: "bn000119", title: "Canções Sem Palavras",            author: "Raul Pompeia",           year: 1881, genres: ["Conto", "Clássicos Brasileiros", "Realismo"] }
];

const DP_URL_TEMPLATE = "http://www.dominiopublico.gov.br/download/texto/{id}.txt";

// Presets de gradientes caso a geração de imagem falhe
const GRADIENT_PRESETS = [
  "from-stone-900 via-red-950 to-neutral-900",
  "from-emerald-950 via-teal-900 to-zinc-950",
  "from-amber-950 via-stone-900 to-zinc-950",
  "from-cyan-950 via-zinc-900 to-emerald-950",
  "from-orange-950 via-amber-900 to-stone-950"
];

// Helper para obter gradiente aleatório
function getRandomGradient() {
  return GRADIENT_PRESETS[Math.floor(Math.random() * GRADIENT_PRESETS.length)];
}

// Logger com timestamp
function log(msg, type = "INFO") {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${type}] ${msg}`);
}

// ============================================================================
// PERSISTÊNCIA DE PROGRESSO — progress.json
// ============================================================================
function loadProgress() {
  if (fs.existsSync(PROGRESS_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8'));
    } catch (e) {
      log(`Erro ao carregar progress.json: ${e.message}. Reinicializando.`, "WARN");
    }
  }
  // Estrutura padrão do progresso
  return {
    // Obras do Gutenberg: { bookId: { en: true, "pt-br": true, ... } }
    books: {},
    // Contos: { contoId: { "pt-br": true, ... } }
    stories: {},
    // Títulos descobertos automaticamente (auto-discovery)
    discoveredWorks: [],
    // Último timestamp de auto-discovery
    lastDiscoveryTimestamp: null,
    // Total de ciclos executados
    totalCycles: 0,
    // Contagem de contos por persona (para round-robin)
    personaCounts: {},
    // Timestamp do último deploy automático
    lastDeployTimestamp: null
  };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf-8');
}

// ============================================================================
// HELPER: Parsear JSON de respostas do LLM
// ============================================================================
function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error("Não foi possível encontrar chaves { } no texto da resposta.");
  }
  const jsonStr = text.substring(start, end + 1);

  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    log(`Erro no parsing de JSON puro: ${err.message}. Tentando recuperação via regex...`, "WARN");
  }

  // Fallback via regex
  try {
    const titleMatch = jsonStr.match(/"title"\s*:\s*"([\s\S]*?)"\s*,\s*"/);
    const contentMatch = jsonStr.match(/"content"\s*:\s*"([\s\S]*?)"\s*,\s*"imagePrompt"/) ||
                         jsonStr.match(/"content"\s*:\s*"([\s\S]*?)"\s*(?=,\s*"imagePrompt"|})/) ;
    const imagePromptMatch = jsonStr.match(/"imagePrompt"\s*:\s*"([\s\S]*?)"\s*}/) ||
                             jsonStr.match(/"imagePrompt"\s*:\s*"([\s\S]*?)"/);

    if (titleMatch && contentMatch && imagePromptMatch) {
      log("Recuperação do JSON via Regex bem-sucedida!", "INFO");
      return {
        title: titleMatch[1].trim(),
        content: contentMatch[1].trim(),
        imagePrompt: imagePromptMatch[1].trim()
      };
    }
  } catch (regexErr) {
    log(`Falha na recuperação por regex: ${regexErr.message}`, "ERROR");
  }

  throw new Error("Falha ao parsear o JSON retornado pelo modelo.");
}

// ============================================================================
// HELPER: Baixar imagem externa e salvar localmente
// ============================================================================
async function downloadImage(url, destPath) {
  log(`Baixando imagem de ${url} para salvar em ${destPath}...`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro ao baixar imagem: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(destPath, buffer);
    log(`Imagem salva localmente com sucesso!`);
    return true;
  } catch (err) {
    log(`Falha ao baixar imagem localmente: ${err.message}`, "WARN");
    return false;
  }
}

// Criar pasta de covers se não existir
if (!fs.existsSync(COVERS_DIR)) {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
  log(`Diretório de capas criado em: ${COVERS_DIR}`);
}

// Criar pasta de downloads se não existir
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  log(`Diretório de downloads criado em: ${DOWNLOADS_DIR}`);
}

// ============================================================================
// CHAMADAS DE API DE IA LOCAL
// ============================================================================

async function callLocalLLM(systemPrompt, userPrompt, maxTokens = 1500) {
  log(`Enviando prompt ao LM Studio (Gemma-4 Uncensored)...`);
  try {
    const response = await fetch(LM_STUDIO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Erro na API do LM Studio: ${response.status} ${response.statusText} - Detalhes: ${errorBody}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (err) {
    log(`Falha ao conectar ou processar no LM Studio: ${err.message}`, "ERROR");
    throw err;
  }
}

async function callStableDiffusion(prompt, imagePath) {
  log(`Enviando prompt de imagem ao Stable Diffusion local (${SD_API_URL})...`);
  try {
    const response = await fetch(SD_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        negative_prompt: "easynegative, worst quality, low quality, normal quality, bad anatomy, bad hands, bad eyes, blurry, text, watermark, signature",
        steps: 20,
        cfg_scale: 7.0,
        width: 512,
        height: 768,
        sampler_name: "Euler a",
        output_format: "webp"
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Stable Diffusion: ${response.status}`);
    }

    const data = await response.json();
    if (data.images && data.images.length > 0) {
      const base64Image = data.images[0];
      fs.writeFileSync(imagePath, Buffer.from(base64Image, 'base64'));
      log(`Ilustração salva com sucesso em: ${imagePath}`);
      return true;
    } else {
      throw new Error("Nenhuma imagem retornada pelo Stable Diffusion.");
    }
  } catch (err) {
    log(`Falha no Stable Diffusion: ${err.message}. Usando fallback sem imagem.`, "WARN");
    return false;
  }
}

// ============================================================================
// BUSCAS DE APIs DE TERCEIROS (Project Gutenberg e Open Library)
// ============================================================================

async function fetchGutenbergBook(bookId) {
  const url = `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`;
  log(`Buscando texto da obra ID ${bookId} no Project Gutenberg...`);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) {
      throw new Error(`Erro ao baixar livro: ${response.status}`);
    }
    return await response.text();
  } catch (err) {
    log(`Falha ao baixar do Gutenberg: ${err.message}`, "ERROR");
    throw err;
  }
}

async function fetchOpenLibraryCover(title, author) {
  log(`Buscando capa da edição histórica (vintage) para "${title}" de ${author} na Open Library...`);
  try {
    const searchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&sort=old`;
    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error("Erro na busca da Open Library.");

    const searchData = await response.json();
    if (searchData.docs && searchData.docs.length > 0) {
      const doc = searchData.docs[0];
      if (doc.cover_i) {
        const coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
        log(`Capa encontrada para "${title}": ${coverUrl}`);
        return coverUrl;
      }
      if (doc.isbn && doc.isbn.length > 0) {
        const coverUrl = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
        log(`Capa encontrada via ISBN para "${title}": ${coverUrl}`);
        return coverUrl;
      }
    }
    log(`Nenhuma capa encontrada na Open Library para "${title}".`, "INFO");
  } catch (err) {
    log(`Falha ao obter capa da Open Library: ${err.message}`, "WARN");
  }
  return null;
}

async function fetchDominioPublicoBook(dpId, workTitle, workAuthor) {
  const url = DP_URL_TEMPLATE.replace('{id}', dpId);
  log(`Buscando texto da obra ID ${dpId} no Domínio Público...`);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }
    const text = await response.text();
    let cleanText = text;
    const dpStart = text.indexOf("===|===|===");
    if (dpStart !== -1) {
      cleanText = text.substring(dpStart + 11);
    }
    const dpEnd = cleanText.indexOf("===|===|===");
    if (dpEnd !== -1) {
      cleanText = cleanText.substring(0, dpEnd);
    }
    return cleanText.trim();
  } catch (err) {
    log(`Falha no DP: ${err.message}. Buscando fallback no Gutendex (pt)...`, "WARN");
    // Fallback: busca a obra no Gutendex em português
    try {
      const searchUrl = `https://gutendex.com/books/?languages=pt&search=${encodeURIComponent(workTitle)}`;
      const searchRes = await fetch(searchUrl);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.results && searchData.results.length > 0) {
          const gutenbergId = searchData.results[0].id;
          log(`Fallback: encontrada obra #${gutenbergId} no Gutenberg (pt). Baixando...`);
          const gutenText = await fetchGutenbergBook(gutenbergId);
          return cleanGutenbergText(gutenText);
        }
      }
    } catch (fallbackErr) {
      log(`Fallback também falhou: ${fallbackErr.message}`, "WARN");
    }
    throw new Error(`Não foi possível baixar "${workTitle}" de nenhuma fonte.`);
  }
}

async function fetchDominioPublicoSearch() {
  log("Buscando obras populares no Domínio Público via Gutendex (idioma pt)...");
  try {
    // Usa Gutendex para encontrar obras em português como fallback
    const url = 'https://gutendex.com/books/?languages=pt&copyright=true&sort=popular&page=1';
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Gutendex PT search error: ${response.status}`);
    const data = await response.json();
    return data.results || [];
  } catch (err) {
    log(`Falha na busca Gutendex PT: ${err.message}`, "WARN");
    return [];
  }
}

// ============================================================================
// HELPER: Dividir texto completo em segmentos de ~4000 caracteres
// ============================================================================
function splitIntoChunks(fullText, chunkSize = 4000) {
  const chunks = [];
  for (let i = 0; i < fullText.length; i += chunkSize) {
    chunks.push(fullText.substring(i, i + chunkSize));
  }
  return chunks;
}

function getChunkProgress(progress, bookId, totalChunks) {
  if (!progress.books[bookId]) progress.books[bookId] = {};
  const bp = progress.books[bookId];
  if (!bp.chunks) {
    // Inicializa chunks como false (não traduzido) para cada idioma
    bp.chunks = {};
    for (const lang of LANGUAGES) {
      bp.chunks[lang.code] = new Array(totalChunks).fill(false);
    }
  }
  if (!bp.totalChunks) bp.totalChunks = totalChunks;
  return bp;
}

function isBookFullyTranslated(progress, bookId, langCode) {
  const bp = progress.books[bookId];
  if (!bp || !bp.chunks || !bp.chunks[langCode]) return false;
  return bp.chunks[langCode].every(done => done === true);
}

function getNextUntranslatedChunk(progress, bookId, langCode) {
  const bp = progress.books[bookId];
  if (!bp || !bp.chunks || !bp.chunks[langCode]) return -1;
  const chunks = bp.chunks[langCode];
  for (let i = 0; i < chunks.length; i++) {
    if (!chunks[i]) return i;
  }
  return -1;
}

// ============================================================================
// AUTO-DISCOVERY — Buscar novos títulos (Gutenberg + Domínio Público)
// ============================================================================
async function discoverNewWorks(progress) {
  log("=================================================");
  log("INICIANDO AUTO-DISCOVERY (Gutenberg + Domínio Público)", "DISCOVERY");
  log("=================================================");

  let newCount = 0;

  // ---- ETAPA 1: Gutenberg (EN) ----
  try {
    const url = 'https://gutendex.com/books/?sort=popular&languages=en&copyright=true&page=1';
    log(`Consultando catálogo Gutendex EN: ${url}`);
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const existingIds = new Set([
          ...GUTENBERG_WORKS.map(w => w.id),
          ...(progress.discoveredWorks || []).map(w => w.id)
        ]);

        for (const book of data.results) {
          if (existingIds.has(book.id)) continue;

          const deathYear = book.authors && book.authors.length > 0 ? book.authors[0].death_year : null;
          if (!deathYear || deathYear >= 1954) continue;

          const authorName = book.authors && book.authors.length > 0 ? book.authors[0].name : "Unknown";
          const birthYear = book.authors && book.authors.length > 0 ? book.authors[0].birth_year : null;
          const subjects = book.subjects || [];
          const genres = subjects.slice(0, 3).map(s => {
            if (s.toLowerCase().includes('fiction')) return 'Ficção';
            if (s.toLowerCase().includes('horror')) return 'Terror';
            if (s.toLowerCase().includes('science')) return 'Ficção Científica';
            if (s.toLowerCase().includes('adventure')) return 'Aventura';
            if (s.toLowerCase().includes('romance')) return 'Romance';
            if (s.toLowerCase().includes('mystery')) return 'Mistério';
            return 'Clássicos';
          });

          const newWork = {
            id: book.id,
            title: book.title.split(';')[0].split(':')[0].trim(),
            author: authorName.split(',').reverse().join(' ').trim(),
            year: birthYear ? birthYear + 25 : 1850,
            genres: [...new Set(genres), 'Clássicos'],
            discovered: true,
            source: 'gutenberg'
          };

          progress.discoveredWorks.push(newWork);
          existingIds.add(book.id);
          newCount++;
          log(`Descoberta Gutenberg: "${newWork.title}" por ${newWork.author} (#${newWork.id})`);
          if (newCount >= 5) break;
        }
      }
    }
  } catch (err) {
    log(`Falha no Auto-Discovery Gutenberg: ${err.message}`, "WARN");
  }

  // ---- ETAPA 2: Domínio Público (PT-BR) ----
  try {
    const dpResults = await fetchDominioPublicoSearch();
    const existingDpIds = new Set([
      ...DOMINIO_PUBLICO_WORKS.map(w => w.id),
      ...(progress.discoveredWorks || []).map(w => w.id)
    ]);

    for (const book of dpResults) {
      const dpId = `dp-auto-${book.id}`;
      if (existingDpIds.has(dpId)) continue;

      const deathYear = book.authors && book.authors.length > 0 ? book.authors[0].death_year : null;
      if (!deathYear || deathYear >= 1954) continue;

      const authorName = book.authors && book.authors.length > 0 ? book.authors[0].name : "Unknown";
      const subjects = book.subjects || [];
      const genres = subjects.slice(0, 2).map(s => {
        if (s.toLowerCase().includes('romance')) return 'Romance';
        if (s.toLowerCase().includes('conto')) return 'Conto';
        if (s.toLowerCase().includes('poesia')) return 'Poesia';
        return 'Clássicos Brasileiros';
      });

      const newWork = {
        id: dpId,
        title: book.title.split(';')[0].split(':')[0].trim(),
        author: authorName.split(',').reverse().join(' ').trim(),
        year: 1880,
        genres: [...new Set(genres), 'Clássicos Brasileiros'],
        discovered: true,
        source: 'dominio-publico'
      };

      progress.discoveredWorks.push(newWork);
      existingDpIds.add(dpId);
      newCount++;
      log(`Descoberta DP: "${newWork.title}" por ${newWork.author} (pt-br)`);
      if (newCount >= 10) break;
    }
  } catch (err) {
    log(`Falha no Auto-Discovery DP: ${err.message}`, "WARN");
  }

  progress.lastDiscoveryTimestamp = new Date().toISOString();
  saveProgress(progress);
  log(`Auto-Discovery concluído: ${newCount} novas obras adicionadas ao catálogo.`);
}

// ============================================================================
// HELPER: Limpar texto do Gutenberg
// ============================================================================
function cleanGutenbergText(rawText) {
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

// ============================================================================
// HELPER: Obter título localizado
// ============================================================================
function getLocalizedTitle(originalTitle, langCode) {
  if (TITLE_MAP[originalTitle] && TITLE_MAP[originalTitle][langCode]) {
    return TITLE_MAP[originalTitle][langCode];
  }
  return originalTitle; // Fallback ao título original
}

// ============================================================================
// ESTEIRA A: DOMÍNIO PÚBLICO — OBRAS COMPLETAS POR BLOCOS (Multi-Idioma)
// ============================================================================
async function runEsteiraA(progress) {
  log("=================================================");
  log("INICIANDO ESTEIRA A (Obras Completas — Blocos de 4k)", "ESTEIRA_A");
  log("=================================================");

  try {
    // Combina catálogos fixos + descobertas
    const gutenbergWorks = GUTENBERG_WORKS.map(w => ({ ...w, source: 'gutenberg' }));
    const dpWorks = DOMINIO_PUBLICO_WORKS.map(w => ({ ...w, source: 'dominio-publico' }));
    const allWorks = [...gutenbergWorks, ...dpWorks, ...(progress.discoveredWorks || [])];

    // 1. PROCURAR TRADUÇÃO PENDENTE (bloco incompleto)
    let targetWork = null;
    let targetLang = null;
    let targetChunkIndex = -1;

    for (const work of allWorks) {
      if (work.year >= 1929) continue;
      const bookId = work.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const bp = progress.books[bookId];

      // Se tem chunks, busca o próximo bloco não traduzido
      if (bp && bp.chunks) {
        for (const lang of LANGUAGES) {
          if (!bp.chunks[lang.code]) continue;
          const idx = getNextUntranslatedChunk(progress, bookId, lang.code);
          if (idx !== -1) {
            targetWork = work;
            targetLang = lang;
            targetChunkIndex = idx;
            break;
          }
        }
        if (targetWork) break;
      }
    }

    // 2. Se nenhum bloco pendente, procura livro não iniciado (sem chunks)
    if (!targetWork) {
      for (const work of allWorks) {
        if (work.year >= 1929) continue;
        const bookId = work.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const bp = progress.books[bookId];

        // Se já tem chunks (mesmo que completos), pula
        if (bp && bp.chunks) continue;

        targetWork = work;
        targetLang = null; // Vai iniciar: baixar texto completo e criar chunks
        break;
      }
    }

    if (!targetWork) {
      log("✅ Todas as obras completas em todos os idiomas! Verificando Auto-Discovery...", "ESTEIRA_A");
      const lastDiscovery = progress.lastDiscoveryTimestamp ? new Date(progress.lastDiscoveryTimestamp) : null;
      const hoursSinceDiscovery = lastDiscovery ? (Date.now() - lastDiscovery.getTime()) / (1000 * 60 * 60) : 999;

      if (hoursSinceDiscovery > 6) {
        await discoverNewWorks(progress);
      } else {
        log(`Auto-Discovery já executado há ${hoursSinceDiscovery.toFixed(1)}h.`, "ESTEIRA_A");
      }
      return;
    }

    const bookId = targetWork.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const source = targetWork.source || 'gutenberg';
    const isDp = source === 'dominio-publico';

    // Idioma original da obra
    const ORIGINAL_LANG = isDp ? 'pt-br' : 'en';

    log(`Processando: "${targetWork.title}" [${source}] (${bookId})`, "ESTEIRA_A");
    log(`Validação de Domínio Público: OK! (${targetWork.year})`);

    // Carrega JSON atual
    let livrosMock = [];
    if (fs.existsSync(LIVROS_MOCK_PATH)) {
      livrosMock = JSON.parse(fs.readFileSync(LIVROS_MOCK_PATH, 'utf-8'));
    }

    // ======================================================================
    // CASO 1: NOVO LIVRO — Baixar texto completo, TODOS os chunks do original
    // ======================================================================
    if (targetLang === null) {
      log(`DOWNLOAD do texto completo de "${targetWork.title}"...`, "ESTEIRA_A");

      let fullText;
      const originalDownloadPath = path.join(DOWNLOADS_DIR, `${bookId}-${ORIGINAL_LANG}.txt`);

      if (fs.existsSync(originalDownloadPath)) {
        fullText = fs.readFileSync(originalDownloadPath, 'utf-8');
        log(`Texto original já existe: ${originalDownloadPath}`);
      } else if (isDp) {
        const rawText = await fetchDominioPublicoBook(targetWork.id, targetWork.title, targetWork.author);
        fullText = rawText;
        fs.writeFileSync(originalDownloadPath, fullText, 'utf-8');
        log(`Texto original DP salvo: ${originalDownloadPath}`);
      } else {
        const rawText = await fetchGutenbergBook(targetWork.id);
        fullText = cleanGutenbergText(rawText);
        fs.writeFileSync(originalDownloadPath, fullText, 'utf-8');
        log(`Texto original Gutenberg salvo: ${originalDownloadPath}`);
      }

      // Salvar sem sufixo para compatibilidade
      const legacyPath = path.join(DOWNLOADS_DIR, `${bookId}.txt`);
      if (!fs.existsSync(legacyPath)) {
        fs.copyFileSync(originalDownloadPath, legacyPath);
      }

      // Dividir em chunks de ~4000 caracteres
      const chunks = splitIntoChunks(fullText, 4000);
      log(`Texto completo dividido em ${chunks.length} blocos de ~4000 caracteres.`);

      // Inicializar progresso dos chunks
      const bp = getChunkProgress(progress, bookId, chunks.length);

      // IDIOMA ORIGINAL: marcar TODOS os chunks como concluídos e concatenar
      let fullOriginalText = '';
      for (let i = 0; i < chunks.length; i++) {
        bp.chunks[ORIGINAL_LANG][i] = true;
        fullOriginalText += chunks[i] + '\n\n';
        const chunkPath = path.join(DOWNLOADS_DIR, `${bookId}-${ORIGINAL_LANG}.chunk.${i}.txt`);
        fs.writeFileSync(chunkPath, chunks[i], 'utf-8');
      }
      fullOriginalText = fullOriginalText.trim();

      // Salvar texto completo do idioma original
      fs.writeFileSync(originalDownloadPath, fullOriginalText, 'utf-8');
      fs.writeFileSync(legacyPath, fullOriginalText, 'utf-8');
      log(`Texto COMPLETO do idioma original (${ORIGINAL_LANG}) disponível: ${fullOriginalText.length} caracteres.`);

      // Gerar sinopse no idioma original
      let synopsis;
      if (isDp) {
        const sys = `Você é um crítico literário. Escreva uma sinopse cativante e curta em português brasileiro para a obra clássica "${targetWork.title}" de ${targetWork.author}. Retorne apenas a sinopse.`;
        synopsis = await callLocalLLM(sys, `Crie a sinopse em português brasileiro.`);
      } else {
        const sys = `You are a literary critic. Write a captivating, short synopsis in English for "${targetWork.title}" by ${targetWork.author}. Return only the synopsis.`;
        synopsis = await callLocalLLM(sys, `Write a synopsis.`);
      }
      log(`Sinopse ${ORIGINAL_LANG} gerada.`);

      // Gerar sinopse em pt-br
      let synopsisPtBr = synopsis;
      if (!isDp) {
        const sysPt = `Você é um crítico literário. Escreva uma sinopse cativante e curta em português brasileiro para "${targetWork.title}" de ${targetWork.author}. Retorne apenas a sinopse.`;
        synopsisPtBr = await callLocalLLM(sysPt, `Crie a sinopse em pt-br.`);
      }

      // Buscar capa
      let localCoverImage = undefined;
      const existingBook = livrosMock.find(b => b.id === bookId);
      if (!existingBook || !existingBook.coverImage) {
        const coverUrl = await fetchOpenLibraryCover(targetWork.title, targetWork.author);
        if (coverUrl) {
          const ext = coverUrl.split('.').pop() || 'jpg';
          const filename = `cover-${bookId}.${ext}`;
          const imagePath = path.join(COVERS_DIR, filename);
          if (await downloadImage(coverUrl, imagePath)) {
            localCoverImage = `/covers/${filename}`;
          }
        }
      } else {
        localCoverImage = existingBook.coverImage;
      }

      // Montar objeto do livro com texto COMPLETO no original
      const primaryTitle = getLocalizedTitle(targetWork.title, 'pt-br');
      const searchQuery = `${primaryTitle} ${targetWork.author}`;
      const affLinkBR = `https://www.amazon.com.br/s?k=${encodeURIComponent(searchQuery)}&tag=${AMAZON_TAG_BR}`;
      const affLinkPT = `https://www.amazon.es/s?k=${encodeURIComponent(searchQuery)}&tag=${AMAZON_TAG_PT}`;

      // translations: só o original fica completo; demais idiomas AUSENTES → "Em breve"
      const translations = {};
      translations[ORIGINAL_LANG] = {
        title: getLocalizedTitle(targetWork.title, ORIGINAL_LANG),
        synopsis: synopsis,
        fullText: fullOriginalText,
        downloadFile: `/downloads/${bookId}-${ORIGINAL_LANG}.txt`
      };
      if (!isDp) {
        translations['pt-br'] = {
          title: primaryTitle,
          synopsis: synopsisPtBr,
          fullText: fullOriginalText,
          downloadFile: `/downloads/${bookId}-pt-br.txt`
        };
      }

      const newBook = {
        id: bookId,
        title: primaryTitle,
        author: targetWork.author,
        year: targetWork.year,
        genres: targetWork.genres,
        rating: existingBook ? existingBook.rating : 4.8,
        coverGradient: existingBook ? existingBook.coverGradient : getRandomGradient(),
        coverImage: localCoverImage || (existingBook ? existingBook.coverImage : undefined),
        synopsis: isDp ? synopsis : synopsisPtBr,
        fullText: fullOriginalText,
        downloadFile: `/downloads/${bookId}.txt`,
        translations: translations,
        isFullTextComplete: true,
        editions: existingBook ? existingBook.editions : [
          {
            id: `ed-${bookId}-physical`,
            publisher: "Edição Física Recomendada",
            year: targetWork.year,
            isbn: `978-3161484${bookId.replace(/[^0-9]/g, '').substring(0, 6) || String(targetWork.id)}`,
            pages: Math.floor(Math.random() * 200) + 150,
            coverType: "Brochura Clássica",
            priceBR: 29.90,
            pricePT: 8.99,
            linkBR: affLinkBR,
            linkPT: affLinkPT
          }
        ],
        reviews: existingBook ? existingBook.reviews : [
          {
            id: `rev-${bookId}-gut`,
            username: "leitor_gutenberg",
            rating: 5,
            date: new Date().toISOString().split('T')[0],
            text: `Edição completa traduzida localmente por IA. A leitura flui de forma incrível no e-reader!`
          }
        ]
      };

      const bookIndex = livrosMock.findIndex(b => b.id === bookId);
      if (bookIndex !== -1) {
        livrosMock[bookIndex] = { ...livrosMock[bookIndex], ...newBook };
        log(`Livro "${newBook.title}" atualizado (iniciado blocos).`);
      } else {
        livrosMock.push(newBook);
        log(`Novo livro "${newBook.title}" inserido (iniciado blocos).`);
      }

      fs.writeFileSync(LIVROS_MOCK_PATH, JSON.stringify(livrosMock, null, 2), 'utf-8');
      saveProgress(progress);
      log(`Progresso salvo: ${bookId} → bloco 0/${ORIGINAL_LANG} ✅`);
      return;
    }

    // ======================================================================
    // CASO 2: TRADUZIR PRÓXIMO BLOCO PENDENTE
    // ======================================================================
    const localizedTitle = getLocalizedTitle(targetWork.title, targetLang.code);
    log(`Traduzindo bloco #${targetChunkIndex}: "${targetWork.title}" → ${targetLang.flag} ${targetLang.name}`, "ESTEIRA_A");

    // Carregar texto completo original e dividir em chunks
    const originalDownloadPath = path.join(DOWNLOADS_DIR, `${bookId}-${ORIGINAL_LANG}.txt`);
    const fullOriginalText = fs.readFileSync(originalDownloadPath, 'utf-8');
    const chunks = splitIntoChunks(fullOriginalText, 4000);
    const chunkToTranslate = chunks[targetChunkIndex];

    let translatedChunk;

    if (targetLang.code === ORIGINAL_LANG) {
      translatedChunk = chunkToTranslate;
      const bp = progress.books[bookId];
      if (bp && bp.chunks) {
        bp.chunks[ORIGINAL_LANG][targetChunkIndex] = true;
      }
      log(`Bloco #${targetChunkIndex} copiado (idioma original).`);
    } else {
      let langInstruction;

      if (ORIGINAL_LANG === 'en') {
        const langMap = {
          'pt-br': { from: "do inglês para o português brasileiro" },
          'pt-pt': { from: "do inglês para o português europeu" },
          'es':    { from: "del inglés al español" },
          'fr':    { from: "de l'anglais vers le français" }
        };
        langInstruction = langMap[targetLang.code]?.from || targetLang.translateFrom;
      } else {
        const langMap = {
          'en':  { from: "do português brasileiro para o inglês" },
          'pt-pt': { from: "do português brasileiro para o português europeu" },
          'es':    { from: "do português brasileiro para o espanhol" },
          'fr':    { from: "do português brasileiro para o francês" }
        };
        langInstruction = langMap[targetLang.code]?.from || `do português brasileiro para ${targetLang.name}`;
      }

      const systemPrompt = `Você é um tradutor literário experiente. Traduza o texto a seguir ${langInstruction} de forma muito fiel e artística, mantendo o tom clássico e a profundidade da obra original. Retorne APENAS o texto traduzido, sem introduções ou explicações.`;

      const userPrompt = `Traduza o seguinte segmento (bloco ${targetChunkIndex + 1}/${chunks.length}) da obra "${targetWork.title}":\n\n${chunkToTranslate}`;

      translatedChunk = await callLocalLLM(systemPrompt, userPrompt);
      log(`Bloco #${targetChunkIndex} traduzido para ${targetLang.code}.`);

      const bp = progress.books[bookId];
      if (bp && bp.chunks) {
        bp.chunks[targetLang.code][targetChunkIndex] = true;
      }

      // Se for o primeiro bloco, gerar sinopse no idioma alvo
      if (targetChunkIndex === 0) {
        let synopsisLang = {
          'en': 'Write a captivating short synopsis in English. Return only the synopsis.',
          'pt-br': 'Escreva uma sinopse cativante e curta em português brasileiro. Retorne apenas a sinopse.',
          'pt-pt': 'Escreva uma sinopse cativante e curta em português europeu. Retorne apenas a sinopse.',
          'es': 'Escribe una sinopsis cautivadora y corta en español. Devuelve solo la sinopsis.',
          'fr': 'Écrivez un synopsis captivant et court en français. Retournez uniquement le synopsis.'
        };
        const synSysPrompt = `Você é um crítico literário. ${synopsisLang[targetLang.code]} para a obra "${targetWork.title}" de ${targetWork.author}.`;
        try {
          const newSynopsis = await callLocalLLM(synSysPrompt, `Crie a sinopse.`);
          // Atualizar no livros-mock
          let livrosMock = [];
          if (fs.existsSync(LIVROS_MOCK_PATH)) {
            livrosMock = JSON.parse(fs.readFileSync(LIVROS_MOCK_PATH, 'utf-8'));
          }
          const existingBook = livrosMock.find(b => b.id === bookId);
          if (existingBook) {
            if (!existingBook.translations) existingBook.translations = {};
            existingBook.translations[targetLang.code] = {
              ...(existingBook.translations[targetLang.code] || {}),
              title: localizedTitle,
              synopsis: newSynopsis
            };
            fs.writeFileSync(LIVROS_MOCK_PATH, JSON.stringify(livrosMock, null, 2), 'utf-8');
          }
          log(`Sinopse ${targetLang.code} gerada para "${targetWork.title}".`);
        } catch (e) {
          log(`Erro ao gerar sinopse ${targetLang.code}: ${e.message}`, "WARN");
        }
      }
    }

    // Salvar chunk traduzido individualmente
    const chunkFilePath = path.join(DOWNLOADS_DIR, `${bookId}-${targetLang.code}.chunk.${targetChunkIndex}.txt`);
    fs.writeFileSync(chunkFilePath, translatedChunk, 'utf-8');

    // Verificar se o idioma está completo
    const langComplete = isBookFullyTranslated(progress, bookId, targetLang.code);

    if (langComplete) {
      log(`🎉 Idioma ${targetLang.code} COMPLETO para "${targetWork.title}"! Concatenando blocos...`, "ESTEIRA_A");

      // Concatenar todos os chunks deste idioma
      let fullTranslatedText = '';
      const bp = progress.books[bookId];
      const total = bp.totalChunks;
      for (let i = 0; i < total; i++) {
        const chunkPath = path.join(DOWNLOADS_DIR, `${bookId}-${targetLang.code}.chunk.${i}.txt`);
        if (fs.existsSync(chunkPath)) {
          fullTranslatedText += fs.readFileSync(chunkPath, 'utf-8') + '\n\n';
        }
      }

      // Salvar arquivo completo de download
      const langDownloadPath = path.join(DOWNLOADS_DIR, `${bookId}-${targetLang.code}.txt`);
      fs.writeFileSync(langDownloadPath, fullTranslatedText, 'utf-8');
      log(`Arquivo completo salvo: ${langDownloadPath}`);

      // Atualizar livros-mock.json com o texto completo
      const existingBook = livrosMock.find(b => b.id === bookId);
      if (existingBook) {
        if (!existingBook.translations) existingBook.translations = {};
        existingBook.translations[targetLang.code] = {
          title: localizedTitle,
          synopsis: existingBook.translations[targetLang.code]?.synopsis || fullTranslatedText.substring(0, 150) + "...",
          fullText: fullTranslatedText,
          downloadFile: `/downloads/${bookId}-${targetLang.code}.txt`
        };

        // Atualizar fullText principal se for pt-br ou en
        if (targetLang.code === 'pt-br' || (targetLang.code === 'en' && !existingBook.translations['pt-br'])) {
          existingBook.fullText = fullTranslatedText;
          existingBook.synopsis = existingBook.translations[targetLang.code]?.synopsis || existingBook.synopsis;
        }

        // Se todos os 5 idiomas estiverem completos, marcar isFullTextComplete
        const allDone = LANGUAGES.every(l => isBookFullyTranslated(progress, bookId, l.code));
        if (allDone) {
          existingBook.isFullTextComplete = true;
          log(`🎉🎉 OBRA COMPLETA: "${targetWork.title}" em todos os 5 idiomas!`);
        }

        fs.writeFileSync(LIVROS_MOCK_PATH, JSON.stringify(livrosMock, null, 2), 'utf-8');
      }
    }

    saveProgress(progress);
    log(`Progresso: ${bookId} → ${targetLang.code} bloco ${targetChunkIndex + 1}/${progress.books[bookId]?.totalChunks || '?'} ✅`);

  } catch (err) {
    log(`Falha crítica na Esteira A: ${err.message}`, "ERROR");
  }
}

// ============================================================================
// ESTEIRA B: CONTOS DAS PERSONAS — ROUND-ROBIN (Multi-Idioma)
// ============================================================================
async function runEsteiraB(progress) {
  log("=================================================");
  log("INICIANDO ESTEIRA B (Contos — Round-Robin Multi-Idioma)", "ESTEIRA_B");
  log("=================================================");

  try {
    let contosMock = [];
    if (fs.existsSync(CONTOS_MOCK_PATH)) {
      try {
        contosMock = JSON.parse(fs.readFileSync(CONTOS_MOCK_PATH, 'utf-8'));
      } catch (e) {
        log(`Erro ao carregar contos-mock.json: ${e.message}. Reinicializando.`, "WARN");
      }
    }

    // Inicializar personaCounts se não existir
    if (!progress.personaCounts) progress.personaCounts = {};

    // ---- ETAPA 1: TRADUZIR CONTO EXISTENTE PENDENTE ----
    let pendingConto = null;
    let pendingLang = null;

    for (const conto of contosMock) {
      const storyProgress = progress.stories[conto.id] || {};
      for (const lang of LANGUAGES) {
        if (lang.code === 'pt-br') continue;
        if (!storyProgress[lang.code]) {
          pendingConto = conto;
          pendingLang = lang;
          break;
        }
      }
      if (pendingConto) break;
    }

    if (pendingConto && pendingLang) {
      log(`Traduzindo conto existente "${pendingConto.title}" para ${pendingLang.flag} ${pendingLang.name}`, "ESTEIRA_B");

      const sourceText = pendingConto.fullText;
      let translatedContent;
      let translatedTitle;

      if (pendingLang.code === 'en') {
        const sysPrompt = `You are a professional literary translator. Translate the following short story from Portuguese to English, maintaining the artistic quality, tone, and style. Return ONLY the translated text in Markdown format.`;
        translatedContent = await callLocalLLM(sysPrompt, sourceText);
        const titleSysPrompt = `Translate this short story title from Portuguese to English. Return ONLY the translated title, nothing else.`;
        translatedTitle = await callLocalLLM(titleSysPrompt, pendingConto.title);
      } else {
        const sysPrompt = `Você é um tradutor literário. Traduza o seguinte conto do português brasileiro para ${pendingLang.name}. Mantenha a qualidade artística e o tom. Retorne APENAS o texto traduzido em Markdown.`;
        translatedContent = await callLocalLLM(sysPrompt, sourceText);
        const titleSysPrompt = `Traduza este título de conto do português para ${pendingLang.name}. Retorne APENAS o título traduzido.`;
        translatedTitle = await callLocalLLM(titleSysPrompt, pendingConto.title);
      }

      translatedTitle = translatedTitle.replace(/["\n]/g, '').trim();
      log(`Tradução concluída: "${translatedTitle}" (${pendingLang.code})`);

      const contoIndex = contosMock.findIndex(c => c.id === pendingConto.id);
      if (contoIndex !== -1) {
        if (!contosMock[contoIndex].translations) contosMock[contoIndex].translations = {};
        contosMock[contoIndex].translations[pendingLang.code] = {
          title: translatedTitle,
          synopsis: translatedContent.split('\n')[0].replace(/[#*`]/g, '').substring(0, 150) + "...",
          fullText: translatedContent
        };
        if (!contosMock[contoIndex].translations['pt-br']) {
          contosMock[contoIndex].translations['pt-br'] = {
            title: contosMock[contoIndex].title,
            synopsis: contosMock[contoIndex].synopsis,
            fullText: contosMock[contoIndex].fullText
          };
        }
      }

      fs.writeFileSync(CONTOS_MOCK_PATH, JSON.stringify(contosMock, null, 2), 'utf-8');
      log("Arquivo 'src/data/contos-mock.json' atualizado!");

      if (!progress.stories[pendingConto.id]) progress.stories[pendingConto.id] = {};
      progress.stories[pendingConto.id][pendingLang.code] = true;
      progress.stories[pendingConto.id]['pt-br'] = true;
      saveProgress(progress);
      log(`Progresso salvo: ${pendingConto.id} → ${pendingLang.code} ✅`);
      return;
    }

    // ---- ETAPA 2: GERAR NOVO CONTO (ROUND-ROBIN) ----
    log("Nenhuma tradução pendente. Gerando novo conto (Round-Robin)...", "ESTEIRA_B");

    // Contar contos existentes por persona
    const storyCounts = {};
    for (const p of PERSONAS) {
      storyCounts[p.name] = 0;
    }
    for (const conto of contosMock) {
      if (conto.author && storyCounts[conto.author] !== undefined) {
        storyCounts[conto.author]++;
      }
    }

    // Sincronizar com progress.personaCounts
    for (const p of PERSONAS) {
      if (progress.personaCounts[p.name] === undefined) {
        progress.personaCounts[p.name] = storyCounts[p.name] || 0;
      }
    }

    // Encontrar persona com MENOS contos (round-robin)
    let minCount = Infinity;
    let selectedPersona = null;
    for (const p of PERSONAS) {
      const count = progress.personaCounts[p.name] || 0;
      if (count < minCount) {
        minCount = count;
        selectedPersona = p;
      }
    }

    if (!selectedPersona) {
      // Fallback: primeira persona
      selectedPersona = PERSONAS[0];
    }

    log(`Persona selecionada (Round-Robin): ${selectedPersona.name} (${minCount} contos, Gênero: ${selectedPersona.genre}${selectedPersona.isAdult ? " [+18]" : ""})`, "ESTEIRA_B");

    const systemPrompt = `Você é a persona literária ${selectedPersona.name}, autor(a) profissional do gênero ${selectedPersona.genre}.
Seu estilo de escrita é: ${selectedPersona.style}.
Seu tema recorrente é: ${selectedPersona.theme}.

Você deve gerar um conto inédito, imersivo e completo com aproximadamente 800 palavras sobre este tema.
Se a sua persona for categorizada como +18 (romance erótico, terror visceral, etc.), sinta-se livre para incluir descrições sensuais, adultas ou viscerais explícitas sem qualquer filtro, aproveitando a natureza sem censura do seu modelo Gemma-4.

Além disso, forneça um prompt descritivo em inglês (máximo de 20 palavras) para alimentar um gerador de imagem (Stable Diffusion) que ilustrará este conto. O estilo da ilustração deve ser artístico, conceitual e condizente com o tom do conto (ex: pintura a óleo gótica, arte digital cyberpunk, etc.), sem conter textos, marcas d'água ou assinaturas na imagem.

Sua resposta DEVE ser estritamente um objeto JSON válido, sem introdução ou explicações no chat. Formate o JSON com as seguintes propriedades:
{
  "title": "Título criativo do conto em português",
  "content": "Texto completo do conto em português, formatado em markdown com quebras de parágrafo confortáveis e boa UX de leitura",
  "imagePrompt": "Prompt visual detalhado em inglês de até 20 palavras descrevendo a cena principal do conto"
}`;

    const userPrompt = `Escreva um conto inédito de acordo com as especificações da sua persona editorial. Lembre-se de retornar estritamente o objeto JSON.`;

    const rawResponse = await callLocalLLM(systemPrompt, userPrompt);
    const generatedData = extractJson(rawResponse);

    if (!generatedData.title || !generatedData.content || !generatedData.imagePrompt) {
      throw new Error("Modelo não gerou a estrutura JSON completa com title, content e imagePrompt.");
    }

    const storyId = `conto-${selectedPersona.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const filename = `${storyId}.webp`;
    const imagePath = path.join(COVERS_DIR, filename);
    const webpPathInJson = `/covers/${filename}`;

    log(`Conto gerado: "${generatedData.title}". Gênero: ${selectedPersona.genre}.`);
    log(`Prompt de imagem: "${generatedData.imagePrompt}"`);

    const imageSuccess = await callStableDiffusion(generatedData.imagePrompt, imagePath);

    const newConto = {
      id: storyId,
      title: generatedData.title,
      author: selectedPersona.name,
      year: new Date().getFullYear(),
      genres: [selectedPersona.genre, "Original", selectedPersona.isAdult ? "Adulto +18" : "Geral"],
      rating: 5.0,
      coverGradient: getRandomGradient(),
      coverImage: imageSuccess ? webpPathInJson : undefined,
      synopsis: generatedData.content.split('\n')[0].replace(/[#*`]/g, '').substring(0, 150) + "...",
      fullText: generatedData.content,
      translations: {
        'pt-br': {
          title: generatedData.title,
          synopsis: generatedData.content.split('\n')[0].replace(/[#*`]/g, '').substring(0, 150) + "...",
          fullText: generatedData.content
        }
      },
      editions: [],
      reviews: [
        {
          id: `rev-${storyId}-sys`,
          username: "editorial_gargbooks",
          rating: 5,
          date: new Date().toISOString().split('T')[0],
          text: `Conto original gerado pela IA da nossa editora sob a persona de ${selectedPersona.name}. Excelente exploração literária do gênero ${selectedPersona.genre}.`
        }
      ],
      isUserPublished: false
    };

    contosMock.unshift(newConto);
    fs.writeFileSync(CONTOS_MOCK_PATH, JSON.stringify(contosMock, null, 2), 'utf-8');
    log("Arquivo 'src/data/contos-mock.json' atualizado!");

    // Incrementar contagem da persona
    if (!progress.personaCounts[selectedPersona.name]) progress.personaCounts[selectedPersona.name] = 0;
    progress.personaCounts[selectedPersona.name]++;

    if (!progress.stories[storyId]) progress.stories[storyId] = {};
    progress.stories[storyId]['pt-br'] = true;
    saveProgress(progress);

    log(`Persona "${selectedPersona.name}" agora tem ${progress.personaCounts[selectedPersona.name]} contos.`);

  } catch (err) {
    log(`Falha crítica na Esteira B: ${err.message}`, "ERROR");
  }
}

// ============================================================================
// AUTO-DEPLOY — Git commit + push para Firebase App Hosting
// ============================================================================
async function deployChanges(progress) {
  const GIT_DEPLOY_INTERVAL = 60 * 60 * 1000; // 1 hora entre deploys
  const lastDeploy = progress.lastDeployTimestamp ? new Date(progress.lastDeployTimestamp) : null;
  const hoursSinceDeploy = lastDeploy ? (Date.now() - lastDeploy.getTime()) / (1000 * 60 * 60) : 999;

  if (hoursSinceDeploy < 1) {
    log(`Deploy já executado há ${hoursSinceDeploy.toFixed(1)}h. Próximo em ${(1 - hoursSinceDeploy).toFixed(1)}h.`, "DEPLOY");
    return;
  }

  log("Iniciando auto-deploy para Firebase App Hosting...", "DEPLOY");

  const { execSync } = require('child_process');
  const filesToTrack = [
    'src/data/livros-mock.json',
    'src/data/contos-mock.json',
    'scripts/progress.json',
    'public/covers/',
    'public/downloads/'
  ];

  try {
    for (const f of filesToTrack) {
      try { execSync(`git add "${f}"`, { stdio: 'pipe', cwd: __dirname + '/..' }); } catch (_) {}
    }

    const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
    execSync(`git commit -m "auto-deploy: ${ts}" --allow-empty`, {
      stdio: 'pipe',
      cwd: __dirname + '/..'
    });

    execSync('git push origin main', { stdio: 'pipe', cwd: __dirname + '/..' });

    progress.lastDeployTimestamp = Date.now();
    saveProgress(progress);
    log(`Deploy realizado com sucesso! (${ts})`, "DEPLOY");
  } catch (err) {
    log(`Falha no auto-deploy: ${err.message}`, "WARN");
  }
}

// ============================================================================
// CICLO DO ORQUESTRADOR
// ============================================================================

async function runOrchestrator() {
  const progress = loadProgress();
  progress.totalCycles = (progress.totalCycles || 0) + 1;
  
  log(`Iniciando ciclo #${progress.totalCycles} do Orquestrador v3 (Obras Completas + Round-Robin)...`);
  log(`Progresso: ${Object.keys(progress.books).length} livros, ${Object.keys(progress.stories).length} contos rastreados.`);
  if (progress.personaCounts) {
    const pc = Object.entries(progress.personaCounts).map(([k, v]) => `${k}: ${v}`).join(', ');
    log(`Personas: ${pc}`);
  }

  // Roda Esteira A e Esteira B consecutivamente
  await runEsteiraA(progress);
  await runEsteiraB(progress);

  saveProgress(progress);

  // Auto-deploy para Firebase App Hosting (máx 1x por hora)
  await deployChanges(progress);

  log("Ciclo concluído. Aguardando próximo agendamento.");
}

// Execução imediata no início
runOrchestrator();

// Configura o agendamento em background
setInterval(runOrchestrator, ORCHESTRATOR_INTERVAL);

log(`Orquestrador v3 — Obras Completas + Round-Robin ativo a cada ${ORCHESTRATOR_INTERVAL / 1000 / 60} minutos.`);
log(`Idiomas: ${LANGUAGES.map(l => `${l.flag} ${l.code}`).join(', ')}`);
log(`Catálogo Gutenberg: ${GUTENBERG_WORKS.length} obras | Catálogo DP: ${DOMINIO_PUBLICO_WORKS.length} obras | Auto-Discovery: ativado`);
log(`Auto-Deploy: Firebase App Hosting (push para main, máx 1x/h)`);
log(`Persistência: ${PROGRESS_PATH}`);
