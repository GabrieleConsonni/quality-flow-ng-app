import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject, OnInit } from '@angular/core';
import { ValueChangedEvent } from 'devextreme/ui/text_box';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTreeViewModule } from 'devextreme-angular/ui/tree-view';
import { map } from 'rxjs';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';

import { SideMenuStore } from '../../+store/side-menu.store';
import { LOGO_WHITE_BASE64 } from '../../tokens/logo.tokens';
import { MenuItemLevelOneComponent } from '../menu-item-level-one/menu-item-level-one.component';
import { SearchResultComponent } from '../search-result/search-result.component';

@Component({
  selector: 'qf-navigation-panel-ui',
  standalone: true,
  imports: [
    CommonModule,
    DxScrollViewModule,
    DxTreeViewModule,
    DxTextBoxModule,
    MenuItemLevelOneComponent,
    SearchResultComponent,
  ],
  templateUrl: './navigation-panel-ui.component.html',
  styleUrl: './navigation-panel-ui.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationPanelUiComponent implements OnInit {
  private readonly _sideMenuStore = inject(SideMenuStore);
  readonly isLevOneOpened$ = this._sideMenuStore.isLevOneOpened$;
  readonly isLevTwoOpened$ = this._sideMenuStore.isLevTwoOpened$;
  readonly menuItems$ = this._sideMenuStore.menuItems$;
  readonly searchValue$ = this._sideMenuStore.searchValue$;
  readonly searchData$ = this._sideMenuStore.searchData$;
  readonly isMenuOpened$ = combineLatest([this.isLevOneOpened$, this.isLevTwoOpened$]).pipe(
    map(([levOne, levTwo]) => levOne || levTwo),
  );
  readonly canTriggerMouseEnter$ = combineLatest([this.isMenuOpened$, this._sideMenuStore.isAnimating$]).pipe(
    map(([menuOpened, isAnimating]) => !menuOpened && !isAnimating),
  );

  whiteLogo: string = inject(LOGO_WHITE_BASE64);
  canTriggerMouseEnter: boolean = true;

  get logo(): string | undefined {
    return this.whiteLogo;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this._sideMenuStore.closeMenu();
  }

  ngOnInit(): void {
    this.canTriggerMouseEnter$.subscribe((canTriggerMouseEnter) => {
      this.canTriggerMouseEnter = canTriggerMouseEnter;
    });
  }

  openMenu() {
    if (this.canTriggerMouseEnter) {
      this._sideMenuStore.levOneToggleOpen(true);
    }
  }

  closeMenu() {
    this._sideMenuStore.search('');
    this._sideMenuStore.closeMenu();
  }

  searchValueChanged(e: ValueChangedEvent) {
    this._sideMenuStore.search(e.value);
    this._sideMenuStore.levTwoToggleOpen(false);
  }
}
