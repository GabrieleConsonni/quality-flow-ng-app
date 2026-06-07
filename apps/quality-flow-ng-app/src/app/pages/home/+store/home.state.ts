import { ExecutionDto, ExecutionStatusCount } from '../models/execution.model';

export type HomeState = {
  executions: ExecutionDto[];
  totalExecutions: number;
  statusCounts: ExecutionStatusCount[];
  loading: boolean;
};
