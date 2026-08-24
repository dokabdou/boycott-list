import { Injectable, signal, inject, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private isLoggedInSignal = signal(false);
	readonly isLoggedIn = this.isLoggedInSignal.asReadonly();
	private readonly tokenService = inject(TokenService);

	private readyResolve!: () => void;
	private readyPromise = new Promise<void>((resolve) => (this.readyResolve = resolve));
	private initialized = false;

	constructor(
		private http: HttpClient,
		@Inject(PLATFORM_ID) private platformId: Object,
	) {}

	/** Called by app initializer. */
	async init(): Promise<void> {
		if (isPlatformBrowser(this.platformId)) {
			await this.checkLoginStatus();
		}
		this.initialized = true;
		this.readyResolve();
	}

	private checkLoginStatus(): Promise<void> {
		return new Promise((resolve) => {
			this.http.get<{ username: string }>('/api/auth/me').subscribe({
				next: () => {
					this.isLoggedInSignal.set(true);
					resolve();
				},
				error: () => {
					this.isLoggedInSignal.set(false);
					resolve();
				},
			});
		});
	}

	/** Wait until init() has completed. */
	waitForReady(): Promise<void> {
		return this.readyPromise;
	}

	isAuthenticated(): boolean {
		return this.isLoggedInSignal();
	}

	getToken(): string | null {
		return this.tokenService.getToken();
	}

	login(username: string, password: string): Observable<{ message: string }> {
		return this.http
			.post<{ message: string }>('/api/auth/login', { username, password })
			.pipe(tap(() => this.isLoggedInSignal.set(true)));
	}

	logout(): Observable<any> {
		return this.http
			.post('/api/auth/logout', {})
			.pipe(tap(() => this.isLoggedInSignal.set(false)));
	}
}
