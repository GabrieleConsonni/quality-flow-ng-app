export type SuiteItemRole = 'test' | 'setup' | 'teardown';
export type TemplateKind = 'custom' | 'send_verify' | 'mock_assert';
export type SuiteItemKind = 'test' | 'hook';
export type HookPhase = 'before-all' | 'before-each' | 'after-each' | 'after-all';
export type OnFailure = 'ABORT' | 'CONTINUE';
export type LastRunStatus = 'success' | 'failed' | 'running' | 'skipped' | 'never';

export interface SuiteItemCommand {
  id?: string;
  order: number;
  description?: string | null;
  command_code?: string;
  command_type?: string;
  configuration_json?: Record<string, unknown>;
}

export interface SuiteItem {
  id: string;
  test_suite_id: string;
  kind: SuiteItemKind;
  hook_phase?: HookPhase | null;
  description: string;
  position: number;
  on_failure: OnFailure;
  role: SuiteItemRole;
  template_kind: TemplateKind;
  template_config?: Record<string, unknown> | null;
  data_driven: boolean;
  dataset_id?: string | null;
  sources?: unknown[];
  commands: SuiteItemCommand[];
}

export interface TestSuiteSummary {
  id: string;
  description: string;
}

export interface TestSuiteDetail extends TestSuiteSummary {
  hooks: SuiteItem[];
  tests: SuiteItem[];
}

export interface CreateSuiteItemPayload {
  kind?: SuiteItemKind;
  hook_phase?: HookPhase | null;
  description?: string;
  on_failure?: OnFailure;
  role?: SuiteItemRole;
  template_kind?: TemplateKind;
  template_config?: Record<string, unknown> | null;
  data_driven?: boolean;
  dataset_id?: string | null;
  sources?: unknown[];
  commands?: SuiteItemCommand[];
}

export interface SuitesListRow extends TestSuiteSummary {
  testsCount: number;
  lastRunAt?: string | null;
  lastRunStatus: LastRunStatus;
  scheduleLabel?: string | null;
  hasDataDrivenTests: boolean;
}

// ---------------------------------------------------------------------------
// Phase 2 — template engine
// ---------------------------------------------------------------------------

export interface TemplateMeta {
  kind: TemplateKind;
  name: string;
  description: string;
  config_schema_summary?: Record<string, unknown>;
}

export type TemplateAssertTarget = 'queue' | 'database' | 'none';
export type TemplateAssertOperator = 'equals' | 'exists';

export interface TemplateAssertSpec {
  target: TemplateAssertTarget;
  queue_id?: string;
  connection_id?: string;
  database_query?: string;
  operator?: TemplateAssertOperator;
  expected?: unknown;
}

export type SendVerifyPayloadKind = 'json_inline';

export interface SendVerifyPayload {
  kind: SendVerifyPayloadKind;
  value: unknown;
}

export interface SendVerifyConfig {
  queue_id: string;
  payload: SendVerifyPayload;
  wait_ms?: number;
  asserts?: TemplateAssertSpec[];
}

export interface MockAssertConfig {
  trigger_hint?: string;
  wait_ms?: number;
  asserts: TemplateAssertSpec[];
}

export type TemplateConfig = SendVerifyConfig | MockAssertConfig | Record<string, unknown>;

export interface TemplatePreviewRequest {
  template_kind: TemplateKind;
  template_config?: TemplateConfig | null;
  data_driven?: boolean;
  dataset_row?: Record<string, unknown> | null;
}

export interface PreviewedCommand {
  order: number;
  description?: string | null;
  cfg: Record<string, unknown> | null;
}

export interface TemplatePreviewResponse {
  template_kind: TemplateKind;
  commands: PreviewedCommand[];
  note?: string;
}
