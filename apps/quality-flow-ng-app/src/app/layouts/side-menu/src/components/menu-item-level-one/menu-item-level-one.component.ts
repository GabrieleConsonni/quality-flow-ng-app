import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';

import { SideMenuStore } from '../../+store/side-menu.store';
import { MenuItem } from '../../models/menu-item.model';
import { MenuItemLevelTwoComponent } from '../menu-item-level-two/menu-item-level-two.component';

@Component({
  selector: 'qf-menu-item-level-one',
  standalone: true,
  imports: [CommonModule, MenuItemLevelTwoComponent, DxScrollViewModule],
  templateUrl: './menu-item-level-one.component.html',
  styleUrl: './menu-item-level-one.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemLevelOneComponent {
  private readonly _sideMenuStore = inject(SideMenuStore);
  readonly selectedItem$ = this._sideMenuStore.selectedItem$;

  @Input() item: MenuItem = {} as MenuItem;

  get hasChildren(): boolean {
    return (this.item?.children ?? []).length > 0;
  }

  selectItem(e: MenuItem) {
    this._sideMenuStore.clickItem(e);
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        this.handleEnterOrSpace(event);
        break;
      case 'ArrowRight':
        this.handleArrowRight();
        break;
      case 'ArrowLeft':
        this.handleArrowLeft();
        break;
      default:
        break;
    }
  }

  private handleEnterOrSpace(event: KeyboardEvent): void {
    event.preventDefault();
    this.selectItem(this.item);
  }

  private handleArrowRight(): void {
    const hasClosedChildren = !!this.item?.children && this.item.children.length > 0 && !this.item?.isOpen;
    if (hasClosedChildren) {
      this.selectItem(this.item);
    }
  }

  private handleArrowLeft(): void {
    if (this.item?.isOpen) {
      this.selectItem(this.item);
    }
  }
}
