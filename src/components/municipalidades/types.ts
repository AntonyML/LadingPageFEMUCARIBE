import type { ImageMetadata } from 'astro';
import type { Municipality } from '../../lib/municipalities-repository';

export interface MunicipalGovernment extends Municipality {
  slug: string;
  cantonName: string;
  memberLocation: string;
  memberSummary: string;
  photo?: ImageMetadata;
  photoAlt: string;
  period: string;
  mayor: {
    name: string;
    roleLabel: string;
    roleTitle: string;
    initials: string;
    portrait?: string;
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
