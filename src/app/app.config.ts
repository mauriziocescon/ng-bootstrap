import {
  ApplicationConfig,
  inject,
  isDevMode,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { provideTransloco } from '@jsverse/transloco';

import { AppLanguage } from './core/app-language';
import { TranslocoHttpLoader } from './core/transloco-loader';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true, runCoalescing: true }),
    provideHttpClient(withFetch()),
    provideRouter(routes),
    provideTransloco({
      config: {
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    {
      provide: LOCALE_ID,
      useFactory: () => inject(AppLanguage).getLanguageId(),
    },
  ],
};
