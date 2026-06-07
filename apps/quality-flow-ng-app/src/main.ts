import { provideTiaraDesignSystem } from '@akeron-ng/tiara-ng';
import { ErrorHandlingInterceptor } from '@quality-flow/error-handling-interceptor/error-handling.interceptor';
import { AppInfoService } from '@quality-flow/infrastructure-services/app-info.service';
import { AuthService } from '@quality-flow/infrastructure-services/auth.service';
import { ScreenService } from '@quality-flow/infrastructure-services/screen.service';
import { initializeAuth } from '@quality-flow/initializers/auth-initializer';
import { MockOAuthService } from '@quality-flow/initializers/mock-oauth.service';
import { MockAuthInterceptor } from '@quality-flow/mock-auth-interceptor/mock-auth.interceptor';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateLoader } from '@ngx-translate/core';
import { OAuthService, provideOAuthClient } from 'angular-oauth2-oidc';
import themes from 'devextreme/ui/themes';
import { from, Observable, of } from 'rxjs';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

themes.initialized(() => {
  fetch('./assets/i18n/en.json')
    .then((r) => r.json())
    .then((enTranslations) => {
      bootstrapApplication(AppComponent, {
        providers: [
          ...(appConfig.providers ?? []),
          {
            provide: TranslateLoader,
            useValue: {
              getTranslation(lang: string): Observable<unknown> {
                if (lang === 'en') return of(enTranslations);
                return from(fetch(`./assets/i18n/${lang}.json`).then((r) => r.json()));
              },
            },
          },
          provideAnimations(),
          provideTiaraDesignSystem(),
          provideZonelessChangeDetection(),
          AuthService,
          ScreenService,
          AppInfoService,
          provideHttpClient(withInterceptorsFromDi()),
          ...(environment.mockAuth
            ? [
                { provide: OAuthService, useClass: MockOAuthService },
                {
                  provide: HTTP_INTERCEPTORS,
                  useClass: MockAuthInterceptor,
                  multi: true,
                },
              ]
            : [
                provideOAuthClient({
                  resourceServer: {
                    allowedUrls: ['api'],
                    sendAccessToken: true,
                  },
                }),
              ]),
          provideAppInitializer(() => {
            const http = inject(HttpClient);
            const oauthService = inject(OAuthService);
            return initializeAuth(oauthService, http);
          }),
          {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorHandlingInterceptor,
            multi: true,
          },
        ],
      }).catch((err) => console.error(err));
    });
});
