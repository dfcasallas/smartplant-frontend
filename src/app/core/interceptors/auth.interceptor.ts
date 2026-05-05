import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();
  const isApiRequest = request.url.startsWith('/api');

  const authRequest = isApiRequest && token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authRequest).pipe(
    catchError((error: unknown) => {
      if (isApiRequest && error instanceof HttpErrorResponse && error.status === 401) {
        auth.logout();
        router.navigateByUrl('/login');
      }

      return throwError(() => error);
    }),
  );
};
