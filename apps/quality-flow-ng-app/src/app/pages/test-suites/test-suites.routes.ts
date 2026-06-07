import type { Routes } from '@angular/router';

import { provideStepForms } from './step-forms/step-form.registry';

/**
 * Step-form providers are registered at the root of the test-suites lazy
 * chunk via a pathless parent route, so that all child routes (suites-list,
 * suite-editor, test-editor) share the same injector subtree and can inject
 * STEP_FORM_REGISTRY without duplicating providers per route.
 *
 * The pathless parent acts as a "module boundary" — Angular creates an
 * EnvironmentInjector for it that is shared by all its children.
 */
export const testSuitesRoutes: Routes = [
  {
    path: '',
    providers: provideStepForms(),
    children: [
      {
        path: '',
        title: 'Test Suites',
        loadComponent: () =>
          import('./suites-list/suites-list.component').then(
            (m) => m.SuitesListComponent,
          ),
      },
      {
        path: ':suiteId',
        title: 'Suite Editor',
        loadComponent: () =>
          import('./suite-editor/suite-editor.component').then(
            (m) => m.SuiteEditorComponent,
          ),
      },
      {
        path: ':suiteId/tests/new',
        title: 'New Test',
        loadComponent: () =>
          import('./test-editor/test-editor.component').then(
            (m) => m.TestEditorComponent,
          ),
      },
      {
        path: ':suiteId/tests/:suiteItemId',
        title: 'Edit Test',
        loadComponent: () =>
          import('./test-editor/test-editor.component').then(
            (m) => m.TestEditorComponent,
          ),
      },
    ],
  },
];
