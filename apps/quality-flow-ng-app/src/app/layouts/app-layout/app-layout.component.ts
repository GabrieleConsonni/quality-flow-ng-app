import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from '../header/header.component';
import { SideMenuComponent } from '../side-menu/src/components/side-menu/side-menu.component';

@Component({
  selector: 'qf-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
  standalone: true,
  imports: [RouterOutlet, SideMenuComponent, HeaderComponent],
})
export class AppLayoutComponent {}
