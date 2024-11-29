import { computed, inject, Injectable, OnDestroy } from '@angular/core';

import { pipe } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { patchState, signalState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { User } from './user';

import { UsersDataClient } from './users-data-client';

type UserState = {
  params: { textSearch: string };
  users: User[],
  loading: boolean;
  error: string | undefined,
};

@Injectable()
export class UsersStore implements OnDestroy {
  private readonly usersDataClient = inject(UsersDataClient);

  private readonly state = signalState<UserState>({
    params: { textSearch: '' },
    users: [],
    loading: false,
    error: undefined,
  });

  readonly users = computed(() => this.state.users());
  readonly loading = computed(() => this.state.loading());
  readonly error = computed(() => this.state.error());
  readonly isLoadCompleted = computed<boolean>(() => this.users()?.length > 0);
  readonly hasNoData = computed(() => this.users()?.length === 0 && !this.loading() && this.error() === undefined);
  readonly shouldRetry = computed(() => !this.loading() && this.error() !== undefined);

  private readonly loadUsers = rxMethod<{ textSearch: string }>(
    pipe(
      filter(({ textSearch }) => textSearch !== undefined),
      tap(() => patchState(this.state, () => ({ loading: true, error: undefined }))),
      switchMap(({ textSearch }) => this.usersDataClient.getUsers(textSearch)
        .pipe(
          tapResponse({
            next: data => patchState(this.state, state => ({ users: data.users })),
            error: (err: string) => patchState(this.state, state => ({ error: err })),
            finalize: () => patchState(this.state, state => ({ loading: false })),
          }),
        ),
      ),
    ),
  );

  setup() {
    this.loadUsers(this.state.params);
  }

  ngOnDestroy() {
    this.loadUsers?.unsubscribe();
  }

  updateParams(params: { textSearch: string }) {
    patchState(this.state, () => ({ params: { ...params }, users: [] }));
  }

  retry() {
    patchState(this.state, state => ({ params: { ...state.params }, users: [] }));
  }
}
