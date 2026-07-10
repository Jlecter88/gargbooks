<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Google Books API Key

Para habilitar o Catálogo Comercial sem limite de 10 requisições/dia:

1. Acesse https://console.cloud.google.com/
2. Crie um projeto ou selecione um existente
3. **APIs e Serviços > Biblioteca** → busque "Books API" → Ative
4. **APIs e Serviços > Credenciais** → **Criar Credenciais > Chave de API**
5. Opcional: restrinja a chave (Aplicativos Web → seu domínio, ex: `localhost`)
6. Copie a chave para `.env.local`:
   GOOGLE_BOOKS_API_KEY=sua_chave_aqui

## Firebase Admin (db-feeder / Firestore)

Para popular o Firestore com os dados dos mocks:

1. Acesse Firebase Console → Configurações do Projeto → Contas de Serviço
2. Clique em "Gerar nova chave privada" e salve como `scripts/serviceAccountKey.json`
3. Execute: `node scripts/db-feeder.js`

**Credenciais alternativas via .env.local:**
```
FIREBASE_PROJECT_ID=gargbooks-ecccf
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@gargbooks-ecccf.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

O BookContext carrega livros do Firestore automaticamente (paginação de 50 em 50, até 200). Se o Firestore estiver vazio ou offline, cai para o JSON local + localStorage.
