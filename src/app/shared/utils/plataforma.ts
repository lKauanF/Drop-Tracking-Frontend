// util: descobre se está no browser (e não no SSR)
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export function estaNoBrowser(): boolean {
  const platformId = inject(PLATFORM_ID);
  return isPlatformBrowser(platformId);
}