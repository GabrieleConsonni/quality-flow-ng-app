import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { alert } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { SKIP_GLOBAL_404_ALERT_HEADER, SKIP_GLOBAL_ERROR_HANDLING_HEADER } from './error-handling.constants';

interface BodyErrorMessage {
  errorMessage: string;
}

interface BodyEntityError {
  field?: string;
  errorMessage: string;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingInterceptor implements HttpInterceptor {
  private readonly _translateService: TranslateService = inject(TranslateService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (!this.shouldSkipErrorHandling(req, err)) {
          this.handleError(err);
        }
        return throwError(() => err);
      }),
    );
  }

  private shouldSkipErrorHandling(req: HttpRequest<any>, err: HttpErrorResponse): boolean {
    if (req.headers.get(SKIP_GLOBAL_ERROR_HANDLING_HEADER) === 'true') {
      return true;
    }
    return err.status === 404 && req.headers.get(SKIP_GLOBAL_404_ALERT_HEADER) === 'true';
  }

  handleError(err: HttpErrorResponse): void {
    switch (err.status) {
      case 400:
        this.showBodyErrorMessage(err);
        break;
      case 404:
        this.showAlert(err);
        break;
      case 422:
        this.showBodyEntityError(err);
        break;
      case 500:
        this.showBodyErrorMessage(err);
        break;
      case 504:
        this.handleTimeOutError();
        break;
      default:
        this.showAlert(err);
        break;
    }
  }

  handleTimeOutError(): void {
    notify(
      {
        message: this._translateService.instant('error.timeout.message'),
        type: 'error',
        displayTime: 15000,
      },
      { position: 'bottom center', direction: 'up-push' },
    );
  }

  showAlert(err: HttpErrorResponse): void {
    const title: string = this._translateService.instant('error.generic');
    alert(err.error, title);
  }

  showBodyErrorMessage(err: HttpErrorResponse): void {
    const title: string = this._translateService.instant('error.generic');
    const bodyErrorMessage: BodyErrorMessage = err.error as BodyErrorMessage;
    alert(bodyErrorMessage?.errorMessage, title);
  }

  showBodyEntityError(err: HttpErrorResponse): void {
    const bodyEntityError: BodyEntityError[] = err.error as BodyEntityError[];
    const messages: string[] = bodyEntityError.map((entityError: BodyEntityError) =>
      entityError.field ? `${entityError.field}: ${entityError.errorMessage}` : `${entityError.errorMessage}`,
    );
    messages.forEach((message: string) => {
      notify(message, 'error', 5000);
    });
  }
}
