import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { SideMenuStore } from '../../+store/side-menu.store';
import { MenuItem } from '../../models/menu-item.model';

@Component({
  selector: 'qf-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultComponent {
  readonly _sideMenuStore = inject(SideMenuStore);
  readonly searchData$ = this._sideMenuStore.searchData$;

  selectItem(e: MenuItem) {
    this._sideMenuStore.selectItem(e);
    this._sideMenuStore.search('');
  }
}
