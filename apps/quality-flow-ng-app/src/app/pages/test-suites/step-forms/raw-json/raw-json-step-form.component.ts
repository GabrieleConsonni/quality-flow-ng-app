import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  signal,
} from '@angular/core';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';

import type { StepFormComponent, StepFormConfig } from '../step-form.contract';

/**
 * Fallback step-form component for any CommandCode not covered by a
 * dedicated form component.
 *
 * Shows a monospace textarea containing the raw `configuration_json`
 * serialised as pretty-printed JSON. Emits `configChange` only when the
 * textarea content is valid JSON; otherwise shows an inline error and keeps
 * the previous valid state.
 *
 * Implements the StepFormComponent contract (step-form.contract.ts).
 */
@Component({
  selector: 'qf-raw-json-step-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DxTextAreaModule],
  templateUrl: './raw-json-step-form.component.html',
  styleUrls: ['./raw-json-step-form.component.scss'],
})
export class RawJsonStepFormComponent implements StepFormComponent, OnChanges {
  @Input() config: StepFormConfig = {
    commandCode: '',
    commandType: 'action',
  };

  @Output() readonly configChange = new EventEmitter<StepFormConfig>();

  protected readonly textValue = signal('');
  protected readonly parseError = signal<string | null>(null);

  ngOnChanges(): void {
    const json = this.config.configuration_json ?? {};
    try {
      this.textValue.set(JSON.stringify(json, null, 2));
    } catch {
      this.textValue.set('{}');
    }
    // Re-evaluate validity when config is replaced from outside.
    this.parseError.set(null);
  }

  protected onTextChanged(value: string): void {
    const raw = (value ?? '').trim();
    if (!raw) {
      this.parseError.set(null);
      this.emitChange({});
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        this.parseError.set('configuration_json must be a JSON object ({ … }).');
        return;
      }
      this.parseError.set(null);
      this.emitChange(parsed);
    } catch (err) {
      this.parseError.set((err as Error).message);
      // Do NOT emit when JSON is invalid.
    }
  }

  isValid(): boolean {
    return this.parseError() === null;
  }

  private emitChange(configuration_json: Record<string, unknown>): void {
    this.configChange.emit({
      ...this.config,
      configuration_json,
    });
  }
}
