import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import notify from 'devextreme/ui/notify';
import { combineLatest, map } from 'rxjs';

import type {
  SendVerifyConfig,
  SuiteItem,
  TemplateAssertOperator,
  TemplateAssertSpec,
  TemplateAssertTarget,
  TemplateKind,
  TestSuiteDetail,
} from '../models/test-suite.model';
import { TestSuiteService } from '../services/test-suite.service';
import { GeneratedStepsTimelineComponent } from './components/generated-steps-timeline.component';

const SUPPORTED_TEMPLATES: TemplateKind[] = ['send_verify', 'mock_assert'];
const ASSERT_TARGETS: TemplateAssertTarget[] = ['queue', 'database', 'none'];
const ASSERT_OPERATORS: TemplateAssertOperator[] = ['equals', 'exists'];

@Component({
  selector: 'qf-test-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DxButtonModule,
    DxLoadIndicatorModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxTextBoxModule,
    GeneratedStepsTimelineComponent,
  ],
  templateUrl: './test-editor.component.html',
  styleUrls: ['./test-editor.component.scss'],
})
export class TestEditorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(TestSuiteService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly assertTargets = ASSERT_TARGETS;
  protected readonly assertOperators = ASSERT_OPERATORS;

  protected readonly suiteId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('suiteId') ?? '')),
    { initialValue: '' },
  );
  protected readonly routeItemId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('suiteItemId') ?? '')),
    { initialValue: '' },
  );
  protected readonly queryTemplateKind = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => (params.get('template_kind') ?? '') as TemplateKind | ''),
    ),
    { initialValue: '' as TemplateKind | '' },
  );

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly templateKind = signal<TemplateKind>('send_verify');
  protected readonly testDescription = signal('');

  protected readonly queueId = signal('');
  protected readonly payloadText = signal('{\n  "id": 1\n}');
  protected readonly waitMs = signal(500);
  protected readonly asserts = signal<TemplateAssertSpec[]>([]);

  protected readonly payloadError = signal<string | null>(null);

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, query]) => {
        const itemId = params.get('suiteItemId');
        const kindParam = (query.get('template_kind') ?? '') as TemplateKind | '';
        if (itemId) {
          this.loadExisting(itemId);
        } else if (SUPPORTED_TEMPLATES.includes(kindParam as TemplateKind)) {
          this.templateKind.set(kindParam as TemplateKind);
          this.resetFormForKind(kindParam as TemplateKind);
        }
      });
  }

  protected currentTemplateConfig(): Record<string, unknown> {
    const kind = this.templateKind();
    if (kind === 'send_verify') {
      const payload = this.parsePayload();
      const config: SendVerifyConfig = {
        queue_id: this.queueId().trim(),
        payload: { kind: 'json_inline', value: payload ?? {} },
        wait_ms: this.waitMs(),
        asserts: this.asserts(),
      };
      return config as unknown as Record<string, unknown>;
    }
    // mock_assert (and future kinds) — same asserts list, no payload.
    return {
      wait_ms: this.waitMs(),
      asserts: this.asserts(),
    };
  }

  protected isFormValid(): boolean {
    if (this.payloadError() !== null) {
      return false;
    }
    if (this.templateKind() === 'send_verify' && !this.queueId().trim()) {
      return false;
    }
    if (this.templateKind() === 'mock_assert' && this.asserts().length === 0) {
      return false;
    }
    return true;
  }

  protected addAssert(): void {
    this.asserts.update((current) => [
      ...current,
      { target: 'queue', operator: 'exists' },
    ]);
  }

  protected removeAssert(index: number): void {
    this.asserts.update((current) => current.filter((_, i) => i !== index));
  }

  protected updateAssert(index: number, patch: Partial<TemplateAssertSpec>): void {
    this.asserts.update((current) =>
      current.map((spec, i) => (i === index ? { ...spec, ...patch } : spec)),
    );
  }

  protected updatePayloadText(value: string): void {
    this.payloadText.set(value ?? '');
    this.parsePayload();
  }

  protected tryParseJson(raw: string): unknown {
    const trimmed = (raw ?? '').trim();
    if (!trimmed) {
      return undefined;
    }
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  protected save(): void {
    const id = this.suiteId();
    if (!id) {
      return;
    }
    if (!this.isFormValid()) {
      notify({ message: 'Fix form errors before saving.', type: 'warning' });
      return;
    }
    this.saving.set(true);
    const config = this.currentTemplateConfig();
    const payload = {
      kind: 'test' as const,
      role: 'test' as const,
      template_kind: this.templateKind(),
      template_config: config,
      description: this.testDescription().trim() || 'Untitled test',
      on_failure: 'ABORT' as const,
      commands: [],
    };
    const editingId = this.routeItemId();
    const obs = editingId
      ? this.service.updateTest(id, editingId, payload)
      : this.service.addTest(id, payload);

    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        notify({ message: 'Test saved.', type: 'success', displayTime: 1800 });
        this.router.navigate(['/test-suites', id]);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        notify({
          message: this.formatError('Unable to save test', err),
          type: 'error',
          displayTime: 4000,
        });
      },
    });
  }

  protected cancel(): void {
    const id = this.suiteId();
    if (id) {
      this.router.navigate(['/test-suites', id]);
    } else {
      this.router.navigate(['/test-suites']);
    }
  }

  private loadExisting(suiteItemId: string): void {
    const id = this.suiteId();
    if (!id) {
      return;
    }
    this.loading.set(true);
    this.service
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail: TestSuiteDetail) => {
          const test = detail.tests.find((t) => t.id === suiteItemId);
          this.loading.set(false);
          if (!test) {
            notify({ message: 'Test not found.', type: 'error' });
            this.router.navigate(['/test-suites', id]);
            return;
          }
          this.hydrateFromExisting(test);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          notify({
            message: this.formatError('Unable to load test', err),
            type: 'error',
          });
        },
      });
  }

  private hydrateFromExisting(test: SuiteItem): void {
    const kind = (test.template_kind as TemplateKind) ?? 'custom';
    if (!SUPPORTED_TEMPLATES.includes(kind)) {
      // For custom items, send the user to the legacy custom editor (TBD in F3).
      notify({
        message: `Test kind "${kind}" is edited in the custom flow (coming in Phase 3).`,
        type: 'warning',
      });
      const id = this.suiteId();
      if (id) {
        this.router.navigate(['/test-suites', id]);
      }
      return;
    }
    this.templateKind.set(kind);
    this.testDescription.set(test.description ?? '');
    const config = (test.template_config ?? {}) as Record<string, unknown>;
    this.waitMs.set(Number(config['wait_ms'] ?? (kind === 'mock_assert' ? 1000 : 500)));
    const asserts = Array.isArray(config['asserts'])
      ? (config['asserts'] as TemplateAssertSpec[])
      : [];
    this.asserts.set(asserts);
    if (kind === 'send_verify') {
      this.queueId.set(String(config['queue_id'] ?? ''));
      const payload = config['payload'] as { value?: unknown } | undefined;
      this.payloadText.set(JSON.stringify(payload?.value ?? {}, null, 2));
    } else {
      this.queueId.set('');
    }
  }

  private resetFormForKind(kind: TemplateKind): void {
    this.testDescription.set('');
    this.queueId.set('');
    this.payloadText.set('{\n  "id": 1\n}');
    this.waitMs.set(kind === 'mock_assert' ? 1000 : 500);
    this.asserts.set(kind === 'mock_assert' ? [{ target: 'queue', operator: 'exists' }] : []);
    this.payloadError.set(null);
  }

  private parsePayload(): unknown {
    if (this.templateKind() !== 'send_verify') {
      this.payloadError.set(null);
      return null;
    }
    const raw = this.payloadText().trim();
    if (!raw) {
      this.payloadError.set('Payload is required.');
      return null;
    }
    try {
      const value = JSON.parse(raw);
      this.payloadError.set(null);
      return value;
    } catch (err) {
      this.payloadError.set((err as Error).message);
      return null;
    }
  }

  private formatError(prefix: string, err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const inner = (err as { error?: { detail?: string; message?: string } }).error;
      if (inner?.detail) {
        return `${prefix}: ${inner.detail}`;
      }
      if (inner?.message) {
        return `${prefix}: ${inner.message}`;
      }
    }
    return prefix;
  }
}
