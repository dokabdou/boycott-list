import {
	ApplicationConfig,
	provideAppInitializer,
	provideZonelessChangeDetection,
	inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import {
	provideHttpClient,
	withInterceptors,
	withFetch,
	HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { routes } from './app.routes';
import { serverRoutes } from './app.routes.server';


export const appConfig: ApplicationConfig = {
	providers: [
		provideZonelessChangeDetection(),
		provideRouter(routes),
		provideHttpClient(withFetch()),
		{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
		provideServerRendering(withRoutes(serverRoutes)),
		provideAppInitializer(() => {
			const authService = inject(AuthService);
			return authService.init();
		}),
	],
};
