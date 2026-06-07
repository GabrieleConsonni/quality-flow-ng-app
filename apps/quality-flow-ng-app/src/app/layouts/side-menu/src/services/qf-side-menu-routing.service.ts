import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Observable } from 'rxjs';

import { MenuItem } from '../models/menu-item.model';
import { SideMenuRoutingService } from './side-menu-routing.service';

@Injectable()
export class QfSideMenuRoutingService extends SideMenuRoutingService {
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);

  override navigateToMenuItem(menuItem: MenuItem): void {
    if (menuItem.route) {
      const isAbsolutePath = menuItem.route.startsWith('/');
      const fullRoute = isAbsolutePath ? menuItem.route.substring(1).split('/') : menuItem.route.split('/');
      this._router.navigate(fullRoute, { relativeTo: this._activatedRoute });
    }
  }

  override currentNavigation(): Observable<NavigationEnd> {
    return this._router.events.pipe(filter((event) => event instanceof NavigationEnd)) as Observable<NavigationEnd>;
  }
}
