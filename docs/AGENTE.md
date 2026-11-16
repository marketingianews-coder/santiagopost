# Agente de contenido — Santiago Post

## Qué hace
`editor-santiagopost` (en `.claude/agents/`) cubre la **contingencia del día** y novedades por
categoría, redacta noticias verificadas con fuentes chilenas oficiales, las valida con un
revisor independiente y las deja como **borrador** en el panel (`/admin`). **No publica solo.**

## Cómo correrlo
En Claude Code, dentro de `C:\Users\Home\Desktop\santiagopost`:

```
> Usa el agente editor-santiagopost para cubrir la contingencia de hoy.
```

O prueba en seco (no escribe nada):

```
> editor-santiagopost en modo prueba en seco.
```

Los borradores quedan en `borradores/{slug}.md` y aparecen en `/admin`. Tú los revisas,
editas y publicas con el botón **Publicar**.

## Interruptor de auto-publicación
**APAGADO.** El agente nunca publica directo: solo deja borradores. La publicación es siempre
una decisión humana desde el panel. (Para activar auto-publicación en el futuro habría que
cambiar el flujo del agente para que llame a `/api/admin/publish`; hoy no lo hace a propósito.)

## Publicar (manual, desde el panel)
1. Entra a `/admin` con la contraseña.
2. En **Borradores**, abre la nota, revisa fuentes y datos, ajusta.
3. **Publicar** → commitea `articulos/{id}.md` + `lib/data.ts` y Vercel redespliega (~2 min).

## Pendiente de tu lado
1. Definir la **contraseña** de producción (`ADMIN_PASSWORD` en Vercel).
2. Cargar el **GITHUB_TOKEN** en Vercel para que el panel commitee (sin él, el panel escribe
   solo en local).
3. Definir el **método de imágenes** de portada (hoy: subida manual o gradiente por defecto).
