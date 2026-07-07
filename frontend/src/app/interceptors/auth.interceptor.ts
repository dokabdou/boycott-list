import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  /* console.log(
    `[Interceptor] ${req.method} ${req.url} → token:`,
    token ? token.substring(0, 10) + '...' : 'null',
  ); */

  if (token && req.url.startsWith('/api/admin')) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
