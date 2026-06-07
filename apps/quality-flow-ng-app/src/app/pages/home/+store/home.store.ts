import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { tap } from 'rxjs';
import { ExecutionDto, ExecutionStatus, ExecutionStatusCount } from '../models/execution.model';
import { HomeService } from '../home.service';
import { HomeState } from './home.state';

const initialState: HomeState = {
  executions: [],
  totalExecutions: 0,
  statusCounts: [],
  loading: false,
};

function computeStatusCounts(executions: ExecutionDto[]): ExecutionStatusCount[] {
  const map = new Map<ExecutionStatus, number>();
  for (const e of executions) {
    map.set(e.status, (map.get(e.status) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
}

export const HomeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, homeService = inject(HomeService)) => ({
    loadExecutions(pageSize = 50, pageNumber = 1) {
      patchState(store, { loading: true });
      homeService
        .searchExecutions({ page_size: pageSize, page_number: pageNumber })
        .pipe(
          tap((result) => {
            patchState(store, {
              executions: result.items,
              totalExecutions: result.total,
              statusCounts: computeStatusCounts(result.items),
              loading: false,
            });
          }),
        )
        .subscribe();
    },
    filterByStatus(status: string, pageSize = 50) {
      patchState(store, { loading: true });
      homeService
        .searchExecutions({ page_size: pageSize, status })
        .pipe(
          tap((result) => {
            patchState(store, {
              executions: result.items,
              totalExecutions: result.total,
              loading: false,
            });
          }),
        )
        .subscribe();
    },
  })),
);
