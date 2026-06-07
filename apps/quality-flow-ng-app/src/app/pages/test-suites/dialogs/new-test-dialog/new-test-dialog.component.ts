import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxPopupModule } from 'devextreme-angular/ui/popup';

import type { TemplateKind } from '../../models/test-suite.model';

interface TemplateCard {
  kind: TemplateKind;
  title: string;
  description: string;
  bullets: string[];
  footerLabel: string;
  footerStyle: 'neutral' | 'warning';
}

const CARDS: TemplateCard[] = [
  {
    kind: 'send_verify',
    title: 'Send & Verify',
    description: 'Send a message to a queue and verify the side effects.',
    bullets: [
      '1. Send message to a queue',
      '2. Wait',
      '3. Assert on queue or database',
    ],
    footerLabel: 'Most common',
    footerStyle: 'neutral',
  },
  {
    kind: 'mock_assert',
    title: 'Mock & Assert',
    description: 'Verify the side effects after an external system triggers your mock.',
    bullets: [
      '1. Wait for the trigger',
      '2. Read the side effect (queue or database)',
      '3. Assert the result',
    ],
    footerLabel: 'Mock-driven flows',
    footerStyle: 'neutral',
  },
  {
    kind: 'custom',
    title: 'Custom',
    description: 'Build the test step-by-step. Full control over commands and variables.',
    bullets: [
      'Empty step list',
      'Choose any commands',
      'Manage variables and scopes',
    ],
    footerLabel: 'Advanced',
    footerStyle: 'warning',
  },
];

@Component({
  selector: 'qf-new-test-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DxButtonModule, DxPopupModule],
  templateUrl: './new-test-dialog.component.html',
  styleUrls: ['./new-test-dialog.component.scss'],
})
export class NewTestDialogComponent {
  @Input() set visible(value: boolean) {
    this.visibleSig.set(value);
    if (!value) {
      this.selectedKind.set(null);
    }
  }
  get visible(): boolean {
    return this.visibleSig();
  }

  @Output() readonly applied = new EventEmitter<TemplateKind>();
  @Output() readonly closed = new EventEmitter<void>();

  protected readonly cards = CARDS;
  protected readonly visibleSig = signal(false);
  protected readonly selectedKind = signal<TemplateKind | null>(null);

  protected selectKind(kind: TemplateKind): void {
    this.selectedKind.set(kind);
  }

  protected isSelected(kind: TemplateKind): boolean {
    return this.selectedKind() === kind;
  }

  protected confirm(): void {
    const kind = this.selectedKind();
    if (!kind) {
      return;
    }
    this.applied.emit(kind);
    this.visibleSig.set(false);
    this.selectedKind.set(null);
  }

  protected cancel(): void {
    this.visibleSig.set(false);
    this.selectedKind.set(null);
    this.closed.emit();
  }

  protected onCardDoubleClick(kind: TemplateKind): void {
    this.selectKind(kind);
    this.confirm();
  }

  protected onHiding(): void {
    if (this.visibleSig()) {
      this.cancel();
    }
  }
}
