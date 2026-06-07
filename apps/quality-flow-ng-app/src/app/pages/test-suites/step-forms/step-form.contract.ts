/**
 * Stable contract that every step-form component must honour.
 *
 * Design decision: we use classic @Input() / @Output() / method pattern rather
 * than signal-based InputSignal/OutputEmitterRef because:
 *   - Angular does not yet expose OutputEmitterRef as a stable public type
 *     suitable for interface enforcement.
 *   - @Input() + @Output() EventEmitter is compatible with both the current
 *     DevExtreme/template-driven code style and the signal-based approach used
 *     elsewhere in this feature module.
 *   - Individual form components are free to use signals for internal state;
 *     they only need to satisfy this contract at their public boundary.
 *
 * Consumer pattern (Step Editor Dialog — F3-FE-2):
 *   const formCmp = viewContainerRef.createComponent(formType);
 *   formCmp.setInput('config', currentConfig);
 *   formCmp.instance.configChange.subscribe(cfg => { ... });
 *   if (!formCmp.instance.isValid()) { ... }
 */

import type { EventEmitter } from '@angular/core';

/**
 * Shape of the data flowing in/out of every step form.
 * Mirrors the SuiteItemCommand interface from the model layer.
 */
export interface StepFormConfig {
  /** BE CommandCode, e.g. "setVariable", "readApi", "jsonEquals" */
  commandCode: string;
  /** BE CommandType discriminator: "context" | "action" | "assert" */
  commandType: 'context' | 'action' | 'assert';
  /** Arbitrary payload object that the BE executor consumes */
  configuration_json?: Record<string, unknown>;
  /** Optional human-readable description for this command */
  description?: string;
}

/**
 * Duck-type contract every step-form component must implement.
 * Applied via `implements StepFormComponent` on the component class.
 *
 * Note: Angular does not structurally enforce interface membership at
 * compile-time for dynamically instantiated components, but declaring
 * `implements StepFormComponent` gives the TypeScript compiler enough
 * information to catch mismatches in generic registry callers.
 */
export interface StepFormComponent {
  /** Current step configuration passed by the host */
  config: StepFormConfig;
  /**
   * Emits a new StepFormConfig whenever the user edits a valid state.
   * Must NOT emit when the form is in an invalid/partially-edited state.
   */
  configChange: EventEmitter<StepFormConfig>;
  /**
   * Returns true when the form content is valid and can be saved.
   * Polled by the host before enabling the Save button.
   */
  isValid(): boolean;
}
