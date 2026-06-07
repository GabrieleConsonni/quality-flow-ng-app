import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  CreateSuiteItemPayload,
  SuiteItem,
  TemplateMeta,
  TemplatePreviewRequest,
  TemplatePreviewResponse,
  TestSuiteDetail,
  TestSuiteSummary,
} from '../models/test-suite.model';

interface CreateTestSuitePayload {
  description: string;
  tests?: CreateSuiteItemPayload[];
  hooks?: CreateSuiteItemPayload[];
}

interface UpdateTestSuitePayload extends CreateTestSuitePayload {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class TestSuiteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'api/elaborations/test-suite';
  private readonly templatesBaseUrl = 'api/elaborations/templates';

  list(): Observable<TestSuiteSummary[]> {
    return this.http.get<TestSuiteSummary[]>(this.baseUrl);
  }

  getById(id: string): Observable<TestSuiteDetail> {
    return this.http.get<TestSuiteDetail>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  create(payload: CreateTestSuitePayload): Observable<{ id: string; message: string }> {
    return this.http.post<{ id: string; message: string }>(this.baseUrl, payload);
  }

  update(payload: UpdateTestSuitePayload): Observable<{ id: string; message: string }> {
    return this.http.put<{ id: string; message: string }>(this.baseUrl, payload);
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  runSuite(id: string): Observable<{ message: string; execution_id: string }> {
    return this.http.get<{ message: string; execution_id: string }>(
      `${this.baseUrl}/${encodeURIComponent(id)}/execute`,
    );
  }

  addTest(suiteId: string, payload: CreateSuiteItemPayload): Observable<SuiteItem> {
    return this.http.post<SuiteItem>(
      `${this.baseUrl}/${encodeURIComponent(suiteId)}/test`,
      payload,
    );
  }

  updateTest(
    suiteId: string,
    suiteItemId: string,
    payload: CreateSuiteItemPayload,
  ): Observable<SuiteItem> {
    return this.http.put<SuiteItem>(
      `${this.baseUrl}/${encodeURIComponent(suiteId)}/test/${encodeURIComponent(suiteItemId)}`,
      payload,
    );
  }

  convertTestToCustom(suiteId: string, suiteItemId: string): Observable<SuiteItem> {
    return this.http.post<SuiteItem>(
      `${this.baseUrl}/${encodeURIComponent(suiteId)}/test/${encodeURIComponent(suiteItemId)}/convert-to-custom`,
      {},
    );
  }

  runTest(
    suiteId: string,
    suiteItemId: string,
  ): Observable<{ message: string; execution_id: string }> {
    return this.http.post<{ message: string; execution_id: string }>(
      `${this.baseUrl}/${encodeURIComponent(suiteId)}/test/${encodeURIComponent(suiteItemId)}/execute`,
      {},
    );
  }

  listTemplates(): Observable<TemplateMeta[]> {
    return this.http.get<TemplateMeta[]>(this.templatesBaseUrl);
  }

  previewTemplate(payload: TemplatePreviewRequest): Observable<TemplatePreviewResponse> {
    return this.http.post<TemplatePreviewResponse>(
      `${this.templatesBaseUrl}/preview`,
      payload,
    );
  }
}
