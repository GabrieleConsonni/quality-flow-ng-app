import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  ViewContainerRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { Subscription } from 'rxjs';

import {
  STEP_KIND_CATALOG,
  type StepKindCategory,
  type StepKindMeta,
} from '../../step-forms/step-kind-catalog';
import type { StepFormComponent, StepFormConfig } from '../../step-forms/step-form.contract';
import { STEP_FORM_REGISTRY, RawJsonStepFormComponent } from '../../step-forms/step-form.registry';

/** Internal phase of the dialog */
type DialogPhase = 'chooser' | 'form';

/** Category display order + subtitle */
const CATEGORY_META: Record<
  StepKindCategory,
  { order: number; subtitle: string }
> = {
  Producers: { order: 0, subtitle: 'Produce values that other steps can reference' },
  Consumers: { order: 1, subtitle: 'Perform actions with side effects' },
  Assertions: { order: 2, subtitle: 'Verify expected outcomes' },
  Control: { order: 3, subtitle: 'Flow control: timing, scope cleanup' },
};

const CATEGORY_ORDER: StepKindCategory[] = ['Producers', 'Consumers', 'Assertions', 'Control'];

export interface StepEditorDialogGroup {
  category: StepKindCategory;
  subtitle: string;
  items: StepKindMeta[];
}

@Component({
  selector: 'qf-step-editor-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DxButtonModule, DxPopupModule, DxTextBoxModule],
  templateUrl: './step-editor-dialog.component.html',
  styleUrls: ['./step-editor-dialog.component.scss'],
})
export class StepEditorDialogComponent implements OnDestroy {
  // ── Inputs / Outputs ────────────────────────────────────────────────────────

  @Input() set visible(value: boolean) {
    this.visibleSig.set(value);
    if (value) {
      this._resetState();
    }
  }
  get visible(): boolean {
    return this.visibleSig();
  }

  @Input() set mode(value: 'create' | 'edit') {
    this.modeSig.set(value);
  }
  get mode(): 'create' | 'edit' {
    return this.modeSig();
  }

  @Input() set initialConfig(value: StepFormConfig | null) {
    this.initialConfigSig.set(value);
  }
  get initialConfig(): StepFormConfig | null {
    return this.initialConfigSig();
  }

  @Input() availableKinds?: string[];

  @Output() readonly applied = new EventEmitter<StepFormConfig>();
  @Output() readonly closed = new EventEmitter<void>();

  // ── ViewContainerRef for dynamic form ──────────────────────────────────────

  @ViewChild('formOutlet', { read: ViewContainerRef })
  set formOutletRef(vcr: ViewContainerRef | undefined) {
    // Triggered when the template-reference enters or leaves the DOM.
    // When we get a real VCR and we already have a selectedKind, mount the form.
    if (vcr) {
      this._formVcr = vcr;
      const kind = this.selectedKindSig();
      if (kind && this.phaseSig() === 'form') {
        this._mountForm(kind);
      }
    } else {
      this._destroyForm();
      this._formVcr = undefined;
    }
  }

  // ── Internal signals ────────────────────────────────────────────────────────

  protected readonly visibleSig = signal(false);
  protected readonly modeSig = signal<'create' | 'edit'>('create');
  protected readonly initialConfigSig = signal<StepFormConfig | null>(null);
  protected readonly phaseSig = signal<DialogPhase>('chooser');
  protected readonly selectedKindSig = signal<string | null>(null);
  protected readonly searchQuerySig = signal('');
  protected readonly currentConfigSig = signal<StepFormConfig | null>(null);
  protected readonly formValidSig = signal(false);
  protected readonly descriptionSig = signal('');
  protected readonly isDirtySig = signal(false);
  protected readonly showDiscardConfirmSig = signal(false);

  // ── Computed ────────────────────────────────────────────────────────────────

  protected readonly filteredGroups = computed<StepEditorDialogGroup[]>(() => {
    const q = this.searchQuerySig().toLowerCase().trim();
    const allowed = this.availableKinds ? new Set(this.availableKinds) : null;

    let items = STEP_KIND_CATALOG as readonly StepKindMeta[];

    if (allowed) {
      items = items.filter((k) => allowed.has(k.code));
    }

    if (q) {
      items = items.filter(
        (k) =>
          k.code.toLowerCase().includes(q) ||
          k.label.toLowerCase().includes(q) ||
          k.description.toLowerCase().includes(q) ||
          k.searchableTerms.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Group by category
    const grouped = new Map<StepKindCategory, StepKindMeta[]>();
    for (const item of items) {
      let bucket = grouped.get(item.category);
      if (!bucket) {
        bucket = [];
        grouped.set(item.category, bucket);
      }
      bucket.push(item);
    }

    // Sort categories in fixed order
    return CATEGORY_ORDER.filter((cat) => grouped.has(cat)).map((cat) => ({
      category: cat,
      subtitle: CATEGORY_META[cat].subtitle,
      items: grouped.get(cat) ?? [],
    }));
  });

  protected readonly continueDisabled = computed(
    () => this.selectedKindSig() === null,
  );

  protected readonly saveDisabled = computed(
    () => !this.formValidSig(),
  );

  protected readonly dialogTitle = computed(() =>
    this.modeSig() === 'edit' ? 'Edit step' : 'New step',
  );

  // ── Private ─────────────────────────────────────────────────────────────────

  private _formVcr: ViewContainerRef | undefined;
  private _formRef: ComponentRef<StepFormComponent> | null = null;
  private _formSub: Subscription | null = null;
  private readonly _registry = inject(STEP_FORM_REGISTRY);

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    this._destroyForm();
  }

  // ── Template helpers ─────────────────────────────────────────────────────────

  protected isSelected(code: string): boolean {
    return this.selectedKindSig() === code;
  }

  protected selectKind(code: string): void {
    this.selectedKindSig.set(code);
  }

  protected onKindDoubleClick(code: string): void {
    this.selectedKindSig.set(code);
    this.continueToForm();
  }

  protected continueToForm(): void {
    const kind = this.selectedKindSig();
    if (!kind) {
      return;
    }
    this.phaseSig.set('form');
    // VCR will be assigned once @if renders the formOutlet container.
    // If it is already available (shouldn't happen), mount immediately.
    if (this._formVcr) {
      this._mountForm(kind);
    }
  }

  protected onSearchChanged(value: string): void {
    this.searchQuerySig.set(value ?? '');
  }

  protected onDescriptionChanged(value: string): void {
    this.descriptionSig.set(value ?? '');
    this.isDirtySig.set(true);
  }

  protected save(): void {
    const config = this.currentConfigSig();
    if (!config || !this.formValidSig()) {
      return;
    }
    const finalConfig: StepFormConfig = {
      ...config,
      description: this.descriptionSig() || undefined,
    };
    this.isDirtySig.set(false);
    this.applied.emit(finalConfig);
    this.visibleSig.set(false);
  }

  protected cancel(): void {
    if (this.isDirtySig()) {
      this.showDiscardConfirmSig.set(true);
    } else {
      this._doClose();
    }
  }

  protected confirmDiscard(): void {
    this.showDiscardConfirmSig.set(false);
    this._doClose();
  }

  protected cancelDiscard(): void {
    this.showDiscardConfirmSig.set(false);
    // Re-show the main popup that was hidden by onHiding trigger.
    this.visibleSig.set(true);
  }

  protected onHiding(): void {
    // dx-popup fires onHiding when the user clicks the X button or outside.
    if (this.isDirtySig()) {
      // Prevent native close and show confirm instead.
      this.visibleSig.set(false);
      this.showDiscardConfirmSig.set(true);
    } else {
      this._doClose();
    }
  }

  protected onDiscardHiding(): void {
    this.showDiscardConfirmSig.set(false);
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private _resetState(): void {
    const cfg = this.initialConfigSig();
    const isEdit = this.modeSig() === 'edit';

    this._destroyForm();
    this.searchQuerySig.set('');
    this.isDirtySig.set(false);
    this.showDiscardConfirmSig.set(false);
    this.formValidSig.set(false);
    this.currentConfigSig.set(cfg);
    this.descriptionSig.set(cfg?.description ?? '');

    if (isEdit && cfg) {
      this.selectedKindSig.set(cfg.commandCode);
      this.phaseSig.set('form');
    } else {
      this.selectedKindSig.set(null);
      this.phaseSig.set('chooser');
    }
  }

  private _doClose(): void {
    this._destroyForm();
    this.visibleSig.set(false);
    this.closed.emit();
  }

  private _mountForm(commandCode: string): void {
    const vcr = this._formVcr;
    if (!vcr) {
      return;
    }
    this._destroyForm();

    const formType =
      (this._registry.get(commandCode) as
        | Parameters<typeof vcr.createComponent>[0]
        | undefined) ?? RawJsonStepFormComponent;

    const ref = vcr.createComponent(
      formType as Parameters<typeof vcr.createComponent>[0],
    ) as ComponentRef<StepFormComponent>;

    // Build initial config for the form
    const existingConfig = this.currentConfigSig();
    const commandType = _resolveCommandType(commandCode);

    const initialFormConfig: StepFormConfig = existingConfig ?? {
      commandCode,
      commandType,
      configuration_json: {},
    };
    ref.setInput('config', initialFormConfig);
    this.currentConfigSig.set(initialFormConfig);
    this.formValidSig.set(ref.instance.isValid());

    this._formSub = ref.instance.configChange.subscribe((newCfg: StepFormConfig) => {
      this.currentConfigSig.set(newCfg);
      this.formValidSig.set(ref.instance.isValid());
      this.isDirtySig.set(true);
    });

    this._formRef = ref;
  }

  private _destroyForm(): void {
    this._formSub?.unsubscribe();
    this._formSub = null;
    this._formRef?.destroy();
    this._formRef = null;
  }
}

/** Map commandCode to its StepFormConfig commandType */
function _resolveCommandType(code: string): StepFormConfig['commandType'] {
  const catalog = STEP_KIND_CATALOG.find((k) => k.code === code);
  if (!catalog) {
    return 'action';
  }
  switch (catalog.category) {
    case 'Producers':
      return 'context';
    case 'Assertions':
      return 'assert';
    case 'Consumers':
    case 'Control':
    default:
      return 'action';
  }
}
