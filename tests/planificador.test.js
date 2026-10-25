// Pruebas del motor de planificación: node tests/planificador.test.js
'use strict';
var assert = require('assert');
var Catalogo = require('../js/catalogo.js');
var P = require('../js/planificador.js');

function examen(id, asigId, fecha, temaIds, nivel, extra) {
  var a = Catalogo.asignatura(asigId);
  var temas = (temaIds || a.temas.map(function (t) { return t.id; })).map(function (tid) {
    var t = Object.assign({}, Catalogo.tema(asigId, tid));
    t.nivel = typeof nivel === 'function' ? nivel(tid) : nivel;
    return t;
  });
  return Object.assign({ id: id, titulo: 'Examen ' + a.corto, tipo: 'instituto', fecha: fecha, duracion: 60, asignatura: a, temas: temas }, extra || {});
}

var tardes = { semanal: {}, excepciones: {} };
for (var d = 1; d <= 5; d++) tardes.semanal[d] = [{ ini: '17:00', fin: '19:00' }];
tardes.semanal[6] = [{ ini: '10:00', fin: '13:00' }];

var pruebas = 0;
function prueba(nombre, fn) { fn(); pruebas++; console.log('✓ ' + nombre); }

prueba('genera sesiones antes del examen y dentro de las franjas', function () {
  var r = P.generar({
    hoy: '2026-11-02', examenes: [examen('e1', 'mat2', '2026-11-20', ['primit', 'integdef'], 2)],
    disponibilidad: tardes, sesion: 50, descanso: 10, hechas: {}
  });
  assert.ok(r.sesiones.length > 0);
  r.sesiones.forEach(function (s) {
    assert.ok(s.fecha < '2026-11-20', 'sesión el día del examen o después');
    var franjas = P.franjasDelDia(s.fecha, tardes);
    var ini = P.fecha.horaAMin(s.ini), fin = P.fecha.horaAMin(s.fin);
    assert.ok(franjas.some(function (f) { return ini >= f[0] && fin <= f[1]; }), 'fuera de franja ' + s.fecha + ' ' + s.ini);
  });
  assert.ok(r.sesiones.some(function (s) { return s.tipo === 'simulacro'; }), 'hay simulacro');
  assert.ok(r.sesiones.some(function (s) { return s.tipo === 'vispera' && s.fecha === '2026-11-19'; }), 'repaso víspera');
  assert.strictEqual(r.avisos.filter(function (a) { return a.nivel === 'alto'; }).length, 0);
});

prueba('respeta el orden estudio -> práctica -> repaso final de cada tema', function () {
  var r = P.generar({
    hoy: '2026-11-02', examenes: [examen('e1', 'qui', '2026-12-01', ['equilibrio', 'acidobase', 'redox'], 3)],
    disponibilidad: tardes, sesion: 50, descanso: 10, hechas: {}
  });
  ['equilibrio', 'acidobase', 'redox'].forEach(function (tid) {
    var ses = r.sesiones.filter(function (s) { return s.temaId === tid; });
    var clave = function (s) { return s.fecha + s.ini; };
    var est = ses.filter(function (s) { return s.tipo === 'estudio'; })[0];
    var fin = ses.filter(function (s) { return s.tipo === 'final'; })[0];
    ses.filter(function (s) { return s.tipo === 'practica'; }).forEach(function (p) {
      assert.ok(clave(p) > clave(est), 'práctica antes del estudio en ' + tid);
      assert.ok(clave(p) < clave(fin), 'práctica después del repaso final en ' + tid);
    });
  });
});

prueba('los temas que cuestan reciben más sesiones que los que se dominan', function () {
  var r = P.generar({
    hoy: '2026-11-02',
    examenes: [examen('e1', 'mat2', '2026-12-15', ['primit', 'sistemas'], function (t) { return t === 'primit' ? 3 : 1; })],
    disponibilidad: tardes, sesion: 50, descanso: 10, hechas: {}
  });
  var n = function (tid) { return r.sesiones.filter(function (s) { return s.temaId === tid; }).length; };
  assert.ok(n('primit') > n('sistemas'), n('primit') + ' vs ' + n('sistemas'));
});

prueba('si no hay tiempo recorta extras y avisa', function () {
  var poco = { semanal: { 2: [{ ini: '18:00', fin: '19:00' }] }, excepciones: {} };
  var r = P.generar({
    hoy: '2026-11-02', examenes: [examen('e1', 'bio', '2026-11-25', null, 3)],
    disponibilidad: poco, sesion: 50, descanso: 10, hechas: {}
  });
  assert.ok(r.avisos.length > 0, 'debe avisar');
  assert.ok(r.resumen.e1.recortado || r.resumen.e1.sinProgramar > 0);
});

prueba('días sin estudio (excepciones) no reciben sesiones', function () {
  var disp = JSON.parse(JSON.stringify(tardes));
  disp.excepciones['2026-11-04'] = [];
  var r = P.generar({
    hoy: '2026-11-02', examenes: [examen('e1', 'fis', '2026-11-30', null, 2)],
    disponibilidad: disp, sesion: 50, descanso: 10, hechas: {}
  });
  assert.ok(!r.sesiones.some(function (s) { return s.fecha === '2026-11-04'; }));
});

prueba('las tareas hechas no se vuelven a programar y desbloquean la siguiente', function () {
  var ex = examen('e1', 'mat2', '2026-11-20', ['primit'], 2);
  var hechas = { 'e1|primit|estudio': { fecha: '2026-11-01' } };
  var r = P.generar({ hoy: '2026-11-02', examenes: [ex], disponibilidad: tardes, sesion: 50, descanso: 10, hechas: hechas });
  assert.ok(!r.sesiones.some(function (s) { return s.id === 'e1|primit|estudio'; }));
  assert.ok(r.sesiones.some(function (s) { return s.id === 'e1|primit|practica1'; }));
});

prueba('varios exámenes a la vez: ninguna sesión se solapa', function () {
  var r = P.generar({
    hoy: '2026-11-02',
    examenes: [
      examen('e1', 'mat2', '2026-11-18', ['primit', 'integdef'], 2),
      examen('e2', 'his', '2026-11-20', ['a2t1', 'a2t2', 'a2t3'], 3),
      examen('e3', 'ing', '2026-11-24', ['passive', 'reported', 'writing'], 2)
    ],
    disponibilidad: tardes, sesion: 45, descanso: 10, hechas: {}
  });
  var porDia = {};
  r.sesiones.forEach(function (s) { (porDia[s.fecha] = porDia[s.fecha] || []).push(s); });
  Object.keys(porDia).forEach(function (d) {
    var l = porDia[d].sort(function (a, b) { return a.ini < b.ini ? -1 : 1; });
    for (var i = 1; i < l.length; i++) assert.ok(l[i].ini >= l[i - 1].fin, 'solape ' + d);
  });
  ['e1', 'e2', 'e3'].forEach(function (id) { assert.ok(r.resumen[id].programadas > 0, id); });
});

prueba('PAU con horizonte largo reparte el estudio en el tiempo', function () {
  var r = P.generar({
    hoy: '2026-11-02',
    examenes: [examen('pau', 'mat2', '2027-06-02', null, 2, { tipo: 'pau', duracion: 90, inicio: '2027-03-01' })],
    disponibilidad: tardes, sesion: 50, descanso: 10, hechas: {}
  });
  assert.ok(r.sesiones.every(function (s) { return s.fecha >= '2027-03-01'; }), 'no empieza antes de la fecha de inicio');
  var meses = {};
  r.sesiones.forEach(function (s) { meses[s.fecha.slice(0, 7)] = true; });
  assert.ok(Object.keys(meses).length >= 3, 'repartido en varios meses');
  var sim = r.sesiones.filter(function (s) { return s.tipo === 'simulacro'; })[0];
  assert.ok(sim && P.fecha.horaAMin(sim.fin) - P.fecha.horaAMin(sim.ini) === 90, 'simulacro de 90 min');
});

prueba('recorta las franjas de hoy que ya han pasado', function () {
  var r = P.generar({
    hoy: '2026-11-02', ahora: 18 * 60 + 10, examenes: [examen('e1', 'mat2', '2026-11-06', ['lim'], 2)],
    disponibilidad: tardes, sesion: 30, descanso: 5, hechas: {}
  });
  r.sesiones.filter(function (s) { return s.fecha === '2026-11-02'; }).forEach(function (s) {
    assert.ok(s.ini >= '18:10', s.ini);
  });
});

console.log('\n' + pruebas + ' pruebas superadas');
