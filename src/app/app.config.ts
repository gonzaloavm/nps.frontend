import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { activityInterceptor } from './core/interceptors/activity.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ConfigService } from './core/configuration/config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(NgxSpinnerModule),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, activityInterceptor])
    ),
    provideAppInitializer(() => {
        const configService = inject(ConfigService);
        return configService.loadConfig();
    }),
  ]
};
