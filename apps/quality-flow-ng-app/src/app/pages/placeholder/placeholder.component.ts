import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'qf-placeholder',
  standalone: true,
  template: `
    <div class="placeholder-container">
      <h2>{{ pageName }}</h2>
      <p>This page is under construction.</p>
    </div>
  `,
  styles: [`
    .placeholder-container {
      padding: 40px;
      text-align: center;
      color: var(--tiara-text-color, #333);
    }
    h2 {
      font-size: 2em;
      margin-bottom: 16px;
    }
    p {
      font-size: 1.1em;
      opacity: 0.6;
    }
  `],
})
export class PlaceholderComponent {
  private readonly _route = inject(ActivatedRoute);
  readonly pageName = this._route.snapshot.data['pageName'] ?? 'Page';
}
