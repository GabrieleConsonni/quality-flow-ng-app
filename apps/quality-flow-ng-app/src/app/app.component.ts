import { AppInfoService } from '@quality-flow/infrastructure-services/app-info.service';
import { ScreenService } from '@quality-flow/infrastructure-services/screen.service';
import { AppLayoutComponent } from '@quality-flow/layouts/app-layout/app-layout.component';
import { ScreenLockStore } from '@quality-flow/screen-lock/+store/screen-lock.store';
import { ScreenLockComponent } from '@quality-flow/screen-lock/screen-lock.component';
import { UserStore } from '@quality-flow/user/user.store';
import { Component, HostBinding, inject, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { filter } from 'rxjs';

@Component({
  selector: 'qf-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [AppLayoutComponent, ScreenLockComponent],
})
export class AppComponent implements OnInit {
  @HostBinding('class') get getClass() {
    const sizeClassName = Object.keys(this.screen.sizes)
      .filter((cl) => this.screen.sizes[cl])
      .join(' ');
    return `${sizeClassName} app`;
  }

  private readonly authService: OAuthService = inject(OAuthService);
  private readonly screen: ScreenService = inject(ScreenService);
  public appInfo: AppInfoService = inject(AppInfoService);
  private readonly _router = inject(Router);
  private readonly _screenLockStore = inject(ScreenLockStore);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly _userStore = inject(UserStore);

  constructor() {
    this._router.events
      .pipe(filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this._screenLockStore.lockScreen();
        } else if (event instanceof NavigationEnd) {
          this._screenLockStore.unlockScreen();
        }
      });
  }

  ngOnInit() {
    this.translate.setDefaultLang('en');
    const storedLang = this._userStore.language();
    if (storedLang) {
      this.translate.use(storedLang);
    } else {
      const browserLang = this.translate.getBrowserLang();
      const defaultLang = browserLang?.match(/en|it/) ? browserLang : 'en';
      this.translate.use(defaultLang);
      this._userStore.setLanguage(defaultLang);
    }
  }

  loggedIn() {
    return this.authService.hasValidAccessToken();
  }
}
