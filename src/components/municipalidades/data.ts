import limonPhoto from '../../assets/municipalidades/canton-limon.png';
import talamancaPhoto from '../../assets/municipalidades/canton-talamanca.png';
import matinaPhoto from '../../assets/municipalidades/canton-matina.png';
import guacimoPhoto from '../../assets/municipalidades/canton-guacimo.png';
import pocociPhoto from '../../assets/municipalidades/canton-pococi.png';
import parritaPhoto from '../../assets/municipalidades/canton-parrita.png';
import type { Municipality } from '../../lib/municipalities-repository';
import type { MunicipalGovernment } from './types';

// Only existing territorial imagery and council presentation live here.
// Institutional fields come from the repository on every request.
const presentation = {
  limon: {
    cantonName: 'Limón',
    photo: limonPhoto,
    photoAlt: 'Edificio de la Municipalidad de Limón',
    viceMayors: ['John Gerardo Gutiérrez Gómez', 'Katerine Calvo Lobo'],
    councilShort: 'Juan Pablo Poveda Chinchilla',
    councilDetails:
      'Juan Pablo Poveda Chinchilla (Pres.) / Katerine Calvo Lobo (Vicepres.)',
    councillors: [
      'Juan Pablo Poveda Chinchilla',
      'Katerine Calvo Lobo',
      'Orin George Grant Ebanks',
      'Dwayne Kareem Mattis Pinnock',
      'Yahuzu Acuña Martínez',
      'Keyvin Paul Ramírez Quesada',
      'José Luis Vásquez Mora',
    ],
    additionalCouncillors: '+7 regidores suplentes',
    territoryLabel: 'Cabecera Provincial',
    districtLabel: '4 Distritos · Puerto Principal y Logística',
  },
  pococi: {
    cantonName: 'Pococí',
    photo: pocociPhoto,
    photoAlt: 'Paisaje natural del cantón de Pococí',
    viceMayors: ['Yamileth Hidalgo Arias', 'Vacante (declaratoria TSE)'],
    councilShort: 'Juan Mauricio Mora Cruz',
    councilDetails:
      'Juan Mauricio Mora Cruz (Pres.) / Eva Isabel Torres Marín (Vicepres.)',
    councillors: [
      'Juan Mauricio Mora Cruz',
      'Eva Isabel Torres Marín',
      'Luis Ángel Méndez Araya',
      'Patricia Aguilar Araya',
      'Walter Villagra Rodríguez',
      'Carmen Sánchez Navarro',
      'Carlos Alberto Retana López',
      'Ricardo Villalobos Vargas',
      'Jordan Chaves Chaves',
    ],
    additionalCouncillors: '+9 regidores suplentes',
    territoryLabel: 'Caribe Norte',
    districtLabel: '7 Distritos · Guápiles y Cariari',
  },
  parrita: {
    cantonName: 'Parrita',
    photo: parritaPhoto,
    photoAlt: 'Litoral y paisaje natural del cantón de Parrita',
    viceMayors: ['Elizabeth Segura Gamboa', 'Gerardo Fernando Gamboa Díaz'],
    councilShort: 'Carlos Alberto Mora Solano',
    councilDetails:
      'Carlos Alberto Mora Solano (Pres.) / María Virginia Quesada Fallas (Vicepres.)',
    councillors: [
      'Carlos Alberto Mora Solano',
      'María Virginia Quesada Fallas',
      'Alberto Cerdas Ríos',
      'Tania Ninoska Huembes Cuesta',
      'Miguel Cordero Barrantes',
    ],
    additionalCouncillors: '+5 regidores suplentes',
    territoryLabel: 'Pacífico Central',
    districtLabel: 'Distrito Único · Playas Esterillos y Río Pirrís',
  },
  talamanca: {
    cantonName: 'Talamanca',
    photo: talamancaPhoto,
    photoAlt: 'Edificio municipal de Talamanca con banderas',
    viceMayors: ['Denia Patricia Zúñiga Pita', 'Gineth María Jarquín Casanova'],
    councilShort: 'Julio Molina Masis',
    councilDetails:
      'Julio Molina Masis (Pres.) / Maritza Patricia Medrano Gómez (Vicepres.)',
    councillors: [
      'Julio Molina Masis',
      'Maritza Patricia Medrano Gómez',
      'Freddy Enrique Soto Álvarez',
      'Yahaira Mora Blanco',
      'Newton Grant Arana',
    ],
    additionalCouncillors: '+5 regidores suplentes',
    territoryLabel: 'Caribe Sur',
    districtLabel: '4 Distritos · Bribri, Cahuita, Sixaola y Telire',
  },
  matina: {
    cantonName: 'Matina',
    photo: matinaPhoto,
    photoAlt: 'Edificio de la Municipalidad de Matina',
    viceMayors: ['Yorleny Canales Delgado', 'Gerardo Valverde Sanders'],
    councilShort: 'Verónica Mayela Ugalde Torres',
    councilDetails:
      'Verónica Mayela Ugalde Torres (Pres.) / Ever Cortés Chaves (Vicepres.)',
    councillors: [
      'Verónica Mayela Ugalde Torres',
      'Ever Cortés Chaves',
      'Yaritza Isabel Reid Uba',
      'Kevin Yasdani Centeno Villafuerte',
    ],
    additionalCouncillors: '+1 regidor propietario y suplentes',
    territoryLabel: 'Corredor Agrícola',
    districtLabel: '3 Distritos · Batán, Carrandi y Matina',
  },
  guacimo: {
    cantonName: 'Guácimo',
    photo: guacimoPhoto,
    photoAlt: 'Vista aérea del cantón de Guácimo',
    viceMayors: ['Siviany Moya Peraza', 'Félix Ruiz Sánchez'],
    councilShort: 'Nelson Lobo Rodríguez',
    councilDetails:
      'Nelson Lobo Rodríguez (Pres.) / Blanca Rosa Mejía Medina (Vicepres.)',
    councillors: [
      'Nelson Lobo Rodríguez',
      'Blanca Rosa Mejía Medina',
      'Maricel Elizondo Zúñiga',
      'Saaed Calderón Hernández',
      'Kimberly Corrales Camacho',
      'Denis Alonso Li Mora',
      'Manuel Alfonso Gutiérrez Chaves',
    ],
    additionalCouncillors: '+7 regidores suplentes',
    territoryLabel: 'Caribe Central',
    districtLabel: '5 Distritos · Innovación Agropecuaria',
  },
} satisfies Record<Municipality['id'], Partial<MunicipalGovernment>>;

export function presentMunicipalities(
  records: readonly Municipality[],
): MunicipalGovernment[] {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const assetUrl = (url: string) =>
    url.startsWith('/') ? `${base}${url}` : url;
  return records.map((record) => ({
    ...record,
    ...presentation[record.id],
    photo: record.cantonFotoUrl
      ? assetUrl(record.cantonFotoUrl)
      : presentation[record.id].photo,
    slug: record.id,
    escudoUrl: assetUrl(record.escudoUrl),
    memberLocation: record.cabecera,
    memberSummary: record.description,
    territoryDescription: record.description,
    period: '2024-2028',
    mayor: {
      name: record.alcaldia.nombre,
      roleLabel: record.alcaldia.cargo,
      roleTitle: record.alcaldia.cargo,
      initials: record.alcaldia.nombre
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join(''),
      ...(record.alcaldia.fotoUrl
        ? {
            portrait: assetUrl(record.alcaldia.fotoUrl),
            portraitAlt: record.alcaldia.nombre,
          }
        : {}),
    },
    viceMayors: [
      presentation[record.id].viceMayors[0] ?? '',
      presentation[record.id].viceMayors[1] ?? '',
    ],
  }));
}
