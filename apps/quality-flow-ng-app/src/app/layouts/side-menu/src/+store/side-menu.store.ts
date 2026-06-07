import { Injectable, inject } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, filter, map, Observable, of, switchMap, take, tap, timer } from 'rxjs';

import { MenuItem } from '../models/menu-item.model';
import {
  closeAll,
  deselectAll,
  findSelectedItem,
  openParents,
  searchDataRecursiveHelper,
  selectParents,
} from '../services/menu-utility';
import { SideMenuRoutingService } from '../services/side-menu-routing.service';
import { SideMenuState } from './side-menu.state';

@Injectable()
export class SideMenuStore extends ComponentStore<SideMenuState> {
  private readonly _sideMenuRoutingService = inject(SideMenuRoutingService);

  private readonly _translateService: TranslateService = inject(TranslateService);

  readonly menuItems$ = this.select((state) => state.menuItems);

  readonly selectedItem$ = this.select((state) => state.selectedItem);

  readonly isLevOneOpened$ = this.select((state) => state.isLevOneOpened);

  readonly isLevTwoOpened$ = this.select((state) => state.isLevTwoOpened);

  readonly searchValue$ = this.select((state) => state.searchValue);

  readonly searchData$ = this.select((state) => state.searchData);

  readonly isAnimating$ = this.select((state) => state.isAnimating);

  readonly codFunctionSelected$ = this.select((state) => state.codFunctionSelected);

  constructor() {
    const initialState: SideMenuState = {
      menuItems: [],
      selectedItem: undefined,
      errorMessage: '',
      isLevOneOpened: false,
      isLevTwoOpened: false,
      searchValue: '',
      searchData: undefined,
      isAnimating: false,
      codFunctionSelected: '',
    };
    super(initialState);
    this.navigation();
    this.navigateToSelectedItem();
    // F1 refactor (QSM-047): only 3 active L1 entries. Configurations and
    // Datasources will be reintroduced as L1 entries when their respective
    // refactor waves ship.
    this._translateService
      .get([
        'qf.menu.home',
        'qf.menu.test-suites',
        'qf.menu.logs',
      ])
      .subscribe(() => {
        this.setMenuItems([
          {
            id: '1',
            name: this._translateService.instant('qf.menu.home') || 'Home',
            function: '',
            icon: 'fa-solid fa-home',
            route: '/home',
            children: [],
            isOpen: false,
          },
          {
            id: '2',
            name: this._translateService.instant('qf.menu.test-suites') || 'Test Suites',
            function: '',
            icon: 'fa-solid fa-list-check',
            route: '/test-suites',
            children: [],
            isOpen: false,
          },
          {
            id: '3',
            name: this._translateService.instant('qf.menu.logs') || 'Logs',
            function: '',
            icon: 'fa-solid fa-history',
            route: '/logs',
            children: [],
            isOpen: false,
          },
        ]);
      });
  }

  readonly setMenuItems = this.effect((menuItems$: Observable<MenuItem[]>) =>
    menuItems$.pipe(
      tap((menuItems: MenuItem[]) => {
        this.patchState({ menuItems });
      }),
    ),
  );

  readonly navigation = this.effect<void>(() =>
    this._sideMenuRoutingService.currentNavigation().pipe(
      switchMap((navigation) =>
        this.menuItems$.pipe(
          filter((menuItems) => (menuItems ?? []).length > 0),
          take(1),
          map((items) => {
            return findSelectedItem(items, navigation.url);
          }),
          filter(Boolean),
          map((selectedItem: MenuItem) => this.selectItem(selectedItem)),
        ),
      ),
    ),
  );

  readonly navigateToSelectedItem = this.effect<void>(() =>
    this.selectedItem$.pipe(
      tap((selectedItem: MenuItem | undefined) => {
        if (selectedItem?.route) {
          this.animate();
          this.closeMenu();
          this.patchState({ codFunctionSelected: selectedItem?.function });
        }
      }),
      switchMap((selectedItem: MenuItem | undefined) =>
        selectedItem?.route
          ? timer(500).pipe(tap(() => this._sideMenuRoutingService.navigateToMenuItem(selectedItem)))
          : [],
      ),
    ),
  );

  readonly clickItem = this.effect<MenuItem>((clickedItem$) => {
    return clickedItem$.pipe(
      tap((clickedItem: MenuItem) => {
        if (clickedItem.children?.length && clickedItem.children?.length > 0) {
          this.levTwoToggleOpen(true);
          this.levOneToggleOpen(false);
          this.openItem(clickedItem);
        } else {
          this.selectItem(clickedItem);
        }
      }),
    );
  });

  readonly search = this.effect((searchText$: Observable<string>) =>
    searchText$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((searchText) =>
        this.searchData(searchText).pipe(
          tap((results) => {
            this.setSearchResults(results);
          }),
        ),
      ),
    ),
  );

  private searchData(query: string): Observable<MenuItem[]> {
    this.setSearchValue(query);
    if (query && query !== '') {
      return this.menuItems$.pipe(
        take(1),
        switchMap((menuItems) => {
          if (!menuItems) {
            return of([]);
          }
          const results = searchDataRecursiveHelper(menuItems, query);
          return of(results);
        }),
      );
    } else {
      return of([]);
    }
  }

  readonly selectItem = this.updater((state, selectedItem: MenuItem) => {
    const newMenuItems = JSON.parse(JSON.stringify(state.menuItems));

    deselectAll(newMenuItems);

    selectParents(newMenuItems, selectedItem.id);

    return {
      ...state,
      menuItems: newMenuItems,
      selectedItem,
    };
  });

  readonly openItem = this.updater((state, selectedItem: MenuItem) => {
    const newMenuItems = JSON.parse(JSON.stringify(state.menuItems));

    closeAll(newMenuItems);

    openParents(newMenuItems, selectedItem.id);

    return {
      ...state,
      menuItems: newMenuItems,
      selectedItem,
    };
  });

  readonly animate = this.effect((trigger$) =>
    trigger$.pipe(
      tap(() => {
        this.startAnimation();
        setTimeout(() => {
          this.endAnimation();
        }, 300);
      }),
    ),
  );

  readonly startAnimation = this.updater((state) => ({
    ...state,
    isAnimating: true,
  }));

  readonly endAnimation = this.updater((state) => ({
    ...state,
    isAnimating: false,
  }));

  readonly setSearchResults = this.updater((state, results: MenuItem[]) => {
    return { ...state, searchData: results };
  });

  readonly setSearchValue = this.updater((state, searchValue: string) => {
    return { ...state, searchValue: (state.searchValue = searchValue) };
  });

  readonly levOneToggleOpen = this.updater((state, opened: boolean) => {
    return { ...state, isLevOneOpened: (state.isLevOneOpened = opened) };
  });

  readonly levTwoToggleOpen = this.updater((state, opened: boolean) => {
    return { ...state, isLevTwoOpened: (state.isLevTwoOpened = opened) };
  });

  readonly closeMenu = this.updater((state) => {
    return {
      ...state,
      menuItems: state.menuItems?.map((item) => {
        return { ...item, isOpen: false };
      }),
      isLevOneOpened: false,
      isLevTwoOpened: false,
    };
  });
}
