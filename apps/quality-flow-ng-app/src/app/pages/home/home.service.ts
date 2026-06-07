import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExecutionSearchResult } from './models/execution.model';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'api/elaborations/test-suite-execution';

  searchExecutions(params: {
    page_size?: number;
    page_number?: number;
    status?: string;
    started_from?: string;
    started_to?: string;
  }): Observable<ExecutionSearchResult> {
    let httpParams = new HttpParams();
    if (params.page_size) httpParams = httpParams.set('page_size', params.page_size);
    if (params.page_number) httpParams = httpParams.set('page_number', params.page_number);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.started_from) httpParams = httpParams.set('started_from', params.started_from);
    if (params.started_to) httpParams = httpParams.set('started_to', params.started_to);
    return this.http.get<ExecutionSearchResult>(`${this.baseUrl}/search`, { params: httpParams });
  }
}
