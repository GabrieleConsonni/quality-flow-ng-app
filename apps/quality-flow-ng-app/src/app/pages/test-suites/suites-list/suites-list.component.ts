import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';

import type { TestSuiteSummary } from '../models/test-suite.model';
import { TestSuiteService } from '../services/test-suite.service';

@Component({
  selector: 'qf-suites-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    DxButtonModule,
    DxDataGridModule,
    DxLoadIndicatorModule,
    DxPopupModule,
    DxTextBoxModule,
  ],
  templateUrl: './suites-list.component.html',
  styleUrls: ['./suites-list.component.scss'],
})
export class SuitesListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(TestSuiteService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(false);
  protected readonly suites = signal<TestSuiteSummary[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly createPopupVisible = signal(false);
  protected readonly newSuiteDescription = signal('');
  protected readonly creating = signal(false);

  protected readonly filteredSuites = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const all = this.suites();
    if (!term) {
      return all;
    }
    return all.filter((s) => (s.description ?? '').toLowerCase().includes(term));
  });

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.service
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rows) => {
          this.suites.set(rows ?? []);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          notify({
            message: this.formatError('Unable to load test suites', err),
            type: 'error',
            displayTime: 4000,
            position: { my: 'bottom right', at: 'bottom right' },
          });
        },
      });
  }

  protected onSearchInput(value: string | null | undefined): void {
    this.searchTerm.set(value ?? '');
  }

  protected openCreatePopup(): void {
    this.newSuiteDescription.set('');
    this.createPopupVisible.set(true);
  }

  protected closeCreatePopup(): void {
    if (this.creating()) {
      return;
    }
    this.createPopupVisible.set(false);
  }

  protected submitCreate(): void {
    const description = this.newSuiteDescription().trim();
    if (!description) {
      notify({ message: 'Description is required.', type: 'warning', displayTime: 2000 });
      return;
    }
    this.creating.set(true);
    this.service
      .create({ description, tests: [], hooks: [] })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.creating.set(false);
          this.createPopupVisible.set(false);
          notify({ message: 'Suite created.', type: 'success', displayTime: 2000 });
          this.router.navigate(['/test-suites', response.id]);
        },
        error: (err) => {
          this.creating.set(false);
          notify({
            message: this.formatError('Unable to create the suite', err),
            type: 'error',
            displayTime: 4000,
          });
        },
      });
  }

  protected openSuite(row: TestSuiteSummary): void {
    this.router.navigate(['/test-suites', row.id]);
  }

  protected runSuite(row: TestSuiteSummary, event?: Event): void {
    event?.stopPropagation();
    this.service
      .runSuite(row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          notify({
            message: `Suite "${row.description}" is running… (#${response.execution_id})`,
            type: 'success',
            displayTime: 3000,
            position: { my: 'bottom right', at: 'bottom right' },
          });
        },
        error: (err) => {
          notify({
            message: this.formatError('Unable to start the suite', err),
            type: 'error',
            displayTime: 4000,
          });
        },
      });
  }

  protected async deleteSuite(row: TestSuiteSummary, event?: Event): Promise<void> {
    event?.stopPropagation();
    const confirmed = await confirm(
      `Delete suite "${row.description}"? This cannot be undone.`,
      'Delete suite',
    );
    if (!confirmed) {
      return;
    }
    this.service
      .remove(row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          notify({ message: 'Suite deleted.', type: 'success', displayTime: 2000 });
          this.reload();
        },
        error: (err) => {
          notify({
            message: this.formatError('Unable to delete the suite', err),
            type: 'error',
            displayTime: 4000,
          });
        },
      });
  }

  protected trackById = (_: number, row: TestSuiteSummary): string => row.id;

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
