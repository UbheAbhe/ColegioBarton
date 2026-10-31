/* Solicitud de vacante: flujo por pasos con validación accesible (WCAG 3.3.1, 3.3.3, 3.3.4, 4.1.3) */
(function () {
  "use strict";
  var doc = document;
  var form = doc.getElementById("form-solicitud");
  if (!form) return;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var resumen = doc.getElementById("resumen-errores");
  var estado = doc.getElementById("estado-solicitud");
  var CLAVE = "barton-solicitud";
  var GRADOS = {
    Inicial: ["3 años", "4 años", "5 años"],
    Primaria: ["1.° grado", "2.° grado", "3.° grado", "4.° grado", "5.° grado", "6.° grado"],
    Secundaria: ["1.° año", "2.° año", "3.° año", "4.° año", "5.° año"]
  };
  var ETIQUETAS = {
    "e-nombres": "Nombres", "e-apellidos": "Apellidos", "e-nacimiento": "Fecha de nacimiento",
    "e-procedencia": "Colegio de procedencia", "e-nivel": "Nivel", "e-grado": "Grado o edad",
    "a-nombre": "Nombre", "a-parentesco": "Parentesco", "a-correo": "Correo", "a-telefono": "Celular",
    "a-medio": "Medio de contacto", "a-apoyos": "Apoyos solicitados"
  };
  var pasoActual = 1;

  /* ---------- Grados según nivel ---------- */
  var grado = doc.getElementById("e-grado");
  function cargarGrados(nivel, valor) {
    grado.innerHTML = "";
    if (!nivel) { grado.disabled = true; grado.innerHTML = '<option value="">Primero elige el nivel</option>'; return; }
    grado.disabled = false;
    grado.appendChild(new Option("Elige una opción", ""));
    GRADOS[nivel].forEach(function (g) { grado.appendChild(new Option(g, g)); });
    if (valor) grado.value = valor;
  }
  $$('input[name="e-nivel"]').forEach(function (r) {
    r.addEventListener("change", function () {
      cargarGrados(r.value);
      estado.textContent = "Se actualizaron las opciones de grado para el nivel " + r.value + ".";
    });
  });

  /* ---------- Validación ---------- */
  function valor(nombre) {
    var el = form.elements[nombre];
    if (!el) return "";
    if (el instanceof RadioNodeList) return el.value;
    if (el.type === "checkbox") return el.checked ? "sí" : "";
    return el.value.trim();
  }
  function reglas(paso) {
    var r = [];
    if (paso === 1) {
      r.push(["e-nombres", !valor("e-nombres") ? "Escribe los nombres del estudiante." : ""]);
      r.push(["e-apellidos", !valor("e-apellidos") ? "Escribe los apellidos del estudiante." : ""]);
      var f = valor("e-nacimiento"), msg = "";
      if (!f) msg = "Indica la fecha de nacimiento.";
      else {
        var edad = (new Date() - new Date(f)) / 31557600000;
        if (isNaN(edad)) msg = "La fecha no es válida. Escríbela como día, mes y año.";
        else if (edad < 2.5 || edad > 18) msg = "Revisa el año: la edad calculada es " + Math.floor(edad) + " años y el colegio recibe estudiantes de 3 a 17 años.";
      }
      r.push(["e-nacimiento", msg]);
      r.push(["e-nivel", !valor("e-nivel") ? "Elige el nivel al que postula: inicial, primaria o secundaria." : ""]);
      r.push(["e-grado", valor("e-nivel") && !valor("e-grado") ? "Elige el grado o la edad dentro del nivel " + valor("e-nivel") + "." : (!valor("e-nivel") ? "" : "")]);
    }
    if (paso === 2) {
      var n = valor("a-nombre");
      r.push(["a-nombre", !n ? "Escribe el nombre completo del apoderado." : (n.split(/\s+/).length < 2 ? "Escribe al menos un nombre y un apellido." : "")]);
      r.push(["a-parentesco", !valor("a-parentesco") ? "Elige el parentesco con el estudiante." : ""]);
      var c = valor("a-correo"), mc = "";
      if (!c) mc = "Escribe un correo electrónico.";
      else if (c.indexOf("@") === -1) mc = "Al correo le falta la @. Ejemplo: nombre@gmail.com.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)) mc = "Al correo le falta el dominio después de la @, por ejemplo «@gmail.com».";
      r.push(["a-correo", mc]);
      var t = valor("a-telefono").replace(/[\s-]/g, ""), mt = "";
      if (!t) mt = "Escribe un número de celular.";
      else if (!/^\d+$/.test(t)) mt = "Usa solo números, sin letras ni símbolos.";
      else if (t.length !== 9 || t[0] !== "9") mt = "El celular debe tener 9 dígitos y empezar con 9. Escribiste " + t.length + " dígitos.";
      r.push(["a-telefono", mt]);
      r.push(["a-medio", !valor("a-medio") ? "Elige cómo prefieres que te contactemos." : ""]);
    }
    if (paso === 3) {
      r.push(["c-consentimiento", !valor("c-consentimiento") ? "Marca la autorización para que podamos atender tu solicitud." : ""]);
    }
    return r;
  }
  function marcar(nombre, msg) {
    var err = doc.getElementById(nombre + "-error");
    if (err) err.textContent = msg ? "Error: " + msg : "";
    var els = form.elements[nombre];
    var lista = els instanceof RadioNodeList ? Array.prototype.slice.call(els) : [els];
    lista.forEach(function (el) { if (el) el.setAttribute("aria-invalid", msg ? "true" : "false"); });
  }
  function primerControl(nombre) {
    var el = form.elements[nombre];
    return el instanceof RadioNodeList ? el[0] : el;
  }
  function validar(paso) {
    var errores = reglas(paso).filter(function (r) { marcar(r[0], r[1]); return r[1]; });
    var ul = $("ul", resumen);
    ul.innerHTML = "";
    if (!errores.length) { resumen.hidden = true; return true; }
    errores.forEach(function (e) {
      var li = doc.createElement("li"), a = doc.createElement("a");
      a.href = "#" + (primerControl(e[0]).id || e[0]);
      a.textContent = e[1];
      a.addEventListener("click", function (ev) { ev.preventDefault(); primerControl(e[0]).focus(); });
      li.appendChild(a); ul.appendChild(li);
    });
    $("h2", resumen).textContent = errores.length === 1 ? "Revisa 1 dato antes de continuar" : "Revisa " + errores.length + " datos antes de continuar";
    resumen.hidden = false;
    resumen.focus();
    return false;
  }
  /* Los errores nuevos solo aparecen al pulsar «Continuar», así la página no se mueve mientras se llena.
     Si un campo con error se corrige mientras se escribe, el mensaje desaparece en ese momento. */
  function revisarCorreccion(el) {
    var n = el.name;
    if (!n || el.getAttribute("aria-invalid") !== "true") return;
    reglas(pasoActual).forEach(function (r) { if (r[0] === n && !r[1]) marcar(n, ""); });
  }
  form.addEventListener("input", function (e) { revisarCorreccion(e.target); guardar(); });
  form.addEventListener("change", function (e) { revisarCorreccion(e.target); guardar(); });

  /* ---------- Pasos ---------- */
  function irA(paso, enfocar) {
    pasoActual = paso;
    $$(".paso", form).forEach(function (p) { p.hidden = Number(p.dataset.paso) !== paso; });
    $$(".progreso li").forEach(function (li) {
      var n = Number(li.dataset.paso);
      if (n === paso) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      li.classList.toggle("hecho", n < paso);
    });
    if (paso === 3) pintarResumen();
    doc.title = "Paso " + paso + " de 3 | Solicitud de vacante | Colegio Benjamin Barton";
    if (enfocar !== false) {
      var h = $('.paso[data-paso="' + paso + '"] h2', form);
      h.focus();
      h.scrollIntoView({ block: "start" });
    }
  }
  form.addEventListener("click", function (e) {
    var b = e.target.closest("[data-ir]");
    if (!b) return;
    var destino = Number(b.dataset.ir);
    if (destino > pasoActual && !validar(pasoActual)) return;
    resumen.hidden = true;
    irA(destino);
  });

  function pintarResumen() {
    [1, 2].forEach(function (p) {
      var dl = $('[data-resumen="' + p + '"]', form);
      dl.innerHTML = "";
      Object.keys(ETIQUETAS).filter(function (k) { return k[0] === (p === 1 ? "e" : "a"); }).forEach(function (k) {
        var v = valor(k);
        if (k === "e-nacimiento" && v) v = new Date(v + "T00:00").toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
        var dt = doc.createElement("dt"), dd = doc.createElement("dd");
        dt.textContent = ETIQUETAS[k]; dd.textContent = v || "No indicado";
        dl.appendChild(dt); dl.appendChild(dd);
      });
    });
  }

  /* ---------- Envío, confirmación y anulación ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validar(3)) return;
    var codigo = "BB-2027-" + String(Math.floor(1000 + Math.random() * 9000));
    doc.getElementById("codigo-solicitud").textContent = codigo;
    var medio = valor("a-medio"); doc.getElementById("medio-elegido").textContent = medio.charAt(0).toLowerCase() + medio.slice(1);
    $$(".paso", form).forEach(function (p) { p.hidden = true; });
    $$(".progreso li").forEach(function (li) { li.classList.add("hecho"); li.removeAttribute("aria-current"); });
    var conf = doc.getElementById("confirmacion");
    conf.hidden = false;
    estado.textContent = "Solicitud registrada con el código " + codigo + ".";
    doc.title = "Solicitud registrada | Colegio Benjamin Barton";
    $("h2", conf).focus();
    try { sessionStorage.removeItem(CLAVE); } catch (err) { /* sin almacenamiento */ }
  });
  doc.getElementById("anular").addEventListener("click", function () {
    doc.getElementById("confirmacion").hidden = true;
    estado.textContent = "Solicitud anulada. Tus datos siguen en el formulario para que los corrijas.";
    irA(1);
  });

  /* ---------- Borrador (no se pierden datos al salir) ---------- */
  function guardar() {
    var datos = {};
    $$("input, select, textarea", form).forEach(function (el) {
      if (!el.name || el.type === "checkbox") return;
      if (el.type === "radio") { if (el.checked) datos[el.name] = el.value; }
      else datos[el.name] = el.value;
    });
    try { sessionStorage.setItem(CLAVE, JSON.stringify(datos)); } catch (e) { /* sin almacenamiento */ }
  }
  function restaurar() {
    var datos = null;
    try { datos = JSON.parse(sessionStorage.getItem(CLAVE) || "null"); } catch (e) { datos = null; }
    if (!datos) return;
    Object.keys(datos).forEach(function (k) {
      var el = form.elements[k];
      if (!el) return;
      if (el instanceof RadioNodeList) { $$('input[name="' + k + '"]', form).forEach(function (r) { r.checked = r.value === datos[k]; }); }
      else if (k !== "e-grado") el.value = datos[k];
    });
    if (datos["e-nivel"]) cargarGrados(datos["e-nivel"], datos["e-grado"]);
    estado.textContent = "Recuperamos lo que habías escrito antes.";
  }
  doc.getElementById("borrar-borrador").addEventListener("click", function () {
    form.reset();
    cargarGrados("");
    $$("[aria-invalid]", form).forEach(function (el) { el.removeAttribute("aria-invalid"); });
    $$(".error", form).forEach(function (el) { el.textContent = ""; });
    resumen.hidden = true;
    try { sessionStorage.removeItem(CLAVE); } catch (e) { /* sin almacenamiento */ }
    irA(1);
    estado.textContent = "Se borró todo lo escrito.";
  });

  restaurar();
  irA(1, false);
})();
