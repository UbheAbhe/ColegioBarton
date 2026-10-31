# Colegio Benjamin Barton — sitio estático (HTML + CSS)

Abre `index.html` en el navegador. No necesita servidor ni instalación.

## Estructura
- `index.html` — Inicio
- Nosotros: `bienvenidos.html`, `organizacion-institucional.html`, `ideas-rectoras.html`, `municipio-escolar.html`, `benjamin-barton.html`
- `admision.html`
- `solicitud-vacante.html` — solicitud de vacante en tres pasos (v3.0): validación con mensajes de causa y sugerencia, resumen de errores, revisión antes de enviar, confirmación con opción de anular y borrador en la sesión (`js/solicitud.js`). Es un prototipo: no envía datos a ningún servidor.
- Niveles: `nivel-inicial.html`, `nivel-primaria.html`, `nivel-secundaria.html`
- Vida escolar: `actividades.html`, `noticias.html`
- Campus virtual: `biblioteca-virtual.html`, `horarios.html`, `lista-de-utiles.html`, `cuadernos-virtuales.html`
- `contactenos.html`
- `accesibilidad.html` — opciones de accesibilidad y declaración de conformidad WCAG 2.1 AA (estado: parcialmente conforme), con resultado por principio, excepciones, criterios WCAG 2.2 y canal de contacto
- `css/styles.css` — todos los estilos (colores y tipografía definidos como variables en `:root`)
- `js/main.js` — menú, carrusel, visor de fotos y videos, pestañas, filtros, buscador y formulario
- `css/accesibilidad.css` y `js/accesibilidad.js` — panel de accesibilidad (botón abajo a la izquierda o Alt + A): tamaño de texto, contraste alto, ajustes para daltonismo, lectura en voz alta, subtítulos, letra de fácil lectura, espaciado, guía de lectura, control por voz, cursor grande, foco resaltado y detener animaciones

## Notas
- Todas las fotos y los PDF se cargan en línea desde la web oficial www.colegiobarton.edu.pe (ya no se usa barton.engie24.com), por lo que se necesita conexión a internet para verlos.
- El formulario de contacto abre el programa de correo del usuario con el mensaje dirigido a informes@colegiobarton.edu.pe (no hay servidor).
- La lectura en voz alta y el control por voz usan la Web Speech API del navegador; el control por voz funciona en Chrome y Edge y pide permiso para usar el micrófono.
- Las preferencias de accesibilidad se guardan en el navegador (localStorage).

## Versión 3.0 (APF3)
- Corrige los hallazgos de la auditoría WCAG 2.1 AA: contraste de los accesos rápidos y del velo de la portada, foco visible de doble anillo (también en alto contraste), bordes de campos a 4.2:1, encabezados con un solo h1, objetivos de 24 px como mínimo y de 44 px en menú y opciones, y mensajes de error con causa y ejemplo.
- Verificación: axe-core 4.10.2 no reporta incumplimientos WCAG 2.0/2.1 A y AA en las 19 páginas; sin desplazamiento horizontal a 320 px ni al 200 %.
- El panel de accesibilidad es complementario: el sitio cumple con el panel apagado.
