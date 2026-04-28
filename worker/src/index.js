import {
  hashPassword, verifyPassword, signJWT, verifyJWT,
  generateId, generateLicenseCode, generateSecurePassword,
} from './crypto.js';
import { sendLicenseApprovedEmail } from './email.js';

// ── Career database ───────────────────────────────────────────────────────────
// ideal: EI (0=I,100=E) · SN (0=N,100=S) · TF (0=F,100=T) · JP (0=P,100=J)
// future: job market outlook 0-100

// ideal: EI/SN/TF/JP (MBTI), R/I/A/S/E/C (RIASEC), O/C/E/A/N (NEO Big Five)
const CAREERS = [
  { id: 'arquitectura_grado', name: 'Arquitectura', area: 'Arquitectura', description: 'Diseño y planificación de edificios, espacios y entornos urbanos.',
    mbti:{EI:38,SN:38,TF:52,JP:58}, riasec:{R:65,I:48,A:52,S:25,E:44,C:57},
    values:{autonomy:83,innovative:80,socialImpact:44,growth:50}, future:9 },
  { id: 'arq_naval', name: 'Arquitectura Naval e Ingeniería Marítima', area: 'Arquitectura', description: 'Diseño y construcción de embarcaciones y estructuras marinas.',
    mbti:{EI:35,SN:62,TF:78,JP:70}, riasec:{R:79,I:78,A:27,S:5,E:38,C:55},
    values:{autonomy:83,innovative:78,socialImpact:50,growth:50}, future:16 },
  { id: 'arq_tecnica', name: 'Arquitectura Técnica', area: 'Arquitectura', description: 'Dirección de ejecución de obra, control de costes y gestión de proyectos constructivos.',
    mbti:{EI:42,SN:62,TF:68,JP:72}, riasec:{R:76,I:54,A:58,S:9,E:9,C:65},
    values:{autonomy:83,innovative:80,socialImpact:44,growth:50}, future:8 },
  { id: 'edificacion_ct', name: 'Ciencia y Tecnología de Edificación', area: 'Arquitectura', description: 'Gestión técnica de proyectos de edificación, materiales y procesos constructivos.',
    mbti:{EI:48,SN:65,TF:72,JP:72}, riasec:{R:61,I:36,A:12,S:22,E:79,C:63},
    values:{autonomy:78,innovative:75,socialImpact:67,growth:61}, future:8 },
  { id: 'ing_edificacion', name: 'Ingeniería de Edificación', area: 'Arquitectura', description: 'Dirección técnica de obras de edificación y gestión de proyectos de construcción.',
    mbti:{EI:42,SN:65,TF:75,JP:72}, riasec:{R:90,I:69,A:20,S:12,E:28,C:60},
    values:{autonomy:83,innovative:78,socialImpact:50,growth:50}, future:9 },
  { id: 'urbanismo', name: 'Urbanismo', area: 'Arquitectura', description: 'Planificación y ordenación del territorio, diseño urbano y gestión de ciudades.',
    mbti:{EI:42,SN:45,TF:58,JP:62}, riasec:{R:37,I:72,A:34,S:34,E:58,C:49},
    values:{autonomy:56,innovative:62,socialImpact:72,growth:56}, future:9 },
  { id: 'animacion', name: 'Animación', area: 'Artes y Humanidades', description: 'Creación de personajes, escenas y efectos animados para cine, televisión y videojuegos.',
    mbti:{EI:38,SN:32,TF:35,JP:35}, riasec:{R:45,I:30,A:100,S:20,E:27,C:36},
    values:{autonomy:72,innovative:75,socialImpact:50,growth:67}, future:26 },
  { id: 'arte_digital', name: 'Arte Digital', area: 'Artes y Humanidades', description: 'Creación artística mediante herramientas digitales: ilustración, NFT y arte generativo.',
    mbti:{EI:35,SN:30,TF:32,JP:32}, riasec:{R:40,I:31,A:100,S:19,E:40,C:49},
    values:{autonomy:72,innovative:75,socialImpact:50,growth:67}, future:26 },
  { id: 'artes_escenicas', name: 'Artes Escénicas', area: 'Artes y Humanidades', description: 'Interpretación teatral, danza y performance en escenarios y producciones en vivo.',
    mbti:{EI:72,SN:30,TF:28,JP:30}, riasec:{R:22,I:19,A:100,S:51,E:50,C:14},
    values:{autonomy:61,innovative:70,socialImpact:83,growth:67}, future:6 },
  { id: 'bellas_artes', name: 'Bellas Artes', area: 'Artes y Humanidades', description: 'Expresión artística a través de pintura, escultura, instalaciones y medios mixtos.',
    mbti:{EI:30,SN:22,TF:22,JP:22}, riasec:{R:51,I:28,A:100,S:21,E:23,C:22},
    values:{autonomy:78,innovative:78,socialImpact:50,growth:67}, future:6 },
  { id: 'cine', name: 'Cine', area: 'Artes y Humanidades', description: 'Dirección, producción y realización de largometrajes, documentales y cortometrajes.',
    mbti:{EI:55,SN:32,TF:35,JP:38}, riasec:{R:19,I:21,A:86,S:35,E:80,C:43},
    values:{autonomy:78,innovative:80,socialImpact:78,growth:61}, future:6 },
  { id: 'composicion_musical', name: 'Composición Musical', area: 'Artes y Humanidades', description: 'Creación de obras musicales originales para concierto, cine, videojuegos y publicidad.',
    mbti:{EI:32,SN:28,TF:30,JP:38}, riasec:{R:18,I:21,A:100,S:34,E:64,C:27},
    values:{autonomy:78,innovative:78,socialImpact:50,growth:67}, future:6 },
  { id: 'conservacion_restauracion', name: 'Conservación y Restauración de Bienes Culturales', area: 'Artes y Humanidades', description: 'Preservación, análisis y restauración de obras artísticas y bienes culturales.',
    mbti:{EI:35,SN:58,TF:60,JP:65}, riasec:{R:25,I:40,A:33,S:47,E:47,C:73},
    values:{autonomy:83,innovative:80,socialImpact:50,growth:61}, future:0 },
  { id: 'disenyo', name: 'Diseño', area: 'Artes y Humanidades', description: 'Diseño visual y de producto combinando creatividad, funcionalidad y comunicación.',
    mbti:{EI:38,SN:30,TF:40,JP:38}, riasec:{R:40,I:31,A:100,S:19,E:40,C:49},
    values:{autonomy:72,innovative:75,socialImpact:50,growth:67}, future:22 },
  { id: 'disenyo_digital', name: 'Diseño Digital', area: 'Artes y Humanidades', description: 'Diseño de interfaces, experiencias digitales y comunicación visual online.',
    mbti:{EI:38,SN:30,TF:38,JP:35}, riasec:{R:40,I:31,A:100,S:19,E:40,C:49},
    values:{autonomy:72,innovative:75,socialImpact:50,growth:67}, future:22 },
  { id: 'disenyo_grafico', name: 'Diseño Gráfico', area: 'Artes y Humanidades', description: 'Creación de identidades visuales, tipografía, ilustración y comunicación gráfica.',
    mbti:{EI:38,SN:28,TF:38,JP:32}, riasec:{R:40,I:31,A:100,S:19,E:40,C:49},
    values:{autonomy:72,innovative:75,socialImpact:50,growth:67}, future:22 },
  { id: 'disenyo_interiores', name: 'Diseño de Interiores', area: 'Artes y Humanidades', description: 'Diseño y decoración de espacios interiores residenciales y comerciales.',
    mbti:{EI:42,SN:42,TF:45,JP:52}, riasec:{R:52,I:34,A:76,S:28,E:45,C:47},
    values:{autonomy:78,innovative:78,socialImpact:67,growth:72}, future:9 },
  { id: 'disenyo_moda', name: 'Diseño de Moda', area: 'Artes y Humanidades', description: 'Creación de colecciones de ropa, accesorios y textiles para la industria de la moda.',
    mbti:{EI:45,SN:30,TF:35,JP:32}, riasec:{R:56,I:19,A:100,S:22,E:49,C:32},
    values:{autonomy:72,innovative:75,socialImpact:50,growth:67}, future:8 },
  { id: 'disenyo_producto', name: 'Diseño de Producto', area: 'Artes y Humanidades', description: 'Diseño de objetos físicos combinando funcionalidad, ergonomía y estética.',
    mbti:{EI:38,SN:40,TF:52,JP:45}, riasec:{R:40,I:31,A:100,S:19,E:40,C:49},
    values:{autonomy:72,innovative:75,socialImpact:50,growth:67}, future:16 },
  { id: 'estudios_clasicos', name: 'Estudios Clásicos', area: 'Artes y Humanidades', description: 'Estudio de las civilizaciones griega y romana: lengua, literatura, historia y filosofía.',
    mbti:{EI:30,SN:35,TF:45,JP:52}, riasec:{R:23,I:72,A:45,S:37,E:22,C:64},
    values:{autonomy:67,innovative:67,socialImpact:67,growth:50}, future:0 },
  { id: 'estudios_ingleses', name: 'Estudios Ingleses', area: 'Artes y Humanidades', description: 'Lengua, literatura y cultura anglosajona con aplicaciones en traducción y educación.',
    mbti:{EI:42,SN:38,TF:38,JP:52}, riasec:{R:15,I:36,A:55,S:41,E:15,C:63},
    values:{autonomy:44,innovative:44,socialImpact:72,growth:44}, future:0 },
  { id: 'filologia', name: 'Filología', area: 'Artes y Humanidades', description: 'Estudio profundo de la lengua y la literatura con especialización en lingüística aplicada.',
    mbti:{EI:30,SN:35,TF:38,JP:52}, riasec:{R:15,I:36,A:55,S:41,E:15,C:63},
    values:{autonomy:44,innovative:44,socialImpact:72,growth:44}, future:0 },
  { id: 'filosofia_poli_eco', name: 'Filosofía, Política y Economía', area: 'Artes y Humanidades', description: 'Formación interdisciplinar en pensamiento crítico, gobernanza e instituciones económicas.',
    mbti:{EI:42,SN:38,TF:55,JP:55}, riasec:{R:0,I:95,A:48,S:40,E:44,C:42},
    values:{autonomy:67,innovative:72,socialImpact:39,growth:56}, future:14 },
  { id: 'fotografia', name: 'Fotografía', area: 'Artes y Humanidades', description: 'Arte y técnica fotográfica aplicada a la moda, publicidad y documentalismo.',
    mbti:{EI:35,SN:30,TF:32,JP:32}, riasec:{R:76,I:20,A:71,S:16,E:21,C:39},
    values:{autonomy:78,innovative:78,socialImpact:50,growth:67}, future:6 },
  { id: 'gestion_cultural', name: 'Gestión Cultural', area: 'Artes y Humanidades', description: 'Planificación y administración de proyectos culturales, festivales y patrimonio.',
    mbti:{EI:55,SN:45,TF:40,JP:58}, riasec:{R:39,I:16,A:16,S:49,E:88,C:67},
    values:{autonomy:78,innovative:80,socialImpact:78,growth:61}, future:17 },
  { id: 'historia', name: 'Historia', area: 'Artes y Humanidades', description: 'Estudio del pasado humano, sus procesos, causas y consecuencias.',
    mbti:{EI:30,SN:38,TF:45,JP:55}, riasec:{R:23,I:72,A:45,S:37,E:22,C:64},
    values:{autonomy:67,innovative:67,socialImpact:67,growth:50}, future:0 },
  { id: 'historia_arte', name: 'Historia del Arte', area: 'Artes y Humanidades', description: 'Análisis e interpretación de las manifestaciones artísticas a lo largo de la historia.',
    mbti:{EI:32,SN:35,TF:42,JP:52}, riasec:{R:25,I:40,A:33,S:47,E:47,C:73},
    values:{autonomy:83,innovative:80,socialImpact:50,growth:61}, future:0 },
  { id: 'historia_musica', name: 'Historia y Ciencias de la Música', area: 'Artes y Humanidades', description: 'Musicología, análisis musical e historia de la música clásica y contemporánea.',
    mbti:{EI:30,SN:35,TF:40,JP:52}, riasec:{R:18,I:21,A:100,S:34,E:64,C:27},
    values:{autonomy:78,innovative:78,socialImpact:50,growth:67}, future:6 },
  { id: 'humanidades', name: 'Humanidades', area: 'Artes y Humanidades', description: 'Formación integral en pensamiento crítico, cultura, filosofía e historia.',
    mbti:{EI:32,SN:35,TF:42,JP:52}, riasec:{R:23,I:72,A:45,S:37,E:22,C:64},
    values:{autonomy:67,innovative:67,socialImpact:67,growth:50}, future:0 },
  { id: 'interpretacion_musical', name: 'Interpretación Musical', area: 'Artes y Humanidades', description: 'Formación de intérpretes instrumentales o vocales para conciertos y orquestas.',
    mbti:{EI:42,SN:30,TF:28,JP:35}, riasec:{R:31,I:9,A:94,S:40,E:40,C:19},
    values:{autonomy:78,innovative:78,socialImpact:50,growth:67}, future:6 },
  { id: 'lengua_lit_esp', name: 'Lengua y Literatura Española', area: 'Artes y Humanidades', description: 'Estudio de la lengua castellana, su literatura y sus aplicaciones editoriales y educativas.',
    mbti:{EI:32,SN:38,TF:38,JP:52}, riasec:{R:1,I:32,A:73,S:26,E:52,C:61},
    values:{autonomy:83,innovative:78,socialImpact:56,growth:55}, future:0 },
  { id: 'lenguas_modernas', name: 'Lenguas Modernas', area: 'Artes y Humanidades', description: 'Formación en dos o más idiomas extranjeros con orientación profesional e intercultural.',
    mbti:{EI:45,SN:40,TF:38,JP:52}, riasec:{R:15,I:36,A:55,S:41,E:15,C:63},
    values:{autonomy:44,innovative:44,socialImpact:72,growth:44}, future:0 },
  { id: 'linguistica', name: 'Lingüística', area: 'Artes y Humanidades', description: 'Estudio científico del lenguaje, la fonología, la gramática y el procesamiento del habla.',
    mbti:{EI:30,SN:35,TF:52,JP:58}, riasec:{R:15,I:36,A:55,S:41,E:15,C:63},
    values:{autonomy:44,innovative:44,socialImpact:72,growth:44}, future:0 },
  { id: 'literatura_comparada', name: 'Literatura General y Comparada', area: 'Artes y Humanidades', description: 'Análisis comparativo de tradiciones literarias y su contexto histórico-cultural.',
    mbti:{EI:30,SN:32,TF:35,JP:48}, riasec:{R:0,I:38,A:95,S:31,E:62,C:39},
    values:{autonomy:83,innovative:78,socialImpact:56,growth:55}, future:0 },
  { id: 'musica', name: 'Música', area: 'Artes y Humanidades', description: 'Formación musical integral: teoría, historia e interpretación.',
    mbti:{EI:38,SN:30,TF:28,JP:35}, riasec:{R:31,I:9,A:94,S:40,E:40,C:19},
    values:{autonomy:78,innovative:78,socialImpact:50,growth:67}, future:6 },
  { id: 'traduccion_int', name: 'Traducción e Interpretación', area: 'Artes y Humanidades', description: 'Traducción escrita e interpretación oral entre idiomas en contextos profesionales.',
    mbti:{EI:38,SN:42,TF:42,JP:58}, riasec:{R:15,I:36,A:55,S:41,E:15,C:63},
    values:{autonomy:44,innovative:44,socialImpact:72,growth:44}, future:6 },
  { id: 'bioquimica', name: 'Bioquímica', area: 'Ciencias Puras y Matemáticas', description: 'Estudio de los procesos químicos de los seres vivos y sus aplicaciones biomédicas.',
    mbti:{EI:28,SN:45,TF:75,JP:60}, riasec:{R:68,I:100,A:27,S:19,E:14,C:44},
    values:{autonomy:67,innovative:72,socialImpact:44,growth:45}, future:9 },
  { id: 'cc_ambientales', name: 'Ciencias Ambientales', area: 'Ciencias Puras y Matemáticas', description: 'Estudio y gestión del medio ambiente, cambio climático y sostenibilidad.',
    mbti:{EI:40,SN:52,TF:60,JP:60}, riasec:{R:63,I:100,A:15,S:29,E:26,C:55},
    values:{autonomy:67,innovative:67,socialImpact:50,growth:50}, future:28 },
  { id: 'cc_mar', name: 'Ciencias del Mar', area: 'Ciencias Puras y Matemáticas', description: 'Oceanografía, biología marina y gestión de recursos marinos y costeros.',
    mbti:{EI:35,SN:55,TF:68,JP:60}, riasec:{R:81,I:90,A:10,S:19,E:22,C:55},
    values:{autonomy:56,innovative:64,socialImpact:22,growth:72}, future:0 },
  { id: 'estadistica', name: 'Estadística', area: 'Ciencias Puras y Matemáticas', description: 'Recopilación, análisis e interpretación de datos para la toma de decisiones.',
    mbti:{EI:28,SN:45,TF:85,JP:65}, riasec:{R:19,I:93,A:13,S:12,E:14,C:84},
    values:{autonomy:78,innovative:75,socialImpact:61,growth:55}, future:41 },
  { id: 'fisica', name: 'Física', area: 'Ciencias Puras y Matemáticas', description: 'Estudio de las leyes fundamentales del universo y sus aplicaciones tecnológicas.',
    mbti:{EI:25,SN:30,TF:88,JP:55}, riasec:{R:66,I:100,A:29,S:19,E:13,C:63},
    values:{autonomy:83,innovative:83,socialImpact:28,growth:44}, future:9 },
  { id: 'matematicas', name: 'Matemáticas', area: 'Ciencias Puras y Matemáticas', description: 'Estudio del razonamiento abstracto, modelos matemáticos y sus aplicaciones.',
    mbti:{EI:25,SN:32,TF:88,JP:58}, riasec:{R:37,I:100,A:37,S:16,E:2,C:67},
    values:{autonomy:72,innovative:78,socialImpact:17,growth:55}, future:16 },
  { id: 'cc_politicas', name: 'Ciencias Políticas', area: 'Ciencias Sociales', description: 'Análisis de sistemas políticos, instituciones, poder y política pública.',
    mbti:{EI:55,SN:45,TF:52,JP:60}, riasec:{R:0,I:95,A:48,S:40,E:44,C:42},
    values:{autonomy:67,innovative:72,socialImpact:39,growth:56}, future:7 },
  { id: 'cc_seguridad', name: 'Ciencias de la Seguridad', area: 'Ciencias Sociales', description: 'Gestión de la seguridad pública, criminología aplicada y defensa civil.',
    mbti:{EI:48,SN:65,TF:68,JP:70}, riasec:{R:53,I:65,A:3,S:29,E:51,C:64},
    values:{autonomy:83,innovative:83,socialImpact:50,growth:44}, future:-3 },
  { id: 'comunicacion', name: 'Comunicación', area: 'Ciencias Sociales', description: 'Comunicación estratégica, relaciones públicas y gestión de la comunicación corporativa.',
    mbti:{EI:65,SN:42,TF:38,JP:48}, riasec:{R:0,I:29,A:61,S:49,E:80,C:41},
    values:{autonomy:78,innovative:78,socialImpact:72,growth:67}, future:12 },
  { id: 'comunicacion_audiovisual', name: 'Comunicación Audiovisual', area: 'Ciencias Sociales', description: 'Producción audiovisual, periodismo multimedia y comunicación digital.',
    mbti:{EI:60,SN:38,TF:35,JP:40}, riasec:{R:22,I:34,A:72,S:23,E:42,C:45},
    values:{autonomy:67,innovative:72,socialImpact:39,growth:56}, future:6 },
  { id: 'comunicacion_corp', name: 'Comunicación Corporativa y Protocolo', area: 'Ciencias Sociales', description: 'Gestión de la imagen institucional, comunicación interna y protocolo empresarial.',
    mbti:{EI:62,SN:48,TF:42,JP:60}, riasec:{R:0,I:22,A:44,S:53,E:100,C:56},
    values:{autonomy:72,innovative:72,socialImpact:67,growth:50}, future:17 },
  { id: 'comunicacion_digital', name: 'Comunicación Digital', area: 'Ciencias Sociales', description: 'Estrategia de comunicación en entornos digitales, redes sociales y marketing de contenidos.',
    mbti:{EI:62,SN:38,TF:38,JP:45}, riasec:{R:0,I:29,A:61,S:49,E:80,C:41},
    values:{autonomy:78,innovative:78,socialImpact:72,growth:67}, future:18 },
  { id: 'educacion_infantil', name: 'Educación Infantil', area: 'Ciencias Sociales', description: 'Formación y acompañamiento del desarrollo cognitivo y emocional en la etapa 0-6 años.',
    mbti:{EI:62,SN:55,TF:18,JP:65}, riasec:{R:32,I:29,A:50,S:100,E:25,C:44},
    values:{autonomy:56,innovative:58,socialImpact:89,growth:78}, future:10 },
  { id: 'educacion_primaria', name: 'Educación Primaria', area: 'Ciencias Sociales', description: 'Docencia en primaria y diseño de metodologías pedagógicas para niños de 6-12 años.',
    mbti:{EI:62,SN:52,TF:22,JP:65}, riasec:{R:27,I:39,A:48,S:100,E:26,C:46},
    values:{autonomy:72,innovative:75,socialImpact:89,growth:72}, future:10 },
  { id: 'estudios_globales', name: 'Estudios Globales', area: 'Ciencias Sociales', description: 'Análisis de fenómenos globales: geopolítica, desarrollo internacional y sostenibilidad.',
    mbti:{EI:55,SN:42,TF:52,JP:58}, riasec:{R:0,I:95,A:48,S:40,E:44,C:42},
    values:{autonomy:67,innovative:72,socialImpact:39,growth:56}, future:13 },
  { id: 'geografia_ord_territorio', name: 'Geografía y Ordenación del Territorio', area: 'Ciencias Sociales', description: 'Análisis espacial, ordenación territorial y gestión medioambiental.',
    mbti:{EI:38,SN:55,TF:60,JP:62}, riasec:{R:68,I:96,A:45,S:29,E:18,C:45},
    values:{autonomy:83,innovative:80,socialImpact:33,growth:72}, future:14 },
  { id: 'gestion_moda', name: 'Gestión de Moda', area: 'Ciencias Sociales', description: 'Gestión empresarial, marketing y distribución en la industria de la moda y el lujo.',
    mbti:{EI:58,SN:45,TF:42,JP:52}, riasec:{R:0,I:32,A:24,S:30,E:100,C:62},
    values:{autonomy:78,innovative:80,socialImpact:78,growth:61}, future:12 },
  { id: 'informacion_documentacion', name: 'Información y Documentación', area: 'Ciencias Sociales', description: 'Gestión de información, archivos, bibliotecas y documentación digital.',
    mbti:{EI:35,SN:55,TF:58,JP:68}, riasec:{R:22,I:44,A:27,S:51,E:29,C:80},
    values:{autonomy:67,innovative:67,socialImpact:67,growth:50}, future:22 },
  { id: 'periodismo', name: 'Periodismo', area: 'Ciencias Sociales', description: 'Investigación y difusión de información periodística en medios escritos, digitales y audiovisuales.',
    mbti:{EI:68,SN:40,TF:38,JP:42}, riasec:{R:8,I:53,A:68,S:30,E:49,C:44},
    values:{autonomy:67,innovative:72,socialImpact:39,growth:56}, future:6 },
  { id: 'publicidad_rrpp', name: 'Publicidad y Relaciones Públicas', area: 'Ciencias Sociales', description: 'Diseño de campañas publicitarias, gestión de marcas y relaciones con los medios.',
    mbti:{EI:68,SN:38,TF:38,JP:45}, riasec:{R:0,I:20,A:54,S:42,E:90,C:49},
    values:{autonomy:75,innovative:75,socialImpact:70,growth:59}, future:17 },
  { id: 'relaciones_internacionales', name: 'Relaciones Internacionales', area: 'Ciencias Sociales', description: 'Diplomacia, política exterior y cooperación entre estados y organismos internacionales.',
    mbti:{EI:58,SN:42,TF:52,JP:60}, riasec:{R:0,I:95,A:48,S:40,E:44,C:42},
    values:{autonomy:67,innovative:72,socialImpact:39,growth:56}, future:13 },
  { id: 'sociologia', name: 'Sociología', area: 'Ciencias Sociales', description: 'Estudio de la sociedad, sus estructuras, comportamientos colectivos y cambios sociales.',
    mbti:{EI:42,SN:42,TF:45,JP:52}, riasec:{R:9,I:92,A:50,S:56,E:35,C:43},
    values:{autonomy:78,innovative:78,socialImpact:39,growth:56}, future:13 },
  { id: 'bioinformatica', name: 'Bioinformática', area: 'Ciencias de la Salud', description: 'Análisis computacional de datos biológicos, genómica y desarrollo de herramientas bioinformáticas.',
    mbti:{EI:25,SN:42,TF:82,JP:62}, riasec:{R:47,I:100,A:25,S:11,E:4,C:67},
    values:{autonomy:72,innovative:70,socialImpact:39,growth:50}, future:25 },
  { id: 'biologia', name: 'Biología', area: 'Ciencias de la Salud', description: 'Estudio de los seres vivos, sus procesos celulares, genética y ecosistemas.',
    mbti:{EI:30,SN:48,TF:68,JP:60}, riasec:{R:72,I:100,A:15,S:16,E:1,C:48},
    values:{autonomy:67,innovative:67,socialImpact:56,growth:45}, future:28 },
  { id: 'biomedicina', name: 'Biomedicina', area: 'Ciencias de la Salud', description: 'Investigación biomédica orientada al diagnóstico y tratamiento de enfermedades.',
    mbti:{EI:28,SN:52,TF:72,JP:65}, riasec:{R:54,I:100,A:24,S:38,E:20,C:45},
    values:{autonomy:78,innovative:78,socialImpact:56,growth:50}, future:9 },
  { id: 'cc_act_fisica_deporte', name: 'Ciencias de la Actividad Física y del Deporte', area: 'Ciencias de la Salud', description: 'Entrenamiento deportivo, fisiología del ejercicio y salud física.',
    mbti:{EI:65,SN:60,TF:45,JP:60}, riasec:{R:50,I:50,A:50,S:50,E:50,C:50},
    values:{autonomy:56,innovative:56,socialImpact:83,growth:67}, future:19 },
  { id: 'optica_optometria', name: 'Óptica y Optometría', area: 'Ciencias de la Salud', description: 'Examen visual, prescripción óptica y detección de patologías oculares.',
    mbti:{EI:42,SN:68,TF:60,JP:72}, riasec:{R:63,I:80,A:10,S:67,E:21,C:49},
    values:{autonomy:78,innovative:80,socialImpact:83,growth:50}, future:6 },
  { id: 'criminologia', name: 'Criminología', area: 'Derecho y Ciencias Jurídicas', description: 'Análisis de la conducta criminal, victimología y sistemas de justicia penal.',
    mbti:{EI:52,SN:58,TF:62,JP:68}, riasec:{R:53,I:65,A:3,S:29,E:51,C:64},
    values:{autonomy:83,innovative:83,socialImpact:50,growth:44}, future:7 },
  { id: 'rrll_rrhh', name: 'Relaciones Laborales y Recursos Humanos', area: 'Derecho y Ciencias Jurídicas', description: 'Gestión del talento, negociación colectiva y derecho laboral en las organizaciones.',
    mbti:{EI:58,SN:55,TF:45,JP:65}, riasec:{R:3,I:30,A:9,S:46,E:78,C:68},
    values:{autonomy:56,innovative:64,socialImpact:78,growth:66}, future:5 },
  { id: 'ade', name: 'Administración y Dirección de Empresas (ADE)', area: 'Economía y Administración de Empresas', description: 'Gestión integral de empresas: estrategia, finanzas, marketing y recursos humanos.',
    mbti:{EI:58,SN:62,TF:65,JP:72}, riasec:{R:20,I:23,A:5,S:40,E:100,C:72},
    values:{autonomy:83,innovative:78,socialImpact:89,growth:44}, future:12 },
  { id: 'analisis_datos_empresa', name: 'Análisis de Datos en la Empresa', area: 'Economía y Administración de Empresas', description: 'Análisis de grandes volúmenes de datos para la toma de decisiones empresariales.',
    mbti:{EI:32,SN:52,TF:82,JP:68}, riasec:{R:4,I:74,A:16,S:14,E:57,C:80},
    values:{autonomy:44,innovative:61,socialImpact:33,growth:78}, future:30 },
  { id: 'analisis_negocios', name: 'Análisis de Negocios', area: 'Economía y Administración de Empresas', description: 'Evaluación de procesos empresariales y diseño de soluciones para mejorar la eficiencia.',
    mbti:{EI:42,SN:58,TF:75,JP:72}, riasec:{R:6,I:74,A:10,S:30,E:63,C:84},
    values:{autonomy:72,innovative:72,socialImpact:83,growth:55}, future:19 },
  { id: 'cc_empresariales', name: 'Ciencias Empresariales', area: 'Economía y Administración de Empresas', description: 'Fundamentos de gestión empresarial con enfoque en pequeñas y medianas empresas.',
    mbti:{EI:58,SN:62,TF:62,JP:70}, riasec:{R:20,I:23,A:5,S:40,E:100,C:72},
    values:{autonomy:83,innovative:78,socialImpact:89,growth:44}, future:12 },
  { id: 'direccion_hotelera', name: 'Dirección Hotelera', area: 'Economía y Administración de Empresas', description: 'Gestión de hoteles y establecimientos turísticos: operaciones, calidad y experiencia de cliente.',
    mbti:{EI:62,SN:68,TF:52,JP:72}, riasec:{R:28,I:2,A:7,S:55,E:87,C:70},
    values:{autonomy:83,innovative:75,socialImpact:100,growth:61}, future:12 },
  { id: 'economia', name: 'Economía', area: 'Economía y Administración de Empresas', description: 'Análisis de mercados, políticas económicas, macroeconomía y econometría.',
    mbti:{EI:38,SN:52,TF:78,JP:68}, riasec:{R:6,I:100,A:24,S:23,E:49,C:59},
    values:{autonomy:72,innovative:70,socialImpact:22,growth:50}, future:14 },
  { id: 'finanzas_contabilidad', name: 'Finanzas y Contabilidad', area: 'Economía y Administración de Empresas', description: 'Gestión financiera, contabilidad, auditoría y análisis de inversiones.',
    mbti:{EI:38,SN:68,TF:82,JP:78}, riasec:{R:2,I:43,A:1,S:19,E:48,C:100},
    values:{autonomy:67,innovative:72,socialImpact:56,growth:56}, future:-3 },
  { id: 'gastronomia', name: 'Gastronomía', area: 'Economía y Administración de Empresas', description: 'Cocina creativa, gestión de restaurantes y cultura gastronómica.',
    mbti:{EI:52,SN:60,TF:48,JP:55}, riasec:{R:64,I:11,A:29,S:32,E:69,C:56},
    values:{autonomy:83,innovative:75,socialImpact:61,growth:45}, future:15 },
  { id: 'gestion_hotelera', name: 'Gestión Hotelera', area: 'Economía y Administración de Empresas', description: 'Operaciones hoteleras, revenue management y hospitalidad internacional.',
    mbti:{EI:62,SN:65,TF:50,JP:70}, riasec:{R:28,I:2,A:7,S:55,E:87,C:70},
    values:{autonomy:83,innovative:75,socialImpact:100,growth:61}, future:19 },
  { id: 'gestion_logistica', name: 'Gestión Logística', area: 'Economía y Administración de Empresas', description: 'Cadena de suministro, transporte, almacenamiento y optimización logística.',
    mbti:{EI:42,SN:65,TF:72,JP:72}, riasec:{R:22,I:47,A:2,S:22,E:67,C:74},
    values:{autonomy:78,innovative:75,socialImpact:67,growth:55}, future:17 },
  { id: 'gestion_adm_publica', name: 'Gestión y Administración Pública', area: 'Economía y Administración de Empresas', description: 'Gestión de organismos públicos, políticas gubernamentales y administración del Estado.',
    mbti:{EI:48,SN:60,TF:58,JP:72}, riasec:{R:7,I:19,A:2,S:46,E:91,C:88},
    values:{autonomy:78,innovative:70,socialImpact:89,growth:50}, future:6 },
  { id: 'business_intelligence', name: 'Inteligencia de Negocios / Business Intelligence', area: 'Economía y Administración de Empresas', description: 'Análisis de datos corporativos y cuadros de mando para la toma de decisiones estratégicas.',
    mbti:{EI:32,SN:52,TF:82,JP:68}, riasec:{R:4,I:74,A:16,S:14,E:57,C:80},
    values:{autonomy:44,innovative:61,socialImpact:33,growth:78}, future:30 },
  { id: 'marketing_grado', name: 'Marketing', area: 'Economía y Administración de Empresas', description: 'Estrategia de marca, campañas digitales y comportamiento del consumidor.',
    mbti:{EI:65,SN:38,TF:40,JP:45}, riasec:{R:0,I:32,A:24,S:30,E:100,C:62},
    values:{autonomy:78,innovative:80,socialImpact:78,growth:61}, future:23 },
  { id: 'marketing_inv_mercados', name: 'Marketing e Investigación de Mercados', area: 'Economía y Administración de Empresas', description: 'Investigación de mercados, análisis del consumidor y estrategia comercial basada en datos.',
    mbti:{EI:48,SN:45,TF:58,JP:58}, riasec:{R:1,I:60,A:26,S:25,E:75,C:60},
    values:{autonomy:50,innovative:56,socialImpact:39,growth:67}, future:29 },
  { id: 'negocios_int', name: 'Negocios Internacionales', area: 'Economía y Administración de Empresas', description: 'Gestión de empresas en mercados globales, comercio exterior y estrategia internacional.',
    mbti:{EI:58,SN:52,TF:62,JP:65}, riasec:{R:20,I:23,A:5,S:40,E:100,C:72},
    values:{autonomy:83,innovative:78,socialImpact:89,growth:44}, future:17 },
  { id: 'turismo', name: 'Turismo', area: 'Economía y Administración de Empresas', description: 'Gestión de destinos turísticos, empresas de viajes y turismo sostenible.',
    mbti:{EI:68,SN:60,TF:42,JP:60}, riasec:{R:2,I:8,A:15,S:55,E:80,C:80},
    values:{autonomy:39,innovative:39,socialImpact:61,growth:50}, future:13 },
  { id: 'ciberseguridad', name: 'Ciberseguridad', area: 'Ingeniería', description: 'Protección de sistemas informáticos, redes y datos frente a ciberamenazas.',
    mbti:{EI:28,SN:45,TF:82,JP:68}, riasec:{R:43,I:73,A:6,S:18,E:31,C:85},
    values:{autonomy:72,innovative:66,socialImpact:56,growth:55}, future:31 },
  { id: 'ciencia_datos', name: 'Ciencia de Datos', area: 'Ingeniería', description: 'Análisis avanzado de datos, machine learning e inteligencia artificial aplicada.',
    mbti:{EI:25,SN:42,TF:85,JP:62}, riasec:{R:19,I:100,A:27,S:11,E:12,C:73},
    values:{autonomy:50,innovative:58,socialImpact:33,growth:45}, future:63 },
  { id: 'videojuegos', name: 'Diseño y Desarrollo de Videojuegos', area: 'Ingeniería', description: 'Programación, diseño de mecánicas y producción de videojuegos para múltiples plataformas.',
    mbti:{EI:35,SN:35,TF:65,JP:48}, riasec:{R:45,I:30,A:100,S:20,E:27,C:36},
    values:{autonomy:50,innovative:58,socialImpact:33,growth:45}, future:30 },
  { id: 'ing_aeroespacial', name: 'Ingeniería Aeroespacial', area: 'Ingeniería', description: 'Diseño y desarrollo de aeronaves, vehículos espaciales y sistemas de propulsión.',
    mbti:{EI:30,SN:55,TF:85,JP:70}, riasec:{R:78,I:84,A:22,S:4,E:25,C:57},
    values:{autonomy:72,innovative:70,socialImpact:56,growth:45}, future:20 },
  { id: 'ing_agraria', name: 'Ingeniería Agraria', area: 'Ingeniería', description: 'Mecanización agrícola, gestión de cultivos y tecnología aplicada al sector agroalimentario.',
    mbti:{EI:38,SN:62,TF:70,JP:68}, riasec:{R:94,I:88,A:20,S:12,E:22,C:46},
    values:{autonomy:78,innovative:75,socialImpact:39,growth:61}, future:17 },
  { id: 'ing_agroalimentaria', name: 'Ingeniería Agroalimentaria', area: 'Ingeniería', description: 'Procesado, conservación y calidad de alimentos en la industria agroalimentaria.',
    mbti:{EI:35,SN:62,TF:72,JP:68}, riasec:{R:68,I:78,A:24,S:19,E:26,C:49},
    values:{autonomy:56,innovative:62,socialImpact:56,growth:56}, future:12 },
  { id: 'ing_biomedica', name: 'Ingeniería Biomédica', area: 'Ingeniería', description: 'Desarrollo de dispositivos médicos, prótesis e instrumentación biomédica.',
    mbti:{EI:30,SN:52,TF:80,JP:68}, riasec:{R:74,I:96,A:18,S:24,E:14,C:58},
    values:{autonomy:72,innovative:72,socialImpact:50,growth:44}, future:9 },
  { id: 'ing_civil', name: 'Ingeniería Civil', area: 'Ingeniería', description: 'Diseño y construcción de infraestructuras: carreteras, puentes, presas y saneamiento.',
    mbti:{EI:40,SN:68,TF:78,JP:72}, riasec:{R:90,I:69,A:20,S:12,E:28,C:60},
    values:{autonomy:83,innovative:78,socialImpact:50,growth:50}, future:13 },
  { id: 'ing_electronica_ind', name: 'Ingeniería Electrónica Industrial y Automática', area: 'Ingeniería', description: 'Automatización industrial, robótica y sistemas de control electrónico.',
    mbti:{EI:32,SN:58,TF:82,JP:68}, riasec:{R:84,I:74,A:19,S:12,E:24,C:57},
    values:{autonomy:72,innovative:75,socialImpact:56,growth:56}, future:15 },
  { id: 'ing_electrica', name: 'Ingeniería Eléctrica', area: 'Ingeniería', description: 'Generación, distribución y gestión de energía eléctrica en sistemas industriales y civiles.',
    mbti:{EI:35,SN:62,TF:82,JP:72}, riasec:{R:84,I:74,A:19,S:12,E:24,C:57},
    values:{autonomy:72,innovative:75,socialImpact:56,growth:56}, future:11 },
  { id: 'ing_forestal', name: 'Ingeniería Forestal', area: 'Ingeniería', description: 'Gestión forestal sostenible, conservación de bosques y prevención de incendios.',
    mbti:{EI:38,SN:65,TF:65,JP:65}, riasec:{R:72,I:58,A:4,S:22,E:46,C:56},
    values:{autonomy:78,innovative:64,socialImpact:50,growth:56}, future:17 },
  { id: 'ing_fisica', name: 'Ingeniería Física', area: 'Ingeniería', description: 'Aplicación de la física avanzada a problemas de ingeniería en energía, óptica y materiales.',
    mbti:{EI:28,SN:48,TF:85,JP:65}, riasec:{R:66,I:100,A:29,S:19,E:13,C:63},
    values:{autonomy:83,innovative:83,socialImpact:28,growth:44}, future:21 },
  { id: 'ing_geomatica', name: 'Ingeniería Geomática y Topografía', area: 'Ingeniería', description: 'Cartografía digital, sistemas de información geográfica y teledetección.',
    mbti:{EI:38,SN:65,TF:72,JP:70}, riasec:{R:71,I:62,A:19,S:10,E:15,C:72},
    values:{autonomy:67,innovative:58,socialImpact:72,growth:56}, future:16 },
  { id: 'ing_informatica', name: 'Ingeniería Informática', area: 'Ingeniería', description: 'Desarrollo de software, arquitectura de sistemas e infraestructura tecnológica.',
    mbti:{EI:30,SN:45,TF:80,JP:65}, riasec:{R:38,I:90,A:16,S:15,E:20,C:82},
    values:{autonomy:67,innovative:72,socialImpact:61,growth:56}, future:33 },
  { id: 'ing_matematica', name: 'Ingeniería Matemática', area: 'Ingeniería', description: 'Modelado matemático, optimización y análisis cuantitativo aplicado a ingeniería.',
    mbti:{EI:28,SN:38,TF:88,JP:62}, riasec:{R:26,I:94,A:28,S:16,E:19,C:73},
    values:{autonomy:72,innovative:78,socialImpact:17,growth:55}, future:37 },
  { id: 'ing_mecatronica', name: 'Ingeniería Mecatrónica', area: 'Ingeniería', description: 'Integración de mecánica, electrónica e informática en sistemas robóticos e industriales.',
    mbti:{EI:32,SN:55,TF:82,JP:68}, riasec:{R:88,I:73,A:15,S:6,E:14,C:61},
    values:{autonomy:78,innovative:75,socialImpact:39,growth:55}, future:23 },
  { id: 'ing_mecanica', name: 'Ingeniería Mecánica', area: 'Ingeniería', description: 'Diseño de máquinas, sistemas de producción y análisis de materiales y fluidos.',
    mbti:{EI:35,SN:62,TF:80,JP:70}, riasec:{R:90,I:69,A:17,S:4,E:16,C:64},
    values:{autonomy:72,innovative:72,socialImpact:61,growth:44}, future:9 },
  { id: 'ing_minera', name: 'Ingeniería Minera', area: 'Ingeniería', description: 'Extracción de recursos minerales, geotecnia y seguridad en minería.',
    mbti:{EI:38,SN:68,TF:78,JP:70}, riasec:{R:85,I:76,A:9,S:14,E:29,C:61},
    values:{autonomy:72,innovative:70,socialImpact:44,growth:50}, future:1 },
  { id: 'ing_naval', name: 'Ingeniería Naval', area: 'Ingeniería', description: 'Diseño y construcción de barcos, plataformas offshore y sistemas de propulsión marina.',
    mbti:{EI:35,SN:62,TF:78,JP:70}, riasec:{R:79,I:78,A:27,S:5,E:38,C:55},
    values:{autonomy:83,innovative:78,socialImpact:50,growth:50}, future:16 },
  { id: 'ing_nautica', name: 'Ingeniería Náutica y Transporte Marítimo', area: 'Ingeniería', description: 'Operación y gestión de buques mercantes y sistemas de transporte marítimo.',
    mbti:{EI:38,SN:65,TF:72,JP:70}, riasec:{R:91,I:42,A:0,S:13,E:46,C:65},
    values:{autonomy:83,innovative:78,socialImpact:50,growth:50}, future:16 },
  { id: 'ing_quimica', name: 'Ingeniería Química', area: 'Ingeniería', description: 'Diseño de procesos industriales de transformación de materias primas y síntesis química.',
    mbti:{EI:32,SN:58,TF:82,JP:70}, riasec:{R:88,I:79,A:13,S:0,E:14,C:59},
    values:{autonomy:72,innovative:72,socialImpact:50,growth:44}, future:5 },
  { id: 'ing_robotica', name: 'Ingeniería Robótica', area: 'Ingeniería', description: 'Diseño, programación y control de sistemas robóticos autónomos e inteligentes.',
    mbti:{EI:28,SN:50,TF:82,JP:65}, riasec:{R:86,I:77,A:13,S:8,E:13,C:58},
    values:{autonomy:78,innovative:75,socialImpact:39,growth:55}, future:60 },
  { id: 'ing_automocion', name: 'Ingeniería de Automoción', area: 'Ingeniería', description: 'Diseño y desarrollo de vehículos, motores y sistemas de propulsión avanzados.',
    mbti:{EI:35,SN:60,TF:80,JP:70}, riasec:{R:86,I:78,A:26,S:6,E:19,C:51},
    values:{autonomy:72,innovative:80,socialImpact:28,growth:61}, future:17 },
  { id: 'ing_disenyo_ind', name: 'Ingeniería de Diseño Industrial', area: 'Ingeniería', description: 'Desarrollo de productos industriales desde el concepto hasta la fabricación.',
    mbti:{EI:38,SN:42,TF:65,JP:52}, riasec:{R:65,I:50,A:58,S:12,E:28,C:56},
    values:{autonomy:72,innovative:75,socialImpact:50,growth:67}, future:16 },
  { id: 'ing_energias_renovables', name: 'Ingeniería de Energías Renovables', area: 'Ingeniería', description: 'Diseño e implantación de sistemas de energía solar, eólica, hidráulica y geotérmica.',
    mbti:{EI:35,SN:58,TF:78,JP:68}, riasec:{R:90,I:69,A:18,S:8,E:22,C:62},
    values:{autonomy:72,innovative:72,socialImpact:61,growth:44}, future:32 },
  { id: 'ing_org_industrial', name: 'Ingeniería de Organización Industrial', area: 'Ingeniería', description: 'Optimización de procesos productivos, gestión de operaciones y lean manufacturing.',
    mbti:{EI:42,SN:65,TF:78,JP:72}, riasec:{R:66,I:66,A:10,S:6,E:38,C:72},
    values:{autonomy:78,innovative:75,socialImpact:44,growth:44}, future:15 },
  { id: 'ing_sonido_imagen', name: 'Ingeniería de Sonido e Imagen', area: 'Ingeniería', description: 'Diseño de sistemas audiovisuales, producción de sonido e ingeniería de broadcast.',
    mbti:{EI:40,SN:50,TF:68,JP:58}, riasec:{R:69,I:28,A:58,S:12,E:19,C:54},
    values:{autonomy:83,innovative:78,socialImpact:78,growth:61}, future:6 },
  { id: 'ing_textil', name: 'Ingeniería de Tecnología Textil', area: 'Ingeniería', description: 'Diseño de procesos textiles, materiales técnicos y gestión de la cadena de producción.',
    mbti:{EI:38,SN:62,TF:72,JP:68}, riasec:{R:66,I:66,A:10,S:6,E:38,C:72},
    values:{autonomy:78,innovative:75,socialImpact:44,growth:44}, future:8 },
  { id: 'ing_tecnologias_ind', name: 'Ingeniería de Tecnologías Industriales', area: 'Ingeniería', description: 'Diseño y gestión de sistemas de producción industrial multidisciplinar.',
    mbti:{EI:35,SN:62,TF:80,JP:70}, riasec:{R:66,I:66,A:10,S:6,E:38,C:72},
    values:{autonomy:78,innovative:75,socialImpact:44,growth:44}, future:15 },
  { id: 'ing_telecomunicacion', name: 'Ingeniería de Telecomunicación', area: 'Ingeniería', description: 'Sistemas de comunicación, redes, señales y tecnologías de la información.',
    mbti:{EI:30,SN:48,TF:80,JP:65}, riasec:{R:84,I:74,A:19,S:12,E:24,C:57},
    values:{autonomy:72,innovative:75,socialImpact:56,growth:56}, future:19 },
  { id: 'ing_energia', name: 'Ingeniería de la Energía', area: 'Ingeniería', description: 'Generación, distribución y eficiencia energética en sistemas convencionales y renovables.',
    mbti:{EI:35,SN:58,TF:78,JP:68}, riasec:{R:70,I:62,A:17,S:21,E:35,C:57},
    values:{autonomy:72,innovative:72,socialImpact:61,growth:44}, future:18 },
  { id: 'ia', name: 'Inteligencia Artificial', area: 'Ingeniería', description: 'Diseño y desarrollo de modelos de aprendizaje automático, visión artificial y NLP.',
    mbti:{EI:28,SN:42,TF:85,JP:62}, riasec:{R:19,I:100,A:27,S:11,E:12,C:73},
    values:{autonomy:50,innovative:58,socialImpact:33,growth:45}, future:56 },
  { id: 'prod_contenidos_digitales', name: 'Producción y Gestión de Contenidos Digitales', area: 'Ingeniería', description: 'Creación, gestión y distribución de contenidos digitales para plataformas y marcas.',
    mbti:{EI:58,SN:38,TF:48,JP:48}, riasec:{R:19,I:21,A:86,S:35,E:80,C:43},
    values:{autonomy:78,innovative:80,socialImpact:78,growth:61}, future:24 },
  { id: 'tecnologia_alimentos', name: 'Tecnología de los Alimentos', area: 'Ingeniería', description: 'Innovación en procesos de producción, conservación y calidad alimentaria industrial.',
    mbti:{EI:35,SN:62,TF:72,JP:68}, riasec:{R:68,I:78,A:24,S:19,E:26,C:49},
    values:{autonomy:56,innovative:62,socialImpact:56,growth:56}, future:16 },
];

const MBTI_INFO = {
  INTJ: { label: 'El Arquitecto',    tagline: 'Estratégico, independiente y de alto rendimiento.' },
  INTP: { label: 'El Lógico',        tagline: 'Analítico, curioso y apasionado por las ideas.' },
  ENTJ: { label: 'El Comandante',    tagline: 'Líder nato, decidido y orientado a los objetivos.' },
  ENTP: { label: 'El Innovador',     tagline: 'Creativo, debatidor y amante de los retos intelectuales.' },
  INFJ: { label: 'El Consejero',     tagline: 'Visionario, empático y profundamente comprometido.' },
  INFP: { label: 'El Mediador',      tagline: 'Idealista, creativo y guiado por sus valores.' },
  ENFJ: { label: 'El Protagonista',  tagline: 'Carismático, inspirador y orientado a las personas.' },
  ENFP: { label: 'El Activista',     tagline: 'Entusiasta, imaginativo y lleno de energía.' },
  ISTJ: { label: 'El Inspector',     tagline: 'Fiable, metódico y comprometido con sus deberes.' },
  ISFJ: { label: 'El Defensor',      tagline: 'Protector, detallista y dedicado a los demás.' },
  ESTJ: { label: 'El Ejecutivo',     tagline: 'Organizado, decidido y excelente gestor.' },
  ESFJ: { label: 'El Cónsul',        tagline: 'Sociable, atento y comprometido con la comunidad.' },
  ISTP: { label: 'El Virtuoso',      tagline: 'Práctico, observador y hábil con las manos.' },
  ISFP: { label: 'El Aventurero',    tagline: 'Artístico, espontáneo y en sintonía con el presente.' },
  ESTP: { label: 'El Emprendedor',   tagline: 'Audaz, perceptivo y experto en la acción.' },
  ESFP: { label: 'El Animador',      tagline: 'Espontáneo, entusiasta y con gran sentido de la vida.' },
};

const MAX_ATTEMPTS   = 5;
const LOCKOUT_MINS   = 15;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getToken(req) {
  const auth = req.headers.get('Authorization') || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

function getIP(req) {
  return req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || 'unknown';
}

async function verifyRole(req, env, role) {
  const token = getToken(req);
  if (!token) return null;
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload || payload.role !== role) return null;
  return payload;
}

async function checkRateLimit(env, ip, key) {
  const cutoff = new Date(Date.now() - LOCKOUT_MINS * 60 * 1000).toISOString();
  const { results } = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM login_attempts WHERE (ip = ? OR email = ?) AND attempted_at > ?`
  ).bind(ip, key, cutoff).all();
  return (results[0]?.count ?? 0) >= MAX_ATTEMPTS;
}

async function recordAttempt(env, ip, key) {
  await env.DB.prepare('INSERT INTO login_attempts (id, ip, email) VALUES (?, ?, ?)')
    .bind(generateId(), ip, key).run();
}

async function clearAttempts(env, ip, key) {
  await env.DB.prepare('DELETE FROM login_attempts WHERE ip = ? OR email = ?')
    .bind(ip, key).run();
}

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json', ...cors() },
  });
}

function err(msg, status = 400) { return json({ error: msg }, status); }

// ── Main handler ──────────────────────────────────────────────────────────────

export default {
  async fetch(req, env) {
    const { pathname: path } = new URL(req.url);
    const method = req.method;

    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: cors() });

    try {

      // ── SETUP ───────────────────────────────────────────────────────────────

      if (path === '/api/setup/status' && method === 'GET') {
        const existing = await env.DB.prepare('SELECT id FROM admin LIMIT 1').first();
        return json({ configured: !!existing });
      }

      if (path === '/api/setup' && method === 'POST') {
        const existing = await env.DB.prepare('SELECT id FROM admin LIMIT 1').first();
        if (existing) return err('Setup ya completado', 403);
        const { password } = await req.json();
        if (!password || password.length < 8) return err('Mínimo 8 caracteres');
        const { hash, salt } = await hashPassword(password);
        await env.DB.prepare('INSERT INTO admin (id, password_hash, salt) VALUES (1, ?, ?)')
          .bind(hash, salt).run();
        return json({ ok: true });
      }

      // ── ADMIN AUTH ──────────────────────────────────────────────────────────

      if (path === '/api/admin/login' && method === 'POST') {
        const ip = getIP(req);
        const { password } = await req.json();
        if (!password) return err('Contraseña requerida');
        if (await checkRateLimit(env, ip, 'admin')) return err(`Demasiados intentos. Espera ${LOCKOUT_MINS} min.`, 429);
        const admin = await env.DB.prepare('SELECT password_hash, salt FROM admin LIMIT 1').first();
        if (!admin) return err('Setup no completado', 403);
        const valid = await verifyPassword(password, admin.password_hash, admin.salt);
        if (!valid) { await recordAttempt(env, ip, 'admin'); return err('Credenciales incorrectas', 401); }
        await clearAttempts(env, ip, 'admin');
        const token = await signJWT(
          { role: 'admin', exp: Math.floor(Date.now() / 1000) + 8 * 3600 },
          env.JWT_SECRET
        );
        return json({ ok: true, token });
      }

      // ── PUBLIC STATS ─────────────────────────────────────────────────────────

      if (path === '/api/stats' && method === 'GET') {
        const { results } = await env.DB.prepare(
          `SELECT COUNT(*) as total FROM users WHERE active = 1`
        ).all();
        return json({ students: results[0]?.total ?? 0 });
      }

      // ── LICENSE REQUESTS ────────────────────────────────────────────────────

      if (path === '/api/licenses/request' && method === 'POST') {
        const { centerName, centerType, contactName, email, phone, students, message } = await req.json();
        if (!centerName || !contactName || !email) return err('Faltan campos obligatorios');
        const id = generateId('req_');
        await env.DB.prepare(
          `INSERT INTO centers (id, name, type, contact_name, email, phone, students, message)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(id, centerName, centerType, contactName, email, phone || null, students || null, message || null).run();
        return json({ ok: true });
      }

      // ── ADMIN: REQUESTS ─────────────────────────────────────────────────────

      if (path === '/api/admin/requests' && method === 'GET') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { results } = await env.DB.prepare(
          `SELECT c.*, l.code as license_code, l.max_users, l.id as license_id, l.revoked
           FROM centers c LEFT JOIN licenses l ON l.center_id = c.id
           ORDER BY c.created_at DESC`
        ).all();
        return json({ requests: results });
      }

      if (path === '/api/admin/requests/approve' && method === 'POST') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { centerId, maxUsers } = await req.json();
        if (!centerId || !maxUsers) return err('Faltan campos');

        const center = await env.DB.prepare(
          "SELECT * FROM centers WHERE id = ? AND status = 'pending'"
        ).bind(centerId).first();
        if (!center) return err('Solicitud no encontrada', 404);

        const code = generateLicenseCode();
        const licenseId = generateId('lic_');
        const tempPassword = generateSecurePassword();
        const { hash, salt } = await hashPassword(tempPassword);

        await env.DB.batch([
          env.DB.prepare(
            "UPDATE centers SET status = 'approved', password_hash = ?, salt = ?, must_change_password = 1 WHERE id = ?"
          ).bind(hash, salt, centerId),
          env.DB.prepare(
            'INSERT INTO licenses (id, center_id, code, max_users) VALUES (?, ?, ?, ?)'
          ).bind(licenseId, centerId, code, maxUsers),
        ]);

        // Send email — non-blocking, errors logged but don't fail the request
        if (env.RESEND_API_KEY) {
          await sendLicenseApprovedEmail(env.RESEND_API_KEY, {
            to: center.email,
            centerName: center.name,
            licenseCode: code,
            password: tempPassword,
          });
        }

        return json({ ok: true, licenseCode: code, licenseId });
      }

      if (path === '/api/admin/requests/reject' && method === 'POST') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { centerId } = await req.json();
        await env.DB.prepare("UPDATE centers SET status = 'rejected' WHERE id = ?").bind(centerId).run();
        return json({ ok: true });
      }

      // ── ADMIN: LICENSES ─────────────────────────────────────────────────────

      if (path === '/api/admin/licenses' && method === 'GET') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { results } = await env.DB.prepare(
          `SELECT l.*, c.name as center_name, c.email as center_email,
           (SELECT COUNT(*) FROM users u WHERE u.license_id = l.id AND u.active = 1) as used_users
           FROM licenses l JOIN centers c ON c.id = l.center_id ORDER BY l.created_at DESC`
        ).all();
        return json({ licenses: results });
      }

      if (path === '/api/admin/licenses/revoke' && method === 'PATCH') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { licenseId, revoked } = await req.json();
        await env.DB.prepare('UPDATE licenses SET revoked = ? WHERE id = ?')
          .bind(revoked ? 1 : 0, licenseId).run();
        return json({ ok: true });
      }

      if (path === '/api/admin/licenses/delete' && method === 'DELETE') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { licenseId } = await req.json();
        if (!licenseId) return err('Falta licenseId');

        // Get center_id before deleting
        const license = await env.DB.prepare('SELECT center_id FROM licenses WHERE id = ?')
          .bind(licenseId).first();
        if (!license) return err('Licencia no encontrada', 404);

        // Delete in order: users → sessions → license → center
        await env.DB.batch([
          env.DB.prepare('DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE license_id = ?)').bind(licenseId),
          env.DB.prepare('DELETE FROM users WHERE license_id = ?').bind(licenseId),
          env.DB.prepare('DELETE FROM licenses WHERE id = ?').bind(licenseId),
          env.DB.prepare('DELETE FROM centers WHERE id = ?').bind(license.center_id),
        ]);

        return json({ ok: true });
      }

      if (path === '/api/admin/licenses/max-users' && method === 'PATCH') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { licenseId, maxUsers } = await req.json();
        if (!licenseId || !maxUsers || maxUsers < 1) return err('Datos inválidos');
        await env.DB.prepare('UPDATE licenses SET max_users = ? WHERE id = ?')
          .bind(maxUsers, licenseId).run();
        return json({ ok: true });
      }

      // ── ADMIN: USERS ────────────────────────────────────────────────────────

      if (path === '/api/admin/users' && method === 'GET') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { results } = await env.DB.prepare(
          `SELECT u.id, u.name, u.email, u.created_at, u.active,
           l.code as license_code, c.name as center_name
           FROM users u
           JOIN licenses l ON l.id = u.license_id
           JOIN centers c ON c.id = l.center_id
           ORDER BY u.created_at DESC`
        ).all();
        return json({ users: results });
      }

      if (path === '/api/admin/users' && method === 'POST') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { name, email, licenseId } = await req.json();
        if (!name || !email || !licenseId) return err('Faltan campos');
        const result = await createUserForLicense(env, { name, email, licenseId });
        if (result.error) return err(result.error, result.status || 400);
        return json({ ok: true, ...result });
      }

      // ── CENTER AUTH ─────────────────────────────────────────────────────────

      if (path === '/api/center/login' && method === 'POST') {
        const ip = getIP(req);
        const { email, password } = await req.json();
        if (!email || !password) return err('Faltan campos');

        if (await checkRateLimit(env, ip, email)) {
          return err(`Demasiados intentos. Espera ${LOCKOUT_MINS} min.`, 429);
        }

        const center = await env.DB.prepare(
          `SELECT c.*, l.id as license_id, l.code as license_code, l.revoked
           FROM centers c LEFT JOIN licenses l ON l.center_id = c.id
           WHERE c.email = ? AND c.status = 'approved'`
        ).bind(email).first();

        if (!center || !center.password_hash) {
          await recordAttempt(env, ip, email);
          return err('Credenciales incorrectas', 401);
        }

        if (center.revoked === 1) return err('Tu licencia ha sido revocada. Contacta con MindPath.', 403);

        const valid = await verifyPassword(password, center.password_hash, center.salt);
        if (!valid) {
          await recordAttempt(env, ip, email);
          return err('Credenciales incorrectas', 401);
        }

        await clearAttempts(env, ip, email);
        const mustChange = center.must_change_password === 1;
        const token = await signJWT(
          {
            role: 'center',
            centerId: center.id,
            licenseId: center.license_id,
            centerName: center.name,
            email: center.email,
            mustChangePassword: mustChange,
            exp: Math.floor(Date.now() / 1000) + 8 * 3600,
          },
          env.JWT_SECRET
        );
        return json({
          ok: true, token,
          centerName: center.name,
          licenseCode: center.license_code,
          mustChangePassword: mustChange,
        });
      }

      if (path === '/api/center/change-password' && method === 'POST') {
        const ip = getIP(req);
        const { email, currentPassword, newPassword } = await req.json();
        if (!email || !currentPassword || !newPassword) return err('Faltan campos');
        if (newPassword.length < 8) return err('La contraseña debe tener al menos 8 caracteres');

        if (await checkRateLimit(env, ip, email)) {
          return err(`Demasiados intentos. Espera ${LOCKOUT_MINS} min.`, 429);
        }

        const center = await env.DB.prepare(
          "SELECT * FROM centers WHERE email = ? AND status = 'approved'"
        ).bind(email).first();

        if (!center || !center.password_hash) {
          await recordAttempt(env, ip, email);
          return err('Credenciales incorrectas', 401);
        }

        const valid = await verifyPassword(currentPassword, center.password_hash, center.salt);
        if (!valid) {
          await recordAttempt(env, ip, email);
          return err('La contraseña actual es incorrecta', 401);
        }

        const { hash, salt } = await hashPassword(newPassword);
        await env.DB.prepare(
          'UPDATE centers SET password_hash = ?, salt = ?, must_change_password = 0 WHERE id = ?'
        ).bind(hash, salt, center.id).run();

        await clearAttempts(env, ip, email);

        // Issue new token without mustChangePassword
        const license = await env.DB.prepare('SELECT id, code FROM licenses WHERE center_id = ?')
          .bind(center.id).first();
        const token = await signJWT(
          {
            role: 'center', centerId: center.id, licenseId: license?.id,
            centerName: center.name, email: center.email, mustChangePassword: false,
            exp: Math.floor(Date.now() / 1000) + 8 * 3600,
          },
          env.JWT_SECRET
        );
        return json({ ok: true, token, centerName: center.name });
      }

      // ── CENTER: INFO ────────────────────────────────────────────────────────

      if (path === '/api/center/info' && method === 'GET') {
        const center = await verifyRole(req, env, 'center');
        if (!center) return err('No autorizado', 401);
        const license = await env.DB.prepare(
          `SELECT l.*, c.name as center_name, c.email as center_email,
           (SELECT COUNT(*) FROM users u WHERE u.license_id = l.id AND u.active = 1) as used_users
           FROM licenses l JOIN centers c ON c.id = l.center_id WHERE l.id = ?`
        ).bind(center.licenseId).first();
        if (!license) return err('Licencia no encontrada', 404);
        return json({ license });
      }

      // ── CENTER: USERS ───────────────────────────────────────────────────────

      if (path === '/api/center/users' && method === 'GET') {
        const center = await verifyRole(req, env, 'center');
        if (!center) return err('No autorizado', 401);
        const { results } = await env.DB.prepare(
          'SELECT id, name, email, created_at, active FROM users WHERE license_id = ? ORDER BY created_at DESC'
        ).bind(center.licenseId).all();
        return json({ users: results });
      }

      if (path === '/api/center/users' && method === 'POST') {
        const center = await verifyRole(req, env, 'center');
        if (!center) return err('No autorizado', 401);
        const { name, email } = await req.json();
        if (!name || !email) return err('Faltan campos');
        const result = await createUserForLicense(env, { name, email, licenseId: center.licenseId });
        if (result.error) return err(result.error, result.status || 400);
        return json({ ok: true, ...result });
      }

      if (path === '/api/center/users/deactivate' && method === 'POST') {
        const center = await verifyRole(req, env, 'center');
        if (!center) return err('No autorizado', 401);
        const { userId } = await req.json();
        const user = await env.DB.prepare('SELECT id FROM users WHERE id = ? AND license_id = ?')
          .bind(userId, center.licenseId).first();
        if (!user) return err('Usuario no encontrado', 404);
        await env.DB.prepare('UPDATE users SET active = 0 WHERE id = ?').bind(userId).run();
        return json({ ok: true });
      }

      if (path === '/api/center/users/reactivate' && method === 'POST') {
        const center = await verifyRole(req, env, 'center');
        if (!center) return err('No autorizado', 401);
        const { userId } = await req.json();
        const license = await env.DB.prepare('SELECT max_users FROM licenses WHERE id = ?')
          .bind(center.licenseId).first();
        const { results: active } = await env.DB.prepare(
          'SELECT id FROM users WHERE license_id = ? AND active = 1'
        ).bind(center.licenseId).all();
        if (active.length >= license.max_users) return err('Licencia sin plazas disponibles');
        const user = await env.DB.prepare('SELECT id FROM users WHERE id = ? AND license_id = ?')
          .bind(userId, center.licenseId).first();
        if (!user) return err('Usuario no encontrado', 404);
        await env.DB.prepare('UPDATE users SET active = 1 WHERE id = ?').bind(userId).run();
        return json({ ok: true });
      }

      // ── USER AUTH ───────────────────────────────────────────────────────────

      if (path === '/api/auth/register' && method === 'POST') {
        const ip = getIP(req);
        const { name, email, password, licenseCode } = await req.json();
        if (!name || !email || !password || !licenseCode) return err('Faltan campos');
        if (password.length < 8) return err('La contraseña debe tener al menos 8 caracteres');

        if (await checkRateLimit(env, ip, email)) return err(`Demasiados intentos. Espera ${LOCKOUT_MINS} min.`, 429);

        const license = await env.DB.prepare(
          'SELECT * FROM licenses WHERE code = ? AND revoked = 0'
        ).bind(licenseCode.toUpperCase()).first();
        if (!license) { await recordAttempt(env, ip, email); return err('Código de licencia no válido', 400); }

        const { results: activeUsers } = await env.DB.prepare(
          'SELECT id FROM users WHERE license_id = ? AND active = 1'
        ).bind(license.id).all();
        if (activeUsers.length >= license.max_users) return err('Esta licencia no tiene plazas disponibles', 400);

        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
        if (existing) return err('El email ya está registrado', 400);

        const { hash, salt } = await hashPassword(password);
        const userId = generateId('usr_');
        await env.DB.prepare(
          'INSERT INTO users (id, license_id, name, email, password_hash, salt, active) VALUES (?, ?, ?, ?, ?, ?, 1)'
        ).bind(userId, license.id, name, email, hash, salt).run();

        await clearAttempts(env, ip, email);
        const token = await signJWT(
          { role: 'user', userId, name, email, exp: Math.floor(Date.now() / 1000) + 24 * 3600 },
          env.JWT_SECRET
        );
        return json({ ok: true, token, name, email });
      }

      if (path === '/api/auth/login' && method === 'POST') {
        const ip = getIP(req);
        const { email, password } = await req.json();
        if (!email || !password) return err('Faltan campos');

        if (await checkRateLimit(env, ip, email)) return err(`Demasiados intentos. Espera ${LOCKOUT_MINS} min.`, 429);

        const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND active = 1').bind(email).first();
        if (!user) { await recordAttempt(env, ip, email); return err('Credenciales incorrectas', 401); }

        const license = await env.DB.prepare('SELECT revoked FROM licenses WHERE id = ?').bind(user.license_id).first();
        if (license?.revoked) return err('Tu licencia ha sido revocada. Contacta con tu centro.', 403);

        const valid = await verifyPassword(password, user.password_hash, user.salt);
        if (!valid) { await recordAttempt(env, ip, email); return err('Credenciales incorrectas', 401); }

        await clearAttempts(env, ip, email);
        const mustChange = user.must_change_password === 1;
        const token = await signJWT(
          { role: 'user', userId: user.id, name: user.name, email: user.email,
            mustChangePassword: mustChange, exp: Math.floor(Date.now() / 1000) + 24 * 3600 },
          env.JWT_SECRET
        );
        return json({ ok: true, token, name: user.name, email: user.email, mustChangePassword: mustChange });
      }

      if (path === '/api/auth/change-password' && method === 'POST') {
        const ip = getIP(req);
        const { email, currentPassword, newPassword } = await req.json();
        if (!email || !currentPassword || !newPassword) return err('Faltan campos');
        if (newPassword.length < 8) return err('Mínimo 8 caracteres');
        if (currentPassword === newPassword) return err('La nueva contraseña debe ser distinta');

        if (await checkRateLimit(env, ip, email)) return err(`Demasiados intentos. Espera ${LOCKOUT_MINS} min.`, 429);

        const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND active = 1').bind(email).first();
        if (!user) { await recordAttempt(env, ip, email); return err('Credenciales incorrectas', 401); }

        const valid = await verifyPassword(currentPassword, user.password_hash, user.salt);
        if (!valid) { await recordAttempt(env, ip, email); return err('La contraseña actual es incorrecta', 401); }

        const { hash, salt } = await hashPassword(newPassword);
        await env.DB.prepare('UPDATE users SET password_hash = ?, salt = ?, must_change_password = 0 WHERE id = ?')
          .bind(hash, salt, user.id).run();

        await clearAttempts(env, ip, email);
        const token = await signJWT(
          { role: 'user', userId: user.id, name: user.name, email: user.email,
            mustChangePassword: false, exp: Math.floor(Date.now() / 1000) + 24 * 3600 },
          env.JWT_SECRET
        );
        return json({ ok: true, token, name: user.name, email: user.email });
      }

      if (path === '/api/auth/me' && method === 'GET') {
        const payload = await verifyRole(req, env, 'user');
        if (!payload) return err('No autenticado', 401);
        return json({ name: payload.name, email: payload.email });
      }

      // ── TEST: MBTI + RIASEC + Skills + Values ────────────────────────────────

      if (path === '/api/test/mbti' && method === 'POST') {
        const payload = await verifyRole(req, env, 'user');
        if (!payload) return err('No autorizado', 401);

        const body = await req.json();
        const { answers, riasecScores, skillsScores, valuesProfile } = body;
        if (!Array.isArray(answers) || answers.length < 10) return err('Faltan respuestas');
        if (!env.GROQ_API_KEY) return err('Servicio de IA no configurado', 503);

        const qa = answers.map((a, i) =>
          `Pregunta ${i + 1}: ${a.question}\nRespuesta del alumno: ${a.answer}`
        ).join('\n\n');

        const hasPrecomputedRiasec = riasecScores &&
          ['R','I','A','S','E','C'].every(k => typeof riasecScores[k] === 'number');

        const hasValues = valuesProfile &&
          ['autonomy','innovative','socialImpact','growth'].every(k => typeof valuesProfile[k] === 'number');

        const structuredContext = hasPrecomputedRiasec
          ? `\nPerfil RIASEC del cuestionario estructurado: R=${riasecScores.R} I=${riasecScores.I} A=${riasecScores.A} S=${riasecScores.S} E=${riasecScores.E} C=${riasecScores.C}`
          : '';
        const skillsContext = skillsScores
          ? `\nHabilidades auto-evaluadas (0-100): lógica=${skillsScores.logic} verbal=${skillsScores.verbal} creatividad=${skillsScores.creative} digital=${skillsScores.digital} social=${skillsScores.social} planificación=${skillsScores.planning}`
          : '';

        const prompt = `Eres un experto en psicología vocacional. Analiza las siguientes respuestas de un estudiante para determinar su perfil MBTI y sus intereses vocacionales RIASEC.
${structuredContext}${skillsContext}

Respuestas del estudiante:
${qa}

INSTRUCCIONES DE PUNTUACIÓN:
Para MBTI usa la escala 0-100 con estos anclajes exactos:
• 0-15 = polo izquierdo muy marcado | 16-35 = polo izquierdo moderado | 36-64 = zona neutra, sin señal clara | 65-84 = polo derecho moderado | 85-100 = polo derecho muy marcado
EI: 0=introvertido puro → 100=extrovertido puro
SN: 0=intuitivo/abstracto puro → 100=sensorial/concreto puro
TF: 0=emocional/empático puro → 100=lógico/analítico puro
JP: 0=espontáneo/flexible puro → 100=planificador/estructurado puro

Para cada tipo RIASEC devuelve "score" (0-100) y "confidence" (0.0-1.0):
• confidence 0.0 = el alumno no menciona nada relacionado con este tipo en sus respuestas abiertas
• confidence 0.3 = mención vaga o indirecta
• confidence 0.6 = referencia clara pero puntual
• confidence 1.0 = menciones explícitas, repetidas y coherentes
IMPORTANTE: Si el alumno no proporciona evidencia de un tipo RIASEC en el texto, pon confidence=0.0. El cuestionario estructurado ya mide ese tipo; aquí solo puntúas lo que aparece explícitamente en las respuestas abiertas.

Devuelve ÚNICAMENTE un objeto JSON válido (sin texto adicional, sin bloques markdown):
{
  "MBTI": {
    "EI": <entero 0-100>,
    "SN": <entero 0-100>,
    "TF": <entero 0-100>,
    "JP": <entero 0-100>
  },
  "RIASEC": {
    "R": { "score": <entero 0-100>, "confidence": <decimal 0.0-1.0> },
    "I": { "score": <entero 0-100>, "confidence": <decimal 0.0-1.0> },
    "A": { "score": <entero 0-100>, "confidence": <decimal 0.0-1.0> },
    "S": { "score": <entero 0-100>, "confidence": <decimal 0.0-1.0> },
    "E": { "score": <entero 0-100>, "confidence": <decimal 0.0-1.0> },
    "C": { "score": <entero 0-100>, "confidence": <decimal 0.0-1.0> }
  },
  "analysis": "<2-3 frases en español describiendo el perfil vocacional del alumno>",
  "reasoning": {
    "EI": "<cita frases EXACTAS del alumno que determinaron este valor y explica por qué apuntan a introversión o extraversión>",
    "SN": "<ídem para intuitivo vs sensorial>",
    "TF": "<ídem para emocional vs racional>",
    "JP": "<ídem para espontáneo vs planificador>",
    "R": "<frases exactas que justifican el score y confidence asignados al tipo Realista>",
    "I": "<ídem para Investigador>",
    "A": "<ídem para Artístico>",
    "S": "<ídem para Social>",
    "E": "<ídem para Emprendedor>",
    "C": "<ídem para Convencional>"
  }
}`;

        // ── AI call helper with timeout ───────────────────────────────────────
        const groqCall = async (p, tokens = 1200) => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 25000); // 25s timeout
          try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              signal: controller.signal,
              headers: {
                'Authorization': `Bearer ${env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: p }],
                temperature: 0.1,
                max_tokens: tokens,
              }),
            });
            if (!res.ok) {
              const errBody = await res.text();
              throw new Error(`Groq ${res.status}: ${errBody}`);
            }
            const data = await res.json();
            const raw = data.choices?.[0]?.message?.content || '';
            // Extract the outermost JSON object robustly
            const start = raw.indexOf('{');
            const end   = raw.lastIndexOf('}');
            if (start === -1 || end === -1) throw new Error(`No JSON object in: ${raw.slice(0, 200)}`);
            const parsed = JSON.parse(raw.slice(start, end + 1));
            return { parsed, raw };
          } finally {
            clearTimeout(timer);
          }
        };

        // Primary: two sequential calls (avoids Groq rate-limit on simultaneous requests)
        // then average the scores for objectivity
        let valid1 = null, valid2 = null;
        try { valid1 = await groqCall(prompt); } catch (e) { console.error('Call 1 failed:', e.message); }
        try { valid2 = await groqCall(prompt); } catch (e) { console.error('Call 2 failed:', e.message); }

        // Fallback: if both failed, retry with a minimal plain-number prompt
        if (!valid1 && !valid2) {
          console.error('Both AI calls failed. Trying minimal fallback prompt.');
          const fallbackPrompt = `Eres un orientador vocacional. Analiza estas respuestas y devuelve ÚNICAMENTE el JSON, sin ningún texto adicional ni markdown.

${qa}

JSON exacto a devolver:
{"MBTI":{"EI":50,"SN":50,"TF":50,"JP":50},"RIASEC":{"R":50,"I":50,"A":50,"S":50,"E":50,"C":50},"analysis":"Perfil en proceso de análisis.","reasoning":{"EI":"","SN":"","TF":"","JP":"","R":"","I":"","A":"","S":"","E":"","C":""}}

Sustituye los valores 50 por los valores reales según las respuestas. Solo JSON, sin texto extra.`;
          try {
            valid1 = await groqCall(fallbackPrompt, 600);
          } catch (retryErr) {
            console.error('Fallback also failed:', retryErr.message);
            return err('Error al procesar las respuestas con IA. Inténtalo de nuevo.', 502);
          }
        }

        const d1 = valid1?.parsed;
        const d2 = valid2?.parsed;
        const dims = d1 || d2; // fallback to whichever succeeded

        const clamp  = (v, def = 50) => Math.min(100, Math.max(0, Math.round(Number(v) || def)));
        const clampC = (v) => Math.min(1, Math.max(0, Number(v) || 0));

        // Average two values if both calls succeeded; otherwise use the valid one
        const avgInt = (a, b, def = 50) =>
          (d1 && d2) ? Math.round((clamp(a, def) + clamp(b, def)) / 2)
                     : d1 ? clamp(a, def) : clamp(b, def);
        const avgFloat = (a, b) =>
          (d1 && d2) ? Math.round(((clampC(a) + clampC(b)) / 2) * 100) / 100
                     : d1 ? clampC(a) : clampC(b);

        // Average MBTI (accepts flat or nested format from the model)
        const EI = avgInt(d1?.MBTI?.EI ?? d1?.EI, d2?.MBTI?.EI ?? d2?.EI);
        const SN = avgInt(d1?.MBTI?.SN ?? d1?.SN, d2?.MBTI?.SN ?? d2?.SN);
        const TF = avgInt(d1?.MBTI?.TF ?? d1?.TF, d2?.MBTI?.TF ?? d2?.TF);
        const JP = avgInt(d1?.MBTI?.JP ?? d1?.JP, d2?.MBTI?.JP ?? d2?.JP);

        // Average RIASEC scores + confidence across both calls
        const riasecAI = {};
        for (const k of ['R','I','A','S','E','C']) {
          const r1 = d1?.RIASEC?.[k], r2 = d2?.RIASEC?.[k];
          riasecAI[k] = {
            score:      avgInt(r1?.score   ?? r1, r2?.score   ?? r2),
            confidence: avgFloat(r1?.confidence, r2?.confidence),
          };
        }

        // ── Confidence-weighted RIASEC blend ─────────────────────────────────
        // weight_ai = 0.35 × confidence
        // confidence=0 → 100% structured score (silence is not penalized)
        // confidence=1 → 65% structured + 35% AI (full blend)
        const blendConfidence = (structured, aiScore, conf) => {
          const w = 0.35 * Math.min(1, Math.max(0, conf));
          return Math.round((1 - w) * clamp(structured) + w * clamp(aiScore));
        };

        const RR = hasPrecomputedRiasec ? blendConfidence(riasecScores.R, riasecAI.R.score, riasecAI.R.confidence) : clamp(riasecAI.R.score);
        const RI = hasPrecomputedRiasec ? blendConfidence(riasecScores.I, riasecAI.I.score, riasecAI.I.confidence) : clamp(riasecAI.I.score);
        const RA = hasPrecomputedRiasec ? blendConfidence(riasecScores.A, riasecAI.A.score, riasecAI.A.confidence) : clamp(riasecAI.A.score);
        const RS = hasPrecomputedRiasec ? blendConfidence(riasecScores.S, riasecAI.S.score, riasecAI.S.confidence) : clamp(riasecAI.S.score);
        const RE = hasPrecomputedRiasec ? blendConfidence(riasecScores.E, riasecAI.E.score, riasecAI.E.confidence) : clamp(riasecAI.E.score);
        const RC = hasPrecomputedRiasec ? blendConfidence(riasecScores.C, riasecAI.C.score, riasecAI.C.confidence) : clamp(riasecAI.C.score);

        const mbtiType =
          (EI >= 50 ? 'E' : 'I') +
          (SN >= 50 ? 'S' : 'N') +
          (TF >= 50 ? 'T' : 'F') +
          (JP >= 50 ? 'J' : 'P');

        const riasecCode = Object.entries({ R: RR, I: RI, A: RA, S: RS, E: RE, C: RC })
          .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k).join('');

        const student = { EI, SN, TF, JP, R: RR, I: RI, A: RA, S: RS, E: RE, C: RC };
        const d = (a, b) => Math.pow(1 - Math.abs(a - b) / 100, 2);
        const r2 = (v) => Math.round(v * 100) / 100;

        const scoredCareers = CAREERS.map(c => {
          const dEI = d(student.EI, c.mbti.EI), dSN = d(student.SN, c.mbti.SN);
          const dTF = d(student.TF, c.mbti.TF), dJP = d(student.JP, c.mbti.JP);
          const mbtiC = Math.pow(dEI * dSN * dTF * dJP, 1 / 4);

          const dR = d(student.R, c.riasec.R), dI = d(student.I, c.riasec.I);
          const dA = d(student.A, c.riasec.A), dS = d(student.S, c.riasec.S);
          const dE = d(student.E, c.riasec.E), dC = d(student.C, c.riasec.C);
          const riasecC = Math.pow(dR * dI * dA * dS * dE * dC, 1 / 6);

          let compat, valC = null;
          if (hasValues) {
            valC = valuesCompat(c, valuesProfile);
            compat = Math.pow(riasecC, 0.50) * Math.pow(mbtiC, 0.30) * Math.pow(valC, 0.20);
          } else {
            compat = Math.pow(riasecC, 0.60) * Math.pow(mbtiC, 0.40);
          }

          const compatScore = Math.min(99, Math.round(Math.pow(compat, 1.5) * 160));

          const futureNorm = normalizeWEF(c.future ?? 0);
          const blendedRaw = 0.7 * compat + 0.3 * (futureNorm / 100);
          const scoreFuture = Math.min(99, Math.round(Math.pow(blendedRaw, 1.5) * 160));

          const _debug = {
            mbtiC: r2(mbtiC), riasecC: r2(riasecC), valC: valC !== null ? r2(valC) : null,
            rawCompat: r2(compat),
            mbtiD: { EI: r2(dEI), SN: r2(dSN), TF: r2(dTF), JP: r2(dJP) },
            riasecD: { R: r2(dR), I: r2(dI), A: r2(dA), S: r2(dS), E: r2(dE), C: r2(dC) },
            careerIdeal: { mbti: c.mbti, riasec: c.riasec },
          };

          return { id: c.id, name: c.name, area: c.area, description: c.description,
                   score: compatScore, compatScore, futureScore: Math.round(futureNorm),
                   scoreFuture, _debug };
        }).sort((a, b) => b.score - a.score).slice(0, 10);

        const resultId = generateId('res_');
        const analysis = typeof dims.analysis === 'string' ? dims.analysis.slice(0, 500) : '';

        // NEO columns kept for DB compatibility; set to neutral (50)
        await env.DB.prepare(
          `INSERT INTO test_results
           (id, user_id, mbti_type, ei_score, sn_score, tf_score, jp_score,
            riasec_r, riasec_i, riasec_a, riasec_s, riasec_e, riasec_c, riasec_code,
            neo_o, neo_c, neo_e, neo_a, neo_n,
            analysis, careers_json, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
        ).bind(
          resultId, payload.userId, mbtiType, EI, SN, TF, JP,
          RR, RI, RA, RS, RE, RC, riasecCode,
          50, 50, 50, 50, 50,
          analysis, JSON.stringify(scoredCareers)
        ).run();

        const mbtiInfo = MBTI_INFO[mbtiType] || { label: mbtiType, tagline: '' };
        return json({
          ok: true, resultId, mbtiType,
          mbtiLabel: mbtiInfo.label, mbtiTagline: mbtiInfo.tagline,
          dimensions: { EI, SN, TF, JP },
          riasec: { R: RR, I: RI, A: RA, S: RS, E: RE, C: RC, code: riasecCode },
          analysis,
          careers: scoredCareers,
          _debug: {
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            max_tokens: 1400,
            callsSucceeded: (valid1 ? 1 : 0) + (valid2 ? 1 : 0),
            promptSent: prompt,
            rawAiResponse: valid1?.raw || valid2?.raw || null,
            call1: { raw: valid1?.raw || null, succeeded: !!valid1 },
            call2: { raw: valid2?.raw || null, succeeded: !!valid2 },
            averagedScores: { mbti: { EI, SN, TF, JP }, riasec: riasecAI },
            aiReasoning: dims.reasoning || null,
            aiRawScores: {
              mbti: { EI: dims.MBTI?.EI ?? dims.EI, SN: dims.MBTI?.SN ?? dims.SN,
                      TF: dims.MBTI?.TF ?? dims.TF, JP: dims.MBTI?.JP ?? dims.JP },
              riasec: Object.fromEntries(['R','I','A','S','E','C'].map(k => [k, riasecAI[k].score])),
            },
            riasecPipeline: hasPrecomputedRiasec ? {
              structured: riasecScores,
              ai: Object.fromEntries(['R','I','A','S','E','C'].map(k => [k, riasecAI[k].score])),
              aiConfidence: Object.fromEntries(['R','I','A','S','E','C'].map(k => [k, riasecAI[k].confidence])),
              effectiveWeights: Object.fromEntries(['R','I','A','S','E','C'].map(k => [k, {
                structured: Math.round((1 - 0.35 * riasecAI[k].confidence) * 100) / 100,
                ai: Math.round(0.35 * riasecAI[k].confidence * 100) / 100,
              }])),
              blended: { R: RR, I: RI, A: RA, S: RS, E: RE, C: RC },
            } : null,
            skillsScores: skillsScores || null,
            valuesProfile: valuesProfile || null,
            careerScoring: {
              formula: hasValues
                ? 'compat = riasecC^0.50 × mbtiC^0.30 × valC^0.20'
                : 'compat = riasecC^0.60 × mbtiC^0.40',
              displayFormula: 'displayScore = min(99, round(compat^1.5 × 160))',
              distanceFormula: 'd(a,b) = (1 - |a-b|/100)^2',
              top10: scoredCareers.map(c => ({
                name: c.name, area: c.area, displayScore: c.score,
                ...c._debug,
              })),
            },
          },
        });
      }

      if (path === '/api/test/results' && method === 'GET') {
        const payload = await verifyRole(req, env, 'user');
        if (!payload) return err('No autorizado', 401);
        const { results } = await env.DB.prepare(
          `SELECT id, mbti_type, ei_score, sn_score, tf_score, jp_score,
           riasec_r, riasec_i, riasec_a, riasec_s, riasec_e, riasec_c, riasec_code,
           neo_o, neo_c, neo_e, neo_a, neo_n,
           analysis, careers_json, created_at
           FROM test_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`
        ).bind(payload.userId).all();
        return json({
          results: results.map(r => ({ ...r, careers: JSON.parse(r.careers_json || '[]') })),
        });
      }

      // ── DEGREES: 3-level lazy loading ────────────────────────────────────────────

      if (path === '/api/degrees/categories' && method === 'GET') {
        const sp = new URL(req.url).searchParams;
        const s = extractStudentProfile(sp);

        const { results: degreeTypes } = await env.DB.prepare(
          `SELECT category_id,
           mbti_ei, mbti_sn, mbti_tf, mbti_jp,
           riasec_r, riasec_i, riasec_a, riasec_s, riasec_e, riasec_c,
           neo_o, neo_c, neo_e, neo_a, neo_n, future_score
           FROM degree_types`
        ).all();

        const catBest = {};
        for (const dt of degreeTypes) {
          const sc = rawCompat(s, dt);
          if (catBest[dt.category_id] === undefined || sc > catBest[dt.category_id]) {
            catBest[dt.category_id] = sc;
          }
        }

        const { results: categories } = await env.DB.prepare(
          'SELECT id, name, icon, display_order FROM degree_categories ORDER BY display_order'
        ).all();

        const withRaw = categories.map(c => ({ ...c, _raw: catBest[c.id] ?? 0 }));
        const sorted = withRaw.sort((a, b) => b._raw - a._raw);
        // Use absolute score — rawCompat is already 0-1, multiply by 100
        return json({
          categories: sorted.map(c => {
            const { _raw, ...rest } = c;
            return { ...rest, score: Math.min(99, Math.round(Math.pow(_raw, 1.5) * 160)) };
          }),
        });
      }

      if (path.startsWith('/api/degrees/category/') && method === 'GET') {
        const categoryId = path.split('/')[4];
        if (!categoryId) return err('ID de categoría requerido', 400);
        const sp = new URL(req.url).searchParams;
        const s = extractStudentProfile(sp);

        const { results: degreeTypes } = await env.DB.prepare(
          `SELECT id, name, campo, university_count, future_score,
           mbti_ei, mbti_sn, mbti_tf, mbti_jp,
           riasec_r, riasec_i, riasec_a, riasec_s, riasec_e, riasec_c,
           neo_o, neo_c, neo_e, neo_a, neo_n
           FROM degree_types WHERE category_id = ?`
        ).bind(categoryId).all();

        const raw = degreeTypes.map(dt => ({
          id: dt.id, name: dt.name, campo: dt.campo,
          universityCount: dt.university_count,
          futureScore: dt.future_score ?? 50,
          _compat: rawCompat(s, dt),
        }));

        raw.sort((a, b) => b._compat - a._compat);
        const scored = raw.map(d => {
          const { _compat, ...rest } = d;
          const compatScore = Math.min(99, Math.round(Math.pow(_compat, 1.5) * 160));
          return { ...rest, compatScore, score: compatScore };
        });

        return json({ degrees: scored });
      }

      if (path.startsWith('/api/degrees/type/') && method === 'GET') {
        const typeId = path.split('/')[4];
        if (!typeId) return err('ID de grado requerido', 400);

        const degreeType = await env.DB.prepare(
          'SELECT id, name, campo, future_score FROM degree_types WHERE id = ?'
        ).bind(typeId).first();
        if (!degreeType) return err('Grado no encontrado', 404);

        const { results: universities } = await env.DB.prepare(
          'SELECT id, university, ministry_code FROM degrees WHERE degree_type_id = ? ORDER BY university'
        ).bind(typeId).all();

        return json({ ...degreeType, universities });
      }

      return err('Ruta no encontrada', 404);

    } catch (e) {
      console.error(e?.message || e);
      return err('Error interno del servidor', 500);
    }
  },
};

// ── WEF future-score normalization ───────────────────────────────────────────
// Piecewise linear map of WEF net-employment-change score to 0-100:
//   < 0      →  0–20  (decline)
//   0–5      → 20–40  (stable)
//   5–15     → 40–60  (moderate growth)
//   15–30    → 60–80  (high growth)
//   > 30     → 80–100 (very high growth)

function normalizeWEF(wef) {
  if (wef < 0)  return Math.max(0, 20 + wef * (20 / 30));
  if (wef < 5)  return 20 + (wef / 5) * 20;
  if (wef < 15) return 40 + ((wef - 5) / 10) * 20;
  if (wef < 30) return 60 + ((wef - 15) / 15) * 20;
  return Math.min(100, 80 + ((wef - 30) / 30) * 20);
}

// ── Values compatibility for career scoring ───────────────────────────────────
// Each career now carries its own values profile derived from O*NET Work Values.
// Formula: Independence→autonomy, avg(Independence,Achievement)→innovative,
// Relationships→socialImpact, clamp(Achievement-Recognition+50)→growth.

function valuesCompat(career, values) {
  const ideal = career.values || { autonomy: 55, innovative: 60, socialImpact: 50, growth: 50 };
  const sq = (a, b) => Math.pow(1 - Math.abs(a - b) / 100, 2);
  return Math.pow(
    sq(values.autonomy, ideal.autonomy) * sq(values.innovative, ideal.innovative) *
    sq(values.socialImpact, ideal.socialImpact) * sq(values.growth, ideal.growth),
    1 / 4
  );
}

// ── Degree scoring helpers ────────────────────────────────────────────────────

function extractStudentProfile(sp) {
  const p = (k, d = 50) => Math.min(100, Math.max(0, parseInt(sp.get(k) ?? d, 10) || d));
  return {
    EI: p('ei'), SN: p('sn'), TF: p('tf'), JP: p('jp'),
    R:  p('r'),  I:  p('i'),  A:  p('a'),  S:  p('s'),  E: p('e'), C: p('c'),
    O:  p('o'),  NC: p('nc'), NE: p('ne'), NA: p('na'), NN: p('nn'),
  };
}

// rawCompat: geometric mean within each model group, then weighted geometric between groups.
// Geometric mean is scientifically correct for vocational matching: a strong mismatch on
// any single dimension (e.g. student E=100, career E=10) cannot be compensated by other
// dimensions. This creates natural spread (40-90%) instead of the arithmetic compression (79-87%).
function rawCompat(s, dt) {
  const sq = (a, b) => Math.pow(1 - Math.abs(a - b) / 100, 2);
  // Geometric mean within each model (n-th root of product)
  const mbtiC = Math.pow(
    sq(s.EI, dt.mbti_ei) * sq(s.SN, dt.mbti_sn) *
    sq(s.TF, dt.mbti_tf) * sq(s.JP, dt.mbti_jp),
    1 / 4
  );
  const riasecC = Math.pow(
    sq(s.R,  dt.riasec_r) * sq(s.I,  dt.riasec_i) * sq(s.A,  dt.riasec_a) *
    sq(s.S,  dt.riasec_s) * sq(s.E,  dt.riasec_e) * sq(s.C,  dt.riasec_c),
    1 / 6
  );
  const neoC = Math.pow(
    sq(s.O,  dt.neo_o) * sq(s.NC, dt.neo_c) * sq(s.NE, dt.neo_e) *
    sq(s.NA, dt.neo_a) * sq(s.NN, dt.neo_n),
    1 / 5
  );
  // Weighted geometric mean between the three models
  return Math.pow(riasecC, 0.35) * Math.pow(mbtiC, 0.35) * Math.pow(neoC, 0.30);
}

// ── Shared helper ─────────────────────────────────────────────────────────────

async function createUserForLicense(env, { name, email, licenseId }) {
  const license = await env.DB.prepare('SELECT * FROM licenses WHERE id = ? AND revoked = 0').bind(licenseId).first();
  if (!license) return { error: 'Licencia no encontrada o revocada', status: 404 };

  const { results: activeUsers } = await env.DB.prepare(
    'SELECT id FROM users WHERE license_id = ? AND active = 1'
  ).bind(licenseId).all();
  if (activeUsers.length >= license.max_users) return { error: 'Licencia sin plazas disponibles' };

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return { error: 'Ya existe un usuario con ese email' };

  const password = generateSecurePassword();
  const { hash, salt } = await hashPassword(password);
  const userId = generateId('usr_');

  await env.DB.prepare(
    'INSERT INTO users (id, license_id, name, email, password_hash, salt, active, must_change_password) VALUES (?, ?, ?, ?, ?, ?, 1, 1)'
  ).bind(userId, licenseId, name, email, hash, salt).run();

  return { userId, email, password };
}
