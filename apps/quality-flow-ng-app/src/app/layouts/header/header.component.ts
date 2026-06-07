import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'qf-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class HeaderComponent {
  private readonly _router = inject(Router);
  readonly viewTitle$: Observable<string> = this._router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map((event) => event.url),
    startWith(this._router.url),
    map(() => {
      const currentRoute = this.getCurrentRoute(this._router.routerState.root);
      return currentRoute.snapshot.title ?? '';
    }),
  );

  private getCurrentRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}
