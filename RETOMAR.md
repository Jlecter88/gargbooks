# 🚀 Instruções para Retomar — Gargbooks

## Contexto (13/07/2026)

Projeto: **Gargbooks** — Next.js 16, React 19, Firebase App Hosting
Repo: `Jlecter88/gargbooks`  
Deploy: https://gargbooks--gargbooks-ecccf.us-east4.hosted.app

## O que já foi feito (6 de 11 steps)

| Step | Descrição | Status | PR |
|------|-----------|--------|----|
| 1 | translations.pt-br nas 52 obras BR | ✅ | #1 |
| 2 | Archive.org fallback na API DP | ✅ | #2 |
| 3 | Rota /api/mercadolivre + aba ML na home | ✅ | #3 |
| 4 | Unificar código afiliado Amazon (prycco-20) | ✅ | #4 |
| 5 | Configurar Google Books API Key | ⏳ **Depende de você** |
| 6 | Integrar chunks no leitor | ✅ Já implementado |
| 7 | Rodar db-feeder.js (Firestore) | ⏳ **Depende de você** |
| 8 | Resolver 39 erros de lint | ✅ Lint: 0 erros, Build: OK |
| 9 | Busca unificada /api/search | ❌ Pendente |
| 10 | Capas clássicas via Open Library | ❌ Pendente |
| 11 | Fallback para API DP offline | ❌ Pendente |

## ⚠️ PR #5 (Step 8) está COMMITADO mas não tem PR

Os arquivos do Step 8 estão staged/commitados localmente mas **o PR #5 não foi criado**. 
Antes de continuar, execute:

```bash
cd "C:\Users\USER 1\Desktop\gargbooks"
git checkout -b step-8-lint-fixes
git commit -m "fix: resolve 39 erros de lint (React 19 strict + types)"
git push origin step-8-lint-fixes
gh pr create --base main --head step-8-lint-fixes --title "Step 8: Resolver 39 erros de lint React 19 strict" --body "39 erros de lint resolvidos com startTransition, tipagem, hoisting fix"
gh pr merge 5 --merge --delete-branch
git checkout main && git pull origin main
npx firebase-tools@latest deploy --only apphosting
```

## Para continuar (Steps 9, 10, 11)

Após o PR #5, seguir nesta ordem:

### Step 9 — Busca Unificada /api/search
- Criar `src/app/api/search/route.ts` que consulta em paralelo: Gutendex + Google Books + acervo local + Mercado Livre + Domínio Público
- Unificar resultados com formato padrão e fonte identificada
- Adicionar campo de busca global no Header
- PR → merge → deploy

### Step 10 — Capas Clássicas via Open Library
- Buscar capas de domínio público via `covers.openlibrary.org`
- Fallback: gradiente temático
- PR → merge → deploy

### Step 11 — Fallback API DP offline
- Quando API DP falhar, tentar Gutendex, depois texto local
- Mensagem clara de erro
- PR → merge → deploy

## Comando mágico para copiar e colar:

```
continue o gargbooks: crie o PR #5 do Step 8 (lint), merge, deploy, e depois siga com Steps 9, 10, 11
```

## Notas importantes
- Google Books API Key (Step 5) e Firebase service account (Step 7) dependem de ação manual sua
- O arquivo AUDITORIA.html no Desktop já foi atualizado com o progresso
- Último build: ✅ | Último lint: 0 erros ✅
