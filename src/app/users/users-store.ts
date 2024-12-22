import { computed, DestroyRef, inject, Injectable } from '@angular/core';

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

@Injectable({
  providedIn: 'root',
})
export class UsersStore {
  private readonly destroyRef = inject(DestroyRef);
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
      tap(() => patchState(this.state, { loading: true, error: undefined })),
      switchMap(({ textSearch }) => this.usersDataClient.getUsers(textSearch)
        .pipe(
          tapResponse({
            next: data => patchState(this.state, { users: data.users }),
            error: (err: string) => patchState(this.state, { error: err }),
            finalize: () => patchState(this.state, { loading: false }),
          }),
        ),
      ),
    ),
  );

  private readonly unregisterDestroy = this.destroyRef.onDestroy(() => this.loadUsers?.destroy());

  constructor() {
    this.loadUsers(this.state.params);
  }

  updateParams(params: { textSearch: string }) {
    patchState(this.state, { params: { ...params } });
  }

  retry() {
    patchState(this.state, state => ({ params: { ...state.params } }));
  }
}
