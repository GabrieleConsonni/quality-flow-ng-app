export interface ExecutionDto {
  id: string;
  test_suite_id: string;
  test_suite_description: string;
  status: ExecutionStatus;
  invocation_id: string;
  vars_init_json: unknown;
  result_json: unknown;
  include_previous: boolean;
  requested_test_id: string | null;
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
  items: SuiteItemExecution[];
}

export interface SuiteItemExecution {
  id: string;
  test_suite_execution_id: string;
  suite_item_id: string;
  item_kind: string;
  hook_phase: string | null;
  item_description: string;
  position: number;
  status: string;
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
  commands: OperationExecution[];
}

export interface OperationExecution {
  id: string;
  test_suite_execution_id: string;
  suite_item_execution_id: string;
  suite_item_id: string;
  suite_item_command_id: string;
  command_description: string;
  command_order: number;
  status: string;
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
}

export type ExecutionStatus = 'success' | 'running' | 'error';

export interface ExecutionSearchResult {
  items: ExecutionDto[];
  total: number;
  page_size: number;
  page_number: number;
  total_pages: number;
}

export interface ExecutionStatusCount {
  status: ExecutionStatus;
  count: number;
}
