import { Routes } from '@angular/router';
import { authGuard } from './auth-guards/auth.guard';

export const appRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        title: 'Home',
        loadComponent: () =>
          import('./pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'test-suites',
        title: 'Test Suites',
        loadChildren: () =>
          import('./pages/test-suites/test-suites.routes').then(
            (m) => m.testSuitesRoutes,
          ),
      },
      {
        path: 'logs',
        title: 'Logs',
        loadComponent: () =>
          import('./pages/placeholder/placeholder.component').then(
            (m) => m.PlaceholderComponent,
          ),
        data: { pageName: 'Logs' },
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'home',
      },
    ],
  },
];
