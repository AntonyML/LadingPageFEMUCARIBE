import type { ImageMetadata } from 'astro';

export interface MunicipalGovernment {
  slug: string;
  name: string;
  memberLocation: string;
  memberSummary: string;
  photo: ImageMetadata;
  photoAlt: string;
  period: string;
  mayor: {
    name: string;
    roleLabel: string;
    roleTitle: string;
    initials: string;
    portrait?: ImageMetadata;
    portraitAlt?: string;
  };
  viceMayors: readonly [string, string];
  councilShort: string;
  councilDetails: string;
  councillors: readonly string[];
  additionalCouncillors?: string;
  territoryLabel: string;
  districtLabel: string;
  territoryDescription: string;
}
