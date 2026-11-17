# Hadal

Descenso 3D navegable de la superficie a ~8.100 m en **un solo archivo HTML** con WebGPU. Sin modelos, texturas ni audio descargados: la geometría, los materiales, la fauna y los cascos de naufragios se generan por código y en la GPU.

![Recorrido: kelp, coral, galeón, Titanic y Bismarck](docs/demo.gif)

> Estado: prototipo. Probado en Chrome de escritorio con una GPU Apple integrada. **No probado** en Safari, Firefox, celular ni GPU dedicadas.

## Uso
Abrí `index.html` en un Chrome o Edge reciente con WebGPU. Necesita internet: Three.js 0.160.0 se carga desde un CDN, solo como biblioteca para armar geometría (el render es WebGPU crudo, sin Three.js). Sin WebGPU, la página lo avisa.

| Tecla | Acción |
|---|---|
| Arrastrar / W A S D | mirar / moverse |
| Espacio · C · Shift | subir · bajar · acelerar |
| F | sónar activo |
| J | diario de campo |
| T | recorrido guiado |
| L | luces: normales / reflectores amplios / apagadas |
| M | sonido |
| G · H | calidad · panel de rendimiento |

## Calidad gráfica
Cinco niveles (menú de inicio o tecla G): **Bajo, Medio, Alto, Ultra, Premium**.

| | Sombras | Fauna y rocas | Detalle lejano | Resolución interna máx. | Extras |
|---|---|---|---|---|---|
| Bajo | — | ×0,8 | 35 m | 70 % | sin MSAA |
| Medio | 1024 | ×1 | 60 m | 92 % | MSAA ×4 |
| Alto | 2048 | ×1 | 80 m | 100 % | |
| Ultra | 4096, 9 muestras | ×1,35 | 110 m | 120 % | TAA, oclusión ambiental (8 muestras) |
| Premium | 6144, 16 muestras | ×1,7 | 140 m | 150 % (tope 4096 px) | TAA, oclusión ambiental (14 muestras) |

La resolución interna se ajusta sola. Si Ultra o Premium no sostienen unos ~50 cuadros por segundo, el programa baja un nivel y lo avisa. Ultra y Premium están pensados para GPU dedicadas con 10 GB o más, y **no se probaron en una**.

## Técnicas
- **Cascos esculpidos en la GPU.** Cada barco es un campo de distancia con signo (casco de chapa fina, cubiertas, superestructuras redondeadas, bordes de rotura erosionados con ruido) evaluado en un compute shader y convertido a malla con *surface nets*; el resultado se dibuja con `drawIndirect` sin pasar por la CPU.
- **Culling y niveles de detalle en la GPU.** Cada especie tiene tres bandas de geometría (cercana, media, lejana) elegidas por compute, con instancias indirectas.
- **Reacción de la fauna sin estado.** Los animales huyen o se acercan al submarino calculándolo en el vertex shader a partir de su posición analítica y la de la cámara: no hay buffer de estado ni lectura desde la CPU.
- **Sónar por reconstrucción de profundidad.** Un frente esférico revela superficies reconstruyendo la posición 3D de cada píxel desde el depth buffer, sin geometría extra.
- **Fondo de agua dentro del pase de escena.** La niebla del fondo se dibuja como triángulo a pantalla completa antes del terreno, para que el resolve de MSAA mezcle bien los bordes (hacerlo en el pase final con un test de profundidad dejaba una línea de 1 px en el horizonte).
- **Detalle triplanar con gradientes explícitos y atenuación por profundidad**, y materiales procedurales distintos por tipo de superficie (roca, sedimento, chapa remachada, madera con tablones y agujeros de broma).
- **Bioluminiscencia por compute**: 48.000 partículas excitadas por la estela del submarino.
- **Gobernador de rendimiento** con consultas de marca de tiempo: ajusta resolución y radio de detalle, y baja de nivel de calidad si hace falta.
- **Terreno de alta resolución cerca de la cámara.** Un parche de 251×251 vértices (paso de 25 cm, ±31 m) se recalcula por compute alrededor del submarino y suma, sobre el terreno grueso, rizos de arena, montículos de bioturbación y guijarros procedurales (siempre por encima del terreno grueso, con fundido en el borde, para no necesitar recortes ni costuras). Se activa desde Medio; bit de depuración 32768.
- **Luz volumétrica de los focos.** Marcha de rayos a media resolución en el pase de rayos: dos focos con cono, atenuación por distancia y absorción del agua, fase de dispersión de Henyey-Greenstein, y una densidad de partículas con ruido 3D animado; los pasos se reparten con densidad creciente cerca de la cámara y el haz se corta contra la profundidad de la escena. Desde Medio (el pase viejo de cono queda atenuado). Bit de depuración 65536.
- **Traslucidez de medusas.** Para los materiales translúcidos se suma la luz del foco que atraviesa el cuerpo (más intensa donde la superficie mira a la cámara, teñida por el color propio al cuadrado) y la luz ambiente difusa del agua. Bit de depuración 131072.
- **Profundidad de campo con enfoque automático (Ultra y Premium).** El submarino lee la profundidad del centro de la pantalla con una lectura asíncrona de 1 texel (cada 6 cuadros), suaviza el foco en escala logarítmica y limita el rango a 1,2–20 m; en el pase final se desenfoca con un disco de muestras en espiral áurea (10/18), ponderando por el círculo de confusión de cada muestra para que el fondo desenfocado no manche el primer plano. Bit 262144.
- **Destellos de lente (Ultra y Premium).** Estela anamórfica azulada sobre el bloom y dispersión cromática radial del bloom. Bit 524288.
- **Antialiasing temporal (TAA) en Ultra y Premium.** Jitter de subpíxel (Halton 2,3 de 8 muestras) en la proyección, reproyección del historial con la profundidad y la matriz previa, y recorte por varianza de la vecindad 3×3 para limitar el ghosting en la vegetación que se mueve; el resultado se copia al buffer HDR antes del bloom y del pase final. Interruptor de depuración: bit 16384.
- **Efectos de impacto**: sacudida de cámara y aberración cromática al tocar el fondo a velocidad.
- **Diario de campo y recorrido guiado**: registra lo que ves, con profundidad y fuente, y se guarda en el navegador.
- **Datos con procedencia**: cada ficha marca ✔ (contrastada con fuentes) o ⚠ (sin confirmar). Es una síntesis didáctica, no una referencia científica.

## Cómo se hizo
Escrito de punta a punta por **Claude Sonnet 5.5** (Anthropic) trabajando en Claude Code, con apoyo puntual de **Claude Opus 5.5** en subtareas acotadas. Las decisiones técnicas, el código y las mediciones los produjo el modelo; una persona fijó los objetivos.

El método de trabajo también es parte de lo que se probó:
- **Medición antes de afirmar**: tiempos de GPU con `await device.queue.onSubmittedWorkDone()`, comparación A/B alternada y ablación capa por capa con una máscara de depuración (`#debug`, `__dbg(mask)`).
- **Bisección visual**: para localizar un defecto se apagan especies una por una y se mide el brillo de píxeles leyendo el canvas desde la página.
- **Interruptores por bit** (`__dbg`) para comparar cada mejora con el comportamiento anterior en el mismo punto de cámara.

## Compilar
`python3 src/build.py` regenera `index.html` a partir de `src/`. Opcional: `node --check src/gpu_check.mjs` valida la sintaxis del módulo.

En `#debug` (`index.html#debug`) quedan funciones de ayuda en `window` (`__go`, `__dbg`, `__sps`, `__st`, entre otras); no afectan al uso normal.

## Límites conocidos
- Representación artística: las especies y el relieve no son un modelo científico exacto.
- Los cascos completos se ven poco por la oscuridad del agua profunda; los reflectores (L) ayudan hasta ~100 m.
- La reacción de la fauna al submarino y el sonido procedural (WebAudio) no se verificaron visualmente ni de oído.
- Sin versión para celular (los controles requieren teclado).
- La carga depende de un CDN sin verificación de integridad.

## Licencia
MIT. Los nombres de naufragios y buques son referencias históricas; el proyecto no usa logos ni imágenes de terceros.
