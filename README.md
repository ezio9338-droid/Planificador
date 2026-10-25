# Rumbo PAU · Planificador de estudio

Aplicación web para el alumnado de **2º de Bachillerato** (Andalucía). Cada alumno indica sus asignaturas, sus exámenes (del instituto o la PAU), los temas que entran, cómo lleva cada tema y sus horas libres. Con eso, la app le hace un **plan de estudio día a día**, con tareas concretas basadas en las directrices oficiales de la PAU 2026-2027 (por ejemplo, en Matemáticas: «Integración por partes: resuelve 3-4 ejercicios tipo PAU…»).

## Funciones

- **11 asignaturas** con su temario, los tipos de ejercicio, la estructura del examen y los consejos de corrección, sacados de las directrices de la carpeta [`directrices/`](directrices).
- **Valoración de cada tema** («Lo domino», «Regular», «Me cuesta»): cuanto más cuesta un tema, más sesiones recibe.
- **Horario por franjas** para cada día de la semana, días sin estudio y días con un horario especial.
- **Plan automático**: por cada tema, una sesión de estudio, prácticas, un repaso espaciado y un repaso final. Por cada examen, un simulacro y un repaso ligero la víspera. Cuando no da tiempo, la app avisa y recorta primero las tareas extra.
- **Seguimiento**: el alumno marca las sesiones hechas. Si se salta alguna, el plan se reorganiza solo al día siguiente.
- **Exportación** a PDF (imprimir o guardar como PDF) y a calendario `.ics` (Apple, Google, Outlook).
- **Privacidad**: los datos se guardan solo en el navegador del alumno. No hay servidor ni cuentas. Desde «Más» se puede descargar o restaurar una copia de seguridad.
- Pensada para **iPad** y móvil. Se puede añadir a la pantalla de inicio y funciona sin conexión.

## Publicar con GitHub Pages

1. Fusiona esta rama en `main`.
2. En GitHub, ve a **Settings → Pages**.
3. En «Build and deployment», elige **Deploy from a branch**, la rama `main` y la carpeta **`/ (root)`**. Pulsa **Save**.
4. En un par de minutos la web estará en `https://<usuario>.github.io/<repositorio>/`.

## Actualizar el temario

Todo el contenido está en [`js/catalogo.js`](js/catalogo.js). Cada tema tiene:

- `peso`: horas aproximadas para un alumno que lo lleva «regular».
- `teoria`: lo que hay que estudiar.
- `ejercicios`: los tipos de ejercicio que el plan va rotando en las sesiones de práctica.

Cuando salgan las directrices de un curso nuevo, basta con actualizar ese archivo y las PDF de `directrices/`.

## Pruebas

Las pruebas comprueban el motor de planificación:

```
node tests/planificador.test.js
```
