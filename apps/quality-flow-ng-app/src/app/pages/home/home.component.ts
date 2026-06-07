import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxPieChartModule } from 'devextreme-angular/ui/pie-chart';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { HomeStore } from './+store/home.store';

@Component({
  selector: 'qf-home',
  standalone: true,
  imports: [CommonModule, TranslateModule, DxDataGridModule, DxPieChartModule, DxLoadIndicatorModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  readonly _store = inject(HomeStore);

  readonly statusColors: Record<string, string> = {
    success: '#4caf50',
    error: '#f44336',
    running: '#ff9800',
  };

  ngOnInit(): void {
    this._store.loadExecutions();
  }

  getStatusColor(status: string): string {
    return this.statusColors[status] ?? '#9e9e9e';
  }

  customizePoint = (pointInfo: { argument: string }) => {
    return { color: this.getStatusColor(pointInfo.argument) };
  };

  onStatusClick(status: string): void {
    this._store.filterByStatus(status);
  }

  onReload(): void {
    this._store.loadExecutions();
  }
}
