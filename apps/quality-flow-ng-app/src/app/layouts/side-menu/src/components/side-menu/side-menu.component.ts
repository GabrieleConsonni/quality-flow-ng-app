import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { Observable } from 'rxjs';

import { SideMenuStore } from '../../+store/side-menu.store';
import { MenuItem } from '../../models/menu-item.model';
import { QfSideMenuRoutingService } from '../../services/qf-side-menu-routing.service';
import { SideMenuRoutingService } from '../../services/side-menu-routing.service';
import { BACKGROUND_LOGO_BASE64, LOGO_BASE64, LOGO_WHITE_BASE64 } from '../../tokens/logo.tokens';
import { NavigationPanelUiComponent } from '../navigation-panel-ui/navigation-panel-ui.component';

@Component({
  selector: 'qf-side-menu',
  templateUrl: './side-menu.component.html',
  standalone: true,
  imports: [CommonModule, DxLoadPanelModule, NavigationPanelUiComponent],
  providers: [
    SideMenuStore,
    { provide: SideMenuRoutingService, useClass: QfSideMenuRoutingService },
    { provide: LOGO_BASE64, useValue: 'assets/logos/logo.png' },
    { provide: LOGO_WHITE_BASE64, useValue: 'assets/logos/logo-white.png' },
    { provide: BACKGROUND_LOGO_BASE64, useValue: 'assets/logos/background-logo.png' },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideMenuComponent {
  private readonly _sideMenuStore = inject(SideMenuStore);

  readonly menuItems$: Observable<MenuItem[] | undefined> = this._sideMenuStore.menuItems$;
}
