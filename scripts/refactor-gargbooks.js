/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');


const gargbooksDir = 'C:\\Users\\USER 1\\Desktop\\gargbooks';
const scratchReaderDir = 'C:\\Users\\USER 1\\.gemini\\antigravity\\scratch\\public-domain-reader';

const contosPath = path.join(gargbooksDir, 'src/data/contos-mock.json');
const usersPath = path.join(gargbooksDir, 'src/data/users-mock.json');

// 1. Process users-mock.json
let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

// Refactor arthur_brand to ariadne_brand
users = users.map(u => {
    if (u.id === 'ai-arthur-brand') {
        return {
            ...u,
            username: 'ariadne_brand',
            name: 'Ariadne Brand',
            favorite_style: 'Gótica',
            avatar_initial: 'A',
            bio: '[//PERFIL PROTEGIDO - IA PERSONA SYSTEM GENERATED//] Pesquisadora de ocultismo clássico e colecionadora de edições raras.'
        };
    }
    return u;
});

// Author profiles to append
const newAuthors = [
    {
        id: "ai-clarice-medeiros",
        username: "clarice_medeiros",
        name: "Clarice Medeiros",
        age_verified: true,
        is_premium: true,
        is_ai_persona: true,
        interest_tags: ["Fantasia", "Realismo Mágico", "Original"],
        bio: "Escritora de ficção especulativa e fantasia urbana, apaixonada por mistérios cotidianos e realismo mágico.",
        favorite_style: "Realismo Mágico",
        favorite_genres: ["Fantasia", "Original"],
        read_books: [],
        wishlist: [],
        reading_now: null,
        avatar_initial: "C",
        avatar_url: "profiles/clarice.png"
    },
    {
        id: "ai-andrea-dornelles",
        username: "andrea_dornelles",
        name: "Andréa Dornelles",
        age_verified: true,
        is_premium: true,
        is_ai_persona: true,
        interest_tags: ["Terror", "Sobrenatural", "Original"],
        bio: "Navegando entre o terror psicológico e o suspense clássico. Grande admiradora de Poe e Lovecraft.",
        favorite_style: "Sobrenatural",
        favorite_genres: ["Terror", "Original"],
        read_books: [],
        wishlist: [],
        reading_now: null,
        avatar_initial: "A",
        avatar_url: "profiles/andrea.png"
    },
    {
        id: "ai-juliana-pavesi",
        username: "juliana_pavesi",
        name: "Juliana Pavesi",
        age_verified: true,
        is_premium: true,
        is_ai_persona: true,
        interest_tags: ["Romance", "Crônica", "Original"],
        bio: "Contadora de crônicas cotidianas e romances urbanos sobre a vida moderna nas metrópoles brasileiras.",
        favorite_style: "Crônica",
        favorite_genres: ["Romance", "Original"],
        read_books: [],
        wishlist: [],
        reading_now: null,
        avatar_initial: "J",
        avatar_url: "profiles/juliana.png"
    },
    {
        id: "ai-lucia-sterling",
        username: "lucia_sterling",
        name: "Lucia Sterling",
        age_verified: true,
        is_premium: true,
        is_ai_persona: true,
        interest_tags: ["Ficção Científica", "Ciberpunk", "Original"],
        bio: "Ficção científica futurista e ciberpunk com foco na relação entre inteligência artificial e sentimentos humanos.",
        favorite_style: "Ciberpunk",
        favorite_genres: ["Ficção Científica", "Original"],
        read_books: [],
        wishlist: [],
        reading_now: null,
        avatar_initial: "L",
        avatar_url: "profiles/lucia.png"
    },
    {
        id: "ai-elena-rostova",
        username: "elena_rostova",
        name: "Elena Rostova",
        age_verified: true,
        is_premium: true,
        is_ai_persona: true,
        interest_tags: ["Mistério", "Noir", "Original"],
        bio: "Suspense investigativo e mistério noir em cenários europeus clássicos regados a muito café e chuva.",
        favorite_style: "Noir",
        favorite_genres: ["Mistério", "Original"],
        read_books: [],
        wishlist: [],
        reading_now: null,
        avatar_initial: "E",
        avatar_url: "profiles/elena.png"
    },
    {
        id: "ai-marcela-silva",
        username: "marcela_silva",
        name: "Marcela Silva",
        age_verified: true,
        is_premium: true,
        is_ai_persona: true,
        interest_tags: ["Realismo", "Poético", "Original"],
        bio: "Realismo e narrativas poéticas sobre o sertão brasileiro, misturando lendas locais com emoções profundas.",
        favorite_style: "Poético",
        favorite_genres: ["Realismo", "Original"],
        read_books: [],
        wishlist: [],
        reading_now: null,
        avatar_initial: "M",
        avatar_url: "profiles/marcela.png"
    },
    {
        id: "ai-kaela-vance",
        username: "kaela_vance",
        name: "Kaela Vance",
        age_verified: true,
        is_premium: true,
        is_ai_persona: true,
        interest_tags: ["Fantasia", "Épico", "Original"],
        bio: "Contos de fantasia épea e cavalaria, inspirados na rica mitologia nórdica e folclore escandinavo.",
        favorite_style: "Épico",
        favorite_genres: ["Fantasia", "Original"],
        read_books: [],
        wishlist: [],
        reading_now: null,
        avatar_initial: "K",
        avatar_url: "profiles/kaela.png"
    },
    {
        id: "ai-sofia-bianchi",
        username: "sofia_bianchi",
        name: "Sofia Bianchi",
        age_verified: true,
        is_premium: true,
        is_ai_persona: true,
        interest_tags: ["Drama", "Intimista", "Original"],
        bio: "Contos intimistas focados no drama humano cotidiano, relacionamentos familiares e a busca pela identidade.",
        favorite_style: "Intimista",
        favorite_genres: ["Drama", "Original"],
        read_books: [],
        wishlist: [],
        reading_now: null,
        avatar_initial: "S",
        avatar_url: "profiles/sofia.png"
    },
    {
        id: "ai-yuki-tanaka",
        username: "yuki_tanaka",
        name: "Yuki Tanaka",
        age_verified: true,
        is_premium: true,
        is_ai_persona: true,
        interest_tags: ["Realismo", "Minimalista", "Original"],
        bio: "Realismo lírico e contos minimalistas que trazem a sutil beleza dos mistérios silenciosos da natureza.",
        favorite_style: "Minimalista",
        favorite_genres: ["Realismo", "Original"],
        read_books: [],
        wishlist: [],
        reading_now: null,
        avatar_initial: "Y",
        avatar_url: "profiles/yuki.png"
    }
];

// Avoid duplicating
newAuthors.forEach(na => {
    if (!users.some(u => u.id === na.id)) {
        users.push(na);
    }
});

fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');
console.log('Processed users-mock.json successfully.');

// 2. Process contos-mock.json
let contos = JSON.parse(fs.readFileSync(contosPath, 'utf8'));

// Name mapping for female-only rule
const authorNameMap = {
    "Satoshi Kurogane": "Satsuki Kurogane",
    "Alistair Vance": "Alisa Vance",
    "Rex Obsidian": "Rhea Obsidian",
    "Thomas Kael": "Talia Kael",
    "Viktor Draum": "Viktoria Draum",
    "Marcus Vance": "Marcia Vance",
    "Jax Mercer": "Jacqueline Mercer",
    "Arthur Brand": "Ariadne Brand"
};

contos = contos.map(conto => {
    if (authorNameMap[conto.author]) {
        conto.author = authorNameMap[conto.author];
    }
    return conto;
});

// Import 9 explicit contos
const storyMeta = [
    { id: "a-chave-do-tempo", genre: "Fantasia", style: "Realismo Mágico", gradient: "from-indigo-950 via-purple-950 to-stone-950" },
    { id: "o-sussurro-da-sombra", genre: "Terror", style: "Sobrenatural", gradient: "from-red-950 via-stone-900 to-zinc-950" },
    { id: "estacao-da-saudade", genre: "Romance", style: "Crônica", gradient: "from-rose-950 via-neutral-900 to-stone-950" },
    { id: "codigo-da-alma", genre: "Ficção Científica", style: "Ciberpunk", gradient: "from-cyan-950 via-slate-900 to-zinc-950" },
    { id: "nevoa-sobre-praga", genre: "Mistério", style: "Noir", gradient: "from-emerald-950 via-stone-900 to-stone-950" },
    { id: "o-canto-da-asa-branca", genre: "Realismo", style: "Poético", gradient: "from-yellow-950 via-orange-950 to-stone-950" },
    { id: "a-lenda-de-valhalla", genre: "Fantasia", style: "Épico", gradient: "from-blue-950 via-slate-900 to-stone-950" },
    { id: "janelas-do-passado", genre: "Drama", style: "Intimista", gradient: "from-purple-950 via-stone-900 to-zinc-950" },
    { id: "flor-de-cerejeira-silenciosa", genre: "Realismo", style: "Minimalista", gradient: "from-rose-950 via-pink-950 to-stone-950" }
];

storyMeta.forEach(meta => {
    const fileId = `conto-${meta.id}`;
    // Remove if already exists so we can fresh overwrite
    contos = contos.filter(c => c.id !== fileId);
    
    const rawPath = path.join(scratchReaderDir, `books/${meta.id}.json`);
    if (fs.existsSync(rawPath)) {
        const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
        
        // Assemble text paragraphs
        const fullTextPt = rawData.chapters[0].body.pt.join("\n\n");
        const fullTextEn = rawData.chapters[0].body.en.join("\n\n");
        const fullTextEs = rawData.chapters[0].body.es.join("\n\n");
        
        const newConto = {
            id: fileId,
            title: rawData.title.pt,
            author: rawData.author,
            year: 2026,
            genres: [meta.genre, meta.style, "Original", "Adulto +18"],
            rating: 5,
            coverGradient: meta.gradient,
            synopsis: rawData.desc.pt,
            fullText: fullTextPt,
            translations: {
                "pt-br": {
                    title: rawData.title.pt,
                    synopsis: rawData.desc.pt,
                    fullText: fullTextPt
                },
                "en": {
                    title: rawData.title.en,
                    synopsis: rawData.desc.en,
                    fullText: fullTextEn
                },
                "es": {
                    title: rawData.title.es,
                    synopsis: rawData.desc.es,
                    fullText: fullTextEs
                },
                "pt-pt": {
                    title: rawData.title.pt,
                    synopsis: rawData.desc.pt,
                    fullText: fullTextPt
                },
                "fr": {
                    title: rawData.title.en,
                    synopsis: rawData.desc.en,
                    fullText: fullTextEn
                }
            },
            editions: [],
            reviews: [
                {
                    id: `rev-${fileId}-sys`,
                    username: "editorial_gargbooks",
                    rating: 5,
                    date: "2026-07-13",
                    text: "Conto original de literatura contemporânea erótica/adulta. Excelente contribuição ao acervo."
                }
            ],
            isUserPublished: false
        };
        
        // Put the new premium contos at the beginning
        contos.unshift(newConto);
    } else {
        console.error(`Could not find raw story file at ${rawPath}`);
    }
});

fs.writeFileSync(contosPath, JSON.stringify(contos, null, 2), 'utf8');
console.log('Processed contos-mock.json successfully.');
