/**
 * DI token + provider factory for the step-form registry.
 *
 * The registry maps a CommandCode string to the Angular component class
 * that should be used to edit that kind of step.
 *
 * Design decision — DI scope:
 *   The registry is provided at the feature-route level via
 *   `provideStepForms()` added to the test-suites child-routes providers
 *   array (test-suites.routes.ts). This means the registry is scoped to
 *   the test-suites lazy chunk and is tree-shaken out of the main bundle.
 *   An alternative would be app-level (app.config.ts) but that would
 *   eagerly import all form component classes into the root injector tree,
 *   defeating lazy loading. Feature-route scope is the right choice here.
 *
 * Consumer pattern (Step Editor Dialog — F3-FE-2):
 *   const registry = inject(STEP_FORM_REGISTRY);
 *   const formType = registry.get(command.command_code) ?? RawJsonStepFormComponent;
 *   const ref = viewContainerRef.createComponent(formType);
 */

import { InjectionToken, type Provider, type Type } from '@angular/core';

import { RawJsonStepFormComponent } from './raw-json/raw-json-step-form.component';

/** Maps CommandCode → component class to use as the step-form editor */
export type StepFormRegistry = Map<string, Type<unknown>>;

export const STEP_FORM_REGISTRY = new InjectionToken<StepFormRegistry>('STEP_FORM_REGISTRY');

/**
 * Returns the providers array to register with the feature route or module.
 *
 * Currently only RawJsonStepFormComponent is registered as the universal
 * fallback. F3-FE-3 will add specific form components (setVariable, sleep, …)
 * by calling this factory with an extended map or by patching the token value.
 */
export function provideStepForms(): Provider[] {
  return [
    {
      provide: STEP_FORM_REGISTRY,
      useFactory: (): StepFormRegistry => {
        const map = new Map<string, Type<unknown>>();
        // Fallback: RawJsonStepFormComponent handles any CommandCode not
        // covered by a dedicated form. F3-FE-3 will add entries here.
        // Example when adding a specific form:
        //   map.set('setVariable', SetVariableStepFormComponent);
        //   map.set('sleep', SleepStepFormComponent);
        return map;
      },
    },
  ];
}

/** Re-export the fallback so consumers can reference it without a direct path import */
export { RawJsonStepFormComponent };
