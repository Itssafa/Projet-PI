import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('jwt_token');
    
    // Enhanced debug logs per ChatGPT's suggestion
    console.log('[AuthInterceptor] url=', req.url, ' method=', req.method, ' tokenExists=', !!token);
    
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      console.log('[AuthInterceptor] Added Authorization header ->', cloned.headers.get('Authorization'));
      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            // Token expired or invalid
            console.log('[AuthInterceptor] 401 error, clearing tokens and redirecting');
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('refresh_token');
            this.router.navigate(['/login']);
          }
          return throwError(() => error);
        })
      );
    }

    return next.handle(req);
  }
}