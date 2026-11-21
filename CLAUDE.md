# Hadal

Descenso 3D navegable de la superficie a ~8.100 m en un solo archivo HTML con WebGPU crudo, todo procedural. Repo público (`Kaluka92/hadal`, licencia MIT), con página en https://kaluka92.github.io/hadal/. Detalle técnico, teclas y estado de pruebas: `README.md`.

> **Bitácora** de abajo: fecha, qué se hizo, por qué y qué quedó pendiente. Es un repo público: no escribir acá datos de clientes ni credenciales.

## Comandos
- `python3 src/build.py` regenera `index.html` a partir de `src/` (no se edita `index.html` a mano).
- `node --check src/gpu_check.mjs` valida la sintaxis del módulo (opcional).

## Reglas de trabajo
- Cambios por rama + PR. El token de `gh` es fine-grained (`claude-code-mac-2026-11`) y tiene Contents y Pull requests con escritura sobre `hadal` desde 2026-11-21.
- **El hook de merge (`~/.claude/hooks/merge-con-ci-verde.py`) NO incluye `hadal`**: los merges de este repo se hacen desde la web. Sumarlo requiere editar `REPOS` del hook y el permiso por repo de `~/.claude/settings.json`, y el sistema de permisos bloqueó esa edición hecha por Claude: la hace Juan (o agrega una regla de Bash que la permita).
- El repo no tiene CI conocido; no está verificado qué haría el hook con un repo sin checks.

## Bitácora

### 2026-11-21 — README: el sonido sí fue escuchado (Claude Code, Sonnet 5.5)
- **Por qué:** el README decía que el sonido «nunca se escuchó en una revisión humana»; Juan avisó que sí se escuchó.
- **Qué:** PR #1 (mergeado por Juan desde la web). Líneas 58 y 79 del `README.md`: el sonido procedural lo escuchó una persona y funcionó, sin registro del equipo ni del navegador; la reacción de la fauna sigue sin verificarse visualmente.
- **No verificado:** no abrí el juego ni oí el sonido (Claude no puede); «funcionó» es lo que dijo Juan. Las visitas del repo no se pudieron ver: la API de tráfico da 403 con el token y la extensión de Chrome no conectó; se ven en `github.com/Kaluka92/hadal/graph/traffic` (solo 14 días).
- **Pendiente (Juan):** sumar `hadal` al hook de merge si quiere que Claude mergee ahí; si quiere, completar en el README en qué equipo y navegador se escuchó el sonido.
