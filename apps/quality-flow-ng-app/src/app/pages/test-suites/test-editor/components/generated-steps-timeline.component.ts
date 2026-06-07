import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { Subject, debounceTime, switchMap } from 'rxjs';

import type {
  PreviewedCommand,
  TemplateConfig,
  TemplateKind,
  TemplatePreviewRequest,
} from '../../models/test-suite.model';
import { TestSuiteService } from '../../services/test-suite.service';

@Component({
  selector: 'qf-generated-steps-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DxLoadIndicatorModule],
  templateUrl: './generated-steps-timeline.component.html',
  styleUrls: ['./generated-steps-timeline.component.scss'],
})
export class GeneratedStepsTimelineComponent implements OnChanges {
  @Input({ required: true }) templateKind!: TemplateKind;
  @Input() templateConfig: TemplateConfig | null = null;

  private readonly service = inject(TestSuiteService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requestSubject = new Subject<TemplatePreviewRequest>();

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly commands = signal<PreviewedCommand[]>([]);
  protected readonly note = signal<string | null>(null);

  constructor() {
    this.requestSubject
      .pipe(
        debounceTime(250),
        switchMap((request) => {
          this.loading.set(true);
          return this.service.previewTemplate(request);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          this.errorMessage.set(null);
          this.commands.set(response.commands ?? []);
          this.note.set(response.note ?? null);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.commands.set([]);
          this.note.set(null);
          this.errorMessage.set(this.formatError(err));
        },
      });
  }

  ngOnChanges(_: SimpleChanges): void {
    this.requestPreview();
  }

  protected requestPreview(): void {
    if (!this.templateKind) {
      return;
    }
    this.requestSubject.next({
      template_kind: this.templateKind,
      template_config: this.templateConfig,
    });
  }

  protected commandCode(cmd: PreviewedCommand): string {
    const cfg = cmd.cfg ?? {};
    const code = (cfg as Record<string, unknown>)['commandCode'];
    return typeof code === 'string' ? code : 'unknown';
  }

  protected trackByOrder(_: number, cmd: PreviewedCommand): number {
    return cmd.order;
  }

  private formatError(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const inner = (err as { error?: { detail?: string; message?: string } }).error;
      if (inner?.detail) {
        return inner.detail;
      }
      if (inner?.message) {
        return inner.message;
      }
    }
    if (err && typeof err === 'object' && 'message' in err) {
      const message = (err as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }
    return 'Unable to preview template steps.';
  }
}
