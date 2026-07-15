import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
// import { authInterceptor } from './interceptors/auth.interceptor';
import { routes } from './app.routes';
import { serverRoutes } from './app.routes.server';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient( withFetch()), // enables HttpClient
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};
