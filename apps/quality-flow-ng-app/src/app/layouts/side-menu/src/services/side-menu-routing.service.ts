import { Injectable } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';

import { MenuItem } from '../models/menu-item.model';

@Injectable()
export abstract class SideMenuRoutingService {
  abstract navigateToMenuItem(menuItem: MenuItem): void;
  abstract currentNavigation(): Observable<NavigationEnd>;
}
