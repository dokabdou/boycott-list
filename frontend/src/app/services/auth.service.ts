import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  loggedIn$: Observable<boolean> = this.loggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  private hasToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem(this.TOKEN_KEY);
    }
    return false;
  }

  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>('/api/auth/login', { username, password }).pipe(
      tap((res) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
        }
        this.loggedInSubject.next(true); // notify subscribers
      }),
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.loggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.value; // synchronous, can still be used in guards
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }
}
