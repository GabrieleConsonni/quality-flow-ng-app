import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class MockAuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const mockToken = 'notARealToken';
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${mockToken}`,
        'akn-tenant-id': 'akn-dev-local',
        'akn-user-id': 'offline-user',
      },
    });
    return next.handle(cloned);
  }
}
