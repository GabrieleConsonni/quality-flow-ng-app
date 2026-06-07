import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';

import { SideMenuStore } from '../../+store/side-menu.store';
import { MenuItem } from '../../models/menu-item.model';

@Component({
  selector: 'qf-menu-item-level-three',
  standalone: true,
  imports: [],
  templateUrl: './menu-item-level-three.component.html',
  styleUrl: './menu-item-level-three.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemLevelThreeComponent {
  private readonly _sideMenuStore = inject(SideMenuStore);
  readonly selectedItem$ = this._sideMenuStore.selectedItem$;

  @Input() item: MenuItem = {} as MenuItem;

  selectItem(e: MenuItem) {
    this._sideMenuStore.selectItem(e);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectItem(this.item);
    }
  }
}
