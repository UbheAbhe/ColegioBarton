/* Colegio Benjamin Barton — panel de accesibilidad (sin dependencias)
   Lectura en voz alta y control por voz usan la Web Speech API del navegador. */
(function () {
  "use strict";
  var doc = document, html = doc.documentElement;
  var CLAVE = "barton-a11y";
  var BASE = {
    texto: 100, contraste: "normal", color: "normal",
    enlaces: false, fuente: false, espaciado: false, cursor: false, foco: false,
    "sin-animacion": false, "sin-imagenes": false, guia: false,
    subtitulos: true, velocidad: 1, senalar: false
  };
  var INTERRUPTORES = ["enlaces", "fuente", "espaciado", "cursor", "foco", "sin-animacion", "sin-imagenes"];
  var ajustes = {};
  try { ajustes = JSON.parse(localStorage.getItem(CLAVE) || "{}"); } catch (e) { ajustes = {}; }
  for (var k in BASE) if (!(k in ajustes)) ajustes[k] = BASE[k];

  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(ajustes)); } catch (e) { /* sin almacenamiento */ } }
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function normalizar(t) { return (t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[¿?¡!.,;:]/g, "").trim(); }

  /* ---------- Iconos ---------- */
  var ICO = {
    acceso: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="4.2" r="2.2"/><path d="M20.5 7.6c-.2-.8-1-1.2-1.8-1-2.2.6-4.4.9-6.7.9s-4.5-.3-6.7-.9c-.8-.2-1.6.2-1.8 1-.2.8.3 1.6 1.1 1.8 1.7.4 3.4.7 5.1.8l-.3 3.3-1.7 7.2c-.2.8.3 1.6 1.1 1.8.8.2 1.6-.3 1.8-1.1L12 15.6l1.4 5.8c.2.8 1 1.3 1.8 1.1.8-.2 1.3-1 1.1-1.8l-1.7-7.2-.3-3.3c1.7-.1 3.4-.4 5.1-.8.8-.2 1.3-1 1.1-1.8Z"/></svg>',
    cerrar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    ojo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    color: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M12 3a9 9 0 0 1 0 18"/></svg>',
    voz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    oido: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 8.5a6 6 0 1 1 12 0c0 3-2 4-3 5.5s-1 2.5-1 3.5a3 3 0 0 1-5.5 1.7"/><path d="M9.5 9a2.5 2.5 0 1 1 5 0"/><rect x="2" y="17" width="9" height="5" rx="1" fill="none"/><path d="M4 19.5h5"/></svg>',
    libro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2Z"/><path d="M22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7Z"/></svg>',
    mano: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V5.5a1.5 1.5 0 0 1 3 0V13M17 9.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-1.5a6 6 0 0 1-4.6-2.2L4 16.3a1.6 1.6 0 0 1 2.4-2.1L8 16"/></svg>',
    pausa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5"/></svg>',
    onda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 12h3l2-6 4 12 3-9 2 3h4"/></svg>'
  };

  /* ---------- Aplicar ajustes ---------- */
  var fuenteCargada = false;
  function aplicar() {
    html.style.fontSize = ajustes.texto === 100 ? "" : ajustes.texto + "%";
    html.classList.toggle("a11y-texto-grande", ajustes.texto >= 130);
    html.classList.remove("a11y-contraste-oscuro", "a11y-contraste-claro", "a11y-cv-protan", "a11y-cv-deutan",
      "a11y-cv-tritan", "a11y-cv-acroma", "a11y-saturacion-baja");
    if (ajustes.contraste !== "normal") html.classList.add("a11y-contraste-" + ajustes.contraste);
    if (ajustes.color === "saturacion-baja") html.classList.add("a11y-saturacion-baja");
    else if (ajustes.color !== "normal") html.classList.add("a11y-cv-" + ajustes.color);
    INTERRUPTORES.forEach(function (k) { html.classList.toggle("a11y-" + k, !!ajustes[k]); });
    if (ajustes.fuente && !fuenteCargada) {
      var l = doc.createElement("link");
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap";
      doc.head.appendChild(l);
      fuenteCargada = true;
    }
    guia.activar(ajustes.guia);
    doc.dispatchEvent(new CustomEvent("barton:a11y", { detail: ajustes }));
    sincronizarPanel();
  }
  function cambiar(k, v) { ajustes[k] = v; guardar(); aplicar(); }

  /* ---------- Filtros SVG para daltonismo (corrección tipo "daltonize") ---------- */
  var filtros = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
  filtros.setAttribute("aria-hidden", "true");
  filtros.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
  filtros.innerHTML =
    '<filter id="a11y-protan"><feColorMatrix type="matrix" values="1 0 0 0 0  0.4789 0.4769 0.0442 0 0  0.5973 -0.6887 1.0914 0 0  0 0 0 1 0"/></filter>' +
    '<filter id="a11y-deutan"><feColorMatrix type="matrix" values="1 0 0 0 0  0.1628 0.725 0.1122 0 0  0.4547 -0.6454 1.1907 0 0  0 0 0 1 0"/></filter>' +
    '<filter id="a11y-tritan"><feColorMatrix type="matrix" values="0.7412 -0.4072 0.666 0 0  0.0751 0.5852 0.3397 0 0  0 0 1 0 0  0 0 0 1 0"/></filter>';
  doc.body.appendChild(filtros);

  /* ---------- Guía de lectura ---------- */
  var guia = (function () {
    var arriba, abajo, linea, activa = false, alto = 64;
    function mover(y) {
      arriba.style.height = Math.max(0, y - alto / 2) + "px";
      abajo.style.height = Math.max(0, innerHeight - y - alto / 2) + "px";
      linea.style.top = (y + alto / 2 - 2) + "px";
    }
    function alMover(e) {
      var y = e.touches ? e.touches[0].clientY : e.clientY;
      mover(y);
    }
    return {
      activar: function (si) {
        if (si === activa) return;
        activa = si;
        if (!arriba) {
          arriba = doc.createElement("div"); arriba.className = "a11y-guia a11y-guia--arriba";
          abajo = doc.createElement("div"); abajo.className = "a11y-guia a11y-guia--abajo";
          linea = doc.createElement("div"); linea.className = "a11y-guia-linea";
          [arriba, abajo, linea].forEach(function (n) { n.hidden = true; n.setAttribute("aria-hidden", "true"); doc.body.appendChild(n); });
        }
        [arriba, abajo, linea].forEach(function (n) { n.hidden = !si; });
        if (si) {
          mover(innerHeight / 2);
          doc.addEventListener("mousemove", alMover, { passive: true });
          doc.addEventListener("touchmove", alMover, { passive: true });
        } else {
          doc.removeEventListener("mousemove", alMover);
          doc.removeEventListener("touchmove", alMover);
        }
      }
    };
  })();

  /* ---------- Avisos ---------- */
  var aviso = doc.createElement("div");
  aviso.className = "a11y-aviso";
  aviso.setAttribute("role", "status");
  aviso.hidden = true;
  doc.body.appendChild(aviso);
  var temporizadorAviso;
  function avisar(texto, fijo, conPunto) {
    clearTimeout(temporizadorAviso);
    aviso.innerHTML = (conPunto ? '<span class="punto" aria-hidden="true"></span>' : "") + "<span></span>";
    aviso.lastChild.textContent = texto;
    aviso.hidden = false;
    if (!fijo) temporizadorAviso = setTimeout(function () { aviso.hidden = true; }, 4500);
  }

  /* ---------- Lectura en voz alta ---------- */
  var lector = (function () {
    var sintesis = window.speechSynthesis;
    var soportado = !!sintesis && typeof SpeechSynthesisUtterance !== "undefined";
    var cola = [], actual = null, voz = null, barra = null, enPausa = false, fallos = 0;
    function elegirVoz() {
      if (!soportado) return;
      var vs = sintesis.getVoices();
      var pref = ["es-PE", "es-419", "es-US", "es-MX", "es-CO", "es-AR", "es-ES"];
      for (var i = 0; i < pref.length; i++) {
        var v = vs.filter(function (x) { return x.lang.replace("_", "-") === pref[i]; })[0];
        if (v) { voz = v; return; }
      }
      voz = vs.filter(function (x) { return /^es/i.test(x.lang); })[0] || null;
    }
    if (soportado) { elegirVoz(); sintesis.onvoiceschanged = elegirVoz; }

    function trocear(texto) {
      var partes = texto.replace(/\s+/g, " ").match(/[^.!?;:]+[.!?;:]*/g) || [texto], out = [], buf = "";
      partes.forEach(function (p) {
        if ((buf + p).length > 220 && buf) { out.push(buf); buf = p; } else { buf += p; }
      });
      if (buf.trim()) out.push(buf);
      return out;
    }
    function mostrarBarra() {
      if (!barra) {
        barra = doc.createElement("div");
        barra.className = "a11y-lector";
        barra.setAttribute("role", "region");
        barra.setAttribute("aria-label", "Lectura en voz alta");
        barra.innerHTML = '<span>Leyendo</span><button type="button" data-l="pausa" aria-label="Pausar lectura">' + ICO.pausa +
          '</button><button type="button" data-l="stop" aria-label="Detener lectura">' + ICO.stop + "</button>";
        barra.addEventListener("click", function (e) {
          var b = e.target.closest("button"); if (!b) return;
          if (b.dataset.l === "stop") detener();
          else alternarPausa();
        });
        doc.body.appendChild(barra);
      }
      barra.hidden = false;
    }
    function marcar(el) {
      $$(".a11y-leyendo").forEach(function (n) { n.classList.remove("a11y-leyendo"); });
      if (el) {
        el.classList.add("a11y-leyendo");
        var r = el.getBoundingClientRect();
        if (r.top < 90 || r.bottom > innerHeight - 90) el.scrollIntoView({ block: "center", behavior: ajustes["sin-animacion"] ? "auto" : "smooth" });
      }
    }
    function siguiente() {
      if (!cola.length) { detener(); return; }
      actual = cola.shift();
      marcar(actual.el);
      var u = new SpeechSynthesisUtterance(actual.texto);
      u.lang = voz ? voz.lang : "es-PE";
      if (voz) u.voice = voz;
      u.rate = ajustes.velocidad;
      u.onend = function () { fallos = 0; if (!enPausa) siguiente(); };
      u.onerror = function (e) {
        if (e.error === "interrupted" || e.error === "canceled") return;
        if (++fallos >= 3) { detener(); avisar("No se pudo leer en voz alta: el equipo no tiene voces instaladas. Revisa las opciones de voz de tu sistema."); return; }
        siguiente();
      };
      sintesis.speak(u);
    }
    function leerElementos(elementos) {
      if (!soportado) { avisar("Tu navegador no permite la lectura en voz alta. Prueba con Chrome, Edge o Safari."); return; }
      sintesis.cancel();
      cola = [];
      elementos.forEach(function (el) {
        var t = textoDe(el);
        if (t) trocear(t).forEach(function (p) { cola.push({ el: el, texto: p }); });
      });
      if (!cola.length) return;
      enPausa = false;
      mostrarBarra();
      actualizarBotonPausa();
      siguiente();
    }
    function textoDe(el) {
      var c = el.cloneNode(true);
      $$(".solo-lectores, svg, [aria-hidden='true'], script, style", c).forEach(function (n) { n.remove(); });
      var t = (c.textContent || "").replace(/\s+/g, " ").trim();
      if (!t && el.getAttribute("aria-label")) t = el.getAttribute("aria-label");
      if (/^H[1-4]$/.test(el.tagName)) t = t + ".";
      return t;
    }
    function bloquesDePagina() {
      var sel = ".portada__desde, h1, h2, h3, h4, p, li, figcaption, blockquote, time, label, .acceso strong, .acceso span, .org-nodo, .alcalde strong, .nivel__edad, .dato-edad";
      var raiz = $("main") || doc.body;
      var todos = $$(sel, raiz).filter(function (el) {
        if (el.closest("[hidden], .solo-lectores, .a11y-panel, .diapo:not(.activa)")) return false;
        if (!el.getClientRects().length) return false;
        return true;
      });
      return todos.filter(function (el) {
        return !todos.some(function (o) { return o !== el && o.contains(el); });
      });
    }
    function detener() {
      if (soportado) sintesis.cancel();
      cola = []; actual = null; enPausa = false;
      marcar(null);
      if (barra) barra.hidden = true;
    }
    function actualizarBotonPausa() {
      if (!barra) return;
      var b = $('[data-l="pausa"]', barra);
      b.innerHTML = enPausa ? ICO.play : ICO.pausa;
      b.setAttribute("aria-label", enPausa ? "Continuar lectura" : "Pausar lectura");
      barra.firstChild.textContent = enPausa ? "En pausa" : "Leyendo";
    }
    function alternarPausa() {
      if (!soportado || (!actual && !cola.length)) return;
      if (enPausa) { enPausa = false; sintesis.resume(); if (!sintesis.speaking) siguiente(); }
      else { enPausa = true; sintesis.pause(); }
      actualizarBotonPausa();
    }
    return {
      soportado: soportado,
      leerPagina: function () { leerElementos(bloquesDePagina()); },
      leer: function (el) { leerElementos([el]); },
      leerTexto: function (t) {
        if (!soportado) return;
        sintesis.cancel();
        var u = new SpeechSynthesisUtterance(t); u.lang = voz ? voz.lang : "es-PE"; if (voz) u.voice = voz; u.rate = ajustes.velocidad;
        sintesis.speak(u);
      },
      detener: detener,
      pausa: alternarPausa,
      activo: function () { return !!actual || cola.length > 0; }
    };
  })();

  /* Leer al señalar: clic en un texto o pasar el cursor/foco sobre enlaces y botones */
  var BLOQUES = "h1, h2, h3, h4, p, li, figcaption, blockquote, td, th, label, time, .org-nodo";
  var INTERACTIVOS = "a, button, [role=tab], input, select, textarea";
  var esperaSenal;
  doc.addEventListener("click", function (e) {
    if (!ajustes.senalar || e.target.closest(".a11y-panel, .a11y-lector, .a11y-lanzador")) return;
    if (e.target.closest(INTERACTIVOS)) return;
    var b = e.target.closest(BLOQUES);
    if (b) lector.leer(b);
  });
  function leerEtiqueta(el) {
    var t = (el.getAttribute("aria-label") || el.textContent || el.getAttribute("title") || el.value || "").replace(/\s+/g, " ").trim();
    if (!t && el.querySelector("img[alt]")) t = el.querySelector("img[alt]").alt;
    if (!t) return;
    var tipo = el.tagName === "A" ? "Enlace: " : (el.tagName === "BUTTON" || el.getAttribute("role") === "tab" ? "Botón: " : "");
    lector.leerTexto(tipo + t);
  }
  doc.addEventListener("focusin", function (e) {
    if (!ajustes.senalar || e.target.closest(".a11y-panel")) return;
    var el = e.target.closest(INTERACTIVOS);
    if (el) leerEtiqueta(el);
  });
  doc.addEventListener("mouseover", function (e) {
    if (!ajustes.senalar || e.target.closest(".a11y-panel")) return;
    var el = e.target.closest(INTERACTIVOS);
    clearTimeout(esperaSenal);
    if (el) esperaSenal = setTimeout(function () { leerEtiqueta(el); }, 650);
  });

  /* ---------- Control por voz ---------- */
  var voz = (function () {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var soportado = !!SR, rec = null, escuchando = false;
    var PAGINAS = [
      [["inicio", "portada", "principal"], "index.html"],
      [["bienvenid", "nosotros", "director"], "bienvenidos.html"],
      [["organizacion", "organigrama"], "organizacion-institucional.html"],
      [["ideas rectoras", "mision", "vision", "valores"], "ideas-rectoras.html"],
      [["municipio", "alcalde"], "municipio-escolar.html"],
      [["benjamin", "barton", "historia", "misionero"], "benjamin-barton.html"],
      [["admision", "matricula", "vacante", "inscripcion"], "admision.html"],
      [["inicial"], "nivel-inicial.html"],
      [["primaria"], "nivel-primaria.html"],
      [["secundaria"], "nivel-secundaria.html"],
      [["actividad", "video"], "actividades.html"],
      [["noticia"], "noticias.html"],
      [["contact", "escribir al colegio"], "contactenos.html"],
      [["biblioteca", "libro"], "biblioteca-virtual.html"],
      [["horario"], "horarios.html"],
      [["util"], "lista-de-utiles.html"],
      [["cuaderno"], "cuadernos-virtuales.html"],
      [["declaracion", "pagina de accesibilidad"], "accesibilidad.html"]
    ];
    var AYUDA = "Puedes decir: «ir a admisión», «bajar», «subir», «leer página», «detener», «aumentar texto», «reducir texto», «contraste», «clic en» y el nombre de un botón, «atrás» o «dejar de escuchar».";
    function ir(destino) { avisar("Abriendo " + destino.replace(".html", "").replace(/-/g, " ") + "…"); location.href = destino; }
    function clicEn(nombre) {
      var n = normalizar(nombre);
      var candidatos = $$("a, button, [role=tab]").filter(function (el) {
        return el.getClientRects().length && !el.closest("[hidden]") && normalizar(el.textContent || el.getAttribute("aria-label")).indexOf(n) !== -1;
      });
      if (candidatos.length) { candidatos[0].focus(); candidatos[0].click(); avisar("Clic en «" + nombre + "»"); }
      else avisar("No encontré un botón o enlace llamado «" + nombre + "».");
    }
    function procesar(frase) {
      var f = normalizar(frase);
      avisar("Escuché: «" + frase + "»", true, true);
      var m = f.match(/^(?:haz )?(?:clic|click|clik|pulsa|pulsar|presiona|presionar|toca|tocar)(?: en| sobre)? (.+)$/);
      if (m) return clicEn(m[1]);
      if (/(dejar de escuchar|apagar (el )?(control|voz|microfono)|desactivar voz)/.test(f)) return detenerVoz();
      if (/^(ayuda|comandos|que puedo decir)/.test(f)) { avisar(AYUDA, false); return; }
      if (/(detener|deten|para de leer|parar|silencio|callate)/.test(f)) return lector.detener();
      if (/^(pausa|pausar)/.test(f)) return lector.pausa();
      if (/^(continua|continuar|sigue|reanudar)/.test(f)) return lector.pausa();
      if (/(leer|lee|leeme)( la| esta)? pagina|^leer$|^lee$/.test(f)) return lector.leerPagina();
      if (/(aumentar|agrandar|mas grande|aumenta|agranda)/.test(f)) return pasoTexto(1);
      if (/(reducir|achicar|mas pequen|reduce|achica|disminuir)/.test(f)) return pasoTexto(-1);
      if (/contraste/.test(f)) return cambiar("contraste", ajustes.contraste === "normal" ? "oscuro" : "normal");
      if (/(abrir|mostrar) (opciones|panel|accesibilidad)/.test(f)) return panelUI.abrir();
      if (/^cerrar/.test(f)) { panelUI.cerrar(); var v = $(".visor.abierto .cerrar"); if (v) v.click(); return; }
      if (/^(menu|abrir menu)/.test(f)) { var bm = $(".boton-menu"); if (bm && bm.offsetParent) bm.click(); else { var p = $(".menu a, .menu button"); if (p) p.focus(); } return; }
      if (/(al final|hasta abajo|final de la pagina)/.test(f)) return scrollTo({ top: doc.body.scrollHeight });
      if (/(al principio|hasta arriba|inicio de la pagina)/.test(f)) return scrollTo({ top: 0 });
      if (/(bajar|baja|abajo|siguiente)/.test(f)) return scrollBy({ top: innerHeight * 0.7, behavior: "smooth" });
      if (/(subir|sube|arriba|anterior)/.test(f)) return scrollBy({ top: -innerHeight * 0.7, behavior: "smooth" });
      if (/^(atras|volver|regresar)/.test(f)) return history.back();
      if (/^adelante/.test(f)) return history.forward();
      if (/cubicol/.test(f)) { location.href = "https://colegiobarton.cubicol.pe/principal/login"; return; }
      for (var i = 0; i < PAGINAS.length; i++) {
        for (var j = 0; j < PAGINAS[i][0].length; j++) {
          if (f.indexOf(PAGINAS[i][0][j]) !== -1) return ir(PAGINAS[i][1]);
        }
      }
      avisar("No entendí «" + frase + "». Di «ayuda» para escuchar los comandos.", true, true);
    }
    function iniciarVoz() {
      if (!soportado) { avisar("El control por voz funciona en Chrome y Edge. Tu navegador no lo admite."); return; }
      if (escuchando) return;
      rec = new SR();
      rec.lang = "es-PE";
      rec.continuous = true;
      rec.interimResults = false;
      rec.onresult = function (e) {
        var r = e.results[e.results.length - 1];
        if (r.isFinal) procesar(r[0].transcript);
      };
      rec.onerror = function (e) {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          escuchando = false;
          avisar("No se pudo usar el micrófono. Revisa el permiso del navegador para este sitio.");
          sincronizarPanel();
        }
      };
      rec.onend = function () { if (escuchando) { try { rec.start(); } catch (err) { /* ya iniciado */ } } };
      try { rec.start(); escuchando = true; avisar("Escuchando… di «ayuda» para conocer los comandos.", true, true); }
      catch (err) { avisar("No se pudo iniciar el micrófono."); }
      sincronizarPanel();
    }
    function detenerVoz() {
      escuchando = false;
      if (rec) try { rec.stop(); } catch (err) { /* sin sesión */ }
      avisar("Control por voz desactivado.");
      sincronizarPanel();
    }
    return { soportado: soportado, iniciar: iniciarVoz, detener: detenerVoz, procesar: procesar, activo: function () { return escuchando; } };
  })();

  var NIVELES_TEXTO = [100, 115, 130, 150, 175];
  function pasoTexto(d) {
    var i = NIVELES_TEXTO.indexOf(ajustes.texto); if (i < 0) i = 0;
    i = Math.max(0, Math.min(NIVELES_TEXTO.length - 1, i + d));
    cambiar("texto", NIVELES_TEXTO[i]);
    avisar("Tamaño del texto: " + NIVELES_TEXTO[i] + " %");
  }

  /* ---------- Panel ---------- */
  function interruptor(clave, titulo, detalle) {
    return '<button type="button" class="a11y-opcion" data-alternar="' + clave + '" aria-pressed="false"><span>' + titulo +
      (detalle ? "<small>" + detalle + "</small>" : "") + '</span><span class="a11y-interruptor" aria-hidden="true"></span></button>';
  }
  function segmento(clave, opciones, etiqueta, clase) {
    return '<div class="a11y-seg ' + (clase || "") + '" role="group" aria-label="' + etiqueta + '">' + opciones.map(function (o) {
      return '<button type="button" data-clave="' + clave + '" data-valor="' + o[0] + '" aria-pressed="false"' +
        (o[2] ? ' aria-label="' + o[2] + '"' : "") + ">" + o[1] + "</button>";
    }).join("") + "</div>";
  }
  function grupo(icono, titulo, quien, contenido) {
    return '<section class="a11y-grupo"><h3>' + ICO[icono] + titulo + "</h3><p>" + quien + "</p>" + contenido + "</section>";
  }

  var panel = doc.createElement("div");
  panel.className = "a11y-panel";
  panel.id = "a11y-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-labelledby", "a11y-titulo");
  panel.innerHTML =
    '<div class="a11y-panel__cabecera"><div><h2 id="a11y-titulo">Accesibilidad</h2><p>Ajusta la web a tu manera. Se recuerda en este navegador.</p></div>' +
    '<button type="button" class="a11y-cerrar" aria-label="Cerrar opciones de accesibilidad">' + ICO.cerrar + "</button></div>" +
    '<div class="a11y-panel__cuerpo">' +
    grupo("ojo", "Ver mejor", "Baja visión, ceguera parcial y fatiga visual.",
      '<p class="a11y-etiqueta">Tamaño del texto</p>' +
      segmento("texto", NIVELES_TEXTO.map(function (n) { return [n, n + " %", "Texto al " + n + " %"]; }), "Tamaño del texto") +
      '<p class="a11y-etiqueta">Contraste</p>' +
      segmento("contraste", [["normal", "Normal"], ["oscuro", "Alto, fondo negro"], ["claro", "Alto, fondo blanco"]], "Contraste") +
      interruptor("enlaces", "Resaltar enlaces", "Subraya y marca todos los enlaces.")) +
    grupo("color", "Visión de colores", "Daltonismo: dificultad para distinguir rojos, verdes o azules.",
      segmento("color", [["normal", "Sin ajuste"], ["protan", "Protanopía", "Protanopía: dificultad con el rojo"], ["deutan", "Deuteranopía", "Deuteranopía: dificultad con el verde"],
        ["tritan", "Tritanopía", "Tritanopía: dificultad con el azul y amarillo"], ["acroma", "Acromatopsia", "Acromatopsia: escala de grises con más contraste"]], "Ajuste de color") +
      '<p class="a11y-nota">Protanopía: rojo. Deuteranopía: verde. Tritanopía: azul y amarillo. Acromatopsia: escala de grises con más contraste.</p>') +
    grupo("voz", "Escuchar la página", "Ceguera, baja visión, dislexia o dificultades de lectura.",
      '<div class="a11y-acciones"><button type="button" class="a11y-accion a11y-accion--llena" data-accion="leer">' + ICO.play + 'Leer esta página</button>' +
      '<button type="button" class="a11y-accion" data-accion="parar">' + ICO.stop + "Detener</button></div>" +
      interruptor("senalar", "Leer al señalar", "Lee el texto en el que haces clic y el nombre de enlaces y botones al pasar el cursor.") +
      '<p class="a11y-etiqueta"><label for="a11y-velocidad">Velocidad de lectura</label></p>' +
      '<input class="a11y-rango" id="a11y-velocidad" type="range" min="0.6" max="1.6" step="0.1">' +
      '<p class="a11y-nota">También funciona con lectores de pantalla como NVDA, JAWS, VoiceOver y TalkBack. Atajo: <kbd>Alt</kbd> + <kbd>L</kbd>.</p>') +
    grupo("oido", "Audición", "Personas sordas o con hipoacusia, y dificultades del habla.",
      interruptor("subtitulos", "Subtítulos en los videos", "Los videos se abren con subtítulos en español cuando YouTube los tiene.") +
      '<p class="a11y-nota">Este sitio no usa sonidos ni avisos solo por audio. Para comunicarte por escrito, sin necesidad de llamar, usa el <a href="contactenos.html#form-contacto">formulario de contacto</a> o escribe a informes@colegiobarton.edu.pe.</p>') +
    grupo("libro", "Leer y comprender", "Dislexia, TDAH, autismo, discapacidad intelectual o cognitiva.",
      interruptor("fuente", "Letra de fácil lectura", "Usa Atkinson Hyperlegible, diseñada para distinguir mejor cada letra.") +
      interruptor("espaciado", "Más espacio entre letras y líneas") +
      interruptor("guia", "Guía de lectura", "Oscurece la pantalla salvo la franja donde está el cursor.") +
      interruptor("sin-imagenes", "Ocultar imágenes", "Deja solo el texto para reducir distracciones.") +
      '<button type="button" class="a11y-opcion" data-clave-unica="color" data-valor="saturacion-baja" aria-pressed="false"><span>Colores suaves<small>Baja la intensidad de los colores para reducir estímulos.</small></span><span class="a11y-interruptor" aria-hidden="true"></span></button>') +
    grupo("mano", "Movilidad", "Discapacidad física o motriz, temblores o poca precisión con el ratón.",
      '<div class="a11y-acciones"><button type="button" class="a11y-accion a11y-accion--llena" data-accion="voz">' + ICO.mic + '<span>Activar control por voz</span></button></div>' +
      '<p class="a11y-nota">Di, por ejemplo, «ir a admisión», «bajar», «leer página» o «clic en Biblioteca». Di «ayuda» para escuchar todos los comandos. Funciona en Chrome y Edge y necesita permiso del micrófono. Atajo: <kbd>Alt</kbd> + <kbd>V</kbd>.</p>' +
      interruptor("cursor", "Cursor grande y botones amplios") +
      interruptor("foco", "Resaltar el foco del teclado", "Marca con un borde amarillo dónde estás al navegar con Tab.") +
      '<p class="a11y-nota">Todo el sitio se puede usar con el teclado: <kbd>Tab</kbd> avanza, <kbd>Mayús</kbd> + <kbd>Tab</kbd> retrocede, <kbd>Enter</kbd> activa y <kbd>Esc</kbd> cierra menús y ventanas.</p>') +
    grupo("onda", "Movimiento", "Epilepsia fotosensible, vértigo o mareo con el movimiento.",
      interruptor("sin-animacion", "Detener animaciones", "Pausa el carrusel de portada y quita efectos de movimiento.")) +
    "</div>" +
    '<div class="a11y-panel__pie"><button type="button" class="a11y-accion" data-accion="restablecer">Restablecer todo</button>' +
    '<a href="accesibilidad.html">Declaración de accesibilidad</a></div>';
  doc.body.appendChild(panel);

  var lanzador = doc.createElement("button");
  lanzador.type = "button";
  lanzador.className = "a11y-lanzador";
  lanzador.setAttribute("aria-controls", "a11y-panel");
  lanzador.setAttribute("aria-expanded", "false");
  lanzador.setAttribute("aria-keyshortcuts", "Alt+A");
  lanzador.innerHTML = '<span class="a11y-lanzador__ico">' + ICO.acceso + '</span><span class="a11y-lanzador__texto">Accesibilidad</span>';
  doc.body.appendChild(lanzador);

  var panelUI = {
    abrir: function () {
      panel.classList.add("abierto");
      lanzador.setAttribute("aria-expanded", "true");
      setTimeout(function () { $(".a11y-cerrar", panel).focus(); }, 30);
    },
    cerrar: function () {
      if (!panel.classList.contains("abierto")) return;
      panel.classList.remove("abierto");
      lanzador.setAttribute("aria-expanded", "false");
      lanzador.focus();
    },
    alternar: function () { panel.classList.contains("abierto") ? panelUI.cerrar() : panelUI.abrir(); }
  };
  lanzador.addEventListener("click", panelUI.abrir);
  $(".a11y-cerrar", panel).addEventListener("click", panelUI.cerrar);
  $$(".a11y-enlace").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); panelUI.abrir(); }); });

  panel.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.alternar) {
      cambiar(b.dataset.alternar, !ajustes[b.dataset.alternar]);
    } else if (b.dataset.clave) {
      var v = b.dataset.valor;
      cambiar(b.dataset.clave, b.dataset.clave === "texto" ? Number(v) : v);
    } else if (b.dataset.claveUnica) {
      var cu = b.dataset.claveUnica;
      cambiar(cu, ajustes[cu] === b.dataset.valor ? "normal" : b.dataset.valor);
    } else if (b.dataset.accion === "leer") {
      panelUI.cerrar(); lector.leerPagina();
    } else if (b.dataset.accion === "parar") {
      lector.detener();
    } else if (b.dataset.accion === "voz") {
      voz.activo() ? voz.detener() : voz.iniciar();
    } else if (b.dataset.accion === "restablecer") {
      lector.detener();
      if (voz.activo()) voz.detener();
      ajustes = JSON.parse(JSON.stringify(BASE));
      guardar(); aplicar();
      avisar("Se restablecieron las opciones de accesibilidad.");
    }
  });
  $("#a11y-velocidad", panel).addEventListener("input", function (e) {
    ajustes.velocidad = Number(e.target.value); guardar();
  });

  function sincronizarPanel() {
    if (!panel) return;
    $$("[data-alternar]", panel).forEach(function (b) { b.setAttribute("aria-pressed", String(!!ajustes[b.dataset.alternar])); });
    $$("[data-clave]", panel).forEach(function (b) { b.setAttribute("aria-pressed", String(String(ajustes[b.dataset.clave]) === b.dataset.valor)); });
    $$("[data-clave-unica]", panel).forEach(function (b) { b.setAttribute("aria-pressed", String(ajustes[b.dataset.claveUnica] === b.dataset.valor)); });
    var vel = $("#a11y-velocidad", panel); if (vel) vel.value = ajustes.velocidad;
    var bv = $('[data-accion="voz"]', panel);
    if (bv) {
      bv.lastChild.textContent = voz && voz.activo() ? "Desactivar control por voz" : "Activar control por voz";
      bv.setAttribute("aria-pressed", String(!!(voz && voz.activo())));
      if (voz && !voz.soportado) { bv.disabled = true; bv.lastChild.textContent = "Control por voz no disponible en este navegador"; }
    }
    var bl = $('[data-accion="leer"]', panel);
    if (bl && !lector.soportado) { bl.disabled = true; bl.lastChild.textContent = "Lectura no disponible en este navegador"; }
  }

  /* ---------- Atajos de teclado ---------- */
  doc.addEventListener("keydown", function (e) {
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      var k = e.key.toLowerCase();
      if (k === "a") { e.preventDefault(); panelUI.alternar(); }
      if (k === "l") { e.preventDefault(); lector.activo() ? lector.detener() : lector.leerPagina(); }
      if (k === "v") { e.preventDefault(); voz.activo() ? voz.detener() : voz.iniciar(); }
    }
    if (e.key === "Escape") {
      if (panel.classList.contains("abierto")) panelUI.cerrar();
      else if (lector.activo()) lector.detener();
    }
  });
  /* Mantener el foco dentro del panel mientras está abierto */
  panel.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var f = $$("button:not([disabled]), a[href], input", panel).filter(function (n) { return n.getClientRects().length; });
    var primero = f[0], ultimo = f[f.length - 1];
    if (e.shiftKey && doc.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && doc.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  });

  /* ---------- API para el resto del sitio ---------- */
  window.BartonA11y = {
    ajustes: function () { return ajustes; },
    paramsVideo: function () { return ajustes.subtitulos ? "&cc_load_policy=1&cc_lang_pref=es&hl=es" : ""; },
    abrir: panelUI.abrir,
    comando: function (frase) { voz.procesar(frase); }
  };

  aplicar();
})();
