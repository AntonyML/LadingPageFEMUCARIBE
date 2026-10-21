import limonPhoto from '../../assets/municipalidades/canton-limon.png';
import talamancaPhoto from '../../assets/municipalidades/canton-talamanca.png';
import matinaPhoto from '../../assets/municipalidades/canton-matina.png';
import guacimoPhoto from '../../assets/municipalidades/canton-guacimo.png';
import pocociPhoto from '../../assets/municipalidades/canton-pococi.png';
import parritaPhoto from '../../assets/municipalidades/canton-parrita.png';
import anaMatarritaPhoto from '../../assets/municipalidades/alcaldesa-limon.png';
import walterCespedesPhoto from '../../assets/municipalidades/alcalde-matina.png';
import type { MunicipalGovernment } from './types';

const limon: MunicipalGovernment = {
  slug: 'limon',
  name: 'Limón',
  memberLocation: 'Limón Centro · Puerto Principal y Cabecera de Provincia',
  memberSummary:
    'Nodo logístico y portuario neurálgico del país. Articula proyectos de infraestructura costera, ordenamiento urbano y desarrollo portuario.',
  photo: limonPhoto,
  photoAlt: 'Edificio de la Municipalidad de Limón',
  period: '2024-2028',
  mayor: {
    name: 'Ana Janniel Matarrita Mc Calla',
    roleLabel: 'Alcaldesa',
    roleTitle: 'Alcaldesa Municipal · Cantón Central',
    initials: 'AM',
    portrait: anaMatarritaPhoto,
    portraitAlt: 'Ana Janniel Matarrita Mc Calla, alcaldesa de Limón',
  },
  viceMayors: ['John Gerardo Gutiérrez Gómez', 'Katerine Calvo Lobo'],
  councilShort: 'Directorio Municipal de Limón',
  councilDetails: 'Directorio Municipal de Limón',
  councillors: [
    'Katerine Calvo Lobo',
    'Orin George Grant Ebanks',
    'Dwayne Kareem Mattis Pinnock',
    'Yhouzu Acuña Martínez',
  ],
  additionalCouncillors: '+3 regidores',
  territoryLabel: 'Cabecera Provincial',
  districtLabel: '4 Distritos · Puerto Principal y Logística',
  territoryDescription:
    'Centro neurálgico del Caribe, puerto multimodal y cabecera de provincia. Eje de comercio exterior y desarrollo costero.',
};

const matina: MunicipalGovernment = {
  slug: 'matina',
  name: 'Matina',
  memberLocation: 'Matina · Corredor Agrícola y Logístico',
  memberSummary:
    'Cantón con vocación productiva bananera y cacaotera. Prioriza proyectos de conectividad vial cantonal, gestión de aguas y resiliencia climática.',
  photo: matinaPhoto,
  photoAlt: 'Edificio de la Municipalidad de Matina',
  period: '2024-2028',
  mayor: {
    name: 'Walter Céspedes Salazar',
    roleLabel: 'Alcalde',
    roleTitle: 'Alcalde Municipal · Cantón de Matina',
    initials: 'WC',
    portrait: walterCespedesPhoto,
    portraitAlt: 'Walter Céspedes Salazar, alcalde de Matina',
  },
  viceMayors: ['Yorleny Canales Delgado', 'Gerardo Valverde Sanders'],
  councilShort: 'Directorio Municipal de Matina',
  councilDetails: 'Directorio Municipal de Matina',
  councillors: [
    'Verónica Mayela Ugalde Torres',
    'Ever Cortes Chaves',
    'Yaritza Isabel Reid Uba',
    'Kevin Yasdani Centeno Villafuerte',
  ],
  additionalCouncillors: '+1 regidores',
  territoryLabel: 'Corredor Agrícola',
  districtLabel: '3 Distritos · Batán, Carrandi y Matina',
  territoryDescription:
    'Región de alta productividad bananera y cacaotera. Conexión estratégica intercantonal con infraestructura fluvial y vial.',
};

const guacimo: MunicipalGovernment = {
  slug: 'guacimo',
  name: 'Guácimo',
  memberLocation: 'Guácimo (Sede Central) · Sede Central de FEMUCARIBE',
  memberSummary:
    'Ubicación de la sede operativa de la federación. Centro de articulación intercantonal, desarrollo agropecuario y tecnológico regional.',
  photo: guacimoPhoto,
  photoAlt: 'Vista aérea del cantón de Guácimo',
  period: '2024-2028',
  mayor: {
    name: 'Beatriz Mora Valverde',
    roleLabel: 'Alcaldesa',
    roleTitle: 'Alcaldesa Municipal · Sede Central FEMUCARIBE',
    initials: 'BM',
  },
  viceMayors: ['Siviany Moya Peraza', 'Félix Ruiz Sánchez'],
  councilShort: 'Directorio Municipal de Guácimo',
  councilDetails: 'Directorio Municipal de Guácimo',
  councillors: ['Nómina oficial Concejo Municipal de Guácimo'],
  territoryLabel: 'Sede FEMUCARIBE',
  districtLabel: '5 Distritos · Innovación Agropecuaria',
  territoryDescription:
    'Sede operativa de la federación. Destaca por su articulación tecnológica agropecuaria, centros de investigación y desarrollo rural.',
};

const parrita: MunicipalGovernment = {
  slug: 'parrita',
  name: 'Parrita',
  memberLocation: 'Parrita · Cantón Federado del Pacífico Central',
  memberSummary:
    'Integrado formalmente a la federación para la mancomunidad de proyectos de gestión ambiental, transferencia tecnológica y eficiencia institucional.',
  photo: parritaPhoto,
  photoAlt: 'Edificio de la Municipalidad de Parrita',
  period: '2024-2028',
  mayor: {
    name: 'Roberto Rímola Real',
    roleLabel: 'Alcalde',
    roleTitle: 'Alcalde Municipal · Cantón Federado Pacífico',
    initials: 'RR',
  },
  viceMayors: ['Elizabeth Segura Gamboa', 'Fernando Gamboa Díaz'],
  councilShort: 'Carlos Alberto Mora Solano',
  councilDetails:
    'Carlos Alberto Mora Solano (Pres.) / Maria Virginia Quesada Fallas (Vicepres.)',
  councillors: [
    'Tania Ninoska Huembes Cuesta',
    'Miguel Cordero Barrantes',
    'Alberto Cerdas Ríos',
  ],
  territoryLabel: 'Pacífico Central',
  districtLabel: 'Distrito Único · Cantón Federado',
  territoryDescription:
    'Cantón federado del Pacífico Central. Eje agroindustrial de palma aceitera, turismo costero y cooperación técnica mancomunada.',
};

const talamanca: MunicipalGovernment = {
  slug: 'talamanca',
  name: 'Talamanca',
  memberLocation: 'Bribri · Caribe Sur y Frontera',
  memberSummary:
    'Territorio de alta diversidad biológica y cultural. Enlace estratégico fronterizo en Sixaola, obras comunitarias e infraestructura deportiva.',
  photo: talamancaPhoto,
  photoAlt: 'Edificio municipal de Talamanca con banderas',
  period: '2024-2028',
  mayor: {
    name: 'Rugeli Morales Rodríguez',
    roleLabel: 'Alcalde',
    roleTitle: 'Alcalde Municipal · Caribe Sur y Frontera',
    initials: 'RM',
  },
  viceMayors: ['Denia Zúñiga Pita', 'Gineth Jarquin Casanova'],
  councilShort: 'Julio Molina Masis',
  councilDetails:
    'Julio Molina Masis (Pres.) / Maritza Medrano Gómez (Vicepres.)',
  councillors: [
    'Julio Molina Masis',
    'Maritza Medrano Gómez',
    'Yahaira Mora Blanco',
    'Freddy Soto Álvarez',
  ],
  additionalCouncillors: '+1 regidores',
  territoryLabel: 'Caribe Sur',
  districtLabel: '4 Distritos · Bribri, Cahuita, Sixaola y Telire',
  territoryDescription:
    'Territorio de vasta biodiversidad y riqueza de pueblos originarios. Enlace fronterizo con Panamá y proyección ecoturística.',
};

const pococi: MunicipalGovernment = {
  slug: 'pococi',
  name: 'Pococí',
  memberLocation: 'Guápiles · Polo Comercial del Caribe',
  memberSummary:
    'Principal centro urbano y comercial de la región Caribe. Conexión directa con la Ruta 32 y plataforma para la electrolinera y valorización de residuos.',
  photo: pocociPhoto,
  photoAlt: 'Paisaje natural del cantón de Pococí',
  period: '2024-2028',
  mayor: {
    name: 'Manuel Hernández Rivera',
    roleLabel: 'Alcalde',
    roleTitle: 'Alcalde Municipal · Guápiles · Polo Comercial',
    initials: 'MH',
  },
  viceMayors: ['Yamileth Hidalgo Arias', 'Bernardo Antonio Veach Davis'],
  councilShort: 'Juan Mauricio Mora Cruz',
  councilDetails:
    'Juan Mauricio Mora Cruz (Pres.) / Eva Isabel Torres Marín (Vicepres.)',
  councillors: [
    'Luis Ángel Méndez Araya',
    'Gerardo Cubillo Gamboa',
    'Patricia Aguilar Araya',
    'Walter Villagra Rodríguez',
  ],
  additionalCouncillors: '+6 regidores',
  territoryLabel: 'Caribe Norte',
  districtLabel: '7 Distritos · Guápiles y Cariari',
  territoryDescription:
    'Principal polo comercial, urbano y financiero de la región Caribe. Conexión directa por Ruta 32 y plataforma de servicios.',
};

export const municipalities = [
  limon,
  matina,
  guacimo,
  parrita,
  talamanca,
  pococi,
] as const;

export const overviewMunicipalities = [
  limon,
  talamanca,
  matina,
  guacimo,
  pococi,
  parrita,
] as const;
