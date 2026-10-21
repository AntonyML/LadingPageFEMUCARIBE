export interface NewsArticle {
  category: string;
  publishedOn: string;
  title: string;
  summary: string;
  source: string;
  url: string;
}

export const newsArticles: readonly NewsArticle[] = [
  {
    category: 'Comunidades',
    publishedOn: '2026-10-12',
    title:
      'Comunidades de Limón y Parrita recibirán apoyo para impulsar sus proyectos',
    summary:
      'DINADECO y FEMUCARIBE acordaron brindar asistencia técnica para formular y gestionar iniciativas comunales en los cantones federados.',
    source: 'Teletica',
    url: 'https://www.teletica.com/amp/nacional/comunidades-de-limon-y-parrita-recibiran-apoyo-para-impulsar-sus-proyectos_419048',
  },
  {
    category: 'Infraestructura',
    publishedOn: '2026-09-11',
    title:
      'Puente en Matama de Limón será sustituido por una estructura más amplia y segura',
    summary:
      'MOPT y CONAVI iniciaron la sustitución del puente sobre Quebrada sin Nombre, en la Ruta Nacional 36, con una estructura más amplia y segura.',
    source: 'MOPT',
    url: 'https://www.mopt.go.cr/noticias/2026/puente-en-matama-de-limon-sera-sustituido-por-una-estructura-mas-amplia-y-segura',
  },
  {
    category: 'Obras viales',
    publishedOn: '2026-09-02',
    title:
      'MOPT-CONAVI impulsan 13 proyectos de infraestructura para fortalecer la red vial de la Región Caribe',
    summary:
      'El programa PROERI contempla siete puentes, cinco puntos críticos y trabajos en la Ruta 32, con una inversión cercana a los 16,5 millones de dólares.',
    source: 'MOPT',
    url: 'https://www.mopt.go.cr/noticias/2026/mopt-conavi-impulsan-13-proyectos-de-infraestructura-para-fortalecer-la-red-vial-de',
  },
  {
    category: 'Turismo accesible',
    publishedOn: '2026-09-02',
    title:
      'Ya inició la construcción del sendero universal para mejorar la accesibilidad en el Parque Nacional Tortuguero',
    summary:
      'La obra en el Parque Nacional Tortuguero ampliará el acceso para personas con discapacidad, personas adultas mayores y visitantes con movilidad reducida.',
    source: 'INDER',
    url: 'https://www.inder.go.cr/noticias/ya-inicio-la-construccion-del-sendero-universal-para-mejorar-la-accesibilidad-en-el-parque-nacional-tortuguero/',
  },
  {
    category: 'Desarrollo rural',
    publishedOn: '2026-09-01',
    title:
      'Pococí recibe inversiones por más de ₡5.800 millones en 11 proyectos de infraestructura rural',
    summary:
      'El INDER anunció obras viales, puentes y electrificación por más de ₡5.800 millones, en beneficio de comunidades rurales del cantón.',
    source: 'INDER',
    url: 'https://www.inder.go.cr/noticias/2026/pococi-recibe-inversiones-por-mas-de-%E2%82%A15-800-millones-en-11-proyectos-de-infraestructura-rural/',
  },
  {
    category: 'Inversión territorial',
    publishedOn: '2026-08-31',
    title:
      'Inder promueve el desarrollo de Limón con obras que mejoran la vida de sus familias rurales',
    summary:
      'El instituto reportó inversiones superiores a ₡3.620 millones en infraestructura para Talamanca, Valle La Estrella y Guácimo.',
    source: 'INDER',
    url: 'https://www.inder.go.cr/noticias/inder-promueve-el-desarrollo-de-limon-con-obras-qye-mejoran-la-vida-de-sus-familias-rurales/',
  },
];
