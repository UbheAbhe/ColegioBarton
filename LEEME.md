# Colegio Benjamin Barton — sitio estático (HTML + CSS)

Abre `index.html` en el navegador. No necesita servidor ni instalación.

## Estructura
- `index.html` — Inicio
- Nosotros: `bienvenidos.html`, `organizacion-institucional.html`, `ideas-rectoras.html`, `municipio-escolar.html`, `benjamin-barton.html`
- `admision.html`
- Niveles: `nivel-inicial.html`, `nivel-primaria.html`, `nivel-secundaria.html`
- Vida escolar: `actividades.html`, `noticias.html`
- Campus virtual: `biblioteca-virtual.html`, `horarios.html`, `lista-de-utiles.html`, `cuadernos-virtuales.html`
- `contactenos.html`
- `accesibilidad.html` — declaración de accesibilidad: ayudas por tipo de discapacidad, atajos, comandos de voz y normas
- `css/styles.css` — todos los estilos (colores y tipografía definidos como variables en `:root`)
- `js/main.js` — menú, carrusel, visor de fotos y videos, pestañas, filtros, buscador y formulario
- `css/accesibilidad.css` y `js/accesibilidad.js` — panel de accesibilidad (botón abajo a la izquierda o Alt + A): tamaño de texto, contraste alto, ajustes para daltonismo, lectura en voz alta, subtítulos, letra de fácil lectura, espaciado, guía de lectura, control por voz, cursor grande, foco resaltado y detener animaciones

## Notas
- Todas las fotos y los PDF se cargan en línea desde la web oficial www.colegiobarton.edu.pe (ya no se usa barton.engie24.com), por lo que se necesita conexión a internet para verlos.
- El formulario de contacto abre el programa de correo del usuario con el mensaje dirigido a informes@colegiobarton.edu.pe (no hay servidor).
- La lectura en voz alta y el control por voz usan la Web Speech API del navegador; el control por voz funciona en Chrome y Edge y pide permiso para usar el micrófono.
- Las preferencias de accesibilidad se guardan en el navegador (localStorage).
