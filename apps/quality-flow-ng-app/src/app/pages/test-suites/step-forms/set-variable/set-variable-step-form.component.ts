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
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';

import type { StepFormComponent, StepFormConfig } from '../step-form.contract';

type ValueType = 'value' | 'json' | 'function';
type ContextType = 'runEnvelope' | 'global' | 'local' | 'result';

const VALUE_TYPE_ITEMS: { value: ValueType; label: string }[] = [
  { value: 'value', label: 'value — plain string / number' },
  { value: 'json', label: 'json — JSON object / array' },
  { value: 'function', label: 'function — built-in resolver' },
];

const CONTEXT_ITEMS: { value: ContextType; label: string }[] = [
  { value: 'local', label: 'local' },
  { value: 'global', label: 'global' },
  { value: 'result', label: 'result' },
  { value: 'runEnvelope', label: 'runEnvelope' },
];

const FUNCTION_ITEMS = ['now', 'today'];

/**
 * Step-form for the "setVariable" CommandCode.
 *
 * Fields:
 *  - name (required) — variable name within the chosen context
 *  - context (required, default 'local') — scope: local | global | result | runEnvelope
 *  - valueType (required, default 'value') — how the value field is interpreted
 *  - value (text-box) — shown when valueType = 'value'
 *  - value as JSON text-area — shown when valueType = 'json'
 *  - functionName (select-box: now | today) — shown when valueType = 'function'
 *  - definitionId (text-box, optional) — auto-filled from name if left empty
 */
@Component({
  selector: 'qf-set-variable-step-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DxTextBoxModule, DxTextAreaModule, DxSelectBoxModule],
  templateUrl: './set-variable-step-form.component.html',
  styleUrls: ['./set-variable-step-form.component.scss'],
})
export class SetVariableStepFormComponent implements StepFormComponent, OnChanges {
  @Input() config: StepFormConfig = {
    commandCode: 'setVariable',
    commandType: 'context',
  };

  @Output() readonly configChange = new EventEmitter<StepFormConfig>();

  protected readonly nameValue = signal('');
  protected readonly contextValue = signal<ContextType>('local');
  protected readonly valueTypeValue = signal<ValueType>('value');
  protected readonly plainValue = signal('');
  protected readonly jsonValue = signal('');
  protected readonly functionNameValue = signal<string>('now');
  protected readonly definitionIdValue = signal('');
  protected readonly jsonParseError = signal<string | null>(null);

  protected readonly valueTypeItems = VALUE_TYPE_ITEMS;
  protected readonly contextItems = CONTEXT_ITEMS;
  protected readonly functionItems = FUNCTION_ITEMS;

  ngOnChanges(): void {
    const cfg = this.config.configuration_json ?? {};
    this.nameValue.set(String(cfg['name'] ?? ''));
    this.contextValue.set((cfg['context'] as ContextType) ?? 'local');
    const vt = (cfg['valueType'] as ValueType) ?? 'value';
    this.valueTypeValue.set(vt);
    this.definitionIdValue.set(String(cfg['definitionId'] ?? ''));
    this.functionNameValue.set(String(cfg['functionName'] ?? 'now'));
    this.jsonParseError.set(null);

    if (vt === 'json') {
      const raw = cfg['value'];
      try {
        this.jsonValue.set(raw != null ? JSON.stringify(raw, null, 2) : '');
      } catch {
        this.jsonValue.set('');
      }
      this.plainValue.set('');
    } else {
      this.plainValue.set(cfg['value'] != null ? String(cfg['value']) : '');
      this.jsonValue.set('');
    }
  }

  isValid(): boolean {
    const name = this.nameValue().trim();
    if (!name) {
      return false;
    }
    const vt = this.valueTypeValue();
    if (vt === 'function') {
      return FUNCTION_ITEMS.includes(this.functionNameValue());
    }
    if (vt === 'json') {
      return this.jsonParseError() === null;
    }
    return true;
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  protected onNameChanged(value: string): void {
    this.nameValue.set(value ?? '');
    this._emit();
  }

  protected onContextChanged(value: ContextType): void {
    this.contextValue.set(value ?? 'local');
    this._emit();
  }

  protected onValueTypeChanged(value: ValueType): void {
    this.valueTypeValue.set(value ?? 'value');
    this.jsonParseError.set(null);
    this._emit();
  }

  protected onPlainValueChanged(value: string): void {
    this.plainValue.set(value ?? '');
    this._emit();
  }

  protected onJsonValueChanged(value: string): void {
    const raw = (value ?? '').trim();
    if (!raw) {
      this.jsonParseError.set(null);
      this.jsonValue.set('');
      this._emit();
      return;
    }
    try {
      JSON.parse(raw);
      this.jsonParseError.set(null);
      this.jsonValue.set(value ?? '');
      this._emit();
    } catch (err) {
      this.jsonParseError.set((err as Error).message);
      // Do not emit when JSON is invalid.
    }
  }

  protected onFunctionNameChanged(value: string): void {
    this.functionNameValue.set(value ?? 'now');
    this._emit();
  }

  protected onDefinitionIdChanged(value: string): void {
    this.definitionIdValue.set(value ?? '');
    this._emit();
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private _emit(): void {
    const name = this.nameValue().trim();
    const vt = this.valueTypeValue();
    const definitionId = this.definitionIdValue().trim() || name;

    let resolvedValue: unknown = null;
    if (vt === 'value') {
      resolvedValue = this.plainValue();
    } else if (vt === 'json') {
      const raw = this.jsonValue().trim();
      if (raw) {
        try {
          resolvedValue = JSON.parse(raw);
        } catch {
          return; // invalid JSON — skip emit
        }
      }
    }
    // valueType = 'function': value is null, functionName is used instead.

    const configuration_json: Record<string, unknown> = {
      name,
      context: this.contextValue(),
      valueType: vt,
      definitionId,
    };

    if (vt === 'function') {
      configuration_json['functionName'] = this.functionNameValue();
    } else {
      configuration_json['value'] = resolvedValue;
    }

    this.configChange.emit({
      ...this.config,
      configuration_json,
    });
  }
}
