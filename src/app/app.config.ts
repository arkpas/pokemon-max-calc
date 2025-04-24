import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ImportServiceService } from './services/import-service/import-service.service';
import { provideHttpClient } from '@angular/common/http';

async function initialize() {
  const importService = inject(ImportServiceService);
  await importService.initialize();
}

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAppInitializer(initialize), provideHttpClient()]
};
