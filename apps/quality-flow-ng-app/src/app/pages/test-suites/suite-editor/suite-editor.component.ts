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
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { map } from 'rxjs';

import type {
  SuiteItem,
  TemplateKind,
  TestSuiteDetail,
} from '../models/test-suite.model';
import { TestSuiteService } from '../services/test-suite.service';
import { NewTestDialogComponent } from '../dialogs/new-test-dialog/new-test-dialog.component';

@Component({
  selector: 'qf-suite-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DxButtonModule,
    DxLoadIndicatorModule,
    DxPopupModule,
    DxTextBoxModule,
    NewTestDialogComponent,
  ],
  templateUrl: './suite-editor.component.html',
  styleUrls: ['./suite-editor.component.scss'],
})
export class SuiteEditorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(TestSuiteService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly suiteId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('suiteId') ?? '')),
    { initialValue: '' },
  );

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly suite = signal<TestSuiteDetail | null>(null);

  protected readonly description = signal('');
  protected readonly descriptionDirty = signal(false);

  protected readonly setupExpanded = signal(false);
  protected readonly teardownExpanded = signal(false);

  protected readonly newTestDialogVisible = signal(false);
  protected readonly addTestPopupVisible = signal(false);
  protected readonly newTestDescription = signal('');
  protected readonly addingTest = signal(false);

  ngOnInit(): void {
    if (!this.suiteId()) {
      return;
    }
    this.reload();
  }

  protected reload(): void {
    const id = this.suiteId();
    if (!id) {
      return;
    }
    this.loading.set(true);
    this.service
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          this.suite.set(detail);
          this.description.set(detail.description ?? '');
          this.descriptionDirty.set(false);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          notify({
            message: this.formatError('Unable to load suite', err),
            type: 'error',
            displayTime: 4000,
          });
        },
      });
  }

  protected setupItem(): SuiteItem | null {
    return this.suite()?.hooks.find((h) => h.role === 'setup') ?? null;
  }

  protected teardownItem(): SuiteItem | null {
    return this.suite()?.hooks.find((h) => h.role === 'teardown') ?? null;
  }

  protected tests(): SuiteItem[] {
    return this.suite()?.tests ?? [];
  }

  protected onDescriptionChange(value: string | null | undefined): void {
    this.description.set(value ?? '');
    this.descriptionDirty.set(true);
  }

  protected saveDescription(): void {
    const current = this.suite();
    if (!current) {
      return;
    }
    if (!this.descriptionDirty()) {
      return;
    }
    this.saving.set(true);
    this.service
      .update({
        id: current.id,
        description: this.description().trim(),
        hooks: current.hooks.map((h) => this.suiteItemToCreatePayload(h)),
        tests: current.tests.map((t) => this.suiteItemToCreatePayload(t)),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.descriptionDirty.set(false);
          notify({ message: 'Suite saved.', type: 'success', displayTime: 1800 });
          this.reload();
        },
        error: (err) => {
          this.saving.set(false);
          notify({
            message: this.formatError('Unable to save suite', err),
            type: 'error',
            displayTime: 4000,
          });
        },
      });
  }

  protected openNewTestDialog(): void {
    this.newTestDialogVisible.set(true);
  }

  protected closeNewTestDialog(): void {
    this.newTestDialogVisible.set(false);
  }

  protected onTemplateSelected(kind: TemplateKind): void {
    this.newTestDialogVisible.set(false);
    if (kind === 'custom') {
      this.newTestDescription.set('');
      this.addTestPopupVisible.set(true);
      return;
    }
    const id = this.suiteId();
    if (!id) {
      return;
    }
    this.router.navigate(['/test-suites', id, 'tests', 'new'], {
      queryParams: { template_kind: kind },
    });
  }

  protected openAddTestPopup(): void {
    // Legacy entry-point kept for the custom-only flow opened from the New
    // Test dialog (see onTemplateSelected) and for any callers that bypass
    // the dialog.
    this.newTestDescription.set('');
    this.addTestPopupVisible.set(true);
  }

  protected closeAddTestPopup(): void {
    if (this.addingTest()) {
      return;
    }
    this.addTestPopupVisible.set(false);
  }

  protected submitAddTest(): void {
    const id = this.suiteId();
    const description = this.newTestDescription().trim();
    if (!id) {
      return;
    }
    if (!description) {
      notify({ message: 'Description is required.', type: 'warning', displayTime: 2000 });
      return;
    }
    this.addingTest.set(true);
    this.service
      .addTest(id, {
        kind: 'test',
        role: 'test',
        template_kind: 'custom',
        description,
        on_failure: 'ABORT',
        commands: [],
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.addingTest.set(false);
          this.addTestPopupVisible.set(false);
          notify({ message: 'Test added.', type: 'success', displayTime: 1800 });
          this.reload();
        },
        error: (err) => {
          this.addingTest.set(false);
          notify({
            message: this.formatError('Unable to add test', err),
            type: 'error',
            displayTime: 4000,
          });
        },
      });
  }

  protected runSuite(): void {
    const id = this.suiteId();
    if (!id) {
      return;
    }
    this.service
      .runSuite(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          notify({
            message: `Suite is running… (#${response.execution_id})`,
            type: 'success',
            displayTime: 3000,
            position: { my: 'bottom right', at: 'bottom right' },
          });
        },
        error: (err) => {
          notify({
            message: this.formatError('Unable to run suite', err),
            type: 'error',
            displayTime: 4000,
          });
        },
      });
  }

  protected runTest(test: SuiteItem, event?: Event): void {
    event?.stopPropagation();
    const id = this.suiteId();
    if (!id) {
      return;
    }
    this.service
      .runTest(id, test.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          notify({
            message: `Test is running… (#${response.execution_id})`,
            type: 'success',
            displayTime: 2500,
          });
        },
        error: (err) => {
          notify({
            message: this.formatError('Unable to run test', err),
            type: 'error',
            displayTime: 4000,
          });
        },
      });
  }

  protected async deleteSuite(): Promise<void> {
    const current = this.suite();
    if (!current) {
      return;
    }
    const confirmed = await confirm(
      `Delete suite "${current.description}"? This cannot be undone.`,
      'Delete suite',
    );
    if (!confirmed) {
      return;
    }
    this.service
      .remove(current.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          notify({ message: 'Suite deleted.', type: 'success', displayTime: 1800 });
          this.router.navigate(['/test-suites']);
        },
        error: (err) => {
          notify({
            message: this.formatError('Unable to delete suite', err),
            type: 'error',
            displayTime: 4000,
          });
        },
      });
  }

  protected toggleSetup(): void {
    this.setupExpanded.update((v) => !v);
  }

  protected toggleTeardown(): void {
    this.teardownExpanded.update((v) => !v);
  }

  private suiteItemToCreatePayload(item: SuiteItem) {
    return {
      kind: item.kind,
      hook_phase: item.hook_phase ?? null,
      description: item.description,
      on_failure: item.on_failure,
      role: item.role,
      template_kind: item.template_kind,
      template_config: item.template_config ?? null,
      data_driven: item.data_driven,
      dataset_id: item.dataset_id ?? null,
      sources: item.sources ?? [],
      commands: (item.commands ?? []).map((c) => ({
        order: c.order,
        description: c.description ?? '',
        cfg:
          c.command_code || c.configuration_json
            ? {
                commandCode: c.command_code ?? '',
                commandType: c.command_type ?? 'action',
                ...(c.configuration_json ?? {}),
              }
            : undefined,
      })),
    };
  }

  private formatError(prefix: string, err: unknown): string {
    if (err && typeof err === 'object' && 'message' in err) {
      const message = (err as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) {
        return `${prefix}: ${message}`;
      }
    }
    return prefix;
  }
}
