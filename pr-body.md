## Step 4 da Auditoria — Unificar código de afiliado Amazon

### Problema
O código usava tags diferentes: `gargbooks-20`/`gargbookspt-21` (carrossel, banners) e `prycco-20`/`prycco-21` (API, mock data), causando perda de comissões.

### O que foi feito
- Adicionado `AMAZON_AFFILIATE_TAG_BR=prycco-20` e `AMAZON_AFFILIATE_TAG_PT=prycco-21` no `.env.local`
- `amazon/route.ts`: agora lê tags do `process.env`
- `page.tsx` carrossel: `gargbooks-20` → `prycco-20` (BR), `gargbookspt-21` → `prycco-21` (PT)
- `banners-mock.json`: `gargbooks-20` → `prycco-20`
- `bootstrap-brasil.js` e `orchestrator.js`: atualizados
- `apphosting.yaml`: novas env vars para Cloud Run

### Testes
- Build: ✅
- Typecheck: ✅
