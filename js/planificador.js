/*
 * Motor de planificación de Rumbo PAU.
 *
 * Convierte los exámenes (con sus temas y la valoración del alumno) en tareas de estudio
 * y las coloca en las franjas horarias disponibles, día a día.
 *
 * Idea general:
 *   1. Cada tema genera una cadena de tareas: estudio → práctica(s) → repaso espaciado → repaso final.
 *      El número de sesiones depende del peso del tema y de cómo lo lleva el alumno.
 *   2. Cada examen añade un simulacro y un repaso ligero la víspera.
 *   3. Las tareas de estudio se reparten de forma uniforme entre la fecha de inicio y los días finales,
 *      que se reservan para repasos y simulacro.
 *   4. Un algoritmo voraz rellena cada franja con la tarea más urgente, evitando repetir tema el mismo día
 *      y alternando asignaturas.
 *   5. Si no da tiempo, se recortan primero las tareas "extra" (prácticas adicionales, repasos espaciados)
 *      y se avisa al alumno de lo que falta.
 */
(function (global) {
  'use strict';

  var FACTOR_NIVEL = { 1: 0.5, 2: 1, 3: 1.7 };
  var NOMBRE_NIVEL = { 1: 'lo domino', 2: 'regular', 3: 'me cuesta' };

  /* ---------------------------- Fechas ---------------------------- */

  function parseFecha(s) {
    var p = s.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function fmtFecha(d) {
    var m = d.getMonth() + 1, dd = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
  }
  function sumarDias(s, n) {
    var d = parseFecha(s);
    d.setDate(d.getDate() + n);
    return fmtFecha(d);
  }
  function diasEntre(a, b) {
    // b - a en días (a y b en formato AAAA-MM-DD)
    return Math.round((parseFecha(b) - parseFecha(a)) / 86400000);
  }
  function horaAMin(h) {
    var p = h.split(':');
    return (+p[0]) * 60 + (+p[1]);
  }
  function minAHora(m) {
    var h = Math.floor(m / 60), mm = m % 60;
    return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm;
  }

  /* ------------------------- Disponibilidad ------------------------ */

  // Devuelve las franjas libres de un día como [[ini, fin], ...] en minutos, ordenadas y fusionadas.
  function franjasDelDia(fecha, disponibilidad) {
    var lista;
    var exc = disponibilidad.excepciones || {};
    if (Object.prototype.hasOwnProperty.call(exc, fecha)) lista = exc[fecha] || [];
    else lista = (disponibilidad.semanal || {})[parseFecha(fecha).getDay()] || [];
    var fr = lista
      .map(function (f) { return [horaAMin(f.ini), horaAMin(f.fin)]; })
      .filter(function (f) { return f[1] > f[0]; })
      .sort(function (a, b) { return a[0] - b[0]; });
    var out = [];
    fr.forEach(function (f) {
      var u = out[out.length - 1];
      if (u && f[0] <= u[1]) u[1] = Math.max(u[1], f[1]);
      else out.push(f.slice());
    });
    return out;
  }

  // Resta intervalos ocupados a una lista de franjas.
  function restarOcupado(franjas, ocupados) {
    var res = franjas.map(function (f) { return f.slice(); });
    ocupados.forEach(function (o) {
      var nuevo = [];
      res.forEach(function (f) {
        if (o[1] <= f[0] || o[0] >= f[1]) { nuevo.push(f); return; }
        if (o[0] > f[0]) nuevo.push([f[0], o[0]]);
        if (o[1] < f[1]) nuevo.push([o[1], f[1]]);
      });
      res = nuevo;
    });
    return res;
  }

  /* ----------------------------- Textos ---------------------------- */

  var INSTRUCCION_PRACTICA = {
    problemas: 'Resuelve 3-4 ejercicios tipo PAU de este tipo, corrígelos con las soluciones y apunta tus errores en un cuaderno de fallos.',
    memoria: 'Estudia unos 25 minutos y después escribe de memoria lo que recuerdes; compara con tus apuntes y completa en otro color lo que faltaba.',
    redaccion: 'Hazlo con tiempo limitado, como en el examen, y revisa después la ortografía y la expresión.',
    grafico: 'Resuelve 1-2 láminas dejando visibles las construcciones auxiliares y compáralas con la solución.'
  };
  var INSTRUCCION_ESTUDIO = {
    problemas: 'Haz un resumen con las fórmulas y procedimientos clave y repasa 2-3 ejemplos resueltos.',
    memoria: 'Lee, subraya y haz un esquema propio; termina explicándolo en voz alta sin mirar.',
    redaccion: 'Haz un esquema propio con las ideas clave y anota ejemplos que puedas usar en el examen.',
    grafico: 'Repasa los fundamentos y el procedimiento paso a paso con un ejemplo resuelto.'
  };

  function textoTarea(tarea, fecha) {
    var a = tarea.asignatura, tema = tarea.tema, ex = tarea.examen;
    var estilo = a.estilo || 'problemas';
    var ejercicio = tema && tema.ejercicios && tema.ejercicios.length
      ? tema.ejercicios[(tarea.indice || 0) % tema.ejercicios.length] : '';
    var consejo = tema && tema.consejo ? ' Ojo: ' + tema.consejo : '';
    switch (tarea.tipo) {
      case 'estudio':
        return {
          titulo: 'Estudio: ' + tema.nombre,
          detalle: (tema.teoria ? tema.teoria + ' ' : '') + INSTRUCCION_ESTUDIO[estilo]
        };
      case 'practica':
        return {
          titulo: 'Práctica: ' + tema.nombre,
          detalle: ejercicio + '. ' + INSTRUCCION_PRACTICA[estilo] + consejo
        };
      case 'completo':
        return {
          titulo: 'Repaso y práctica: ' + tema.nombre,
          detalle: 'Repasa tu resumen del tema y practica: ' + ejercicio.charAt(0).toLowerCase() + ejercicio.slice(1) + '.' + consejo
        };
      case 'espaciado':
        return {
          titulo: 'Repaso espaciado: ' + tema.nombre,
          detalle: 'Sin mirar los apuntes, escribe todo lo que recuerdes del tema o rehaz 2 ejercicios que fallaste. Después comprueba. Así se fija a largo plazo.'
        };
      case 'final':
        return {
          titulo: 'Repaso final: ' + tema.nombre,
          detalle: 'Repasa tu esquema y el cuaderno de fallos y haz un ejercicio rápido de: ' + ejercicio.charAt(0).toLowerCase() + ejercicio.slice(1) + '.'
        };
      case 'simulacro':
        var mini = tarea.duracion < ex.duracion;
        var base = ex.tipo === 'pau'
          ? 'Haz un examen PAU completo de ' + a.nombre + ' (modelo de las directrices o exámenes de años anteriores de la Junta de Andalucía) sin interrupciones y corrígelo con los criterios oficiales.'
          : 'Prepara un examen con ejercicios de todos los temas que entran y hazlo cronometrado, sin apuntes. Corrígelo y repasa los fallos.';
        return {
          titulo: (mini ? 'Mini-simulacro' : 'Simulacro') + (tarea.segundo ? ' 2' : '') + ': ' + ex.titulo,
          detalle: base + (mini ? ' (Tu franja más larga es de ' + tarea.duracion + ' min: haz la parte que te dé tiempo.)' : ' Duración: ' + ex.duracion + ' min.')
        };
      case 'vispera':
        var manana = fecha && sumarDias(fecha, 1) === ex.fecha;
        return {
          titulo: 'Repaso ligero: ' + ex.titulo + (manana ? ' es mañana' : ' (último repaso)'),
          detalle: 'Solo repasar esquemas, fórmulas y tus errores frecuentes. Nada nuevo. Prepara el material del examen y duerme bien.'
        };
    }
    return { titulo: tarea.tipo, detalle: '' };
  }

  /* ------------------------ Generación de tareas -------------------- */

  function bloquesTema(tema, sesion) {
    var nivel = tema.nivel || 2;
    var minutos = (tema.peso || 1) * 60 * FACTOR_NIVEL[nivel];
    return Math.max(1, Math.round(minutos / sesion));
  }

  // Tipos de tarea de un tema según el número de bloques.
  function cadenaTipos(nb, nivel) {
    if (nb <= 1) return [{ tipo: 'completo', esencial: true }];
    if (nb === 2) return [{ tipo: 'estudio', esencial: true }, { tipo: 'practica', esencial: true }];
    var c = [{ tipo: 'estudio', esencial: true }];
    var np = nb >= 4 ? nb - 3 : 1;
    for (var i = 0; i < np; i++) c.push({ tipo: 'practica', esencial: i === 0 });
    if (nb >= 4) c.push({ tipo: 'espaciado', esencial: false, gap: 3 });
    c.push({ tipo: 'final', esencial: nivel >= 2, gap: 1 });
    return c;
  }

  // Quita k tareas extra pendientes de una cadena (primero repasos espaciados, después prácticas finales).
  function recortarCadena(cadena, k) {
    var orden = ['espaciado', 'practica', 'final'];
    for (var o = 0; o < orden.length && k > 0; o++) {
      for (var i = cadena.length - 1; i >= 0 && k > 0; i--) {
        var t = cadena[i];
        if (t.tipo === orden[o] && !t.esencial && !t.hecha && !t.quitada) { t.quitada = true; k--; }
      }
    }
  }

  function extrasPendientes(cadena) {
    return cadena.filter(function (t) { return !t.esencial && !t.hecha && !t.quitada; }).length;
  }

  function construirTareas(ctx, recorte) {
    var tareas = [];
    var porExamen = {};
    ctx.examenes.forEach(function (ex) {
      var ultimo = sumarDias(ex.fecha, -1);
      if (ultimo < ctx.hoy) return; // examen hoy o pasado
      var inicio = ex.inicio && ex.inicio > ctx.hoy ? ex.inicio : ctx.hoy;
      if (inicio > ultimo) inicio = ultimo;
      // Días con alguna franja libre dentro de la ventana de preparación.
      var dias = [];
      for (var d = inicio; d <= ultimo; d = sumarDias(d, 1)) {
        if (ctx.franjasLibres(d).some(function (f) { return f[1] - f[0] >= 20; })) dias.push(d);
      }
      if (!dias.length) dias = [ultimo];
      var M = dias.length;
      // Los últimos ~25 % de los días disponibles se reservan para repasos finales y simulacro.
      var finalK = M >= 4 ? Math.max(2, Math.round(M * 0.25)) : 1;
      var diasEstudio = M > finalK ? dias.slice(0, M - finalK) : dias;
      var inicioFinal = M > finalK ? dias[M - finalK] : dias[0];
      var info = { examen: ex, inicio: inicio, ultimo: ultimo, inicioFinal: inicioFinal, cadenas: [], tareas: [] };
      porExamen[ex.id] = info;

      var asig = ex.asignatura;
      var estudio = [];
      var finales = [];
      ex.temas.forEach(function (tema) {
        var nb = bloquesTema(tema, ctx.sesion);
        var tipos = cadenaTipos(nb, tema.nivel || 2);
        var cadena = [];
        var nPract = 0;
        tipos.forEach(function (def, i) {
          var indice = def.tipo === 'practica' ? nPract++ : (def.tipo === 'final' ? nPract + 1 : 0);
          var id = ex.id + '|' + tema.id + '|' + def.tipo + (def.tipo === 'practica' ? indice + 1 : '');
          var t = {
            id: id, examen: ex, asignatura: asig, tema: tema, tipo: def.tipo, indice: indice,
            esencial: def.esencial, gap: def.gap || 0, duracion: ctx.sesion,
            cadena: cadena, posCadena: i, deadline: ultimo, notBefore: inicio,
            hecha: !!ctx.hechas[id], fechaHecha: ctx.hechas[id] ? ctx.hechas[id].fecha : null
          };
          cadena.push(t);
        });
        var k = (recorte[ex.id] && recorte[ex.id][tema.id]) || 0;
        if (k) recortarCadena(cadena, k);
        info.cadenas.push(cadena);
        cadena.forEach(function (t) {
          if (t.hecha || t.quitada) return;
          if (t.tipo === 'final') finales.push(t);
          else if (t.tipo !== 'espaciado') estudio.push(t);
          tareas.push(t);
          info.tareas.push(t);
        });
      });

      // Reparto uniforme de las tareas de estudio entre los días disponibles previos a la ventana final.
      estudio.forEach(function (t, j) {
        t.notBefore = diasEstudio[Math.floor(j * diasEstudio.length / estudio.length)];
      });
      // Los repasos espaciados se liberan con su predecesor (y el hueco de 3 días) y deben caer antes de la ventana final.
      info.tareas.forEach(function (t) {
        if (t.tipo !== 'espaciado') return;
        t.notBefore = inicio;
        if (inicioFinal > inicio) t.deadline = sumarDias(inicioFinal, -1);
      });
      // Repasos finales: en la ventana final, primero los temas que más cuestan.
      finales.sort(function (a, b) { return (b.tema.nivel || 2) - (a.tema.nivel || 2); });
      var diasFinal = dias.slice(M - finalK);
      finales.forEach(function (t, j) {
        t.notBefore = diasFinal[Math.floor(j * diasFinal.length / finales.length)];
      });
      var inicioSimulacro = inicioFinal;

      // Simulacro
      if (ex.temas.length >= 2 || ex.tipo === 'pau') {
        var sid = ex.id + '|simulacro';
        if (!ctx.hechas[sid]) {
          var sim = {
            id: sid, examen: ex, asignatura: asig, tema: null, tipo: 'simulacro', esencial: true,
            duracion: ex.duracion, notBefore: inicioSimulacro,
            deadline: finalK >= 2 ? dias[M - 2] : dias[M - 1]
          };
          ajustarSimulacro(sim, ctx);
          if (sim.duracion) { tareas.push(sim); info.tareas.push(sim); }
          else info.sinSimulacro = true;
        }
        // En la PAU, con ventana final amplia, un segundo simulacro en la recta final.
        var sid2 = ex.id + '|simulacro2';
        if (ex.tipo === 'pau' && finalK >= 8 && !ctx.hechas[sid2]) {
          var sim2 = {
            id: sid2, examen: ex, asignatura: asig, tema: null, tipo: 'simulacro', segundo: true, esencial: false,
            duracion: ex.duracion, notBefore: dias[M - Math.ceil(finalK / 2)], deadline: dias[M - 2]
          };
          ajustarSimulacro(sim2, ctx);
          if (sim2.duracion) { tareas.push(sim2); info.tareas.push(sim2); }
        }
      }
      // Víspera
      if (M >= 2) {
        var vid = ex.id + '|vispera';
        if (!ctx.hechas[vid]) {
          var v = {
            id: vid, examen: ex, asignatura: asig, tema: null, tipo: 'vispera', esencial: true,
            duracion: Math.min(ctx.sesion, 45), notBefore: dias[M - 1], deadline: ultimo
          };
          tareas.push(v);
          info.tareas.push(v);
        }
      }
    });
    return { tareas: tareas, porExamen: porExamen };
  }

  // Si ninguna franja de la ventana permite el simulacro completo, lo acorta a la franja más larga.
  function ajustarSimulacro(sim, ctx) {
    var max = 0;
    for (var d = sim.notBefore; d <= sim.deadline; d = sumarDias(d, 1)) {
      ctx.franjasLibres(d).forEach(function (f) { max = Math.max(max, f[1] - f[0]); });
    }
    if (max >= sim.duracion) return;
    sim.duracion = max >= 20 ? max : 0;
  }

  /* --------------------------- Planificación ------------------------ */

  // Tarea de la que depende t. El repaso espaciado es una rama lateral: nadie depende de él.
  function previa(t) {
    if (!t.cadena) return null;
    for (var i = t.posCadena - 1; i >= 0; i--) {
      var c = t.cadena[i];
      if (!c.quitada && c.tipo !== 'espaciado') return c;
    }
    return null;
  }

  function programar(tareas, ctx, adelanto) {
    adelanto = adelanto || 0;
    tareas.forEach(function (t, i) { t.fecha = null; t.ini = null; t.orden = i; });
    var pendientes = tareas.slice();
    var sesiones = [];
    // Progreso por examen para repartir el tiempo de forma equilibrada cuando hay varios a la vez.
    var totalEx = {}, hechoEx = {};
    tareas.forEach(function (t) { totalEx[t.examen.id] = (totalEx[t.examen.id] || 0) + 1; hechoEx[t.examen.id] = 0; });
    var ultimoDia = ctx.hoy;
    tareas.forEach(function (t) { if (t.deadline > ultimoDia) ultimoDia = t.deadline; });

    for (var d = ctx.hoy; d <= ultimoDia && pendientes.length; d = sumarDias(d, 1)) {
      var franjas = ctx.franjasLibres(d);
      var temasHoy = {};
      var examenesHoy = {};
      franjas.forEach(function (f) {
        var cursor = f[0];
        var anteriorExamen = null;
        while (true) {
          var libre = f[1] - cursor;
          if (libre < 20) break;
          var mejor = null, mejorScore = -Infinity;
          for (var i = 0; i < pendientes.length; i++) {
            var t = pendientes[i];
            if (t.deadline < d || t.duracion > libre) continue;
            var adelantoDias = 0;
            if (t.notBefore > d) {
              // Se puede adelantar el estudio unos días si hay huecos libres (nunca los repasos finales).
              if (!adelanto || t.tipo === 'final' || t.tipo === 'simulacro' || t.tipo === 'vispera') continue;
              adelantoDias = diasEntre(d, t.notBefore);
              if (adelantoDias > adelanto) continue;
            }
            var p = previa(t);
            if (p) {
              if (p.hecha) {
                if (p.fechaHecha && sumarDias(p.fechaHecha, t.gap) > d) continue;
              } else {
                if (!p.fecha) continue;
                if (sumarDias(p.fecha, t.gap) > d) continue;
              }
            }
            var holgura = diasEntre(d, t.deadline);
            var s = 100 - holgura * 4;
            if (t.esencial) s += 30;
            if (t.tema) s += ((t.tema.nivel || 2) - 2) * 4;
            if (t.tema && temasHoy[t.examen.id + '|' + t.tema.id]) s -= 40;
            var nEx = examenesHoy[t.examen.id] || 0;
            if (nEx >= 2) s -= 12 * (nEx - 1);
            if (anteriorExamen === t.examen.id) s -= 8;
            s += adelantoDias ? -3 * adelantoDias : Math.min(10, diasEntre(t.notBefore, d)) * 1.5;
            s -= 25 * hechoEx[t.examen.id] / totalEx[t.examen.id];
            if (t.tipo === 'simulacro') s += 20;
            if (t.tipo === 'vispera' && d === t.notBefore) s += 60;
            if (s > mejorScore || (s === mejorScore && t.orden < mejor.orden)) { mejor = t; mejorScore = s; }
          }
          if (!mejor) break;
          mejor.fecha = d;
          mejor.ini = cursor;
          var txt = textoTarea(mejor, d);
          sesiones.push({
            id: mejor.id,
            examenId: mejor.examen.id,
            asignaturaId: mejor.asignatura.id,
            temaId: mejor.tema ? mejor.tema.id : null,
            tipo: mejor.tipo,
            esencial: mejor.esencial,
            fecha: d,
            ini: minAHora(cursor),
            fin: minAHora(cursor + mejor.duracion),
            titulo: txt.titulo,
            detalle: txt.detalle
          });
          if (mejor.tema) temasHoy[mejor.examen.id + '|' + mejor.tema.id] = true;
          examenesHoy[mejor.examen.id] = (examenesHoy[mejor.examen.id] || 0) + 1;
          anteriorExamen = mejor.examen.id;
          hechoEx[mejor.examen.id]++;
          pendientes.splice(pendientes.indexOf(mejor), 1);
          cursor += mejor.duracion + ctx.descanso;
        }
      });
    }
    return { sesiones: sesiones, sinProgramar: pendientes };
  }

  /* ------------------------------ API ------------------------------- */

  /*
   * opciones = {
   *   hoy: 'AAAA-MM-DD', ahora: minutos desde medianoche (opcional, recorta las franjas de hoy),
   *   examenes: [{ id, titulo, tipo: 'pau'|'instituto', fecha, inicio, duracion,
   *                asignatura: {id, nombre, estilo}, temas: [{id, nombre, peso, nivel, teoria, ejercicios, consejo}] }],
   *   disponibilidad: { semanal: {0..6: [{ini:'17:00', fin:'18:30'}]}, excepciones: {'AAAA-MM-DD': [...]} },
   *   sesion: 50, descanso: 10,
   *   hechas: { idTarea: {fecha} },
   *   ocupadoHoy: [['17:00','17:50'], ...]   // sesiones ya hechas hoy que se mantienen
   * }
   */
  function generar(op) {
    var ctx = {
      hoy: op.hoy,
      sesion: op.sesion || 50,
      descanso: op.descanso == null ? 10 : op.descanso,
      examenes: (op.examenes || []).slice().sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; }),
      hechas: op.hechas || {}
    };
    var cache = {};
    ctx.franjasLibres = function (d) {
      if (cache[d]) return cache[d];
      var fr = franjasDelDia(d, op.disponibilidad || {});
      if (d === op.hoy) {
        var oc = (op.ocupadoHoy || []).map(function (o) { return [horaAMin(o[0]), horaAMin(o[1])]; });
        if (op.ahora != null) {
          var desde = Math.ceil(op.ahora / 5) * 5;
          oc.push([0, desde]);
        }
        fr = restarOcupado(fr, oc);
      }
      cache[d] = fr;
      return fr;
    };

    // Primero se intenta sin adelantar nada; si no cabe todo, se permite adelantar estudio
    // a huecos libres cercanos y, como último recurso, se recortan tareas extra.
    var recorte = {};
    var res, construido, recortado = {};
    var adelantos = [0, 3, 7];
    var nivelAdelanto = 0;
    for (var iter = 0; iter < 30; iter++) {
      construido = construirTareas(ctx, recorte);
      res = programar(construido.tareas, ctx, adelantos[nivelAdelanto]);
      if (!res.sinProgramar.length) break;
      if (nivelAdelanto < adelantos.length - 1) { nivelAdelanto++; continue; }
      var faltanEsenciales = {};
      res.sinProgramar.forEach(function (t) { if (t.esencial) faltanEsenciales[t.examen.id] = true; });
      var algo = false;
      // Los exámenes cuya preparación se solapa compiten por el mismo tiempo: se recorta en todos ellos.
      var aRecortar = {};
      Object.keys(faltanEsenciales).forEach(function (exId) {
        var a = construido.porExamen[exId];
        Object.keys(construido.porExamen).forEach(function (otroId) {
          var b = construido.porExamen[otroId];
          if (b.inicio <= a.ultimo && a.inicio <= b.ultimo) aRecortar[otroId] = true;
        });
      });
      Object.keys(aRecortar).forEach(function (exId) {
        var info = construido.porExamen[exId];
        info.cadenas.forEach(function (cad) {
          if (extrasPendientes(cad) > 0) {
            var temaId = cad[0].tema.id;
            recorte[exId] = recorte[exId] || {};
            recorte[exId][temaId] = (recorte[exId][temaId] || 0) + 1;
            recortado[exId] = true;
            algo = true;
          }
        });
      });
      if (!algo) break;
    }

    // Resumen y avisos
    var resumen = {};
    var avisos = [];
    ctx.examenes.forEach(function (ex) {
      var info = construido.porExamen[ex.id];
      var r = { programadas: 0, sinProgramar: 0, esencialesSinProgramar: 0, minutosSinProgramar: 0, hechas: 0, recortado: !!recortado[ex.id] };
      Object.keys(ctx.hechas).forEach(function (id) { if (id.indexOf(ex.id + '|') === 0) r.hechas++; });
      if (!info) { resumen[ex.id] = r; return; }
      res.sesiones.forEach(function (s) { if (s.examenId === ex.id) r.programadas++; });
      res.sinProgramar.forEach(function (t) {
        if (t.examen.id !== ex.id) return;
        r.sinProgramar++;
        r.minutosSinProgramar += t.duracion;
        if (t.esencial) r.esencialesSinProgramar++;
      });
      resumen[ex.id] = r;
      if (r.esencialesSinProgramar > 0) {
        avisos.push({
          nivel: 'alto', examenId: ex.id,
          texto: 'No da tiempo a preparar bien «' + ex.titulo + '»: faltan ' + r.sinProgramar + ' sesiones (≈ ' +
            Math.round(r.minutosSinProgramar / 6) / 10 + ' h). Añade franjas de estudio o adelanta la fecha de inicio.'
        });
      } else if (r.recortado || r.sinProgramar > 0) {
        avisos.push({
          nivel: 'medio', examenId: ex.id,
          texto: 'Para «' + ex.titulo + '» he quitado algunas prácticas extra para que te dé tiempo. Si puedes, añade algo más de tiempo de estudio.'
        });
      }
      if (info.sinSimulacro) {
        avisos.push({
          nivel: 'medio', examenId: ex.id,
          texto: 'No tienes ninguna franja suficientemente larga para un simulacro de «' + ex.titulo + '» en los últimos días.'
        });
      }
    });

    res.sesiones.sort(function (a, b) { return a.fecha === b.fecha ? (a.ini < b.ini ? -1 : 1) : (a.fecha < b.fecha ? -1 : 1); });
    return { sesiones: res.sesiones, avisos: avisos, resumen: resumen };
  }

  // Minutos de estudio disponibles por semana según el horario semanal.
  function minutosSemana(disponibilidad) {
    var total = 0;
    for (var dia = 0; dia < 7; dia++) {
      ((disponibilidad.semanal || {})[dia] || []).forEach(function (f) {
        total += Math.max(0, horaAMin(f.fin) - horaAMin(f.ini));
      });
    }
    return total;
  }

  var Planificador = {
    generar: generar,
    franjasDelDia: franjasDelDia,
    minutosSemana: minutosSemana,
    bloquesTema: bloquesTema,
    fecha: { parse: parseFecha, fmt: fmtFecha, sumar: sumarDias, entre: diasEntre, horaAMin: horaAMin, minAHora: minAHora },
    NOMBRE_NIVEL: NOMBRE_NIVEL
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Planificador;
  else global.Planificador = Planificador;
})(this);
