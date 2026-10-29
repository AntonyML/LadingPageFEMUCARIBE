import limonPhoto from '../../assets/municipalidades/canton-limon.png';
import talamancaPhoto from '../../assets/municipalidades/canton-talamanca.png';
import matinaPhoto from '../../assets/municipalidades/canton-matina.png';
import guacimoPhoto from '../../assets/municipalidades/canton-guacimo.png';
import pocociPhoto from '../../assets/municipalidades/canton-pococi.png';
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
  },
  pococi: {
    cantonName: 'Pococí',
    photo: pocociPhoto,
    photoAlt: 'Paisaje natural del cantón de Pococí',
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
  },
  siquirres: {
    cantonName: 'Siquirres',
    photo: undefined,
    photoAlt: 'Fotografía del cantón de Siquirres pendiente',
    viceMayors: [
      'Consultar directorio oficial',
      'Consultar directorio oficial',
    ],
    councilShort: 'Consultar directorio oficial',
    councilDetails: 'Consultar directorio oficial de Siquirres',
    councillors: [],
    territoryLabel: 'Caribe Central',
    districtLabel: 'Cabecera cantonal: Siquirres',
  },
  talamanca: {
    cantonName: 'Talamanca',
    photo: talamancaPhoto,
    photoAlt: 'Edificio municipal de Talamanca con banderas',
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
  },
  matina: {
    cantonName: 'Matina',
    photo: matinaPhoto,
    photoAlt: 'Edificio de la Municipalidad de Matina',
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
  },
  guacimo: {
    cantonName: 'Guácimo',
    photo: guacimoPhoto,
    photoAlt: 'Vista aérea del cantón de Guácimo',
    viceMayors: ['Siviany Moya Peraza', 'Félix Ruiz Sánchez'],
    councilShort: 'Directorio Municipal de Guácimo',
    councilDetails: 'Directorio Municipal de Guácimo',
    councillors: ['Nómina oficial Concejo Municipal de Guácimo'],
    territoryLabel: 'Sede FEMUCARIBE',
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
