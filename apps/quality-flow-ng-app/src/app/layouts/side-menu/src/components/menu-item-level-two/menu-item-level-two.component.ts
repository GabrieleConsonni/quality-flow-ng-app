import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';

import { SideMenuStore } from '../../+store/side-menu.store';
import { MenuItem } from '../../models/menu-item.model';
import { MenuItemLevelThreeComponent } from '../menu-item-level-three/menu-item-level-three.component';

@Component({
  selector: 'qf-menu-item-level-two',
  standalone: true,
  imports: [CommonModule, MenuItemLevelThreeComponent, DxScrollViewModule],
  templateUrl: './menu-item-level-two.component.html',
  styleUrl: './menu-item-level-two.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class MenuItemLevelTwoComponent {
  @Input() item: MenuItem = {} as MenuItem;
  private readonly _sideMenuStore = inject(SideMenuStore);
  readonly selectedItem$ = this._sideMenuStore.selectedItem$;
  readonly isLevTwoOpened$ = this._sideMenuStore.isLevTwoOpened$;
  readonly isAnimating$ = this._sideMenuStore.isAnimating$;
}
