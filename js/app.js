/*
 * Rumbo PAU — interfaz de usuario.
 * Todos los datos se guardan solo en el navegador del alumno (localStorage).
 */
(function () {
  'use strict';

  var C = window.Catalogo;
  var P = window.Planificador;
  var F = P.fecha;
  var CLAVE = 'rumbopau.v1';
  var ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0];
  var NOMBRE_DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var NIVELES = [
    { n: 1, txt: 'Lo domino' },
    { n: 2, txt: 'Regular' },
    { n: 3, txt: 'Me cuesta' }
  ];
  var EJERCICIOS_GENERICOS = {
    problemas: ['Ejercicios del libro y de exámenes anteriores sobre el tema', 'Ejercicios de dificultad creciente del tema'],
    memoria: ['Esquema y preguntas de repaso del tema', 'Explicar el tema de memoria y comprobar'],
    redaccion: ['Ejercicio escrito sobre el tema con tiempo limitado', 'Esquema de ideas y ejemplos del tema'],
    grafico: ['Láminas de ejercicios del tema']
  };

  /* ============================== Estado ============================== */

  function estadoInicial() {
    var tarde = [{ ini: '17:00', fin: '19:00' }];
    return {
      version: 1,
      nombre: '',
      asignaturas: [],
      niveles: {},
      temasPropios: {},
      examenes: [],
      disponibilidad: {
        semanal: { 1: tarde.slice(), 2: tarde.slice(), 3: tarde.slice(), 4: tarde.slice(), 5: [{ ini: '16:00', fin: '17:30' }], 6: [{ ini: '10:30', fin: '13:00' }], 0: [{ ini: '17:00', fin: '19:00' }] },
        excepciones: {}
      },
      ajustes: { sesion: 50, descanso: 10, alarma: true },
      hechas: {},
      plan: null,
      horarioRevisado: false
    };
  }

  function cargar() {
    try {
      var txt = localStorage.getItem(CLAVE);
      if (txt) {
        var e = JSON.parse(txt);
        var base = estadoInicial();
        Object.keys(base).forEach(function (k) { if (e[k] === undefined) e[k] = base[k]; });
        return e;
      }
    } catch (err) { /* sin almacenamiento disponible */ }
    return estadoInicial();
  }

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); }
    catch (err) { avisar('No se ha podido guardar en este navegador.'); }
  }

  var estado = cargar();
  var vista = 'hoy';
  var ui = { filtroPlan: '', verPasados: false, asigAbierta: null, perdidas: 0, editor: null, franjaDia: null };

  /* ============================= Utilidades =========================== */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function hoy() { return F.fmt(new Date()); }
  function nuevoId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  var fmtLargoI = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  var fmtCortoI = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  var fmtFechaI = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  function mayus(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function fmtLargo(f) { return mayus(fmtLargoI.format(F.parse(f))); }
  function fmtCorto(f) { return fmtCortoI.format(F.parse(f)); }
  function fmtFecha(f) { return fmtFechaI.format(F.parse(f)); }
  function lunesDe(f) {
    var d = F.parse(f);
    var dia = (d.getDay() + 6) % 7;
    return F.sumar(f, -dia);
  }
  function horas(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + ' h' + (m ? ' ' + m + ' min' : '');
  }

  var temporizadorAviso;
  function avisar(txt) {
    var el = document.getElementById('aviso-flotante');
    el.textContent = txt;
    el.classList.add('visible');
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(function () { el.classList.remove('visible'); }, 2600);
  }

  /* ========================= Datos derivados ========================== */

  function asignatura(id) { return C.asignatura(id); }

  function temasDe(asigId) {
    var a = asignatura(asigId);
    var propios = (estado.temasPropios[asigId] || []).map(function (t) {
      return { id: t.id, nombre: t.nombre, peso: t.peso, bloque: 'Mis temas', propio: true, teoria: '', ejercicios: null };
    });
    return (a ? a.temas : []).concat(propios);
  }

  function nivelDe(asigId, temaId) {
    return (estado.niveles[asigId] && estado.niveles[asigId][temaId]) || 0;
  }

  function bloquesDe(asigId) {
    var a = asignatura(asigId);
    var bloques = a.bloques.map(function (b) { return { nombre: b.nombre, temas: b.temas }; });
    var propios = temasDe(asigId).filter(function (t) { return t.propio; });
    if (propios.length) bloques.push({ nombre: 'Mis temas', temas: propios });
    return bloques;
  }

  function duracionExamen(ex) {
    if (ex.duracion) return ex.duracion;
    var a = asignatura(ex.asignaturaId);
    return ex.tipo === 'pau' ? a.examen.duracion : 60;
  }

  function examenParaPlan(ex) {
    var a = asignatura(ex.asignaturaId);
    var todos = temasDe(ex.asignaturaId);
    var temas = todos.filter(function (t) { return ex.temas.indexOf(t.id) >= 0; }).map(function (t) {
      return {
        id: t.id, nombre: t.nombre, peso: t.peso, teoria: t.teoria, consejo: t.consejo,
        ejercicios: t.ejercicios || EJERCICIOS_GENERICOS[a.estilo],
        nivel: nivelDe(ex.asignaturaId, t.id) || 2
      };
    });
    return {
      id: ex.id, titulo: ex.titulo, tipo: ex.tipo, fecha: ex.fecha, inicio: ex.inicio,
      duracion: duracionExamen(ex),
      asignatura: { id: a.id, nombre: a.nombre, estilo: a.estilo },
      temas: temas
    };
  }

  function firma() {
    var d = estado.disponibilidad;
    return JSON.stringify([estado.asignaturas, estado.niveles, estado.temasPropios, estado.examenes, d, estado.ajustes.sesion, estado.ajustes.descanso]);
  }

  function examenPorId(id) {
    for (var i = 0; i < estado.examenes.length; i++) if (estado.examenes[i].id === id) return estado.examenes[i];
    return null;
  }

  /* =========================== Planificación ========================== */

  function replanificar() {
    var h = hoy();
    var ahora = new Date();
    var idsEx = {};
    estado.examenes.forEach(function (e) { idsEx[e.id] = true; });
    var anteriores = (estado.plan && estado.plan.sesiones) || [];
    // Se conservan las sesiones ya hechas (historial); lo pendiente se vuelve a planificar.
    var conservar = anteriores.filter(function (s) {
      return idsEx[s.examenId] && estado.hechas[s.id] && s.fecha <= h;
    });
    var ocupadoHoy = conservar.filter(function (s) { return s.fecha === h; }).map(function (s) { return [s.ini, s.fin]; });
    var res = P.generar({
      hoy: h,
      ahora: ahora.getHours() * 60 + ahora.getMinutes(),
      examenes: estado.examenes.map(examenParaPlan),
      disponibilidad: estado.disponibilidad,
      sesion: estado.ajustes.sesion,
      descanso: estado.ajustes.descanso,
      hechas: estado.hechas,
      ocupadoHoy: ocupadoHoy
    });
    var sesiones = conservar.concat(res.sesiones).sort(function (a, b) {
      return a.fecha === b.fecha ? (a.ini < b.ini ? -1 : 1) : (a.fecha < b.fecha ? -1 : 1);
    });
    estado.plan = { generado: h, firma: firma(), sesiones: sesiones, avisos: res.avisos, resumen: res.resumen };
    guardar();
  }

  function asegurarPlan() {
    var h = hoy();
    if (!estado.plan) {
      if (estado.examenes.length) replanificar();
      return;
    }
    if (estado.plan.firma !== firma()) { replanificar(); return; }
    if (estado.plan.generado < h) {
      var perdidas = estado.plan.sesiones.filter(function (s) { return s.fecha < h && !estado.hechas[s.id]; }).length;
      replanificar();
      if (perdidas) ui.perdidas = perdidas;
    }
  }

  function cambiarPlan(fn) {
    fn();
    replanificar();
    render();
  }

  function sesionesPlan() { return (estado.plan && estado.plan.sesiones) || []; }

  function progresoExamen(exId) {
    var r = estado.plan && estado.plan.resumen && estado.plan.resumen[exId];
    var hechas = 0;
    Object.keys(estado.hechas).forEach(function (id) { if (id.indexOf(exId + '|') === 0) hechas++; });
    var total = hechas + (r ? r.programadas + r.sinProgramar : 0);
    return { hechas: hechas, total: total, pct: total ? Math.round(100 * hechas / total) : 0 };
  }

  /* ============================== Render ============================== */

  function render() {
    document.querySelectorAll('#navegacion button').forEach(function (b) {
      b.classList.toggle('activo', b.getAttribute('data-vista') === vista);
      if (b.getAttribute('data-vista') === vista) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    var v = document.getElementById('vista');
    var fn = { hoy: vistaHoy, plan: vistaPlan, examenes: vistaExamenes, asignaturas: vistaAsignaturas, horario: vistaHorario, mas: vistaMas }[vista];
    v.innerHTML = fn();
  }

  function irA(v) {
    vista = v;
    render();
    window.scrollTo(0, 0);
  }

  function chipAsig(a) {
    return '<span class="chip"><span class="punto" style="background:' + a.color + '"></span>' + esc(a.corto) + '</span>';
  }

  function htmlSesion(s, conFecha) {
    var a = asignatura(s.asignaturaId);
    var hecha = !!estado.hechas[s.id];
    return '<div class="sesion' + (hecha ? ' hecha' : '') + '">' +
      '<div class="franja-color" style="background:' + a.color + '"></div>' +
      '<div>' +
        '<div class="meta"><span class="hora">' + (conFecha ? esc(fmtCorto(s.fecha)) + ' · ' : '') + esc(s.ini) + '–' + esc(s.fin) + '</span>' + chipAsig(a) + '</div>' +
        '<div class="tit">' + esc(s.titulo) + '</div>' +
        '<div class="det">' + esc(s.detalle) + '</div>' +
      '</div>' +
      '<button class="check" data-accion="hecha" data-id="' + esc(s.id) + '" aria-pressed="' + hecha + '" aria-label="' + (hecha ? 'Marcar como pendiente' : 'Marcar como hecha') + '">' +
        '<svg viewBox="0 0 24 24"><use href="#i-check"/></svg></button>' +
    '</div>';
  }

  function htmlAvisos() {
    var out = '';
    if (ui.perdidas) {
      out += '<div class="aviso info">Tenías ' + ui.perdidas + (ui.perdidas === 1 ? ' sesión' : ' sesiones') +
        ' sin marcar de días anteriores. He reorganizado tu plan para recolocarlas. ' +
        '<button class="boton pequeno" data-accion="cerrar-perdidas">Entendido</button></div>';
    }
    ((estado.plan && estado.plan.avisos) || []).forEach(function (a) {
      out += '<div class="aviso ' + a.nivel + '">' + esc(a.texto) + '</div>';
    });
    return out;
  }

  /* ------------------------------- Hoy -------------------------------- */

  function vistaHoy() {
    var h = hoy();
    var html = '<div class="titulo-vista"><div><h2>' + (estado.nombre ? '¡Hola, ' + esc(estado.nombre) + '!' : '¡Hola!') + '</h2>' +
      '<p class="suave">' + esc(fmtLargo(h)) + '</p></div></div>';

    var pasos = [
      { ok: !!estado.horarioRevisado, txt: 'Indica tus horas libres para estudiar', vista: 'horario', boton: 'Horario' },
      { ok: estado.examenes.length > 0, txt: 'Añade los exámenes de tu próximo periodo y los temas que entran', vista: 'examenes', boton: 'Añadir' }
    ];
    var hayProximos = estado.examenes.some(function (e) { return e.fecha >= h; });
    if (pasos.some(function (p) { return !p.ok; })) {
      html += '<div class="tarjeta"><h3>Configura tu plan en 2 pasos</h3><div class="pasos">' + pasos.map(function (p) {
        return '<div class="paso' + (p.ok ? ' hecho' : '') + '"><span>' + p.txt + '</span>' +
          (p.ok ? '' : '<button class="boton pequeno primario" data-ir="' + p.vista + '">' + p.boton + '</button>') + '</div>';
      }).join('') + '</div></div>';
    }

    if (estado.examenes.length && !hayProximos) {
      html += '<div class="tarjeta" style="border-color:var(--verde)"><h3>¡Periodo de exámenes terminado!</h3>' +
        '<p>Cuando sepas las fechas de tu próximo periodo de exámenes, añádelas con los temas que entran y te preparo un plan nuevo.</p>' +
        '<button class="boton primario" data-accion="nuevo-examen">Añadir exámenes</button></div>';
    }

    html += htmlAvisos();
    html += htmlPorValorar();

    var sesiones = sesionesPlan();
    var deHoy = sesiones.filter(function (s) { return s.fecha === h; });
    if (estado.examenes.length && !hayProximos && !deHoy.length) return html;
    html += '<h3>Para hoy</h3>';
    if (deHoy.length) {
      var hechasHoy = deHoy.filter(function (s) { return estado.hechas[s.id]; }).length;
      html += '<p class="suave pequeno">' + hechasHoy + ' de ' + deHoy.length + ' sesiones hechas</p>';
      html += deHoy.map(function (s) { return htmlSesion(s); }).join('');
    } else {
      var prox = sesiones.filter(function (s) { return s.fecha > h; })[0];
      html += '<div class="tarjeta vacio">' + (estado.examenes.length
        ? 'Hoy no tienes sesiones de estudio planificadas.' + (prox ? '<br>La próxima es el <b>' + esc(fmtLargo(prox.fecha)) + '</b> a las ' + esc(prox.ini) + '.' : '')
        : 'Cuando añadas un examen verás aquí lo que te toca estudiar cada día.') + '</div>';
    }

    var proximos = estado.examenes.filter(function (e) { return e.fecha >= h; })
      .sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
    if (proximos.length) {
      html += '<h3 style="margin-top:22px">Próximos exámenes</h3><div class="rejilla rejilla-2">' +
        proximos.slice(0, 6).map(htmlExamenTarjeta).join('') + '</div>';
    }

    // Resumen semanal
    var lunes = lunesDe(h), domingo = F.sumar(lunes, 6);
    var semana = sesiones.filter(function (s) { return s.fecha >= lunes && s.fecha <= domingo; });
    if (semana.length) {
      var min = 0, hechas = 0;
      semana.forEach(function (s) {
        min += F.horaAMin(s.fin) - F.horaAMin(s.ini);
        if (estado.hechas[s.id]) hechas++;
      });
      html += '<h3 style="margin-top:22px">Esta semana</h3><div class="estadisticas">' +
        '<div class="estadistica"><b>' + semana.length + '</b><span>sesiones planificadas</span></div>' +
        '<div class="estadistica"><b>' + hechas + '</b><span>sesiones hechas</span></div>' +
        '<div class="estadistica"><b>' + horas(min) + '</b><span>de estudio</span></div></div>';
    }
    return html;
  }

  // Temas sin valorar que el plan va a trabajar en los próximos días: buen momento para valorarlos.
  function htmlPorValorar() {
    var h = hoy();
    if (estado.ocultarValorarHasta && estado.ocultarValorarHasta >= h) return '';
    var limite = F.sumar(h, 7);
    var vistos = {}, lista = [];
    sesionesPlan().forEach(function (s) {
      if (!s.temaId || s.fecha < h || s.fecha > limite || estado.hechas[s.id]) return;
      var clave = s.asignaturaId + '|' + s.temaId;
      if (vistos[clave] || nivelDe(s.asignaturaId, s.temaId)) return;
      vistos[clave] = true;
      var tema = temasDe(s.asignaturaId).filter(function (t) { return t.id === s.temaId; })[0];
      if (tema) lista.push({ asig: s.asignaturaId, tema: tema, fecha: s.fecha });
    });
    if (!lista.length) return '';
    return '<div class="tarjeta" style="border-color:var(--azul)"><h3>¿Cómo llevas estos temas?</h3>' +
      '<p class="suave pequeno">Vas a estudiarlos esta semana y aún no los has valorado. Si ya los habéis visto en clase, dime cómo los llevas y ajusto el tiempo. Si todavía no, déjalos así.</p>' +
      lista.slice(0, 6).map(function (x) {
        return '<div class="tema-fila"><span class="nombre">' + chipAsig(asignatura(x.asig)) + ' ' + esc(x.tema.nombre) +
          '<br><span class="suave pequeno">Primera sesión: ' + esc(fmtCorto(x.fecha)) + '</span></span>' + htmlNivel(x.asig, x.tema.id) + '</div>';
      }).join('') +
      '<div class="botones" style="margin-top:10px"><button class="boton pequeno" data-accion="ocultar-valorar">Ahora no</button></div></div>';
  }

  function htmlExamenTarjeta(e) {
    var a = asignatura(e.asignaturaId);
    var dias = F.entre(hoy(), e.fecha);
    var p = progresoExamen(e.id);
    return '<div class="tarjeta examen-tarjeta">' +
      '<div class="cuenta-atras' + (dias <= 3 ? ' cerca' : '') + '"><div><b>' + (dias === 0 ? '¡Hoy!' : dias) + '</b><span>' + (dias === 0 ? '' : (dias === 1 ? 'día' : 'días')) + '</span></div></div>' +
      '<div><div class="etiqueta-tipo">' + (e.tipo === 'pau' ? 'PAU' : 'Examen del instituto') + '</div>' +
        '<div style="font-weight:650">' + esc(e.titulo) + '</div>' +
        '<div class="suave pequeno">' + chipAsig(a) + ' ' + esc(fmtLargo(e.fecha)) + (e.hora ? ' · ' + esc(e.hora) : '') + '</div>' +
        '<div class="barra" style="margin-top:8px" title="Progreso"><div style="width:' + p.pct + '%"></div></div>' +
        '<div class="suave pequeno">' + p.hechas + ' de ' + p.total + ' sesiones hechas</div></div>' +
      '<button class="boton pequeno" data-accion="editar-examen" data-id="' + esc(e.id) + '">Editar</button>' +
    '</div>';
  }

  /* ------------------------------- Plan ------------------------------- */

  function vistaPlan() {
    var h = hoy();
    var html = '<div class="titulo-vista"><div><h2>Tu plan</h2><p class="suave">Sesiones de estudio día a día. Márcalas al terminarlas.</p></div>' +
      '<div class="botones"><button class="boton" data-accion="exportar">Exportar / imprimir</button>' +
      '<button class="boton" data-accion="reorganizar">Reorganizar</button></div></div>';

    if (!estado.examenes.length) {
      return html + '<div class="tarjeta vacio">Aún no hay plan. Añade un examen para empezar.<br><br><button class="boton primario" data-ir="examenes">Añadir examen</button></div>';
    }

    html += htmlAvisos();

    var asigs = {};
    estado.examenes.forEach(function (e) { asigs[e.asignaturaId] = true; });
    html += '<div class="botones" style="margin-bottom:12px"><select data-campo="filtroPlan" aria-label="Filtrar por asignatura" style="max-width:320px">' +
      '<option value="">Todas las asignaturas</option>' +
      Object.keys(asigs).map(function (id) {
        return '<option value="' + id + '"' + (ui.filtroPlan === id ? ' selected' : '') + '>' + esc(asignatura(id).nombre) + '</option>';
      }).join('') + '</select>' +
      '<label class="boton" style="font-weight:500"><input type="checkbox" data-campo="verPasados"' + (ui.verPasados ? ' checked' : '') + '> Ver días anteriores</label></div>';

    var sesiones = sesionesPlan().filter(function (s) {
      return (!ui.filtroPlan || s.asignaturaId === ui.filtroPlan) && (ui.verPasados || s.fecha >= h);
    });
    var examenesPorDia = {};
    estado.examenes.forEach(function (e) {
      if ((!ui.filtroPlan || e.asignaturaId === ui.filtroPlan) && (ui.verPasados || e.fecha >= h)) {
        (examenesPorDia[e.fecha] = examenesPorDia[e.fecha] || []).push(e);
      }
    });
    var porDia = {};
    sesiones.forEach(function (s) { (porDia[s.fecha] = porDia[s.fecha] || []).push(s); });
    var dias = Object.keys(porDia).concat(Object.keys(examenesPorDia)).filter(function (d, i, arr) { return arr.indexOf(d) === i; }).sort();
    if (!dias.length) return html + '<div class="tarjeta vacio">No hay sesiones que mostrar.</div>';

    var semanaActual = null;
    dias.forEach(function (d) {
      var lunes = lunesDe(d);
      if (lunes !== semanaActual) {
        semanaActual = lunes;
        html += '<div class="semana-cab">Semana del ' + esc(fmtFecha(lunes)) + '</div>';
      }
      html += '<section class="dia' + (d === h ? ' hoy' : '') + '"><div class="dia-cab"><h3>' + esc(fmtLargo(d)) + '</h3>' +
        (d === h ? '<span class="chip">Hoy</span>' : '') + '</div>';
      (examenesPorDia[d] || []).forEach(function (e) {
        html += '<div class="examen-dia">📝 ' + esc(e.titulo) + (e.hora ? ' · ' + esc(e.hora) : '') + '</div>';
      });
      html += (porDia[d] || []).map(function (s) { return htmlSesion(s); }).join('');
      html += '</section>';
    });
    return html;
  }

  /* ----------------------------- Exámenes ----------------------------- */

  function vistaExamenes() {
    var h = hoy();
    var html = '<div class="titulo-vista"><div><h2>Exámenes</h2><p class="suave">Añade los exámenes de tu próximo periodo con los temas que entran. Cuando acabe, añade los del siguiente.</p></div>' +
      '<button class="boton primario" data-accion="nuevo-examen">+ Añadir examen</button></div>';
    var proximos = estado.examenes.filter(function (e) { return e.fecha >= h; }).sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
    var pasados = estado.examenes.filter(function (e) { return e.fecha < h; }).sort(function (a, b) { return a.fecha > b.fecha ? -1 : 1; });
    if (!proximos.length) {
      html += '<div class="tarjeta vacio">' + (pasados.length ? 'Tu último periodo de exámenes ya ha pasado.' : 'Aún no has añadido ningún examen.') +
        '<br>¿Cuándo son tus próximos exámenes?<br><br><button class="boton primario" data-accion="nuevo-examen">Añadir exámenes</button></div>';
    } else {
      var primero = proximos[0].fecha, ultimo = proximos[proximos.length - 1].fecha;
      html += '<h3>Próximo periodo de exámenes</h3><p class="suave pequeno" style="margin-bottom:12px">' + proximos.length + (proximos.length === 1 ? ' examen' : ' exámenes') +
        (primero === ultimo ? ' el ' + esc(fmtFecha(primero)) : ' del ' + esc(fmtLargo(primero).toLowerCase()) + ' al ' + esc(fmtLargo(ultimo).toLowerCase())) + '</p>' +
        '<div class="rejilla rejilla-2">' + proximos.map(htmlExamenTarjeta).join('') + '</div>';
    }
    if (pasados.length) {
      html += '<details class="tarjeta" style="margin-top:20px"><summary style="cursor:pointer;font-weight:650">Exámenes pasados (' + pasados.length + ')</summary>' +
        pasados.map(function (e) {
          var a = asignatura(e.asignaturaId);
          return '<div class="tema-fila"><span class="nombre">' + chipAsig(a) + ' ' + esc(e.titulo) + ' <span class="suave pequeno">' + esc(fmtFecha(e.fecha)) + '</span></span>' +
            '<button class="boton pequeno peligro" data-accion="borrar-examen" data-id="' + esc(e.id) + '">Borrar</button></div>';
        }).join('') +
        '<div class="botones" style="margin-top:10px"><button class="boton pequeno peligro" data-accion="borrar-pasados">Borrar todos los exámenes pasados</button></div></details>';
    }
    return html;
  }

  // Asignaturas que el alumno ya ha usado, para ofrecerlas primero.
  function asignaturasUsadas() {
    var usadas = estado.asignaturas.slice();
    estado.examenes.forEach(function (e) { if (usadas.indexOf(e.asignaturaId) < 0) usadas.push(e.asignaturaId); });
    return usadas.filter(function (id) { return asignatura(id); });
  }

  function abrirEditor(id) {
    var h = hoy();
    var ex = id ? examenPorId(id) : null;
    var asigId, fecha;
    if (ex) { asigId = ex.asignaturaId; fecha = ex.fecha; }
    else {
      // Propone una asignatura que aún no tenga examen en este periodo y una fecha cercana a la del último añadido.
      var conExamen = {};
      estado.examenes.forEach(function (e) { if (e.fecha >= h) conExamen[e.asignaturaId] = true; });
      var usadas = asignaturasUsadas();
      var libres = function (id) { return !conExamen[id]; };
      asigId = usadas.filter(libres)[0] || C.asignaturas.map(function (x) { return x.id; }).filter(libres)[0] || C.asignaturas[0].id;
      fecha = ui.ultimaFecha && ui.ultimaFecha >= h ? F.sumar(ui.ultimaFecha, 1) : F.sumar(h, 14);
    }
    ui.editor = {
      id: ex ? ex.id : null,
      asignaturaId: asigId,
      tipo: ex ? ex.tipo : 'instituto',
      titulo: ex ? ex.titulo : '',
      fecha: fecha,
      hora: ex ? (ex.hora || '') : '',
      inicio: ex ? (ex.inicio || '') : '',
      inicioManual: !!(ex && ex.inicioManual),
      temas: ex ? ex.temas.slice() : []
    };
    if (!ex) ui.editor.inicio = inicioPorDefecto(ui.editor);
    pintarEditor();
    document.getElementById('dialogo').showModal();
  }

  function inicioPorDefecto(ed) {
    var dias = ed.tipo === 'pau' ? 30 : 14;
    var ini = F.sumar(ed.fecha, -dias);
    var h = hoy();
    return ini < h ? h : ini;
  }

  function pintarEditor() {
    var ed = ui.editor;
    var usadas = asignaturasUsadas();
    var otras = C.asignaturas.map(function (a) { return a.id; }).filter(function (id) { return usadas.indexOf(id) < 0; });
    function opcion(id) {
      return '<option value="' + id + '"' + (id === ed.asignaturaId ? ' selected' : '') + '>' + esc(asignatura(id).nombre) + '</option>';
    }
    var dlg = document.getElementById('dialogo');
    dlg.innerHTML =
      '<form method="dialog" id="form-examen">' +
      '<div class="dialogo-cab"><h2>' + (ed.id ? 'Editar examen' : 'Nuevo examen') + '</h2>' +
        '<button class="boton icono" value="cancelar" aria-label="Cerrar">✕</button></div>' +
      '<div class="dialogo-cuerpo">' +
        '<div class="fila-campos">' +
          '<label class="campo"><span>Asignatura</span><select id="ed-asig">' +
            (usadas.length ? '<optgroup label="Tus asignaturas">' + usadas.map(opcion).join('') + '</optgroup><optgroup label="Otras">' + otras.map(opcion).join('') + '</optgroup>'
              : otras.map(opcion).join('')) + '</select></label>' +
          '<div class="campo"><span>Tipo de examen</span><div class="segmentado" role="group">' +
            '<button type="button" data-accion="ed-tipo" data-tipo="instituto" class="' + (ed.tipo === 'instituto' ? 'activo' : '') + '">Instituto</button>' +
            '<button type="button" data-accion="ed-tipo" data-tipo="pau" class="' + (ed.tipo === 'pau' ? 'activo' : '') + '">PAU</button></div></div>' +
        '</div>' +
        '<label class="campo"><span>Nombre del examen</span><input type="text" id="ed-titulo" value="' + esc(ed.titulo) + '" placeholder="' + esc(tituloPorDefecto(ed)) + '"></label>' +
        '<div class="fila-campos">' +
          '<label class="campo"><span>Fecha del examen</span><input type="date" id="ed-fecha" value="' + esc(ed.fecha) + '" min="' + hoy() + '"></label>' +
          '<label class="campo"><span>Hora (opcional)</span><input type="time" id="ed-hora" value="' + esc(ed.hora) + '"></label>' +
          '<label class="campo"><span>Empezar a prepararlo el</span><input type="date" id="ed-inicio" value="' + esc(ed.inicio) + '"><small>Desde cuándo quieres que el plan incluya este examen.</small></label>' +
        '</div>' +
        '<div class="campo"><span>¿Qué temas entran? ¿Cómo los llevas?</span>' +
          '<small>Marca los temas del examen y di cómo llevas cada uno: el plan dará más tiempo a lo que te cuesta. Si aún no lo sabes, déjalo sin valorar (contará como «Regular»).</small></div>' +
        '<div id="ed-temas">' + htmlTemasEditor() + '</div>' +
        '<div class="campo" style="margin-top:12px"><span>¿Falta algún tema?</span>' +
          '<div class="botones"><input type="text" id="ed-nuevo-tema" placeholder="Nombre del tema" style="flex:1 1 200px">' +
          '<select id="ed-nuevo-peso" style="width:auto"><option value="1">Corto</option><option value="2" selected>Medio</option><option value="3">Largo</option></select>' +
          '<button type="button" class="boton" data-accion="ed-add-tema">Añadir tema</button></div></div>' +
      '</div>' +
      '<div class="dialogo-pie">' +
        (ed.id ? '<button type="button" class="boton peligro" data-accion="borrar-examen" data-id="' + esc(ed.id) + '" style="margin-right:auto">Borrar</button>' : '') +
        '<button class="boton" value="cancelar">Cancelar</button>' +
        (ed.id ? '' : '<button type="button" class="boton" data-accion="guardar-examen" data-otro="1">Guardar y añadir otro</button>') +
        '<button type="button" class="boton primario" data-accion="guardar-examen">Guardar examen</button>' +
      '</div></form>';
  }

  function tituloPorDefecto(ed) {
    var a = asignatura(ed.asignaturaId);
    return (ed.tipo === 'pau' ? 'PAU ' : 'Examen de ') + a.nombre;
  }

  function htmlNivel(asigId, temaId) {
    var n = nivelDe(asigId, temaId);
    return '<div class="nivel" role="group" aria-label="¿Cómo llevas este tema?">' + NIVELES.map(function (o) {
      return '<button type="button" class="n' + o.n + (n === o.n ? ' activo' : '') + '"' + (o.titulo ? ' title="' + o.titulo + '"' : '') + ' data-accion="nivel" data-asig="' + asigId +
        '" data-tema="' + esc(temaId) + '" data-n="' + o.n + '" aria-pressed="' + (n === o.n) + '">' + o.txt + '</button>';
    }).join('') + '</div>';
  }

  function htmlTemasEditor() {
    var ed = ui.editor;
    return bloquesDe(ed.asignaturaId).map(function (b, bi) {
      return '<div class="bloque-temas tarjeta" style="margin:0 0 10px;padding:12px 14px">' +
        '<h4>' + esc(b.nombre) + ' <button type="button" class="boton pequeno" data-accion="ed-bloque" data-bloque="' + bi + '">Marcar todos</button></h4>' +
        b.temas.map(function (t) {
          var marcado = ed.temas.indexOf(t.id) >= 0;
          return '<div class="tema-fila ed' + (marcado ? ' marcado' : '') + '"><label class="sel"><input type="checkbox" class="ed-tema" data-bloque="' + bi + '" value="' + esc(t.id) + '"' + (marcado ? ' checked' : '') + '> ' +
            '<span>' + esc(t.nombre) + '</span></label>' + htmlNivel(ed.asignaturaId, t.id) + '</div>';
        }).join('') + '</div>';
    }).join('');
  }

  function leerEditor() {
    var ed = ui.editor;
    ed.titulo = document.getElementById('ed-titulo').value.trim();
    ed.fecha = document.getElementById('ed-fecha').value;
    ed.hora = document.getElementById('ed-hora').value;
    ed.inicio = document.getElementById('ed-inicio').value;
    ed.temas = Array.prototype.map.call(document.querySelectorAll('.ed-tema:checked'), function (c) { return c.value; });
  }

  function guardarExamen(otro) {
    leerEditor();
    var ed = ui.editor;
    if (!ed.fecha) { avisar('Indica la fecha del examen.'); return; }
    if (!ed.temas.length) { avisar('Marca al menos un tema que entre en el examen.'); return; }
    var inicio = ed.inicio && ed.inicio <= ed.fecha ? ed.inicio : inicioPorDefecto(ed);
    var datos = {
      id: ed.id || nuevoId(),
      asignaturaId: ed.asignaturaId,
      tipo: ed.tipo,
      titulo: ed.titulo || tituloPorDefecto(ed),
      fecha: ed.fecha,
      hora: ed.hora,
      inicio: inicio,
      inicioManual: ed.inicioManual,
      temas: ed.temas
    };
    cambiarPlan(function () {
      var i = estado.examenes.findIndex(function (e) { return e.id === datos.id; });
      if (i >= 0) estado.examenes[i] = datos; else estado.examenes.push(datos);
      if (estado.asignaturas.indexOf(datos.asignaturaId) < 0) estado.asignaturas.push(datos.asignaturaId);
    });
    ui.ultimaFecha = datos.fecha;
    if (otro) {
      abrirEditor(null);
      document.getElementById('dialogo').scrollTop = 0;
      avisar('Examen guardado. Añade el siguiente.');
      return;
    }
    document.getElementById('dialogo').close();
    avisar(ed.id ? 'Examen actualizado. Plan reorganizado.' : 'Examen añadido. ¡Tu plan está listo!');
  }

  function borrarExamen(id) {
    var ex = examenPorId(id);
    if (!ex || !confirm('¿Borrar «' + ex.titulo + '» y sus sesiones del plan?')) return;
    cambiarPlan(function () {
      estado.examenes = estado.examenes.filter(function (e) { return e.id !== id; });
      Object.keys(estado.hechas).forEach(function (k) { if (k.indexOf(id + '|') === 0) delete estado.hechas[k]; });
    });
    var dlg = document.getElementById('dialogo');
    if (dlg.open) dlg.close();
    avisar('Examen borrado.');
  }

  /* ----------------------------- Temario ------------------------------ */

  function vistaAsignaturas() {
    var html = '<div class="titulo-vista"><div><h2>Temario PAU</h2><p class="suave">Temas de cada asignatura y cómo es su examen, según las directrices oficiales 2026-2027.</p></div></div>';
    var usadas = asignaturasUsadas();
    var orden = usadas.concat(C.asignaturas.map(function (a) { return a.id; }).filter(function (id) { return usadas.indexOf(id) < 0; }));
    orden.forEach(function (id) {
      var a = asignatura(id);
      html += '<details class="tarjeta asig-panel" data-asig="' + id + '"' + (ui.asigAbierta === id ? ' open' : '') + '>' +
        '<summary><span class="punto" style="width:14px;height:14px;border-radius:50%;background:' + a.color + '"></span>' +
        '<span><b>' + esc(a.nombre) + '</b><br><span class="suave pequeno">' + temasDe(id).length + ' temas · examen de ' + a.examen.duracion + ' min</span></span></summary>' +
        '<div class="asig-panel-cuerpo">' + htmlInfoExamen(a) +
        bloquesDe(id).map(function (b) {
          return '<div class="bloque-temas"><h4>' + esc(b.nombre) + '</h4>' + b.temas.map(function (t) {
            var n = nivelDe(id, t.id);
            return '<div class="tema-fila"><span class="nombre">' + esc(t.nombre) +
              (t.teoria && !/^Unidad temática|^Tema \d/.test(t.teoria) ? '<br><span class="suave pequeno">' + esc(t.teoria) + '</span>' : '') + '</span>' +
              (n ? '<span class="chip">' + esc(P.NOMBRE_NIVEL[n]) + '</span>' : '') +
              (t.propio ? '<button class="boton pequeno peligro" data-accion="borrar-tema" data-asig="' + id + '" data-tema="' + esc(t.id) + '">Quitar</button>' : '') +
              '</div>';
          }).join('') + '</div>';
        }).join('') +
        '</div></details>';
    });
    return html;
  }

  function htmlInfoExamen(a) {
    var e = a.examen;
    return '<div class="info-examen tarjeta" style="margin:0 0 6px;background:var(--azul-suave);border:0">' +
      '<h3>Cómo es el examen PAU (' + e.duracion + ' min)</h3><ul>' + e.estructura.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
      '<p><b>Material:</b> ' + esc(e.materiales) + '</p>' +
      '<h3 style="margin-top:12px">Consejos de las directrices</h3><ul>' + e.consejos.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
      '<a class="boton pequeno" href="' + esc(a.pdf) + '" target="_blank" rel="noopener">Ver directrices oficiales (PDF)</a></div>';
  }

  function ponerNivel(asigId, temaId, n, boton) {
    estado.niveles[asigId] = estado.niveles[asigId] || {};
    if (n) estado.niveles[asigId][temaId] = n;
    else delete estado.niveles[asigId][temaId];
    guardar();
    // Actualización en el sitio (el mismo tema puede aparecer en varios sitios de la pantalla).
    document.querySelectorAll('[data-accion="nivel"][data-asig="' + asigId + '"][data-tema="' + temaId + '"]').forEach(function (b) {
      var activo = +b.getAttribute('data-n') === n;
      b.classList.toggle('activo', activo);
      b.setAttribute('aria-pressed', activo);
    });
    planPendiente = true;
    clearTimeout(temporizadorPlan);
    temporizadorPlan = setTimeout(aplicarPlanPendiente, 800);
  }

  var planPendiente = false, temporizadorPlan;
  function aplicarPlanPendiente() {
    if (!planPendiente) return;
    planPendiente = false;
    replanificar();
  }

  /* ----------------------------- Horario ------------------------------ */

  function vistaHorario() {
    var d = estado.disponibilidad;
    var min = P.minutosSemana(d);
    var html = '<div class="titulo-vista"><div><h2>Horario de estudio</h2><p class="suave">Indica las franjas en las que puedes estudiar cada día. El plan solo usará esas horas.</p></div></div>';
    if (!estado.horarioRevisado) {
      html += '<div class="aviso info">Hemos puesto un horario de ejemplo. Ajústalo a tu semana real (extraescolares, academia, deporte…) y pulsa «Mi horario está listo».' +
        ' <button class="boton pequeno primario" data-accion="horario-ok">Mi horario está listo</button></div>';
    }
    html += '<div class="tarjeta"><h3>Semana tipo <span class="chip" style="margin-left:6px">' + horas(min) + ' a la semana</span></h3>';
    ORDEN_DIAS.forEach(function (dia) {
      var franjas = d.semanal[dia] || [];
      html += '<div class="dia-horario"><div class="nombre-dia">' + NOMBRE_DIA[dia] + '</div><div class="franjas">' +
        (franjas.length ? franjas.map(function (f, i) {
          return '<span class="franja">' + esc(f.ini) + '–' + esc(f.fin) +
            '<button data-accion="quitar-franja" data-dia="' + dia + '" data-i="' + i + '" aria-label="Quitar franja">×</button></span>';
        }).join('') : '<span class="suave pequeno">Sin estudio</span>') +
        (ui.franjaDia === dia
          ? '<span class="nueva-franja"><input type="time" value="' + sugerirInicio(franjas) + '" data-franja-ini="' + dia + '" aria-label="Desde">' +
            '<span>–</span><input type="time" value="' + sugerirFin(franjas) + '" data-franja-fin="' + dia + '" aria-label="Hasta">' +
            '<button class="boton pequeno primario" data-accion="add-franja" data-dia="' + dia + '">Añadir</button>' +
            '<button class="boton pequeno" data-accion="cancelar-franja">Cancelar</button></span>'
          : '<button class="boton pequeno" data-accion="abrir-franja" data-dia="' + dia + '">+ Franja</button>') +
        '</div></div>';
    });
    html += '<div class="botones" style="margin-top:10px"><button class="boton pequeno" data-accion="copiar-lunes">Copiar el lunes de martes a viernes</button></div></div>';

    html += '<div class="tarjeta"><h3>Sesiones de estudio</h3>' +
      '<p class="suave pequeno">Cada franja se divide en sesiones con un descanso entre ellas.</p>' +
      '<div class="fila-campos"><div class="campo"><span>Duración de cada sesión</span><div class="segmentado">' +
      [30, 45, 50, 60].map(function (m) {
        return '<button data-accion="sesion" data-min="' + m + '" class="' + (estado.ajustes.sesion === m ? 'activo' : '') + '">' + m + ' min</button>';
      }).join('') + '</div></div>' +
      '<div class="campo"><span>Descanso</span><div class="segmentado">' +
      [5, 10, 15].map(function (m) {
        return '<button data-accion="descanso" data-min="' + m + '" class="' + (estado.ajustes.descanso === m ? 'activo' : '') + '">' + m + ' min</button>';
      }).join('') + '</div></div></div></div>';

    // Días especiales
    var exc = Object.keys(d.excepciones).sort();
    html += '<div class="tarjeta"><h3>Días especiales</h3><p class="suave pequeno">Días sin estudio (viajes, cumpleaños, otros exámenes…) o con un horario distinto al habitual.</p>';
    if (exc.length) {
      html += exc.map(function (f) {
        var fr = d.excepciones[f];
        return '<div class="tema-fila"><span class="nombre">' + esc(fmtLargo(f)) + '</span>' +
          '<span class="suave">' + (fr.length ? fr.map(function (x) { return esc(x.ini + '–' + x.fin); }).join(', ') : 'Sin estudio') + '</span>' +
          '<button class="boton pequeno peligro" data-accion="quitar-excepcion" data-fecha="' + f + '">Quitar</button></div>';
      }).join('');
    }
    html += '<div class="fila-campos" style="margin-top:12px">' +
      '<label class="campo"><span>Desde</span><input type="date" id="exc-desde" value="' + hoy() + '"></label>' +
      '<label class="campo"><span>Hasta (opcional)</span><input type="date" id="exc-hasta"></label>' +
      '<label class="campo"><span>Tipo</span><select id="exc-tipo"><option value="libre">Sin estudio</option><option value="especial">Horario especial</option></select></label>' +
      '</div><div class="botones oculto" id="exc-horas" style="margin-bottom:12px"><span class="suave">Horario especial:</span>' +
      '<input type="time" id="exc-ini" value="10:00"><span>–</span><input type="time" id="exc-fin" value="12:00"></div>' +
      '<button class="boton" data-accion="add-excepcion">Añadir día especial</button></div>';
    return html;
  }

  function sugerirInicio(franjas) {
    if (!franjas.length) return '17:00';
    var m = Math.min(F.horaAMin(franjas[franjas.length - 1].fin) + 30, 22 * 60);
    return F.minAHora(m);
  }
  function sugerirFin(franjas) {
    return F.minAHora(Math.min(F.horaAMin(sugerirInicio(franjas)) + 60, 23 * 60 + 30));
  }

  /* ------------------------------- Más -------------------------------- */

  function vistaMas() {
    var html = '<div class="titulo-vista"><div><h2>Más opciones</h2></div></div>';
    html += '<div class="tarjeta"><h3>Tu nombre</h3><input type="text" data-campo="nombre" value="' + esc(estado.nombre) + '" placeholder="¿Cómo te llamas?" maxlength="40"></div>';

    html += '<div class="tarjeta"><h3>Exportar el plan</h3>' +
      '<p class="suave">Guárdalo en PDF o añádelo al calendario de tu iPad, Google Calendar u Outlook.</p>' +
      '<label class="botones" style="align-items:center;margin:8px 0"><input type="checkbox" data-campo="alarma"' + (estado.ajustes.alarma ? ' checked' : '') +
      ' style="width:22px;height:22px;accent-color:var(--verde)"> Aviso 10 minutos antes de cada sesión en el calendario</label>' +
      '<button class="boton azul" data-accion="exportar">Exportar / imprimir</button></div>';

    html += '<div class="tarjeta"><h3>Cómo añadir el plan a tu calendario</h3>' +
      '<p><b>iPad / iPhone (Calendario de Apple):</b> pulsa «Descargar calendario», abre el archivo descargado y toca «Añadir todo». Te recomendamos crear antes un calendario nuevo llamado «Rumbo PAU».</p>' +
      '<p><b>Google Calendar:</b> desde un ordenador, entra en calendar.google.com → ⚙️ Configuración → Importar y exportar → selecciona el archivo .ics.</p>' +
      '<p><b>Outlook / Microsoft:</b> en outlook.com → Calendario → Agregar calendario → Cargar desde archivo.</p>' +
      '<p class="suave pequeno">Si reorganizas el plan, borra el calendario «Rumbo PAU» y vuelve a importarlo para no tener sesiones duplicadas.</p></div>';

    html += '<div class="tarjeta"><h3>Instalar en el iPad</h3>' +
      '<p>Abre esta página en Safari, pulsa el botón Compartir y elige «Añadir a pantalla de inicio». Se abrirá como una app y funcionará también sin conexión.</p></div>';

    html += '<div class="tarjeta"><h3>Copia de seguridad</h3>' +
      '<p class="suave">Tus datos se guardan solo en este dispositivo. Descarga una copia para pasarlos a otro dispositivo o por si borras el navegador.</p>' +
      '<div class="botones"><button class="boton" data-accion="copia-descargar">Descargar copia</button>' +
      '<label class="boton">Restaurar copia<input type="file" accept=".json,application/json" data-accion="copia-restaurar" class="oculto"></label></div></div>';

    html += '<div class="tarjeta"><h3>Directrices oficiales PAU 2026-2027</h3><p class="suave pequeno">El planificador se basa en las directrices de las ponencias de Andalucía.</p><div class="botones">' +
      C.asignaturas.map(function (a) { return '<a class="boton pequeno" href="' + esc(a.pdf) + '" target="_blank" rel="noopener">' + esc(a.corto) + '</a>'; }).join('') + '</div></div>';

    html += '<div class="tarjeta"><h3>Borrar datos</h3><p class="suave">Elimina asignaturas, exámenes, horario y progreso de este dispositivo.</p>' +
      '<button class="boton peligro" data-accion="borrar-todo">Borrar todos mis datos</button></div>';
    html += '<p class="suave pequeno" style="text-align:center">Rumbo PAU · Planificador de estudio para 2º de Bachillerato</p>';
    return html;
  }

  /* ----------------------------- Exportar ----------------------------- */

  function abrirExportar() {
    if (!sesionesPlan().length) { avisar('Todavía no hay sesiones en tu plan.'); return; }
    var dlg = document.getElementById('dialogo');
    dlg.innerHTML = '<form method="dialog"><div class="dialogo-cab"><h2>Exportar el plan</h2><button class="boton icono" value="cancelar" aria-label="Cerrar">✕</button></div>' +
      '<div class="dialogo-cuerpo">' +
      '<label class="campo"><span>¿Qué parte del plan?</span><select id="exp-rango">' +
        '<option value="7">Los próximos 7 días</option><option value="30" selected>Los próximos 30 días</option><option value="todo">Todo el plan</option></select></label>' +
      '<label class="botones" style="align-items:center;margin-bottom:12px"><input type="checkbox" id="exp-examenes" checked style="width:22px;height:22px;accent-color:var(--verde)"> Incluir los exámenes</label>' +
      '<p class="suave pequeno">PDF: se abrirá la ventana de impresión. En iPad, pulsa «Compartir» o «Imprimir» y guarda como PDF.<br>' +
      'Calendario: descarga un archivo .ics compatible con Apple, Google y Outlook.</p></div>' +
      '<div class="dialogo-pie"><button type="button" class="boton" data-accion="exp-pdf">Imprimir / PDF</button>' +
      '<button type="button" class="boton primario" data-accion="exp-ics">Descargar calendario (.ics)</button></div></form>';
    dlg.showModal();
  }

  function seleccionExportar() {
    var rango = document.getElementById('exp-rango').value;
    var conExamenes = document.getElementById('exp-examenes').checked;
    var h = hoy();
    var hasta = rango === 'todo' ? '9999-12-31' : F.sumar(h, +rango - 1);
    var sesiones = sesionesPlan().filter(function (s) { return s.fecha >= h && s.fecha <= hasta && !estado.hechas[s.id]; });
    var examenes = conExamenes ? estado.examenes.filter(function (e) { return e.fecha >= h && e.fecha <= hasta; }) : [];
    return { sesiones: sesiones, examenes: examenes, hasta: hasta, rango: rango };
  }

  function exportarIcs() {
    var sel = seleccionExportar();
    var ics = window.Exportar.generarIcs(
      sel.sesiones.map(function (s) {
        return { id: s.id, fecha: s.fecha, ini: s.ini, fin: s.fin, titulo: s.titulo, detalle: s.detalle, asignatura: asignatura(s.asignaturaId).corto };
      }),
      sel.examenes.map(function (e) {
        return { id: e.id, fecha: e.fecha, hora: e.hora, duracion: duracionExamen(e), titulo: e.titulo, asignatura: asignatura(e.asignaturaId).nombre };
      }),
      { alarma: estado.ajustes.alarma }
    );
    window.Exportar.descargar('rumbo-pau-plan.ics', ics, 'text/calendar;charset=utf-8');
    document.getElementById('dialogo').close();
    avisar('Calendario descargado. Ábrelo para añadirlo.');
  }

  function exportarPdf() {
    var sel = seleccionExportar();
    var porDia = {};
    sel.sesiones.forEach(function (s) { (porDia[s.fecha] = porDia[s.fecha] || []).push(s); });
    var exDia = {};
    sel.examenes.forEach(function (e) { (exDia[e.fecha] = exDia[e.fecha] || []).push(e); });
    var dias = Object.keys(porDia).concat(Object.keys(exDia)).filter(function (d, i, a) { return a.indexOf(d) === i; }).sort();
    var html = '<h1>Plan de estudio' + (estado.nombre ? ' de ' + esc(estado.nombre) : '') + '</h1>' +
      '<div class="sub">Rumbo PAU · Generado el ' + esc(fmtFecha(hoy())) + (sel.rango === 'todo' ? '' : ' · próximos ' + sel.rango + ' días') + '</div>';
    dias.forEach(function (d) {
      html += '<h2>' + esc(fmtLargo(d)) + '</h2><table>';
      (exDia[d] || []).forEach(function (e) {
        html += '<tr><td class="h">' + esc(e.hora || '') + '</td><td class="a ex">EXAMEN</td><td class="ex">' + esc(e.titulo) + '</td><td class="c"></td></tr>';
      });
      (porDia[d] || []).forEach(function (s) {
        html += '<tr><td class="h">' + esc(s.ini) + '–' + esc(s.fin) + '</td><td class="a">' + esc(asignatura(s.asignaturaId).corto) + '</td>' +
          '<td><b>' + esc(s.titulo) + '</b><div class="d">' + esc(s.detalle) + '</div></td><td class="c">☐</td></tr>';
      });
      html += '</table>';
    });
    html += '<div class="pie">Marca cada sesión al terminarla. Si te retrasas, abre Rumbo PAU y el plan se reorganiza solo.</div>';
    document.getElementById('impresion').innerHTML = html;
    document.getElementById('dialogo').close();
    setTimeout(function () { window.print(); }, 150);
  }

  /* ============================== Eventos ============================= */

  document.addEventListener('click', function (ev) {
    var ir = ev.target.closest('[data-ir]');
    if (ir) { ev.preventDefault(); irA(ir.getAttribute('data-ir')); return; }
    var nav = ev.target.closest('#navegacion button');
    if (nav) { irA(nav.getAttribute('data-vista')); return; }
    var el = ev.target.closest('[data-accion]');
    if (!el || el.tagName === 'INPUT') return;
    var acc = el.getAttribute('data-accion');
    var id = el.getAttribute('data-id');
    var dia, lista;
    switch (acc) {
      case 'hecha':
        if (estado.hechas[id]) delete estado.hechas[id];
        else {
          estado.hechas[id] = { fecha: hoy() };
          avisar('¡Bien hecho! 💪');
        }
        guardar();
        render();
        break;
      case 'cerrar-perdidas': ui.perdidas = 0; render(); break;
      case 'ocultar-valorar': estado.ocultarValorarHasta = hoy(); guardar(); render(); break;
      case 'reorganizar': replanificar(); render(); avisar('Plan reorganizado.'); break;
      case 'exportar': abrirExportar(); break;
      case 'exp-ics': exportarIcs(); break;
      case 'exp-pdf': exportarPdf(); break;
      case 'nuevo-examen': abrirEditor(null); break;
      case 'editar-examen': abrirEditor(id); break;
      case 'borrar-examen': borrarExamen(id); break;
      case 'guardar-examen': guardarExamen(el.getAttribute('data-otro') === '1'); break;
      case 'borrar-pasados':
        if (!confirm('¿Borrar todos los exámenes pasados?')) break;
        cambiarPlan(function () {
          var h0 = hoy();
          estado.examenes.filter(function (e) { return e.fecha < h0; }).forEach(function (e) {
            Object.keys(estado.hechas).forEach(function (k) { if (k.indexOf(e.id + '|') === 0) delete estado.hechas[k]; });
          });
          estado.examenes = estado.examenes.filter(function (e) { return e.fecha >= h0; });
        });
        break;
      case 'ed-tipo':
        leerEditor();
        ui.editor.tipo = el.getAttribute('data-tipo');
        if (ui.editor.tipo === 'pau') ui.editor.temas = temasDe(ui.editor.asignaturaId).map(function (t) { return t.id; });
        if (!ui.editor.inicioManual) ui.editor.inicio = inicioPorDefecto(ui.editor);
        pintarEditor();
        break;
      case 'ed-bloque':
        var cajas = document.querySelectorAll('.ed-tema[data-bloque="' + el.getAttribute('data-bloque') + '"]');
        var todas = Array.prototype.every.call(cajas, function (c) { return c.checked; });
        cajas.forEach(function (c) { c.checked = !todas; c.closest('.tema-fila').classList.toggle('marcado', c.checked); });
        break;
      case 'ed-add-tema':
        var nombre = document.getElementById('ed-nuevo-tema').value.trim();
        if (!nombre) { avisar('Escribe el nombre del tema.'); break; }
        leerEditor();
        var nuevo = { id: 'p' + nuevoId(), nombre: nombre, peso: +document.getElementById('ed-nuevo-peso').value };
        (estado.temasPropios[ui.editor.asignaturaId] = estado.temasPropios[ui.editor.asignaturaId] || []).push(nuevo);
        ui.editor.temas.push(nuevo.id);
        guardar();
        pintarEditor();
        break;
      case 'nivel':
        // Pulsar otra vez la opción marcada la quita (tema sin valorar).
        var nNivel = +el.getAttribute('data-n');
        if (nivelDe(el.getAttribute('data-asig'), el.getAttribute('data-tema')) === nNivel) nNivel = 0;
        ponerNivel(el.getAttribute('data-asig'), el.getAttribute('data-tema'), nNivel, el);
        break;
      case 'borrar-tema':
        var a2 = el.getAttribute('data-asig'), t2 = el.getAttribute('data-tema');
        if (!confirm('¿Quitar este tema? También se quitará de tus exámenes.')) break;
        ui.asigAbierta = a2;
        cambiarPlan(function () {
          estado.temasPropios[a2] = (estado.temasPropios[a2] || []).filter(function (t) { return t.id !== t2; });
          estado.examenes.forEach(function (e) { e.temas = e.temas.filter(function (x) { return x !== t2; }); });
        });
        break;
      case 'abrir-franja': ui.franjaDia = +el.getAttribute('data-dia'); render(); break;
      case 'cancelar-franja': ui.franjaDia = null; render(); break;
      case 'add-franja':
        dia = +el.getAttribute('data-dia');
        var ini = document.querySelector('[data-franja-ini="' + dia + '"]').value;
        var fin = document.querySelector('[data-franja-fin="' + dia + '"]').value;
        if (!ini || !fin || fin <= ini) { avisar('La hora final debe ser posterior a la inicial.'); break; }
        estado.horarioRevisado = true;
        ui.franjaDia = null;
        cambiarPlan(function () {
          lista = estado.disponibilidad.semanal[dia] = estado.disponibilidad.semanal[dia] || [];
          lista.push({ ini: ini, fin: fin });
          lista.sort(function (a, b) { return a.ini < b.ini ? -1 : 1; });
        });
        break;
      case 'quitar-franja':
        dia = +el.getAttribute('data-dia');
        estado.horarioRevisado = true;
        cambiarPlan(function () { estado.disponibilidad.semanal[dia].splice(+el.getAttribute('data-i'), 1); });
        break;
      case 'copiar-lunes':
        cambiarPlan(function () {
          [2, 3, 4, 5].forEach(function (d) {
            estado.disponibilidad.semanal[d] = (estado.disponibilidad.semanal[1] || []).map(function (f) { return { ini: f.ini, fin: f.fin }; });
          });
        });
        avisar('Horario del lunes copiado.');
        break;
      case 'horario-ok':
        estado.horarioRevisado = true;
        guardar();
        render();
        break;
      case 'sesion': cambiarPlan(function () { estado.ajustes.sesion = +el.getAttribute('data-min'); }); break;
      case 'descanso': cambiarPlan(function () { estado.ajustes.descanso = +el.getAttribute('data-min'); }); break;
      case 'add-excepcion':
        var desde = document.getElementById('exc-desde').value;
        var hasta = document.getElementById('exc-hasta').value || desde;
        var tipo = document.getElementById('exc-tipo').value;
        var ei = document.getElementById('exc-ini').value, ef = document.getElementById('exc-fin').value;
        if (!desde || hasta < desde) { avisar('Revisa las fechas.'); break; }
        if (tipo === 'especial' && (!ei || !ef || ef <= ei)) { avisar('Revisa el horario especial.'); break; }
        if (F.entre(desde, hasta) > 120) { avisar('Como máximo 120 días seguidos.'); break; }
        cambiarPlan(function () {
          for (var d = desde; d <= hasta; d = F.sumar(d, 1)) {
            estado.disponibilidad.excepciones[d] = tipo === 'especial' ? [{ ini: ei, fin: ef }] : [];
          }
        });
        break;
      case 'quitar-excepcion':
        cambiarPlan(function () { delete estado.disponibilidad.excepciones[el.getAttribute('data-fecha')]; });
        break;
      case 'copia-descargar':
        var copia = JSON.parse(JSON.stringify(estado));
        delete copia.plan;
        window.Exportar.descargar('rumbo-pau-copia-' + hoy() + '.json', JSON.stringify(copia, null, 1), 'application/json');
        break;
      case 'borrar-todo':
        if (!confirm('¿Seguro que quieres borrar todos tus datos de este dispositivo?')) break;
        estado = estadoInicial();
        guardar();
        irA('hoy');
        break;
    }
  });

  document.addEventListener('change', function (ev) {
    var el = ev.target;
    var campo = el.getAttribute('data-campo');
    if (campo === 'filtroPlan') { ui.filtroPlan = el.value; render(); return; }
    if (campo === 'verPasados') { ui.verPasados = el.checked; render(); return; }
    if (campo === 'nombre') { estado.nombre = el.value.trim(); guardar(); avisar('Guardado.'); return; }
    if (campo === 'alarma') { estado.ajustes.alarma = el.checked; guardar(); return; }
    if (el.id === 'ed-asig') {
      leerEditor();
      ui.editor.asignaturaId = el.value;
      ui.editor.temas = ui.editor.tipo === 'pau' ? temasDe(el.value).map(function (t) { return t.id; }) : [];
      pintarEditor();
      return;
    }
    if (el.id === 'ed-fecha') {
      leerEditor();
      if (!ui.editor.inicioManual) {
        ui.editor.inicio = inicioPorDefecto(ui.editor);
        document.getElementById('ed-inicio').value = ui.editor.inicio;
      }
      return;
    }
    if (el.classList.contains('ed-tema')) { el.closest('.tema-fila').classList.toggle('marcado', el.checked); return; }
    if (el.id === 'exc-tipo') { document.getElementById('exc-horas').classList.toggle('oculto', el.value !== 'especial'); return; }
    if (el.id === 'ed-inicio') { ui.editor.inicioManual = true; return; }
    if (el.getAttribute('data-accion') === 'copia-restaurar' && el.files && el.files[0]) {
      var lector = new FileReader();
      lector.onload = function () {
        try {
          var datos = JSON.parse(lector.result);
          if (!datos || datos.version !== 1 || !Array.isArray(datos.examenes)) throw new Error('formato');
          if (!confirm('Se sustituirán los datos actuales por los de la copia. ¿Continuar?')) return;
          var base = estadoInicial();
          Object.keys(base).forEach(function (k) { if (datos[k] === undefined) datos[k] = base[k]; });
          estado = datos;
          estado.plan = null;
          replanificar();
          irA('hoy');
          avisar('Copia restaurada.');
        } catch (err) { avisar('El archivo no es una copia válida de Rumbo PAU.'); }
      };
      lector.readAsText(el.files[0]);
    }
  });

  // Enter dentro de un formulario de diálogo no debe cerrarlo sin guardar.
  document.addEventListener('submit', function (ev) {
    if (ev.submitter && ev.submitter.value === 'cancelar') return;
    ev.preventDefault();
  });

  document.addEventListener('toggle', function (ev) {
    var d = ev.target;
    if (d.classList && d.classList.contains('asig-panel')) {
      if (d.open) ui.asigAbierta = d.getAttribute('data-asig');
      else if (ui.asigAbierta === d.getAttribute('data-asig')) ui.asigAbierta = null;
    }
  }, true);

  document.getElementById('dialogo').addEventListener('close', function () {
    if (planPendiente) { aplicarPlanPendiente(); render(); }
  });

  // Al cambiar de sección se aplican los cambios de valoración pendientes.
  document.getElementById('navegacion').addEventListener('click', function () {
    if (planPendiente) aplicarPlanPendiente();
  }, true);

  // Al volver a la app (p. ej. al día siguiente) se comprueba si hay que reorganizar.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      var antes = estado.plan && estado.plan.generado;
      asegurarPlan();
      if (estado.plan && estado.plan.generado !== antes) render();
    }
  });

  /* ============================== Inicio ============================== */

  asegurarPlan();
  render();

  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* sin modo offline */ });
    });
  }
})();
