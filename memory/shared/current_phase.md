# NEXUS Webmail — Estado actual

**Fase:** ARCHIVADO (2026-09-28, aprobado por Ricardo)

## Por qué se archivó
- **Webmail genérico:** lo cubre SnappyMail en VPS2 desde abril (17 cuentas, firmas, contactos).
  T070 ya había quedado `deferred` el 2026-04-25 (handoff `2026-04-25-snappymail-vps2.md`).
- **Correo con contexto de negocio:** existe en RYM_SUITE (T313), en producción: sync IMAP de 23 cuentas,
  clasificador con vínculo a cotizaciones/SO/OP/facturas, vigía cada 10 min a Telegram, tarjetas en Kanban.
  La UI de correo pendiente se hará DENTRO de RYM_SUITE, no aquí.

## Dónde quedó cada cosa
- Código: GitHub `rrojashub-source/nexus-webmail`, main `8514129` (incluye fixes S486 + login_hint).
- Producción: RETIRADA 2026-09-28 por RED INTERNA (commit 2d00ce8). Clientes OAuth 44 y 45 borrados;
  vhost, cert y DNS de webmail.ricardo-nexus.dev borrados. Imagen y carpeta conservadas en nexus-server.

## Si alguien reabre esto
No lo revivas como webmail: la decisión y sus motivos están en `PROJECT_STATE.json` → `decisions`.
