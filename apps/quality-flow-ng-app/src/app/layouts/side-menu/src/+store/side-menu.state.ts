import { MenuItem } from '../models/menu-item.model';

export interface SideMenuState {
  menuItems: MenuItem[] | undefined;
  selectedItem: MenuItem | undefined;
  errorMessage: string;
  isLevOneOpened: boolean;
  isLevTwoOpened: boolean;
  searchValue: string;
  searchData: MenuItem[] | undefined;
  isAnimating: boolean;
  codFunctionSelected: string;
}
