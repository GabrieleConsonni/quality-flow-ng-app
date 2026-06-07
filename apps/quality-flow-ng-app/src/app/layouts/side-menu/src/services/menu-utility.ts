import { MenuItem } from '../models/menu-item.model';

export function closeAll(items: MenuItem[]) {
  items.forEach((item) => {
    item.isOpen = false;
    if (item.children) {
      closeAll(item.children);
    }
  });
}

export function openParents(items: MenuItem[], itemId: string): boolean {
  for (const item of items) {
    if (item) {
      const isItemIdMatch = item.id === itemId;
      const hasChildrenAndOpenParents = item.children && openParents(item.children, itemId);

      if (isItemIdMatch || hasChildrenAndOpenParents) {
        item.isOpen = true;
        return true;
      }
      item.isOpen = false;
    }
  }
  return false;
}

export function deselectAll(items: MenuItem[]) {
  items.forEach((item) => {
    if (item) {
      item.isSelected = false;
      if (item.children) {
        deselectAll(item.children);
      }
    }
  });
}

export function selectParents(items: MenuItem[], itemId: string): boolean {
  for (const item of items) {
    if (item) {
      if (item.id === itemId) {
        item.isSelected = true;
        return true;
      }
      if (item.children && selectParents(item.children, itemId)) {
        item.isSelected = true;
        return true;
      }
    }
  }
  return false;
}

export function findSelectedItem(items: MenuItem[] | undefined, route: string): MenuItem | undefined {
  if (!items) return undefined;

  for (const item of items) {
    if (item) {
      if ('/' + item.route === route) return item;
      if (item.children) {
        const found = findSelectedItem(item.children, route);
        if (found) return found;
      }
    }
  }

  return undefined;
}

export function searchDataRecursiveHelper(menuItems: MenuItem[], query: string): MenuItem[] {
  const results: MenuItem[] = [];
  if (menuItems && menuItems.length > 0) {
    menuItems.forEach((item: MenuItem) => {
      const hasRoute = item.route && item.route !== '';
      const hasMatchingName = item.name.toLowerCase().includes(query.toLowerCase());
      if (hasRoute && hasMatchingName) {
        results.push(item);
      }
      if (item.children && item.children.length > 0) {
        results.push(...searchDataRecursiveHelper(item.children, query));
      }
    });
  }
  return results;
}
