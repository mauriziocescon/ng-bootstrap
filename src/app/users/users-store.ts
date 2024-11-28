import { computed, inject, Injectable, OnDestroy } from '@angular/core';

import { pipe } from 'rxjs';
import { startWith, switchMap, tap } from 'rxjs/operators';
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

  private readonly userState = signalState<UserState>({
    params: { textSearch: '' },
    users: [],
    loading: false,
    error: undefined,
  });

  readonly users = computed(() => this.userState.users());
  readonly loading = computed(() => this.userState.loading());
  readonly error = computed(() => this.userState.error());
  readonly isLoadCompleted = computed<boolean>(() => this.users()?.length > 0);
  readonly hasNoData = computed(() => this.users()?.length === 0 && !this.loading() && this.error() === undefined);
  readonly shouldRetry = computed(() => !this.loading() && this.error() !== undefined);

  private readonly paramsSubscription = rxMethod<{ textSearch: string }>(
    pipe(
      startWith({ ...this.userState.params() }),
      tap(() => patchState(this.userState, () => ({ loading: true, error: undefined }))),
      switchMap(({ textSearch }) => this.usersDataClient.getUsers(textSearch)
        .pipe(
          tapResponse({
            next: data => patchState(this.userState, state => ({ users: data.users })),
            error: (err: string) => patchState(this.userState, state => ({ error: err })),
            finalize: () => patchState(this.userState, state => ({ loading: false })),
          }),
        ),
      ),
    ),
  );

  setup(): void {
    this.paramsSubscription(this.userState.params);
  }

  ngOnDestroy(): void {
    this.paramsSubscription?.unsubscribe();
  }

  updateParams(params: { textSearch: string }): void {
    patchState(this.userState, () => ({ params: { ...params }, users: [] }));
  }

  retry(): void {
    patchState(this.userState, state => ({ params: { ...state.params }, users: [] }));
  }
}
