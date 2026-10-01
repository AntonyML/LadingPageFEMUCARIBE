import type { GovernmentBarProps } from './government-bar.types';

export function validateGovernmentBarProps({
  contentId,
  destinations,
}: GovernmentBarProps): void {
  if (!contentId || !/^[A-Za-z][\w-]*$/.test(contentId)) {
    throw new Error('GovernmentBar requires a valid contentId');
  }
  const hrefs = [
    destinations?.accessibility,
    destinations?.serviceComptroller,
    destinations?.law7600,
  ];
  for (const href of hrefs) {
    if (!href?.trim() || href === '#' || href !== href.trim()) {
      throw new Error(
        'GovernmentBar requires all three institutional destinations',
      );
    }
    const url = new URL(href, 'https://femucaribe.invalid');
    if (!['https:', 'http:'].includes(url.protocol)) {
      throw new Error(
        'GovernmentBar destinations must be HTTP links or relative paths',
      );
    }
  }
}
