/*
 * Exportación del plan: calendario .ics (Apple, Google, Outlook…) y PDF mediante impresión.
 */
(function (global) {
  'use strict';

  var VTIMEZONE_MADRID = [
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Madrid',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0200',
    'TZNAME:CEST',
    'DTSTART:19700329T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'TZNAME:CET',
    'DTSTART:19701025T030000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'END:STANDARD',
    'END:VTIMEZONE'
  ];

  function escaparTexto(s) {
    return String(s || '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }

  // Pliega líneas a 75 octetos como exige RFC 5545 (sin partir caracteres UTF-8).
  function plegar(linea) {
    var bytes = 0, out = '', actual = '';
    for (var i = 0; i < linea.length; i++) {
      var ch = linea[i];
      var code = linea.charCodeAt(i);
      if (code >= 0xd800 && code <= 0xdbff && i + 1 < linea.length) { ch += linea[++i]; }
      var b = unescape(encodeURIComponent(ch)).length;
      if (bytes + b > (out ? 74 : 75)) {
        out += (out ? '\r\n ' : '') + actual;
        actual = '';
        bytes = 0;
      }
      actual += ch;
      bytes += b;
    }
    return out + (out ? '\r\n ' : '') + actual;
  }

  function fechaHoraIcs(fecha, hora) {
    return fecha.replace(/-/g, '') + 'T' + hora.replace(':', '') + '00';
  }

  function sello() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) + 'T' + p(d.getUTCHours()) + p(d.getUTCMinutes()) + p(d.getUTCSeconds()) + 'Z';
  }

  /*
   * sesiones: [{id, fecha, ini, fin, titulo, detalle, asignatura}]
   * examenes: [{id, fecha, hora, duracion, titulo, asignatura}]
   */
  function generarIcs(sesiones, examenes, opciones) {
    opciones = opciones || {};
    var ahora = sello();
    var l = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Rumbo PAU//Planificador de estudio//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Rumbo PAU',
      'X-WR-TIMEZONE:Europe/Madrid'
    ].concat(VTIMEZONE_MADRID);

    sesiones.forEach(function (s) {
      l.push('BEGIN:VEVENT');
      l.push('UID:' + (s.id + '-' + s.fecha).replace(/[^A-Za-z0-9\-]/g, '-') + '@rumbopau');
      l.push('DTSTAMP:' + ahora);
      l.push('DTSTART;TZID=Europe/Madrid:' + fechaHoraIcs(s.fecha, s.ini));
      l.push('DTEND;TZID=Europe/Madrid:' + fechaHoraIcs(s.fecha, s.fin));
      l.push('SUMMARY:' + escaparTexto(s.asignatura + ' · ' + s.titulo));
      l.push('DESCRIPTION:' + escaparTexto(s.detalle + '\n\nPlan generado con Rumbo PAU.'));
      l.push('CATEGORIES:' + escaparTexto('Estudio'));
      if (opciones.alarma) {
        l.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + escaparTexto(s.titulo), 'TRIGGER:-PT10M', 'END:VALARM');
      }
      l.push('END:VEVENT');
    });

    examenes.forEach(function (e) {
      l.push('BEGIN:VEVENT');
      l.push('UID:examen-' + String(e.id).replace(/[^A-Za-z0-9\-]/g, '-') + '@rumbopau');
      l.push('DTSTAMP:' + ahora);
      if (e.hora) {
        var ini = e.hora;
        var m = parseInt(ini.split(':')[0], 10) * 60 + parseInt(ini.split(':')[1], 10) + (e.duracion || 60);
        var fin = (Math.floor(m / 60) < 10 ? '0' : '') + Math.floor(m / 60) + ':' + (m % 60 < 10 ? '0' : '') + (m % 60);
        l.push('DTSTART;TZID=Europe/Madrid:' + fechaHoraIcs(e.fecha, ini));
        l.push('DTEND;TZID=Europe/Madrid:' + fechaHoraIcs(e.fecha, fin));
      } else {
        var sig = new Date(+e.fecha.slice(0, 4), +e.fecha.slice(5, 7) - 1, +e.fecha.slice(8, 10) + 1);
        var sigTxt = sig.getFullYear() + ('0' + (sig.getMonth() + 1)).slice(-2) + ('0' + sig.getDate()).slice(-2);
        l.push('DTSTART;VALUE=DATE:' + e.fecha.replace(/-/g, ''));
        l.push('DTEND;VALUE=DATE:' + sigTxt);
      }
      l.push('SUMMARY:' + escaparTexto('📝 ' + e.titulo));
      l.push('DESCRIPTION:' + escaparTexto('Examen de ' + e.asignatura + '. ¡Mucho ánimo!'));
      l.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + escaparTexto(e.titulo), 'TRIGGER:-P1D', 'END:VALARM');
      l.push('END:VEVENT');
    });

    l.push('END:VCALENDAR');
    return l.map(plegar).join('\r\n') + '\r\n';
  }

  function descargar(nombre, contenido, tipo) {
    var blob = new Blob([contenido], { type: tipo });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
  }

  var Exportar = { generarIcs: generarIcs, descargar: descargar, plegar: plegar };
  if (typeof module !== 'undefined' && module.exports) module.exports = Exportar;
  else global.Exportar = Exportar;
})(this);
