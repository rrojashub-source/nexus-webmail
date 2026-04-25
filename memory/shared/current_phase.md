# NEXUS Webmail — Estado actual

**Fase:** Phase 1 — Configuración inicial + verificación
**Fecha:** 2026-04-24
**Versión fork:** 1.5.1

## ¿Qué hay hecho?

El fork `root-fr/jmap-webmail` v1.5.1 ya incluye:
- ✅ OAuth2 PKCE completo (`lib/oauth/`)
- ✅ Cliente JMAP propio (`lib/jmap/client.ts`)
- ✅ Session cookies HttpOnly (`lib/auth/`)
- ✅ App Router Next.js 16 con rutas: login, inbox, calendar, contacts, settings
- ✅ DOMPurify integrado en sanitización de email HTML
- ✅ Zustand stores
- ✅ Tailwind v4
- ✅ Vitest + Testing Library
- ✅ Dockerfile + docker-compose

## ¿Qué falta?

- [ ] Reemplazar ESLint con Biome
- [ ] Verificar que OAuth2 discovery funciona con Stalwart (`/.well-known/oauth-authorization-server`)
- [ ] Login funcional end-to-end contra `mail.ricardo-nexus.dev`
- [ ] Branding RYM (colores, logo)
- [ ] Deploy Docker en Mini PC

## Próximo paso inmediato

Verificar que el dev server conecta con Stalwart y el login OAuth2 funciona.
Si conecta → ir directo a branding RYM + deploy.
Si hay issues de OAuth → diagnosticar endpoint discovery.

## Variables de entorno configuradas (.env.local)
- `JMAP_SERVER_URL=https://mail.ricardo-nexus.dev`
- `APP_NAME=NEXUS Webmail — RYM Corporation`

## OAuth2 client registrado en Stalwart
- `client_id=nexus-webmail`
- Redirect DEV: `http://localhost:3000/api/auth/callback` ✅
- Redirect PROD: `https://webmail.rymcorporation.com/api/auth/callback` ✅
