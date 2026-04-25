# NEXUS Webmail — RYM Corporation

## Misión
Cliente web de correo empresarial self-hosted para RYM Corporation.
Fork de `root-fr/jmap-webmail` (MIT) personalizado con branding RYM y
desplegado en Mini PC NEXUS vía Docker.

**Éxito = Ricardo lee, escribe y gestiona las 4 cuentas empresariales
desde cualquier browser, sin depender de comandos MCP.**

## Infra de correo

| Variable | Valor |
|----------|-------|
| Stalwart URL | `https://mail.ricardo-nexus.dev` |
| SSL | Let's Encrypt válido (renueva automático) |
| Backend | RocksDB |
| OAuth2 client_id | `nexus-webmail` (registrado 2026-04-24) |
| Redirect DEV | `http://localhost:3000/api/auth/callback` |
| Redirect PROD | `https://webmail.rymcorporation.com/api/auth/callback` |

## Cuentas Stalwart
- `ricardorojas@rymcorporation.com`
- `admin@electroservicesusa.com`
- `sales@electroservicesusa.com`
- `ricardorojas@centralpowersolutions.com`

## Stack
- Next.js 16 (App Router) + TypeScript strict
- Tailwind CSS v4 + Zustand
- JMAP client propio en `lib/jmap/client.ts` (NO usar jmap-jam — ya tiene uno completo)
- OAuth2/OIDC PKCE propio en `lib/oauth/` (NO tocar sin code review)
- DOMPurify en todo HTML de correos
- Biome (reemplaza ESLint)
- Vitest + Testing Library
- Docker + Nginx → Mini PC NEXUS

## Comandos
```bash
npm run dev          # Dev server localhost:3000
npm run lint         # Biome
npm run lint:fix     # Biome auto-fix
npm run typecheck    # TypeScript
npm run test         # Vitest
npm run build        # Build producción
docker compose up    # Stack completo con Nginx
```

## Archivos críticos
- `lib/jmap/client.ts` — Cliente JMAP completo
- `lib/oauth/` — PKCE, discovery, tokens (NO MODIFICAR sin revisión)
- `lib/auth/` — Session cookies HttpOnly
- `app/api/auth/` — Routes OAuth2
- `memory/shared/current_phase.md` — Estado actual (leer al iniciar)
- `.env.local` — Credenciales (NO commitear, en .gitignore)

## Reglas críticas
- Tokens OAuth NUNCA al browser — solo Server Components o API Routes
- TODO HTML de correos DEBE pasar por DOMPurify antes de render
- TypeScript `strict: true` — NO `any` sin justificación
- Biome enforced (hooks PostToolUse)
- Commit format: `feat/fix/refactor/test/docs/chore(scope): descripción`

## NO TOCAR
- `lib/oauth/` — flujo PKCE crítico de seguridad
- `lib/auth/session-cookie.ts` — HttpOnly cookie handling
- `.env.local` — credenciales Stalwart
- Ports en docker-compose producción — coordinar con Ricardo

## Protocolo de sesión
- Inicio: leer este archivo + `memory/shared/current_phase.md`
- Cierre: actualizar `memory/shared/current_phase.md` + git commit
