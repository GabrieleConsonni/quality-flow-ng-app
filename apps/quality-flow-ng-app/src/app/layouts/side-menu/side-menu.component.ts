import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { navigation } from '../../app-navigation';

@Component({
  selector: 'qf-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideMenuComponent {
  private readonly _router = inject(Router);
  readonly menuItems = navigation;
  collapsed = true;

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  navigate(path: string) {
    this._router.navigateByUrl(path);
  }

  isActive(path: string): boolean {
    return this._router.url.startsWith(path);
  }
}
