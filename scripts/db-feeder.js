/* eslint-disable @typescript-eslint/no-require-imports */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// 1. Caminhos locais
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'serviceAccountKey.json');
const LIVROS_MOCK_PATH = path.join(__dirname, '..', 'src', 'data', 'livros-mock.json');
const CONTOS_MOCK_PATH = path.join(__dirname, '..', 'src', 'data', 'contos-mock.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Logger decorativo
function log(msg, type = "INFO") {
  const ts = new Date().toLocaleTimeString();
  const icon = type === "SUCCESS" ? "✅" : type === "ERROR" ? "❌" : type === "WARN" ? "⚠️" : "ℹ️";
  console.log(`[${ts}] ${icon} [${type}] ${msg}`);
}

// 2. Verificação inicial da Chave de Segurança
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.log("\n" + "=".repeat(80));
  log("ARQUIVO DE CREDENCIAIS NÃO ENCONTRADO!", "ERROR");
  console.log(`\nPara rodar a alimentação automática de livros no Firebase, siga estes passos:`);
  console.log(`1. Acesse o Console do Firebase (https://console.firebase.google.com/)`);
  console.log(`2. Vá em Configurações do Projeto (ícone de engrenagem) > Contas de Serviço (Service Accounts)`);
  console.log(`3. Clique no botão "Gerar nova chave privada" (Generate new private key)`);
  console.log(`4. Salve o arquivo JSON baixado dentro da pasta:`);
  console.log(`   👉 ${SERVICE_ACCOUNT_PATH}`);
  console.log(`   Nomeie o arquivo exatamente como: serviceAccountKey.json`);
  console.log("\n" + "=".repeat(80) + "\n");
  process.exit(1);
}

// Carregar credenciais
const serviceAccount = require(SERVICE_ACCOUNT_PATH);
const projectId = serviceAccount.project_id;

// Resolver o nome padrão do Storage Bucket
// Em projetos Firebase mais recentes o bucket pode ser .firebasestorage.app ou .appspot.com
const bucketName = `${projectId}.firebasestorage.app`;

log(`Inicializando Firebase Admin para o projeto: ${projectId}...`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: bucketName
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Função auxiliar para codificar o caminho no Firebase Storage e gerar o link público de leitura
function getPublicStorageUrl(storagePath) {
  const encodedPath = encodeURIComponent(storagePath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;
}

// Função para fazer o upload de um arquivo local para o Firebase Storage se ele existir
async function uploadFileToStorage(localRelativePath, storagePath) {
  const localAbsolutePath = path.join(PUBLIC_DIR, localRelativePath);

  if (!fs.existsSync(localAbsolutePath)) {
    // Se o arquivo não existir localmente, pula
    return null;
  }

  try {
    log(`Enviando arquivo: ${localRelativePath} -> Storage: ${storagePath}...`);
    
    await bucket.upload(localAbsolutePath, {
      destination: storagePath,
      metadata: {
        cacheControl: 'public, max-age=31536000'
      }
    });

    const publicUrl = getPublicStorageUrl(storagePath);
    log(`Arquivo enviado com sucesso! URL pública: ${publicUrl}`, "SUCCESS");
    return publicUrl;
  } catch (error) {
    log(`Erro ao enviar arquivo ${localRelativePath}: ${error.message}`, "WARN");
    return null;
  }
}

// Função principal de importação
async function feedDatabase() {
  try {
    // 1. Ler os dados locais dos mocks
    log("Lendo arquivos mock de livros e contos...");
    let livros = [];
    let contos = [];

    if (fs.existsSync(LIVROS_MOCK_PATH)) {
      livros = JSON.parse(fs.readFileSync(LIVROS_MOCK_PATH, 'utf-8')).map(b => ({ ...b, type: 'livro' }));
    }
    if (fs.existsSync(CONTOS_MOCK_PATH)) {
      contos = JSON.parse(fs.readFileSync(CONTOS_MOCK_PATH, 'utf-8')).map(b => ({ ...b, type: 'conto' }));
    }

    const allItems = [...livros, ...contos];
    log(`Total encontrado: ${livros.length} livros e ${contos.length} contos.`);

    // 2. Loop de alimentação
    for (const item of allItems) {
      log(`--- Processando Obra: "${item.title}" (${item.author}) ---`);

      // Garantir id único e padronizado
      const docId = item.id || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Criar cópia para envio
      const firebaseItem = {
        id: docId,
        title: item.title,
        author: item.author,
        year: Number(item.year) || new Date().getFullYear(),
        genres: item.genres || [],
        rating: Number(item.rating) || 5,
        coverGradient: item.coverGradient || "from-stone-900 via-red-950 to-neutral-900",
        synopsis: item.synopsis || "",
        fullText: item.fullText || "",
        type: item.type || "conto",
        editions: item.editions || [],
        reviews: item.reviews || [],
        isUserPublished: item.isUserPublished || false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      if (item.authorId) firebaseItem.authorId = item.authorId;
      if (item.publishWithRealPhoto !== undefined) firebaseItem.publishWithRealPhoto = item.publishWithRealPhoto;

      // a) Processar imagem de capa
      if (item.coverImage) {
        // Se a capa for um caminho local (ex: /covers/dracula.jpg)
        if (item.coverImage.startsWith('/covers/')) {
          const fileName = path.basename(item.coverImage);
          const storagePath = `covers/${fileName}`;
          const publicUrl = await uploadFileToStorage(item.coverImage, storagePath);
          if (publicUrl) {
            firebaseItem.coverImage = publicUrl;
          }
        } else if (item.coverImage.startsWith('data:image')) {
          // Se for base64 (gerado pela IA ou upload no navegador)
          // O feeder pode fazer o upload decodificando o base64
          try {
            const matches = item.coverImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
              const contentType = matches[1];
              const extension = contentType.split('/')[1] || 'jpg';
              const base64Data = matches[2];
              const buffer = Buffer.from(base64Data, 'base64');
              const storagePath = `covers/${docId}.${extension}`;
              
              log(`Enviando imagem em Base64 para Storage: ${storagePath}...`);
              const file = bucket.file(storagePath);
              await file.save(buffer, {
                metadata: { contentType, cacheControl: 'public, max-age=31536000' }
              });

              const publicUrl = getPublicStorageUrl(storagePath);
              firebaseItem.coverImage = publicUrl;
              log(`Base64 enviado! URL: ${publicUrl}`, "SUCCESS");
            }
          } catch (e) {
            log(`Falha ao converter/enviar imagem base64: ${e.message}`, "WARN");
          }
        } else {
          // Se já for uma URL web completa, mantém
          firebaseItem.coverImage = item.coverImage;
        }
      }

      // b) Processar arquivo de download (PDF/EPUB)
      if (item.downloadFile) {
        if (item.downloadFile.startsWith('/downloads/')) {
          const fileName = path.basename(item.downloadFile);
          const storagePath = `downloads/${fileName}`;
          const publicUrl = await uploadFileToStorage(item.downloadFile, storagePath);
          if (publicUrl) {
            firebaseItem.downloadFile = publicUrl;
          }
        } else {
          firebaseItem.downloadFile = item.downloadFile;
        }
      }

      // c) Gravar no Cloud Firestore
      log(`Salvando no Firestore sob o ID: "${docId}"...`);
      await db.collection('books').doc(docId).set(firebaseItem, { merge: true });
      log(`Salvo no Firestore com sucesso!`, "SUCCESS");
    }

    log("Processamento concluído com sucesso total!", "SUCCESS");
    process.exit(0);
  } catch (error) {
    log(`Falha crítica na execução do feeder: ${error.message}`, "ERROR");
    console.error(error);
    process.exit(1);
  }
}

// Executar
feedDatabase();
