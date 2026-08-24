import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
	const authService = inject(AuthService);
	const router = inject(Router);
	const platformId = inject(PLATFORM_ID);

	// On the server, always allow – the client will re-evaluate after hydration
	if (isPlatformServer(platformId)) {
		return true;
	}

	// Wait for the initial auth check to complete
	await authService.waitForReady();

	if (authService.isAuthenticated()) {
		return true;
	}

	return router.createUrlTree(['/login']);
};
