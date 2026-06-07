export interface MenuItem {
  id: string;

  name: string;

  function: string;

  route: string;

  groupId?: string;

  icon?: string;

  children?: MenuItem[];

  isOpen?: boolean;

  isSelected?: boolean;
}
