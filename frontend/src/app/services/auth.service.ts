import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isLoggedInSignal = signal(false);
  readonly isLoggedIn = this.isLoggedInSignal.asReadonly();

  constructor(private http: HttpClient) {
    // On app start, check if the JWT cookie is still valid
    this.checkLoginStatus();
  }

  /**
   * Called automatically on service creation.
   * Asks the backend if the current request is authenticated.
   */
  private checkLoginStatus(): void {
    this.http.get<{ username: string }>('/api/auth/me').subscribe({
      next: () => this.isLoggedInSignal.set(true),
      error: () => this.isLoggedInSignal.set(false),
    });
  }

  /**
   * Login. The backend sets the HttpOnly cookie.
   */
  login(username: string, password: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>('/api/auth/login', { username, password })
      .pipe(tap(() => this.isLoggedInSignal.set(true)));
  }

  /**
   * Logout. The backend clears the cookie.
   */
  logout(): Observable<any> {
    return this.http.post('/api/auth/logout', {}).pipe(tap(() => this.isLoggedInSignal.set(false)));
  }
}
