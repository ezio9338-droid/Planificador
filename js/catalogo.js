/*
 * Catálogo de asignaturas de 2º de Bachillerato (PAU Andalucía, curso 2026-2027).
 * Elaborado a partir de las "Directrices y orientaciones generales" oficiales de cada
 * ponencia (carpeta /directrices).
 *
 * Cada tema tiene:
 *   - peso: horas aproximadas de trabajo para un alumno que lo lleva "regular".
 *   - teoria: qué hay que estudiar/entender.
 *   - ejercicios: tipos de ejercicio o tarea que el planificador va rotando en las sesiones de práctica.
 *   - consejo (opcional): indicación concreta de las directrices.
 *
 * estilo de la asignatura (cómo se redactan las sesiones de práctica):
 *   'problemas'  -> resolver ejercicios tipo PAU
 *   'memoria'    -> recuerdo activo (estudiar, cerrar el libro y escribir de memoria)
 *   'redaccion'  -> producir textos con tiempo limitado
 *   'grafico'    -> láminas de dibujo con construcciones visibles
 */
(function (global) {
  'use strict';

  function t(id, nombre, peso, teoria, ejercicios, consejo) {
    return { id: id, nombre: nombre, peso: peso, teoria: teoria, ejercicios: ejercicios, consejo: consejo || '' };
  }

  var ORTOGRAFIA_CRUE = 'Ortografía y expresión: hasta −1 punto (las dos primeras faltas no penalizan; desde la tercera, −0,1 cada una).';

  var ASIGNATURAS = [
    /* ------------------------------------------------------------------ */
    {
      id: 'mat2',
      nombre: 'Matemáticas II',
      corto: 'Mates II',
      color: '#2d3363',
      estilo: 'problemas',
      pdf: 'directrices/sel_2026-2027-Orientaciones_matematicas.pdf',
      examen: {
        duracion: 90,
        estructura: [
          '7 ejercicios de 2 puntos: 3 obligatorios (E1, E2, E3) y 2 bloques optativos (elige E4.1 o E4.2 y E5.1 o E5.2).',
          'Respondes 5: 2 de Análisis, 1 de Álgebra, 1 de Estadística y Probabilidad y 1 de Geometría.',
          'E1 es competencial y contextualizado (puede ser de cualquier bloque).',
          'No se piden demostraciones de teoremas ni ejercicios exclusivamente teóricos.'
        ],
        materiales: 'Calculadora no programable ni gráfica, regla. Se facilita la tabla de la Normal.',
        consejos: [
          'Justifica cada paso: 0,2 puntos por ejercicio valoran el lenguaje matemático y el razonamiento.',
          'Los errores aritméticos se penalizan hasta 0,2 puntos por ejercicio.',
          'Usa cuatro cifras decimales en Probabilidad y Estadística.',
          'Si respondes las dos opciones de un bloque optativo solo se corrige la primera.'
        ]
      },
      bloques: [
        {
          nombre: 'Análisis',
          temas: [
            t('lim', 'Límites y continuidad', 2,
              'Indeterminaciones (∞−∞, ∞/∞, 0·∞, 0/0), límites laterales, continuidad en un punto y en un intervalo, tipos de discontinuidad (evitable, salto finito, salto infinito).',
              ['Calcular límites resolviendo indeterminaciones', 'Estudiar la continuidad de funciones a trozos con parámetros', 'Clasificar discontinuidades y esbozar la gráfica cerca de ellas']),
            t('deriv', 'Derivabilidad y cálculo de derivadas', 2,
              'Función derivada y derivada en un punto, regla de la cadena, derivadas laterales, relación entre continuidad y derivabilidad, dominio de derivabilidad.',
              ['Derivar funciones compuestas con la regla de la cadena', 'Estudiar la derivabilidad de funciones a trozos (derivadas laterales)', 'Hallar parámetros para que una función sea continua y derivable']),
            t('lhopital', 'Regla de L\'Hôpital', 1,
              'Aplicación de la derivada al cálculo de límites indeterminados 0/0 e ∞/∞, incluso aplicándola varias veces.',
              ['Límites 0/0 e ∞/∞ con L\'Hôpital (aplicándola varias veces)', 'Calcular parámetros a y b para que un límite tome un valor dado (como el Ejercicio 3 del modelo)'],
              'Comprueba y escribe siempre que hay indeterminación antes de aplicar L\'Hôpital: puntúa.'),
            t('aplicder', 'Aplicaciones de la derivada', 2,
              'Recta tangente y normal, monotonía y extremos relativos, concavidad/convexidad (f\'\' > 0 convexa) y puntos de inflexión, extremos absolutos.',
              ['Recta tangente y recta normal en un punto', 'Intervalos de crecimiento y extremos relativos', 'Curvatura y puntos de inflexión', 'Extremos absolutos en un intervalo cerrado (también en funciones a trozos)', 'Obtener información de f a partir de la gráfica de f\'']),
            t('optim', 'Optimización', 2,
              'Planteamiento de la función a optimizar, condición de ligadura, puntos críticos e interpretación del resultado en el contexto.',
              ['Problemas de optimización geométricos (áreas, volúmenes, distancias)', 'Optimización en contexto (costes, beneficios) interpretando el resultado']),
            t('repr', 'Representación gráfica de funciones', 2,
              'Dominio, simetrías, periodicidad, cortes con los ejes, asíntotas (verticales, horizontales y oblicuas), monotonía, extremos, curvatura e inflexión.',
              ['Calcular asíntotas verticales, horizontales y oblicuas', 'Estudio completo y gráfica de una función racional', 'Representar funciones exponenciales, logarítmicas, trigonométricas y a trozos']),
            t('primit', 'Integrales indefinidas (primitivas)', 3,
              'Primitivas inmediatas, cambio de variable, integración por partes (reiterada), racionales con raíces reales en el denominador, primitiva que pasa por un punto.',
              ['Primitivas inmediatas y casi inmediatas', 'Integración por partes (aplicándola varias veces)', 'Integración por cambio de variable', 'Integrales racionales con raíces reales simples y múltiples', 'Hallar la primitiva que pasa por un punto dado']),
            t('integdef', 'Integral definida, áreas y volúmenes', 2,
              'Regla de Barrow, linealidad y aditividad, área bajo una curva y entre curvas, volúmenes de revolución alrededor del eje OX.',
              ['Integrales definidas con la regla de Barrow', 'Área entre una curva y el eje OX o entre dos curvas (esbozando el recinto)', 'Volumen de revolución al girar alrededor del eje OX', 'Usar la simetría de una función para deducir una integral (como el Ejercicio 5.1 del modelo)'])
          ]
        },
        {
          nombre: 'Álgebra',
          temas: [
            t('matrices', 'Matrices y operaciones', 2,
              'Tipos de matrices, suma, producto, producto por escalar, traspuesta, propiedades y potencias de matrices en situaciones cíclicas.',
              ['Operaciones con matrices aplicando sus propiedades', 'Potencias de matrices con comportamiento cíclico (Aⁿ)', 'Hallar parámetros para que se cumpla una igualdad matricial (p. ej. A² = 4I)']),
            t('determ', 'Determinantes, rango e inversa', 2,
              'Determinantes de orden ≤ 3 y propiedades, rango con uno o dos parámetros (Gauss o menores), matriz inversa y condición de existencia.',
              ['Calcular determinantes usando sus propiedades', 'Rango de una matriz según uno o dos parámetros', 'Matriz inversa (adjuntos o Gauss) y valores para los que existe']),
            t('ecmat', 'Ecuaciones matriciales', 1,
              'Despeje de la matriz incógnita usando la inversa (respetando el orden del producto) o transformando en un sistema.',
              ['Despejar X con la inversa (AX = B, XA = B, AXB = C)', 'Resolver una ecuación matricial transformándola en un sistema'],
              'Resuelve primero simbólicamente X (puntúa hasta 0,5) y luego calcula.'),
            t('sistemas', 'Sistemas de ecuaciones lineales', 3,
              'Expresión matricial y matriz ampliada, teorema de Rouché-Frobenius, discusión con un parámetro, resolución por Gauss o Cramer, planteamiento de problemas.',
              ['Discutir un sistema según un parámetro (Rouché-Frobenius)', 'Resolver por Gauss o Cramer, incluidos los compatibles indeterminados', 'Plantear y resolver un sistema a partir de un problema en contexto (como el Ejercicio 4.2 del modelo)'])
          ]
        },
        {
          nombre: 'Geometría',
          temas: [
            t('vectores', 'Vectores en el espacio', 1,
              'Producto escalar, vectorial y mixto con sus aplicaciones, dependencia e independencia lineal, combinación lineal.',
              ['Productos escalar, vectorial y mixto y sus aplicaciones', 'Áreas de triángulos/paralelogramos y volúmenes de tetraedros/paralelepípedos', 'Dependencia lineal y expresar un vector como combinación lineal']),
            t('rectaplano', 'Rectas y planos: ecuaciones y posiciones', 2,
              'Ecuaciones de rectas y planos, posiciones relativas (también como discusión de sistemas), construcción de planos y rectas con condiciones.',
              ['Pasar de unas ecuaciones a otras (vectorial, paramétricas, continua, implícitas)', 'Posición relativa de rectas y planos (también mediante sistemas)', 'Plano que contiene a una recta y a un punto exterior, o a dos rectas', 'Recta que pasa por un punto y corta a dos rectas que se cruzan']),
            t('metrica', 'Geometría métrica: ángulos, distancias y simetrías', 3,
              'Ángulos entre rectas y planos, distancias entre puntos, rectas y planos, perpendicular común, simetrías y proyecciones ortogonales.',
              ['Ángulos entre rectas, entre planos y entre recta y plano', 'Distancias punto-plano, punto-recta y entre planos paralelos', 'Perpendicular común a dos rectas que se cruzan', 'Punto simétrico respecto de un punto, un plano y una recta', 'Proyección ortogonal y recta simétrica respecto de un plano'])
          ]
        },
        {
          nombre: 'Estadística y Probabilidad',
          temas: [
            t('prob', 'Probabilidad', 2,
              'Operaciones con sucesos, leyes de De Morgan, axiomas de Kolmogorov, probabilidad condicionada e independencia, tablas de contingencia, diagramas de árbol, probabilidad total y Bayes.',
              ['Problemas con diagramas de Venn y leyes de De Morgan (como el Ejercicio 1 del modelo)', 'Tablas de contingencia y probabilidad condicionada', 'Diagramas de árbol: probabilidad total y teorema de Bayes']),
            t('distrib', 'Distribuciones binomial y normal', 2,
              'Variables aleatorias, binomial (parámetros y cálculo), normal (tipificación y tabla, también en sentido inverso), aproximación de la binomial por la normal con corrección de Yates.',
              ['Binomial: identificar n y p y calcular probabilidades', 'Normal: tipificar y usar la tabla (también en sentido inverso)', 'Aproximar la binomial por la normal con corrección de Yates'])
          ]
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'macs2',
      nombre: 'Matemáticas Aplicadas a las CC. SS. II',
      corto: 'Mates CCSS',
      color: '#3f51b5',
      estilo: 'problemas',
      pdf: 'directrices/sel_2026-2027-Orientaciones_matematicas_aplicadas.pdf',
      examen: {
        duracion: 90,
        estructura: [
          '4 ejercicios: uno de Álgebra (3 puntos), uno de Análisis (3 puntos) y dos de Probabilidad y Estadística (2 puntos cada uno).',
          'Algunos ejercicios pueden ofrecer elegir entre los apartados A) o B).',
          'El 50 % de la prueba es obligatorio y el 50 % tiene carácter competencial.'
        ],
        materiales: 'Calculadora no programable ni gráfica, regla. Se facilita la tabla de la Normal.',
        consejos: [
          'Si obtienes un resultado con la calculadora, explica con detalle los pasos para obtenerlo sin ella.',
          'Interpreta siempre la solución en el contexto del problema.',
          'Los errores de cálculo (no conceptuales) restan hasta un 10 % del apartado.',
          'Para aproximar la binomial por la normal comprueba n·p ≥ 5 y n·(1−p) ≥ 5 y usa corrección por continuidad.'
        ]
      },
      bloques: [
        {
          nombre: 'Álgebra (A1, C2, C3)',
          temas: [
            t('matrices', 'Matrices y operaciones', 2,
              'Suma y producto de matrices, propiedades, uso de matrices para representar datos estructurados en contextos reales.',
              ['Operar con matrices aplicando sus propiedades', 'Organizar datos de un problema real en matrices (producción, precios…) y operar']),
            t('determ', 'Determinantes, rango e inversa', 2,
              'Determinantes de orden ≤ 3, cálculo del rango y de la matriz inversa.',
              ['Calcular determinantes de orden 2 y 3', 'Matriz inversa por adjuntos y condición de existencia', 'Rango de una matriz']),
            t('ecmat', 'Ecuaciones matriciales', 1,
              'Resolución usando la matriz inversa o transformándolas en un sistema de ecuaciones.',
              ['Despejar X con la inversa', 'Ecuación matricial convertida en sistema']),
            t('sistemas', 'Sistemas de ecuaciones (Gauss y Cramer)', 2,
              'Modelización de situaciones con sistemas, regla de Cramer para sistemas 3×3 compatibles, método de Gauss.',
              ['Plantear un sistema 3×3 a partir de un enunciado (como el de las entradas de cine del modelo)', 'Resolver por Gauss o por Cramer', 'Interpretar la solución en el contexto']),
            t('pl', 'Programación lineal', 3,
              'Variables, restricciones y función objetivo; región factible, cálculo analítico de vértices y solución óptima.',
              ['Plantear variables, restricciones y función objetivo', 'Dibujar la región factible y calcular sus vértices', 'Hallar el óptimo y responder en el contexto (como el taller de pañuelos y corbatas)'])
          ]
        },
        {
          nombre: 'Análisis (B1, B2, C4)',
          temas: [
            t('funciones', 'Funciones, límites y continuidad', 2,
              'Estudio de funciones polinómicas, racionales, exponenciales, logarítmicas y a trozos; continuidad y discontinuidades (evitable, salto finito, salto infinito).',
              ['Continuidad de funciones a trozos con parámetros', 'Límites e indeterminaciones sencillas', 'Clasificar discontinuidades']),
            t('derivadas', 'Derivadas y derivabilidad', 2,
              'Reglas de derivación y regla de la cadena, derivabilidad (incluidas funciones a trozos), derivadas laterales, recta tangente, cálculo de coeficientes.',
              ['Derivar polinómicas, racionales, irracionales, exponenciales y logarítmicas', 'Estudiar la derivabilidad de una función a trozos', 'Recta tangente y cálculo de coeficientes para que se cumplan condiciones']),
            t('aplicder', 'Aplicaciones de la derivada y representación', 2,
              'Extremos relativos, monotonía, curvatura y puntos de inflexión, representación gráfica, optimización en contextos diversos.',
              ['Monotonía, extremos, curvatura e inflexión', 'Representar funciones polinómicas, racionales y a trozos', 'Problemas de optimización en contextos económicos y sociales']),
            t('integrales', 'Integrales y áreas', 2,
              'Primitivas inmediatas simples y compuestas, regla de Barrow, integral definida como área.',
              ['Primitivas inmediatas simples y compuestas', 'Integrales definidas con la regla de Barrow', 'Área de un recinto entre una recta y una parábola (dibujando el recinto)'])
          ]
        },
        {
          nombre: 'Probabilidad y Estadística (D1, D2, D3)',
          temas: [
            t('prob', 'Probabilidad', 2,
              'Probabilidad condicionada e independencia, diagramas de Venn, tablas de contingencia y de árbol, probabilidad total y Bayes.',
              ['Venn y leyes de De Morgan', 'Tablas de contingencia y probabilidad condicionada', 'Árbol, probabilidad total y Bayes (como el problema de los llaveros)']),
            t('distrib', 'Distribuciones binomial y normal', 2,
              'Variables aleatorias, binomial, normal y aproximación de la binomial por la normal.',
              ['Normal: definir el suceso, tipificar y usar la tabla', 'Binomial y aproximación por la normal con corrección por continuidad']),
            t('muestreo', 'Muestreo y distribuciones muestrales', 1,
              'Técnicas de muestreo y representatividad, distribución de la media y de la proporción muestrales.',
              ['Tipos de muestreo y representatividad de una muestra', 'Distribución de la media muestral y de la proporción muestral']),
            t('intervalos', 'Intervalos de confianza', 2,
              'Intervalo para la media (normal con σ conocida) y para la proporción, tamaño muestral mínimo, relación entre confianza, error y tamaño.',
              ['Intervalo de confianza para la media con σ conocida', 'Intervalo de confianza para una proporción', 'Tamaño muestral mínimo y relación confianza–error–tamaño'])
          ]
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'fis',
      nombre: 'Física',
      corto: 'Física',
      color: '#c2410c',
      estilo: 'problemas',
      pdf: 'directrices/sel_2026-2027-Orientaciones_fisica.pdf',
      examen: {
        duracion: 90,
        estructura: [
          '4 ejercicios, uno por bloque (Gravitatorio, Electromagnético, Ondas, Física moderna). Uno es obligatorio (puede ser de cualquier bloque).',
          'Cada ejercicio: apartado a) cuestión teórica (1 punto) y apartado b) problema (1,5 puntos).',
          'En los tres ejercicios optativos eliges un apartado a) y un apartado b) de los dos propuestos.'
        ],
        materiales: 'Bolígrafo azul o negro, regla graduada, compás y calculadora no programable.',
        consejos: [
          'Deduce siempre antes de usarlas: velocidad orbital y de escape, energía en órbita, 3ª ley de Kepler, periodo, radio de giro, fuerza entre hilos, potencial de frenado, nodos y vientres, desfase, v y a máximas de vibración y ángulo límite.',
          'Unidades en datos, resultados intermedios y finales: −0,1 por cada fallo (máx. −0,25 por apartado b).',
          'Pon la flecha de vector en las magnitudes vectoriales (y no en las escalares).',
          'En óptica explica el trazado de rayos e indica el criterio de signos.'
        ]
      },
      bloques: [
        {
          nombre: 'Campo gravitatorio',
          temas: [
            t('gcampo', 'Gravitación: campo, potencial y energía', 2,
              'Ley de Gravitación Universal, intensidad de campo, potencial, carácter conservativo, energía potencial y su origen, superposición (máx. dos masas sobre una tercera).',
              ['Campo y fuerza resultante de dos masas sobre una tercera (tratamiento vectorial)', 'Potencial, energía potencial y trabajo entre dos puntos', 'Cuestiones teóricas sobre fuerzas conservativas y energía potencial']),
            t('gorbitas', 'Satélites, órbitas y leyes de Kepler', 2,
              'Movimiento orbital, velocidad orbital y de escape, energía mecánica en órbita, órbita geoestacionaria, momento angular y su conservación, leyes de Kepler.',
              ['Deducir y aplicar velocidad orbital, periodo y 3ª ley de Kepler', 'Energía mecánica en órbita y energía para situar un satélite', 'Velocidad de escape (definición y deducción)', 'Momento angular de una partícula y su conservación'],
              'La velocidad de escape y la orbital hay que deducirlas siempre.'),
            t('energia', 'Balances de energía y planos inclinados', 1,
              'Conservación de la energía, trabajo de fuerzas no conservativas, cuerpos sobre superficies con o sin rozamiento.',
              ['Balances energéticos en planos inclinados con y sin rozamiento (con esquema de fuerzas)', 'Trabajo de la fuerza de rozamiento'])
          ]
        },
        {
          nombre: 'Campo electromagnético',
          temas: [
            t('eelec', 'Campo y potencial eléctrico', 2,
              'Ley de Coulomb, campo y potencial de cargas puntuales, superposición (máx. dos cargas sobre una tercera), trabajo y energía potencial eléctrica.',
              ['Campo y potencial creados por dos cargas en un punto', 'Trabajo para desplazar una carga en presencia de otras', 'Cuestiones: ¿puede anularse el campo o el potencial entre dos cargas?']),
            t('elorentz', 'Cargas en campos magnéticos (Lorentz)', 2,
              'Fuerza de Lorentz, movimiento de partículas cargadas en campos eléctricos y magnéticos, aceleración mediante diferencia de potencial.',
              ['Radio de la trayectoria tras acelerar una partícula con una ddp (deduciéndolo)', 'Movimiento en campos eléctrico y magnético superpuestos', 'Comparar fuerzas y aceleraciones sobre un protón y un electrón']),
            t('ecorr', 'Campo magnético de corrientes', 1,
              'Campo creado por una corriente rectilínea, espira y bobina (cualitativo), fuerza entre corrientes paralelas, carácter no conservativo del campo magnético.',
              ['Campo de dos corrientes rectilíneas (superposición vectorial)', 'Fuerza por unidad de longitud entre hilos paralelos (deducirla)', 'Cuestiones sobre el origen del campo magnético e imanes']),
            t('einduc', 'Inducción electromagnética', 2,
              'Flujo magnético (superficies planas), leyes de Faraday-Henry y Lenz, fem inducida y sentido de la corriente.',
              ['Cálculo del flujo magnético a través de una espira', 'Fem inducida y sentido de la corriente (ley de Lenz)', 'Cuestiones con espiras e imanes'])
          ]
        },
        {
          nombre: 'Vibraciones y ondas',
          temas: [
            t('mas', 'Movimiento armónico simple', 2,
              'Magnitudes del MAS, ecuación de movimiento (seno o coseno) y condiciones iniciales, muelles y péndulos, balance energético.',
              ['Escribir la ecuación del MAS a partir de sus características y condiciones iniciales', 'Velocidad y aceleración máximas (deducirlas)', 'Energía cinética y potencial del oscilador en cualquier posición']),
            t('ondas', 'Ondas armónicas y estacionarias', 2,
              'Ecuación de una onda unidimensional, doble periodicidad, velocidad de propagación frente a velocidad de vibración, ondas estacionarias en una cuerda.',
              ['Obtener magnitudes (λ, f, k, ω, v) a partir de la ecuación de onda', 'Velocidad de propagación frente a velocidad de vibración de un punto', 'Ondas estacionarias: posición de nodos y vientres', 'Diferencia de fase entre dos puntos']),
            t('fenom', 'Fenómenos ondulatorios y ondas electromagnéticas', 1,
              'Principio de Huygens, interferencia, difracción, reflexión, refracción, dispersión; naturaleza y espectro de las ondas electromagnéticas.',
              ['Cuestiones de interferencia, difracción y principio de Huygens', 'Espectro electromagnético y propiedades de las ondas electromagnéticas']),
            t('luz', 'Reflexión, refracción y reflexión total', 1,
              'Leyes de la reflexión y refracción, índice de refracción, ángulo límite y reflexión total, imagen virtual.',
              ['Ley de Snell y ángulo límite (deducirlo)', 'Cuestiones cotidianas: bastón roto, pecera, prisma, arco iris']),
            t('optica', 'Óptica geométrica: lentes y espejos', 2,
              'Lentes delgadas convergentes y divergentes, espejos planos y esféricos, trazado de rayos, ecuaciones y aumento lateral, fibra óptica.',
              ['Trazado de rayos en lentes y espejos explicando la construcción', 'Ecuación de las lentes delgadas y aumento lateral (con criterio de signos)', 'Características de la imagen: real/virtual, derecha/invertida, tamaño'])
          ]
        },
        {
          nombre: 'Física relativista, cuántica y nuclear',
          temas: [
            t('cuant', 'Física cuántica', 2,
              'Insuficiencia de la física clásica, hipótesis de Planck, efecto fotoeléctrico, dualidad onda-corpúsculo, principio de incertidumbre.',
              ['Efecto fotoeléctrico: balance energético y potencial de frenado', 'Longitud de onda de De Broglie', 'Principio de incertidumbre y cuestiones teóricas sobre dualidad']),
            t('nuclear', 'Física nuclear y radiactividad', 2,
              'Núcleo atómico, defecto de masa y energía de enlace, radiactividad y leyes de desplazamiento, ley de desintegración, fisión y fusión, interacciones fundamentales.',
              ['Ley de desintegración: actividad, constante radiactiva y periodo de semidesintegración', 'Defecto de masa y energía de enlace por nucleón', 'Ajuste de reacciones nucleares, fisión y fusión', 'Cuestiones sobre las cuatro interacciones fundamentales'])
          ]
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'qui',
      nombre: 'Química',
      corto: 'Química',
      color: '#7c3aed',
      estilo: 'problemas',
      pdf: 'directrices/sel_2026-2027-Orientaciones_quimica.pdf',
      examen: {
        duracion: 90,
        estructura: [
          '5 preguntas de 2 puntos. Las preguntas 1 a 4 tienen dos opciones (A o B); la 5 es obligatoria.',
          'Preguntas 1, 2 y 3: cuatro apartados de 0,5 puntos. Pregunta 4: problema con dos apartados de 1 punto.',
          'La pregunta 5 es competencial, a partir de un texto o un contexto real.'
        ],
        materiales: 'Calculadora científica no programable.',
        consejos: [
          'La falta de justificación cuando se pide se penaliza con el 100 % del apartado.',
          'Resultados sin unidades o con unidades incorrectas: −25 % del apartado.',
          'Ajusta las redox siempre por el método del ion-electrón (si no, −25 % en el apartado siguiente).',
          'Un error de concepto básico supone un cero en ese apartado.',
          'No se aceptan flechas como justificación de las propiedades periódicas.'
        ]
      },
      bloques: [
        {
          nombre: 'Enlace químico y estructura de la materia',
          temas: [
            t('forminorg', 'Formulación inorgánica (IUPAC 2005)', 2,
              'Nomenclatura y formulación de compuestos inorgánicos según las recomendaciones IUPAC 2005.',
              ['Óxidos, hidruros y sales binarias', 'Hidróxidos, oxoácidos y oxisales', 'Iones y sales ácidas']),
            t('atomo', 'Estructura atómica y modelos', 1,
              'Espectros atómicos, modelo de Bohr, dualidad, principio de incertidumbre, orbitales y números cuánticos, Z, A e isótopos.',
              ['Protones, neutrones, electrones e isótopos (como la pregunta 1A del modelo)', 'Modelo de Bohr, espectros y cuantización de la energía', 'Números cuánticos posibles y orbitales']),
            t('config', 'Configuración electrónica y propiedades periódicas', 2,
              'Diagrama de Moeller, principio de Pauli y regla de Hund, posición en la tabla, radio, energía de ionización, afinidad electrónica y electronegatividad.',
              ['Escribir configuraciones electrónicas y números cuánticos del electrón diferenciador', 'Situar un elemento (periodo y grupo) a partir de su configuración', 'Justificar la variación de las propiedades periódicas usando la carga nuclear efectiva']),
            t('enlionico', 'Enlace iónico y metálico', 1,
              'Energía reticular y ciclo de Born-Haber, propiedades de los compuestos iónicos, modelo del gas electrónico y bandas, propiedades de los metales.',
              ['Ciclo de Born-Haber y cálculo de la energía reticular', 'Propiedades de compuestos iónicos y metales']),
            t('enlcov', 'Enlace covalente: Lewis, RPECV e hibridación', 2,
              'Estructuras de Lewis, geometría por RPECV, teoría del enlace de valencia, hibridación sp, sp², sp³, enlaces σ y π, polaridad.',
              ['Estructuras de Lewis de moléculas e iones', 'Geometría por RPECV e hibridación del átomo central', 'Polaridad de moléculas a partir de su geometría']),
            t('fuerzas', 'Fuerzas intermoleculares', 1,
              'Tipos de fuerzas intermoleculares y su influencia en puntos de fusión y ebullición y en la solubilidad.',
              ['Identificar fuerzas intermoleculares y justificar puntos de fusión/ebullición', 'Justificar la solubilidad en agua de distintas sustancias'])
          ]
        },
        {
          nombre: 'Reacciones químicas',
          temas: [
            t('termo', 'Termoquímica y espontaneidad', 2,
              'Primer principio, entalpía de reacción, ΔH y ΔU, ley de Hess (entalpías de formación y energías de enlace), entropía, energía de Gibbs.',
              ['Ley de Hess con entalpías de formación o energías de enlace', 'Relación entre ΔH y ΔU y diagramas entálpicos', 'Espontaneidad según ΔH, ΔS y la temperatura']),
            t('cinetica', 'Cinética química', 1,
              'Teoría de colisiones, velocidad de reacción, energía de activación, ecuación de velocidad y órdenes, Arrhenius, catalizadores.',
              ['Ecuación de velocidad y órdenes de reacción a partir de datos experimentales', 'Factores que influyen en la velocidad y papel de los catalizadores']),
            t('equilibrio', 'Equilibrio químico y solubilidad', 3,
              'Ley de acción de masas, Kc y Kp, grado de disociación, cociente de reacción, Le Châtelier, producto de solubilidad y efecto del ion común.',
              ['Calcular Kc y Kp y concentraciones en el equilibrio', 'Grado de disociación en equilibrios gaseosos', 'Principio de Le Châtelier y cociente de reacción', 'Solubilidad, Ks y efecto del ion común (como la pregunta 4A del modelo)']),
            t('acidobase', 'Ácidos y bases', 3,
              'Teorías de Arrhenius y Brønsted-Lowry, pares conjugados, fuerza de ácidos y bases, pH, Ka y Kb, hidrólisis de sales, volumetrías.',
              ['pH de ácidos y bases fuertes y débiles, Ka, Kb y grado de disociación', 'Carácter ácido o básico de sales (hidrólisis)', 'Volumetrías ácido-base y preparación de disoluciones', 'Verdadero/falso razonados sobre pares conjugados y pH (como la pregunta 2A del modelo)']),
            t('redox', 'Reacciones redox y electroquímica', 3,
              'Número de oxidación, ajuste por ion-electrón, volumetrías redox, potenciales estándar, pilas, espontaneidad, electrólisis y leyes de Faraday.',
              ['Ajustar reacciones por el método del ion-electrón (medio ácido y básico)', 'Pilas: semirreacciones, notación y potencial estándar (como la pregunta 2B)', 'Predecir la espontaneidad de un proceso redox', 'Electrólisis y leyes de Faraday: masa depositada y volumen de gas'])
          ]
        },
        {
          nombre: 'Química orgánica y laboratorio',
          temas: [
            t('formorg', 'Formulación orgánica (IUPAC 1993)', 2,
              'Hidrocarburos y funciones: alcohol, fenol, éter, aldehído, cetona, ácido y sal, éster, haluro, amina, amida, nitro y nitrilo; compuestos con varias funciones.',
              ['Hidrocarburos (alcanos, alquenos, alquinos, aromáticos)', 'Funciones oxigenadas: alcoholes, éteres, aldehídos, cetonas, ácidos y ésteres', 'Funciones nitrogenadas y haluros']),
            t('isomeria', 'Isomería', 1,
              'Isomería de cadena, posición y función; isomería geométrica y óptica (carbono asimétrico).',
              ['Escribir los isómeros estructurales de una fórmula molecular', 'Justificar isomería geométrica y óptica']),
            t('reacorg', 'Reactividad orgánica', 2,
              'Combustión, sustitución alifática y aromática, adición a dobles y triples enlaces, eliminación, esterificación, redox orgánicas (sin mecanismos).',
              ['Completar reacciones de sustitución, adición y eliminación', 'Esterificación, combustión y oxidación-reducción de compuestos orgánicos']),
            t('lab', 'Laboratorio y textos científicos', 1,
              'Material e instrumentos de laboratorio, normas de seguridad, gestión de residuos, interpretación de textos de divulgación.',
              ['Material de laboratorio y normas de seguridad', 'Pregunta tipo 5: texto de divulgación con nombrar/formular, cálculos y lectura de gráficas'])
          ]
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'bio',
      nombre: 'Biología',
      corto: 'Biología',
      color: '#15803d',
      estilo: 'memoria',
      pdf: 'directrices/sel_2026-2027-Orientaciones_biologia.pdf',
      examen: {
        duracion: 90,
        estructura: [
          '5 ejercicios de 2 puntos. Los ejercicios 1 y 2 son obligatorios y competenciales.',
          'En los ejercicios 3, 4 y 5 eliges una de las dos opciones.',
          'Entre las cinco preguntas se tocan los seis bloques; al menos el 70 % es de respuesta abierta o semiconstruida.'
        ],
        materiales: 'Solo bolígrafo azul o negro. No se permite calculadora.',
        consejos: [
          'Limítate a lo que se pregunta: la información de más no puntúa.',
          'Acompaña las respuestas con esquemas cuando ayuden.',
          'Usa vocabulario científico preciso.',
          ORTOGRAFIA_CRUE
        ]
      },
      bloques: [
        {
          nombre: 'Biomoléculas',
          temas: [
            t('bioinorg', 'Bioelementos, agua y sales minerales', 1,
              'Clasificación de biomoléculas, tipos de enlaces, grupos funcionales, propiedades del agua y funciones de las sales minerales e iones.',
              ['Relacionar la estructura del agua con sus propiedades', 'Funciones de sales minerales e iones (Na⁺, K⁺, Ca²⁺, Mg²⁺)', 'Tipos de enlaces e interacciones en las biomoléculas']),
            t('glucidos', 'Glúcidos', 2,
              'Monosacáridos (Fischer y cíclicas, isomería, anómeros), enlace O-glucosídico, disacáridos y polisacáridos (almidón, glucógeno, celulosa).',
              ['Reconocer fórmulas de glucosa, fructosa, galactosa, ribosa y desoxirribosa', 'Enlace O-glucosídico y disacáridos (maltosa, lactosa, celobiosa, sacarosa)', 'Estructura y función de los polisacáridos']),
            t('lipidos', 'Lípidos', 2,
              'Ácidos grasos, saponificables (acilglicéridos, ceras, fosfolípidos, esfingolípidos) e insaponificables (esteroides, terpenos), esterificación y saponificación.',
              ['Clasificar lípidos y dar una función de cada tipo (como el Ejercicio 3 del modelo)', 'Ácidos grasos saturados/insaturados y reacción de saponificación', 'Fosfolípidos y carácter anfipático en las membranas']),
            t('proteinas', 'Proteínas', 2,
              'Aminoácidos y carácter anfótero, enlace peptídico, niveles estructurales y enlaces que los estabilizan, desnaturalización, funciones.',
              ['Formular un dipéptido señalando el enlace peptídico', 'Niveles estructurales y enlaces implicados', 'Desnaturalización y funciones de las proteínas con ejemplos']),
            t('enzimas', 'Enzimas y vitaminas', 2,
              'Enzimas como biocatalizadores, centro activo, energía de activación, factores que afectan a la actividad, inhibición, alosterismo, cofactores y vitaminas.',
              ['Interpretar gráficas de actividad enzimática y de energía de activación', 'Inhibición competitiva, no competitiva, irreversible y regulación alostérica', 'Vitaminas hidrosolubles y liposolubles y enfermedades carenciales']),
            t('nucleicos', 'Ácidos nucleicos', 2,
              'Nucleótidos y enlace fosfodiéster, ATP, modelo de Watson y Crick, compactación del ADN, diferencias ADN-ARN, tipos de ARN.',
              ['Composición de nucleótidos y productos de su hidrólisis', 'Estructura del ADN y diferencias con el ARN', 'Tipos de ARN: estructura, localización y función'])
          ]
        },
        {
          nombre: 'Genética molecular',
          temas: [
            t('replic', 'Replicación del ADN', 2,
              'Replicación semiconservativa y bidireccional, etapas y enzimas en procariotas, hebra conductora y retardada, fragmentos de Okazaki, diferencias con eucariotas.',
              ['Etapas y enzimas de la replicación en procariotas', 'Hebra conductora y retardada y fragmentos de Okazaki (como el Ejercicio 1 del modelo)', 'Comparar la replicación en procariotas y eucariotas', 'Problemas con las reglas de Chargaff']),
            t('expresion', 'Expresión génica y código genético', 3,
              'Transcripción (procariotas y eucariotas, maduración), traducción, código genético, regulación (operón lac, cromatina).',
              ['Transcripción: etapas, promotor y diferencias procariotas-eucariotas', 'Traducción: etapas y elementos implicados', 'Problemas con el código genético (cadena molde/codificante → ARNm → proteína)', 'Operón lactosa y regulación en eucariotas']),
            t('mutaciones', 'Mutaciones', 1,
              'Concepto y tipos de mutaciones, agentes mutagénicos, relación con la variabilidad y la evolución.',
              ['Clasificar mutaciones (génicas, cromosómicas, genómicas) y agentes mutagénicos', 'Reconocer mutaciones en esquemas y relacionarlas con la evolución'])
          ]
        },
        {
          nombre: 'Biología celular',
          temas: [
            t('celula', 'Teoría celular, microscopía y tipos de célula', 1,
              'Postulados de la teoría celular, microscopía óptica y electrónica, poder de resolución, organización procariota y eucariota animal y vegetal.',
              ['Comparar célula procariota, eucariota animal y vegetal (como el Ejercicio 2 del modelo)', 'Microscopio óptico, electrónico de transmisión y de barrido']),
            t('membrana', 'Membrana plasmática y transporte', 2,
              'Mosaico fluido, funciones de la membrana, ósmosis en medios hipo/iso/hipertónicos, transporte pasivo y activo, endocitosis y exocitosis.',
              ['Modelo de mosaico fluido y funciones de la membrana', 'Efectos osmóticos en células animales y vegetales', 'Tipos de transporte a través de membrana']),
            t('organulos', 'Orgánulos celulares', 2,
              'Estructura y función de los orgánulos eucariotas y componentes procariotas, origen endosimbiótico, ribosomas 70S y 80S.',
              ['Identificar orgánulos en esquemas y fotografías', 'Relacionar la estructura de cada orgánulo con su función', 'Teoría endosimbiótica y tipos de ribosomas']),
            t('ciclo', 'Ciclo celular, mitosis, meiosis y cáncer', 2,
              'Cromosoma metafásico, haploide/diploide, fases del ciclo, mitosis, meiosis y sobrecruzamiento, cáncer y control del ciclo.',
              ['Identificar fases de mitosis y meiosis en dibujos', 'Comparar mitosis y meiosis (células, resultado, significado)', 'Cáncer: relación con mutaciones y prevención'])
          ]
        },
        {
          nombre: 'Metabolismo',
          temas: [
            t('metab', 'Conceptos de metabolismo, ATP y poder reductor', 1,
              'Tipos de nutrición, catabolismo y anabolismo, ATP, NADH y NADPH, metabolismo aerobio y anaerobio, regulación.',
              ['Clasificar organismos por su tipo de nutrición', 'Comparar catabolismo y anabolismo; papel del ATP y del poder reductor']),
            t('catab', 'Catabolismo: glucólisis, fermentación y respiración', 3,
              'Glucólisis, fermentaciones láctica y alcohólica, respiración aerobia (Krebs, cadena respiratoria, fosforilación oxidativa), β-oxidación, rendimientos.',
              ['Localización, sustratos y productos de glucólisis, Krebs y cadena respiratoria', 'Interpretar un esquema de la mitocondria (como el Ejercicio 3, opción 1)', 'Fermentación frente a respiración: rendimiento y productos', 'β-oxidación de ácidos grasos']),
            t('anab', 'Anabolismo: fotosíntesis y quimiosíntesis', 2,
              'Fase luminosa (fotosistemas, fotólisis, fotofosforilación), ciclo de Calvin, fotosíntesis oxigénica y anoxigénica, quimiosíntesis.',
              ['Interpretar el esquema de la fase luminosa (como el Ejercicio 3, opción 2)', 'Ciclo de Calvin: sustratos, productos y localización', 'Quimiosíntesis e importancia biológica de la fotosíntesis'])
          ]
        },
        {
          nombre: 'Ingeniería genética y biotecnología',
          temas: [
            t('ingen', 'Ingeniería genética', 2,
              'ADN recombinante, enzimas de restricción, vectores, transcriptasa inversa, PCR, electroforesis, secuenciación, CRISPR-Cas, terapia génica, OMG y transgénicos.',
              ['PCR: fases, reactivos y Taq polimerasa (como el Ejercicio 4, opción 1)', 'ADN recombinante, enzimas de restricción y vectores', 'Interpretar resultados de electroforesis y esquemas de CRISPR-Cas']),
            t('biotec', 'Biotecnología y microorganismos', 1,
              'Aplicaciones en alimentación (yogur, queso, pan, vino), medicina, agricultura y medio ambiente; biorremediación.',
              ['Procesos biotecnológicos en alimentación (como el yogur del modelo)', 'Aplicaciones en salud, agricultura y medio ambiente (biorremediación)'])
          ]
        },
        {
          nombre: 'Inmunología',
          temas: [
            t('inmuinn', 'Inmunidad innata y sistema inmunitario', 1,
              'Concepto de inmunidad, órganos y células, barreras externas, inmunidad innata (inflamación, fagocitosis, complemento, NK).',
              ['Barreras externas y respuesta inflamatoria', 'Órganos y células del sistema inmunitario y su función']),
            t('inmuesp', 'Inmunidad específica y anticuerpos', 2,
              'Respuesta humoral y celular, linfocitos B y T, CMH, estructura y tipos de inmunoglobulinas, reacciones antígeno-anticuerpo, respuesta primaria y secundaria.',
              ['Estructura de las inmunoglobulinas y tipos (IgG, IgM, IgA, IgE, IgD)', 'Interpretar gráficas de respuesta primaria y secundaria', 'Reacciones antígeno-anticuerpo y respuesta humoral frente a celular']),
            t('inmusal', 'Vacunas, sueros y patologías inmunitarias', 1,
              'Inmunidad natural/artificial y activa/pasiva, vacunas y sueros, fases de la enfermedad infecciosa, alergias, autoinmunidad, inmunodeficiencias, trasplantes.',
              ['Comparar vacunas y sueros (tipos de inmunidad)', 'Alergia, autoinmunidad, inmunodeficiencia y rechazo de trasplantes'])
          ]
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'his',
      nombre: 'Historia de España',
      corto: 'Historia',
      color: '#b45309',
      estilo: 'memoria',
      pdf: 'directrices/sel_2026-2027-Orientaciones_historia_espana.pdf',
      examen: {
        duracion: 90,
        estructura: [
          'I. Cuestiones (3 puntos): respondes 2 de 4, de la Agrupación I (bloques 1-4). 1,5 puntos cada una.',
          'II. Documento (4 puntos) y III. Tema (3 puntos), dentro del itinerario que elijas:',
          'Itinerario A: documento de la Agrupación II y tema de la Agrupación III.',
          'Itinerario B: documento de la Agrupación III y tema de la Agrupación II.'
        ],
        materiales: 'Sin materiales específicos.',
        consejos: [
          'Documento: a) analiza el hecho histórico (2 puntos) y b) explica contexto y consecuencias (2 puntos).',
          'Tema: localización en tiempo y espacio, componentes y evolución (1,5) + causas, cambios y permanencias (1,5).',
          'Como el documento y el tema se cruzan entre agrupaciones, necesitas dominar la II y la III.',
          ORTOGRAFIA_CRUE
        ]
      },
      bloques: [
        {
          nombre: 'Agrupación I (cuestiones)',
          temas: [
            t('b1', 'B1. De la Prehistoria a la monarquía visigoda (hasta 711)', 1,
              'Primeros pobladores, pueblos prerromanos, colonizaciones, romanización (concepto e instrumentos) y reino visigodo.',
              ['Definir conceptos clave (romanización, municipio, latifundio…)', 'Responder cuestiones cortas tipo PAU (definición + explicación)']),
            t('b2', 'B2. La Edad Media: tres culturas (711-1474)', 1,
              'Conquista musulmana y factores de su rapidez, al-Ándalus, reinos cristianos, Reconquista y repoblación, convivencia de culturas.',
              ['Definir conceptos clave (emirato, califato, taifa, repoblación…)', 'Responder cuestiones cortas tipo PAU']),
            t('b3', 'B3. La Monarquía Hispánica (1474-1700)', 1,
              'Reyes Católicos y monarquía autoritaria, descubrimiento de América, Austrias mayores y menores, crisis del XVII.',
              ['Definir conceptos clave (monarquía autoritaria, Inquisición, validos…)', 'Responder cuestiones cortas tipo PAU']),
            t('b4', 'B4. El reformismo de los primeros Borbones (1700-1788)', 1,
              'Guerra de Sucesión, Decretos de Nueva Planta, reformas borbónicas, despotismo ilustrado y Carlos III.',
              ['Definir conceptos clave (despotismo ilustrado, Nueva Planta…)', 'Responder cuestiones cortas tipo PAU'])
          ]
        },
        {
          nombre: 'Agrupación II (siglo XIX)',
          temas: [
            t('a2t1', 'Crisis de la monarquía borbónica y Guerra de la Independencia (1808-1814)', 1, 'Unidad temática 1 de la Agrupación II.', null),
            t('a2t2', 'Cortes de Cádiz y Constitución de 1812', 1, 'Unidad temática 2 de la Agrupación II.', null),
            t('a2t3', 'Fernando VII: absolutismo e intentos liberales (1814-1833)', 1, 'Unidad temática 3 de la Agrupación II.', null),
            t('a2t4', 'Regencias de Isabel II y Primera Guerra Carlista (1833-1843)', 1, 'Unidad temática 4 de la Agrupación II.', null),
            t('a2t5', 'Reinado efectivo de Isabel II (1843-1868)', 1, 'Unidad temática 5 de la Agrupación II.', null),
            t('a2t6', 'Sexenio: Revolución, Constitución de 1869 y Amadeo de Saboya', 1, 'Unidad temática 6 de la Agrupación II.', null),
            t('a2t7', 'Sexenio: la Primera República y su fracaso', 1, 'Unidad temática 7 de la Agrupación II.', null),
            t('a2t8', 'Implantación de la Restauración: sistema canovista', 1, 'Unidad temática 8 de la Agrupación II.', null),
            t('a2t9', 'Alfonso XII, la Regencia y el turnismo', 1, 'Unidad temática 9 de la Agrupación II.', null),
            t('a2t10', 'Guerra colonial y crisis de 1898', 1, 'Unidad temática 10 de la Agrupación II.', null),
            t('a2t11', 'Cambios agrarios y desamortizaciones', 1, 'Unidad temática 11 de la Agrupación II.', null),
            t('a2t12', 'Industrialización y movimiento obrero en el siglo XIX', 1, 'Unidad temática 12 de la Agrupación II.', null)
          ]
        },
        {
          nombre: 'Agrupación III (siglos XX y XXI)',
          temas: [
            t('a3t1', 'Alfonso XIII y el regeneracionismo (1902-1917)', 1, 'Unidad temática 1 de la Agrupación III.', null),
            t('a3t2', 'La crisis de 1917 y el fin de la Restauración', 1, 'Unidad temática 2 de la Agrupación III.', null),
            t('a3t3', 'Dictadura de Primo de Rivera (1923-1930)', 1, 'Unidad temática 3 de la Agrupación III.', null),
            t('a3t4', 'Proclamación de la Segunda República y Constitución de 1931', 1, 'Unidad temática 4 de la Agrupación III.', null),
            t('a3t5', 'Segunda República: bienios y Frente Popular', 1, 'Unidad temática 5 de la Agrupación III.', null),
            t('a3t6', 'Guerra Civil: evolución militar y consecuencias', 1, 'Unidad temática 6 de la Agrupación III.', null),
            t('a3t7', 'Guerra Civil: evolución política y relaciones internacionales', 1, 'Unidad temática 7 de la Agrupación III.', null),
            t('a3t8', 'Franquismo: bases ideológicas, autarquía y consolidación (1939-1959)', 1, 'Unidad temática 8 de la Agrupación III.', null),
            t('a3t9', 'Franquismo: desarrollismo y crisis final (1959-1975)', 1, 'Unidad temática 9 de la Agrupación III.', null),
            t('a3t10', 'La Transición a la democracia (1975-1978)', 1, 'Unidad temática 10 de la Agrupación III.', null),
            t('a3t11', 'Constitución de 1978 y primeros gobiernos (1978-1982)', 1, 'Unidad temática 11 de la Agrupación III.', null),
            t('a3t12', 'La etapa socialista: modernización e integración europea (1982-1996)', 1, 'Unidad temática 12 de la Agrupación III.', null),
            t('a3t13', 'La alternancia política en democracia (1996-2012)', 1, 'Unidad temática 13 de la Agrupación III.', null)
          ]
        }
      ],
      // Ejercicios comunes para los temas de desarrollo (los que tienen ejercicios = null).
      ejerciciosTema: [
        'Hacer un esquema del tema: causas, desarrollo, consecuencias y fechas clave',
        'Redactar el tema completo en 25 minutos, como en el examen',
        'Comentar un documento de esta etapa: a) hecho histórico y b) contexto y consecuencias',
        'Repasar cronología, personajes y conceptos clave del tema'
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'fil',
      nombre: 'Historia de la Filosofía',
      corto: 'Filosofía',
      color: '#0e7490',
      estilo: 'redaccion',
      pdf: 'directrices/sel_2026-2027-Orientaciones_historia_filosofia.pdf',
      examen: {
        duracion: 90,
        estructura: [
          'Parte I (2,5 puntos): disertación filosófica obligatoria de hasta 400 palabras sobre una cuestión actual.',
          'Parte II: eliges uno de dos textos (uno de problemas ontológico-epistemológicos y otro ético-políticos) y respondes tres cuestiones de 2,5 puntos:',
          '1ª Ideas y problema filosófico del texto. 2ª Relación con la filosofía del autor/a. 3ª Comparación con un autor/a de otra época.'
        ],
        materiales: 'Sin materiales.',
        consejos: [
          'En la cuestión 1ª no parafrasees: usa el lenguaje del autor y argumenta.',
          'En la 3ª confronta de verdad los argumentos de ambos autores.',
          'Disertación: estructura clara, marcadores discursivos, contenido filosófico y pensamiento crítico.',
          ORTOGRAFIA_CRUE
        ]
      },
      bloques: [
        {
          nombre: 'Problemas ontológicos y epistemológicos',
          temas: [
            t('platon', 'Platón (Fedón, República VI)', 2,
              'Teoría de las Ideas, reminiscencia, dualismo, la línea dividida y el conocimiento. Textos: Fedón 74a-75e; República VI 504d-511e.',
              null),
            t('descartes', 'Descartes (Discurso del método, Meditaciones)', 2,
              'Método, duda metódica, cogito, res cogitans y res extensa, Dios como garantía. Textos: Discurso II; Meditaciones Primera y Segunda.',
              null),
            t('nietzsche', 'Nietzsche (La gaya ciencia, Crepúsculo de los ídolos)', 2,
              'Muerte de Dios, nihilismo, crítica a la metafísica y a la razón, perspectivismo. Textos: Gaya ciencia §110, §125, §343, §355; "La razón en la filosofía".',
              null),
            t('ortega', 'Ortega y Gasset (El tema de nuestro tiempo)', 2,
              'Raciovitalismo, perspectivismo, relativismo frente a racionalismo, historia del ser. Textos: "Relativismo y racionalismo", "La doctrina del punto de vista", "Sobre la historia del Ser".',
              null)
          ]
        },
        {
          nombre: 'Problemas éticos y políticos',
          temas: [
            t('aristoteles', 'Aristóteles (Ética nicomáquea, Política)', 2,
              'Felicidad como fin, virtud, el ser humano como animal político, la polis y las formas de gobierno. Textos: EN I 2, 4, 8; Política I 1-2, III 7-8.',
              null),
            t('locke', 'Locke (Segundo Tratado del Gobierno Civil)', 2,
              'Estado de naturaleza, ley natural, propiedad y trabajo, contrato social y gobierno civil. Textos: caps. 2, 3, 4, 5 y 9 (parágrafos seleccionados).',
              null),
            t('kant', 'Kant (Fundamentación de la metafísica de las costumbres)', 2,
              'Buena voluntad, deber, máximas, imperativo categórico frente a hipotético, autonomía. Texto: sección 1ª.',
              null),
            t('arendt', 'Hannah Arendt (Responsabilidad y juicio, La promesa de la política)', 2,
              'Banalidad del mal, pensar y juicio moral, sentido de la política y libertad. Textos: "El pensar y las reflexiones morales"; "Introducción a la política".',
              null)
          ]
        },
        {
          nombre: 'Disertación',
          temas: [
            t('disertacion', 'Disertación filosófica (hasta 400 palabras)', 2,
              'Escrito argumentativo original y crítico sobre un problema actual, apoyado en contenidos filosóficos.',
              ['Escribir una disertación de 400 palabras con introducción, argumentos, contraargumentos y conclusión', 'Practicar marcadores discursivos y conectar el tema con autores estudiados', 'Generar ideas y esquema en 10 minutos para un tema nuevo'])
          ]
        }
      ],
      ejerciciosTema: [
        'Leer y subrayar los fragmentos oficiales del autor',
        'Cuestión 1ª: identificar la idea principal y el problema filosófico de un fragmento',
        'Cuestión 2ª: relacionar el texto con la filosofía completa del autor',
        'Cuestión 3ª: comparar el problema del texto con un autor de otra época',
        'Hacer un esquema del pensamiento del autor (contexto, conocimiento/ser, ética/política)'
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'len',
      nombre: 'Lengua Castellana y Literatura II',
      corto: 'Lengua',
      color: '#be123c',
      estilo: 'redaccion',
      pdf: 'directrices/sel_2026-2027-Orientaciones_lengua_castellana.pdf',
      examen: {
        duracion: 90,
        estructura: [
          'Bloque 1 (4 puntos), a partir de un texto periodístico o ensayístico: P1 ideas, organización y estructura (1,5); P2 intención comunicativa (0,5); P3 texto argumentativo de 200-250 palabras (2).',
          'Bloque 2 (6 puntos): 4a sintaxis (1,5); 4b y 4c lengua y sus hablantes (1 y 0,5); 5a historia de la literatura (1,5); 5b lectura obligatoria (1,5).'
        ],
        materiales: 'Bolígrafo de un único color (azul o negro). Ningún dispositivo electrónico.',
        consejos: [
          'Ortografía muy penalizada: −0,2 por grafía y −0,1 por tilde desde la PRIMERA falta (hasta −2 puntos en total).',
          'Texto argumentativo fuera de 200-250 palabras: −0,25.',
          'Las notas van en intervalos de 0,25.'
        ]
      },
      bloques: [
        {
          nombre: 'Comunicación (comentario de texto)',
          temas: [
            t('ideas', 'Ideas, organización y estructura', 2,
              'Identificar el tema y las ideas, exponer su organización y justificar el tipo de estructura (analizante, sintetizante, encuadrada, paralela…).',
              ['Extraer las ideas de un artículo de opinión', 'Exponer la organización y justificar la estructura del texto']),
            t('intencion', 'Intención comunicativa', 1,
              'Propósito del autor, tipología textual, géneros periodísticos y ensayo.',
              ['Explicar la intención comunicativa de un texto en 4-5 líneas']),
            t('argumentativo', 'Texto argumentativo (200-250 palabras)', 2,
              'Tesis, tipos de argumentos, estructura y marcadores discursivos.',
              ['Escribir un texto argumentativo de 200-250 palabras cronometrado (20 min)', 'Ampliar repertorio de marcadores discursivos y tipos de argumentos'])
          ]
        },
        {
          nombre: 'Reflexión sobre la lengua',
          temas: [
            t('sintaxis', 'Sintaxis: oración simple y compuesta', 3,
              'Categoría y función, grupos sintácticos, coordinación, yuxtaposición, subordinadas sustantivas, adjetivas y adverbiales, valores del se.',
              ['Análisis sintáctico completo de un fragmento', 'Explicar las relaciones sintácticas entre las oraciones de un fragmento', 'Subordinadas sustantivas, adjetivas y adverbiales', 'Valores del se']),
            t('palabras', 'Formación, clase y función de palabras', 1,
              'Procedimientos de formación de palabras, clase gramatical y función, relaciones semánticas.',
              ['Analizar la formación de dos palabras del texto', 'Identificar la clase y la función de palabras señaladas', 'Realizar transformaciones gramaticales']),
            t('cohesion', 'Cohesión, objetividad y sentido de palabras', 1,
              'Mecanismos de cohesión, marcas de objetividad y subjetividad, sentido contextual de palabras y expresiones.',
              ['Comentar dos mecanismos de cohesión con ejemplos del texto', 'Señalar marcas de objetividad y subjetividad', 'Explicar el sentido de palabras en su contexto']),
            t('variedades', 'La lengua y sus hablantes', 1,
              'Lenguas de España, dialectos y el andaluz, sociolectos y registros, norma culta, prejuicios lingüísticos.',
              ['Diferenciar registro formal y coloquial con ejemplos', 'Rasgos del andaluz y variedades del español'])
          ]
        },
        {
          nombre: 'Historia de la literatura (5a)',
          temas: [
            t('lit1', 'La novela de principios del s. XX a 1939', 1, 'Tema 1 del Anexo II: tendencias, autores y obras.', null),
            t('lit2', 'La novela de 1939 a los años 70', 1, 'Tema 2 del Anexo II.', null),
            t('lit3', 'La novela desde 1975 hasta hoy', 1, 'Tema 3 del Anexo II.', null),
            t('lit4', 'La poesía del Modernismo a las vanguardias', 1, 'Tema 4 del Anexo II.', null),
            t('lit5', 'La poesía de la Generación del 27', 1, 'Tema 5 del Anexo II.', null),
            t('lit6', 'La poesía de 1939 a los años 70', 1, 'Tema 6 del Anexo II.', null),
            t('lit7', 'La poesía desde los años 70 hasta hoy', 1, 'Tema 7 del Anexo II.', null),
            t('lit8', 'El teatro de principios del s. XX a 1939', 1, 'Tema 8 del Anexo II.', null),
            t('lit9', 'El teatro desde 1939 hasta hoy', 1, 'Tema 9 del Anexo II.', null)
          ]
        },
        {
          nombre: 'Lecturas obligatorias (5b)',
          temas: [
            t('baroja', 'Pío Baroja, El árbol de la ciencia', 2, 'Argumento, estructura, personajes, temas, contexto (98) y estilo.', null),
            t('cernuda', 'Luis Cernuda, La realidad y el deseo', 2, 'Etapas de su poesía, temas (amor, deseo, soledad, exilio), Generación del 27.', null),
            t('lorca', 'Federico García Lorca, La casa de Bernarda Alba', 2, 'Estructura, personajes, símbolos, temas y teatro lorquiano.', null),
            t('gaite', 'Carmen Martín Gaite, El cuarto de atrás', 2, 'Estructura, el visitante, técnicas narrativas, memoria y posguerra.', null)
          ]
        }
      ],
      ejerciciosTema: [
        'Esquema: tendencias, autores y obras con fechas',
        'Responder tres preguntas breves tipo 5a/5b (0,5 cada una) en 10 minutos',
        'Comentar un fragmento: tema, rasgos formales y contexto',
        'Fichas de memoria: autores, obras y rasgos clave'
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'ing',
      nombre: 'Inglés II',
      corto: 'Inglés',
      color: '#0369a1',
      estilo: 'redaccion',
      pdf: 'directrices/sel_2026-2027-Orientaciones_ingles.pdf',
      examen: {
        duracion: 90,
        estructura: [
          'A. Comprehension (4 puntos): texto de 350-500 palabras con 8 preguntas: 2 de elección múltiple, 4 verdadero/falso justificadas y 2 de vocabulario.',
          'B. Use of English (3 puntos): eliges una opción con 6 transformaciones de frases (0,5 cada una).',
          'C. Writing (3 puntos): redacción de 140-180 palabras sobre uno de dos temas.'
        ],
        materiales: 'Sin diccionario ni material de apoyo.',
        consejos: [
          'Verdadero/falso: copia la frase EXACTA del texto (una oración, sin puntos suspensivos ni palabras propias).',
          'Use of English: un error = 0,25; dos o más errores = 0.',
          'Writing: indica el número de palabras; menos de 140 o más de 180 penaliza.',
          'Si te sales del tema en el writing, la nota es 0.'
        ]
      },
      bloques: [
        {
          nombre: 'Comprehension',
          temas: [
            t('reading', 'Reading comprehension', 2,
              'Lectura de textos auténticos informativos, argumentativos, descriptivos o narrativos.',
              ['Leer un texto y contestar 2 preguntas de elección múltiple', 'True/False justificando con la cita exacta del texto', 'Find in the text: sinónimos, antónimos y definiciones']),
            t('vocab', 'Vocabulary building', 1,
              'Sinónimos, antónimos, word formation y vocabulario de temas actuales (tecnología, medio ambiente, redes, salud…).',
              ['Lista de 20 palabras nuevas de un texto con sinónimo y antónimo', 'Word formation: prefijos y sufijos'])
          ]
        },
        {
          nombre: 'Use of English (rewriting)',
          temas: [
            t('wishes', 'Wishes, If only, I\'d rather, had better', 1, 'Expresar deseos y lamentos, preferencias y consejos.', ['Rewriting con wish / if only', 'Rewriting con I\'d rather / would prefer / had better']),
            t('conditionals', 'Conditionals (unless, provided that…)', 1, 'Condicionales 0, 1, 2, 3 y mixtas; unless, as long as, provided that.', ['Rewriting de condicionales', 'Transformaciones con unless / in case / otherwise']),
            t('passive', 'Passive voice e impersonal passive', 1, 'Pasiva en todos los tiempos, pasiva impersonal (It is thought that… / is thought to have…), causative.', ['Rewriting a pasiva', 'Impersonal passive (THOUGHT, SAID, BELIEVED)', 'Causative have/get something done']),
            t('reported', 'Reported speech', 1, 'Afirmaciones, preguntas, órdenes y peticiones; reporting verbs (asked, told, advised, suggested…).', ['Pasar a estilo indirecto afirmaciones y preguntas', 'Órdenes y peticiones con asked/told/advised + infinitivo']),
            t('comparatives', 'Comparatives, so/such, too/enough', 1, 'Comparativos y superlativos, as…as, so…that, such…that, too, enough.', ['Rewriting con comparativos y as…as', 'Rewriting con so/such…that y too/enough']),
            t('tenses', 'Tiempos verbales y estructuras (spend/take, used to)', 1, 'Present perfect, past perfect, It\'s the first time, used to/be used to, spend/take, since/for/ago.', ['Rewriting con present perfect y past perfect (Paul had never…)', 'Rewriting con spend / take / used to']),
            t('relatives', 'Relative clauses', 1, 'Oraciones de relativo especificativas y explicativas, pronombres relativos.', ['Unir frases con pronombres relativos']),
            t('modals', 'Modals y modal perfects, likely', 1, 'Modales de obligación, posibilidad y deducción; modal perfects; be likely to.', ['Rewriting con modales y modal perfects', 'Rewriting con likely / probably / must have']),
            t('phrasal', 'Phrasal verbs, gerunds e infinitives', 1, 'Phrasal verbs frecuentes (turn down, give up…), verbos + gerundio o infinitivo.', ['Sustituir verbos por phrasal verbs (turn down, look forward to…)', 'Verbos seguidos de gerundio o infinitivo'])
          ]
        },
        {
          nombre: 'Writing',
          temas: [
            t('writing', 'Writing (140-180 words)', 2,
              'Redacciones de opinión, a favor y en contra, narrativas y descriptivas; organización en párrafos y conectores.',
              ['Escribir una opinion essay de 140-180 palabras cronometrada (25 min) y contar palabras', 'Escribir un for-and-against essay', 'Repasar conectores (however, moreover, on the other hand…) y estructuras complejas'],
              'Contenido 1,25 + expresión 1,75. Un mismo error solo cuenta una vez.')
          ]
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'dt',
      nombre: 'Dibujo Técnico II',
      corto: 'Dibujo T.',
      color: '#475569',
      estilo: 'grafico',
      pdf: 'directrices/sel_2026-2027-Orientaciones_dibujo_tecnico.pdf',
      examen: {
        duracion: 90,
        estructura: [
          '4 ejercicios de 2,5 puntos en láminas A4: 1A o 1B (fundamentos geométricos), 2 (sistema diédrico), 3A o 3B (axonométrico o cónica) y 4 (normalización).'
        ],
        materiales: 'Lápiz de grafito, escuadra, cartabón, regla, compás, plantillas, transportador, tablero A3 y calculadora no programable.',
        consejos: [
          'Deja siempre visibles las construcciones auxiliares: se valora el método más que el grafismo.',
          'Usa grosores distintos para datos, construcciones y solución; aplica vistos y ocultos.',
          'En isométrica la circunferencia es una elipse, nunca un óvalo, y siempre con coeficientes de reducción.',
          'Vistas según el método del primer diedro y acotación según UNE-EN ISO 129-1.'
        ]
      },
      bloques: [
        {
          nombre: 'Fundamentos geométricos',
          temas: [
            t('tangencias', 'Tangencias: potencia, eje y centro radical', 2,
              'Potencia de un punto, eje radical y centro radical aplicados a tangencias, puntos de tangencia indicados.',
              ['Circunferencias tangentes por eje radical', 'Problemas de Apolonio sencillos con centro radical', 'Enlaces y puntos de tangencia indicados']),
            t('conicas', 'Curvas cónicas', 2,
              'Elipse, hipérbola y parábola: ejes, focos, directrices, tangentes y asíntotas; trazado por puntos o por homología.',
              ['Trazar una elipse por puntos a partir de sus elementos', 'Tangentes a cónicas desde un punto o paralelas a una dirección', 'Hipérbola y parábola: elementos y trazado']),
            t('homologia', 'Homología y afinidad', 2,
              'Elementos de la homología y la afinidad, transformación de figuras, cónicas como homólogas de la circunferencia (sin rectas límite obligatorias).',
              ['Transformar una figura por afinidad', 'Transformar una figura por homología', 'Obtener una cónica como homóloga de una circunferencia'])
          ]
        },
        {
          nombre: 'Geometría descriptiva',
          temas: [
            t('diedrico1', 'Diédrico: intersecciones, distancias y métodos', 2,
              'Intersecciones de planos y de recta con plano, distancias (excepto rectas que se cruzan), abatimientos, giros y cambios de plano.',
              ['Intersección de planos y de recta con plano', 'Distancia de punto a plano, punto a recta y entre planos paralelos', 'Abatimientos, giros y cambios de plano']),
            t('diedrico2', 'Diédrico: ángulos', 2,
              'Ángulos entre rectas, entre recta y plano y con los planos de proyección; recta o plano dado su ángulo con un plano de proyección.',
              ['Ángulo entre dos rectas y entre recta y plano', 'Ángulos con los planos de proyección', 'Recta o plano conocido el ángulo con un plano de proyección']),
            t('diedrico3', 'Diédrico: cuerpos y secciones', 2,
              'Tetraedro y cubo apoyados en un plano, octaedro, prismas y pirámides regulares, cilindros y conos de revolución; secciones, intersección con rectas.',
              ['Representar poliedros regulares apoyados en un plano', 'Sección plana de un cuerpo y verdadera magnitud', 'Intersección de recta con un cuerpo y puntos en su superficie']),
            t('isometrica', 'Perspectiva isométrica', 2,
              'Ejes y coeficientes de reducción, representación de piezas a partir de sus vistas, circunferencias en isométrica (elipses).',
              ['Dibujar en isométrica una pieza dada por sus vistas', 'Circunferencias en isométrica (elipses)']),
            t('caballera', 'Perspectiva caballera', 1,
              'Ejes y coeficiente de reducción, representación de piezas apoyadas en planos coordenados.',
              ['Dibujar en caballera una pieza dada por sus vistas']),
            t('conica', 'Perspectiva cónica', 2,
              'Elementos del sistema (LT, LH, P, punto de vista abatido) y perspectiva de cuerpos apoyados en el geometral.',
              ['Perspectiva cónica frontal de un cuerpo', 'Perspectiva cónica oblicua de un cuerpo'])
          ]
        },
        {
          nombre: 'Normalización',
          temas: [
            t('vistas', 'Vistas y acotación', 2,
              'Vistas según el primer diedro a partir de una perspectiva, normas de líneas y acotación (UNE-EN ISO 128 y 129).',
              ['Dibujar alzado, planta y perfil a partir de una isométrica', 'Acotar una pieza en sus vistas']),
            t('cortes', 'Cortes y secciones', 2,
              'Cortes totales, medios y quebrados, secciones, rayado y acotación sobre cortes.',
              ['Dibujar un corte a partir de las vistas de una pieza', 'Secciones y acotación sobre cortes'])
          ]
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'edmn',
      nombre: 'Empresa y Diseño de Modelos de Negocio',
      corto: 'Empresa',
      color: '#a16207',
      estilo: 'problemas',
      pdf: 'directrices/sel_2026-2027-Orientaciones_empresa_diseno.pdf',
      examen: {
        duracion: 90,
        estructura: [
          'Primera parte: 2 problemas obligatorios de 2 puntos (uno del Bloque C y otro del Bloque E).',
          'Segunda parte: 6 preguntas competenciales de 1 punto: A (1 de 2), B (1 de 2), C (2 de 3), D (1 de 2) y E (1 de 2).'
        ],
        materiales: 'Calculadora no programable.',
        consejos: [
          'En los problemas interpreta siempre el resultado: puntúa.',
          'En teoría aplica el concepto al caso del enunciado, no lo recites sin más.',
          'Hasta un 10 % menos por pregunta por ortografía, claridad o coherencia.',
          'Las cuentas son las del modelo abreviado del PGC.'
        ]
      },
      bloques: [
        {
          nombre: 'Emprendimiento y entorno (A y B)',
          temas: [
            t('u1', 'Empresariado, emprendimiento e innovación', 1,
              'Perfiles de emprendedor, teorías del empresario, I+D+i, tipos y estrategias de innovación, RSC, igualdad e inclusión.',
              ['Identificar el tipo de innovación de un caso con dos criterios', 'Identificar el tipo de emprendedor y justificarlo', 'Responsabilidad social corporativa en casos reales']),
            t('u2', 'La empresa, formas jurídicas y entorno', 2,
              'Concepto, elementos y funciones de la empresa, formas jurídicas, entorno general y específico, localización, dimensión y crecimiento, marco jurídico.',
              ['Elegir y justificar la forma jurídica de un caso', 'Clasificar elementos del macroentorno y microentorno', 'Estrategias de crecimiento, pymes y multinacionales'])
          ]
        },
        {
          nombre: 'Modelo de negocio y gestión (C)',
          temas: [
            t('u3', 'Organización, dirección y planificación', 1,
              'Planificación estratégica, estructuras organizativas, dirección y liderazgo, cultura de empresa, comunicación y conflictos.',
              ['Identificar estilos de liderazgo y estructuras organizativas en casos']),
            t('u4', 'Función productiva: productividad y costes', 3,
              'Eficiencia, productividad de factores y global, cadena de valor, costes, umbral de rentabilidad, producir o comprar, calidad, inventarios PMP y FIFO.',
              ['Problema de productividad de factores y global (como el Problema 1 del modelo)', 'Umbral de rentabilidad: cálculo, gráfica e interpretación', 'Decisión de producir o comprar', 'Valoración de existencias por PMP y FIFO']),
            t('u5', 'Función comercial y marketing', 2,
              'Investigación de mercados, segmentación, propuesta de valor, marketing mix, digitalización comercial.',
              ['Identificar las variables del marketing mix en un caso (como Decathlon)', 'Segmentación y técnicas de investigación de mercados']),
            t('u6', 'Recursos humanos', 1,
              'Reclutamiento y selección, motivación (Maslow, Herzberg), equipos ágiles, contratación, igualdad y nóminas.',
              ['Analizar un caso con las teorías de Maslow y Herzberg', 'Tipos de contrato y elementos de la nómina']),
            t('u7', 'Evaluación y validación del modelo de negocio', 1,
              'DAFO, subcontratación, Lean Startup, desarrollo de clientes y producto, protección de ideas y marcas (OEPM, EUIPO, OMPI).',
              ['Elaborar un DAFO de un caso', 'Explicar cómo ayuda Lean Startup a un emprendedor'])
          ]
        },
        {
          nombre: 'Herramientas de innovación (D)',
          temas: [
            t('u8', 'Canvas, mapa de empatía y presentación de proyectos', 2,
              'Lienzo Canvas y sus bloques, mapa de empatía, creatividad, visual thinking, prototipado, storytelling y elevator pitch, escenarios.',
              ['Identificar bloques del Canvas en un caso con ejemplos', 'Explicar el elevator pitch y el storytelling', 'Mapa de empatía y segmentación'])
          ]
        },
        {
          nombre: 'Estrategia y análisis (E)',
          temas: [
            t('u9', 'Función financiera: inversión y financiación', 2,
              'Estructura económica y financiera, tipos de inversión, plazo de recuperación, VAN y TIR, fuentes de financiación internas y externas.',
              ['Calcular VAN, TIR y plazo de recuperación y elegir inversión', 'Explicar fuentes de financiación a corto y largo plazo']),
            t('u10', 'Contabilidad: balance y pérdidas y ganancias', 2,
              'Patrimonio y masas patrimoniales, cuentas anuales, balance y cuenta de PyG, BAII, BN y EBITDA.',
              ['Ordenar un balance por masas patrimoniales', 'Elaborar la cuenta de pérdidas y ganancias (BAII, BAI, BN, EBITDA)']),
            t('u11', 'Análisis financiero y entorno competitivo', 2,
              'Fondo de maniobra, ratios, equilibrios patrimoniales, rentabilidad económica y financiera, periodo medio de maduración, fuerzas de Porter.',
              ['Rentabilidad económica y financiera (como el Problema 2 del modelo)', 'Fondo de maniobra y ratios con interpretación', 'Periodo medio de maduración', 'Identificar las fuerzas competitivas de Porter en un caso'])
          ]
        }
      ]
    }
  ];

  /* Utilidades de búsqueda */
  var porId = {};
  ASIGNATURAS.forEach(function (a) {
    porId[a.id] = a;
    a.temas = [];
    a.bloques.forEach(function (b) {
      b.temas.forEach(function (tema) {
        tema.bloque = b.nombre;
        if (!tema.ejercicios) tema.ejercicios = a.ejerciciosTema || ['Repasar y resumir el tema'];
        a.temas.push(tema);
      });
    });
  });

  var Catalogo = {
    asignaturas: ASIGNATURAS,
    asignatura: function (id) { return porId[id] || null; },
    tema: function (asigId, temaId) {
      var a = porId[asigId];
      if (!a) return null;
      for (var i = 0; i < a.temas.length; i++) if (a.temas[i].id === temaId) return a.temas[i];
      return null;
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Catalogo;
  else global.Catalogo = Catalogo;
})(this);
