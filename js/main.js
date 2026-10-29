/* Colegio Benjamin Barton — interacciones del sitio (sin dependencias) */
(function () {
  "use strict";
  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Menú principal ---------- */
  var nav = $(".navegacion");
  var botonMenu = $(".boton-menu");
  var velo = $(".velo");
  function cerrarNav() {
    if (!nav) return;
    nav.classList.remove("abierta");
    if (velo) velo.classList.remove("visible");
    if (botonMenu) botonMenu.setAttribute("aria-expanded", "false");
    doc.body.classList.remove("sin-scroll");
  }
  if (botonMenu && nav) {
    botonMenu.addEventListener("click", function () {
      var abierta = nav.classList.toggle("abierta");
      if (velo) velo.classList.toggle("visible", abierta);
      botonMenu.setAttribute("aria-expanded", String(abierta));
      doc.body.classList.toggle("sin-scroll", abierta);
    });
    if (velo) velo.addEventListener("click", cerrarNav);
  }
  $$(".menu > li > button").forEach(function (b) {
    b.addEventListener("click", function () {
      var li = b.parentElement;
      var abierto = li.classList.contains("abierto");
      $$(".menu > li.abierto").forEach(function (o) {
        o.classList.remove("abierto");
        o.firstElementChild.setAttribute("aria-expanded", "false");
      });
      if (!abierto) { li.classList.add("abierto"); b.setAttribute("aria-expanded", "true"); }
    });
  });
  doc.addEventListener("click", function (e) {
    if (!e.target.closest(".menu") && window.innerWidth > 1080) {
      $$(".menu > li.abierto").forEach(function (o) {
        o.classList.remove("abierto");
        o.firstElementChild.setAttribute("aria-expanded", "false");
      });
    }
  });
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      $$(".menu > li.abierto").forEach(function (o) {
        o.classList.remove("abierto");
        o.firstElementChild.setAttribute("aria-expanded", "false");
      });
      cerrarNav();
    }
  });

  /* ---------- Carrusel de portada ---------- */
  var portada = $(".portada");
  if (portada) {
    var diapos = $$(".diapo", portada);
    var titulo = $(".portada h1", portada);
    var lema = $(".portada__lema", portada);
    var contador = $(".portada__contador", portada);
    var botonPausa = $(".portada__pausa", portada);
    var actual = 0, temporizador = null, pausadoPorUsuario = false, reanudadoPorUsuario = false, enPortada = false;
    var sinMovimiento = function () {
      return reducirMovimiento || doc.documentElement.classList.contains("a11y-sin-animacion");
    };
    var mostrar = function (i) {
      diapos[actual].classList.remove("activa");
      diapos[actual].setAttribute("aria-hidden", "true");
      actual = (i + diapos.length) % diapos.length;
      var d = diapos[actual];
      d.classList.add("activa");
      d.removeAttribute("aria-hidden");
      titulo.textContent = d.dataset.titulo;
      lema.textContent = d.dataset.lema;
      contador.textContent = (actual + 1) + " / " + diapos.length;
    };
    var detener = function () { if (temporizador) clearInterval(temporizador); temporizador = null; };
    var quiereCorrer = function () { return !pausadoPorUsuario && (!sinMovimiento() || reanudadoPorUsuario); };
    var iniciar = function () {
      detener();
      if (!quiereCorrer()) return;
      temporizador = setInterval(function () { mostrar(actual + 1); }, 6500);
    };
    var pintarPausa = function () {
      var parado = !quiereCorrer();
      botonPausa.setAttribute("aria-label", parado ? "Reanudar el carrusel" : "Pausar el carrusel");
      botonPausa.innerHTML = parado
        ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
    };
    $(".portada__anterior", portada).addEventListener("click", function () { mostrar(actual - 1); iniciar(); });
    $(".portada__siguiente", portada).addEventListener("click", function () { mostrar(actual + 1); iniciar(); });
    botonPausa.addEventListener("click", function () {
      if (quiereCorrer()) { pausadoPorUsuario = true; detener(); }
      else { pausadoPorUsuario = false; reanudadoPorUsuario = true; mostrar(actual + 1); if (!enPortada) iniciar(); }
      pintarPausa();
    });
    portada.addEventListener("mouseenter", function () { enPortada = true; detener(); });
    portada.addEventListener("mouseleave", function () { enPortada = false; iniciar(); });
    doc.addEventListener("barton:a11y", function () { reanudadoPorUsuario = false; if (!enPortada) iniciar(); pintarPausa(); });
    iniciar();
    pintarPausa();
  }

  /* ---------- Tiras deslizables con flechas ---------- */
  $$("[data-tira]").forEach(function (grupo) {
    var tira = $(".galeria-tira, .linea-alcaldes", grupo);
    var paso = function () { return tira.clientWidth * 0.8; };
    var a = $("[data-tira-anterior]", grupo), s = $("[data-tira-siguiente]", grupo);
    if (a) a.addEventListener("click", function () { tira.scrollBy({ left: -paso(), behavior: "smooth" }); });
    if (s) s.addEventListener("click", function () { tira.scrollBy({ left: paso(), behavior: "smooth" }); });
  });

  /* ---------- Visor (imágenes y videos) ---------- */
  var visor = doc.createElement("div");
  visor.className = "visor";
  visor.setAttribute("role", "dialog");
  visor.setAttribute("aria-modal", "true");
  visor.setAttribute("aria-label", "Visor");
  visor.innerHTML =
    '<button class="cerrar" type="button" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
    '<button class="anterior" type="button" aria-label="Imagen anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg></button>' +
    '<div class="visor__contenido"></div>' +
    '<button class="siguiente" type="button" aria-label="Imagen siguiente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></button>';
  doc.body.appendChild(visor);
  var contenido = $(".visor__contenido", visor);
  var grupoActual = [], indice = 0, origen = null;
  /* Subtítulos en español activados según el panel de accesibilidad */
  var paramsVideo = function () {
    return window.BartonA11y ? window.BartonA11y.paramsVideo() : "&cc_load_policy=1&cc_lang_pref=es&hl=es";
  };

  function pintarImagen() {
    var el = grupoActual[indice];
    var src = el.dataset.visor || ($("img", el) || {}).src;
    var texto = el.dataset.pie || ($("img", el) || {}).alt || "";
    contenido.innerHTML = '<figure><img src="' + src + '" alt=""><figcaption></figcaption></figure>';
    $("img", contenido).alt = texto;
    $("figcaption", contenido).textContent = texto;
    var varias = grupoActual.length > 1;
    $(".anterior", visor).hidden = !varias;
    $(".siguiente", visor).hidden = !varias;
  }
  function abrirVisor() {
    visor.classList.add("abierto");
    doc.body.classList.add("sin-scroll");
    $(".cerrar", visor).focus();
  }
  function cerrarVisor() {
    visor.classList.remove("abierto");
    contenido.innerHTML = "";
    doc.body.classList.remove("sin-scroll");
    if (origen) origen.focus();
  }
  doc.addEventListener("click", function (e) {
    var el = e.target.closest("[data-zoom]");
    if (el) {
      e.preventDefault();
      origen = el;
      var g = el.dataset.zoom;
      grupoActual = g ? $$('[data-zoom="' + g + '"]') : [el];
      indice = grupoActual.indexOf(el);
      pintarImagen();
      abrirVisor();
      return;
    }
    var v = e.target.closest("[data-video]");
    if (v && !v.classList.contains("video-facade")) {
      e.preventDefault();
      origen = v;
      grupoActual = [];
      contenido.innerHTML = '<div class="marco-video"><iframe src="https://www.youtube-nocookie.com/embed/' +
        v.dataset.video + '?autoplay=1&rel=0' + paramsVideo() + '" title="' + (v.dataset.titulo || "Video") +
        '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>';
      $(".anterior", visor).hidden = true;
      $(".siguiente", visor).hidden = true;
      abrirVisor();
    }
  });
  $(".cerrar", visor).addEventListener("click", cerrarVisor);
  $(".anterior", visor).addEventListener("click", function () { indice = (indice - 1 + grupoActual.length) % grupoActual.length; pintarImagen(); });
  $(".siguiente", visor).addEventListener("click", function () { indice = (indice + 1) % grupoActual.length; pintarImagen(); });
  visor.addEventListener("click", function (e) { if (e.target === visor) cerrarVisor(); });
  doc.addEventListener("keydown", function (e) {
    if (!visor.classList.contains("abierto")) return;
    if (e.key === "Escape") cerrarVisor();
    if (e.key === "ArrowLeft" && grupoActual.length > 1) $(".anterior", visor).click();
    if (e.key === "ArrowRight" && grupoActual.length > 1) $(".siguiente", visor).click();
  });

  /* Video incrustado bajo demanda (no carga YouTube hasta hacer clic) */
  $$(".video-facade").forEach(function (b) {
    b.addEventListener("click", function () {
      var marco = b.parentElement;
      marco.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + b.dataset.video +
        '?autoplay=1&rel=0' + paramsVideo() + '" title="' + (b.dataset.titulo || "Video") +
        '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    });
  });

  /* ---------- Pestañas ---------- */
  $$("[role=tablist]").forEach(function (lista) {
    var botones = $$("[role=tab]", lista);
    botones.forEach(function (b, i) {
      b.addEventListener("click", function () { activar(i); });
      b.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { activar((i + 1) % botones.length); botones[(i + 1) % botones.length].focus(); }
        if (e.key === "ArrowLeft") { var j = (i - 1 + botones.length) % botones.length; activar(j); botones[j].focus(); }
      });
    });
    function activar(i) {
      botones.forEach(function (b, j) {
        var sel = i === j;
        b.setAttribute("aria-selected", String(sel));
        b.tabIndex = sel ? 0 : -1;
        doc.getElementById(b.getAttribute("aria-controls")).hidden = !sel;
      });
    }
  });

  /* ---------- Filtro de actividades ---------- */
  var filtros = $(".filtros");
  if (filtros) {
    var tarjetas = $$(".actividad");
    var cuenta = $(".contador b");
    $$("button", filtros).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("button", filtros).forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        var cat = b.dataset.cat, n = 0;
        tarjetas.forEach(function (t) {
          var ver = cat === "todas" || t.dataset.cat === cat;
          t.hidden = !ver;
          if (ver) n++;
        });
        cuenta.textContent = n;
      });
    });
  }

  /* ---------- Selector de año (municipio escolar) ---------- */
  var selector = $(".selector-anio");
  if (selector) {
    $$("button", selector).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("button", selector).forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        $$(".consejo").forEach(function (c) { c.hidden = c.dataset.anio !== b.dataset.anio; });
      });
    });
  }

  /* ---------- Buscador de la biblioteca ---------- */
  var buscar = $("#buscar-libro");
  if (buscar) {
    var libros = $$(".libros li");
    var total = $(".buscador output");
    var vacio = $(".sin-resultados");
    var normalizar = function (t) { return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
    libros.forEach(function (li) { li.dataset.busqueda = normalizar(li.textContent); });
    buscar.addEventListener("input", function () {
      var q = normalizar(buscar.value.trim()), n = 0;
      libros.forEach(function (li) {
        var ver = !q || li.dataset.busqueda.indexOf(q) !== -1;
        li.hidden = !ver;
        if (ver) n++;
      });
      total.textContent = n === 1 ? "1 título" : n + " títulos";
      vacio.hidden = n !== 0;
    });
  }

  /* ---------- Formulario de contacto (abre el correo del usuario) ---------- */
  var form = $("#form-contacto");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      $$("[required]", form).forEach(function (c) {
        var err = $("#" + c.id + "-error");
        var msg = "";
        if (!c.value.trim()) msg = "Completa este campo.";
        else if (c.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value)) msg = "Escribe un correo válido, por ejemplo nombre@correo.com.";
        else if (c.type === "tel" && !/^[0-9\s+()-]{6,}$/.test(c.value)) msg = "Escribe un número de teléfono válido.";
        c.setAttribute("aria-invalid", msg ? "true" : "false");
        if (err) err.textContent = msg;
        if (msg && ok) { c.focus(); ok = false; }
      });
      if (!ok) return;
      var v = function (id) { return $("#" + id).value.trim(); };
      var cuerpo = "Nombre: " + v("c-nombre") + "\nCorreo: " + v("c-correo") + "\nTeléfono: " + v("c-telefono") +
        "\nNivel de interés: " + v("c-nivel") + "\n\n" + v("c-mensaje");
      window.location.href = "mailto:informes@colegiobarton.edu.pe?subject=" +
        encodeURIComponent(v("c-asunto")) + "&body=" + encodeURIComponent(cuerpo);
      $(".estado-envio", form).textContent = "Se abrió tu aplicación de correo con el mensaje listo para enviar.";
    });
  }

  /* Año actual en el pie */
  $$("[data-anio-actual]").forEach(function (s) { s.textContent = new Date().getFullYear(); });
})();
