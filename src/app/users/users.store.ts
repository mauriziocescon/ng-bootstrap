import { computed, inject, Injectable, OnDestroy } from '@angular/core';

import { pipe } from 'rxjs';
import {
  debounceTime,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { patchState, signalState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { User } from './user.model';

import { UsersService } from './users.service';

type UserState = {
  params: { textSearch: string | undefined };
  users: User[],
  loading: boolean;
  error: string | undefined,
};

@Injectable()
export class UsersStore implements OnDestroy {
  private usersService = inject(UsersService);

  private userState = signalState<UserState>({
    params: { textSearch: '' },
    users: [],
    loading: false,
    error: undefined,
  });

  users = computed(() => this.userState.users());
  loading = computed(() => this.userState.loading());
  error = computed(() => this.userState.error());
  isLoadCompleted = computed<boolean>(() => this.users()?.length > 0);
  hasNoData = computed(() => this.users()?.length === 0 && !this.loading() && this.error() === undefined);
  shouldRetry = computed(() => !this.loading() && this.error() !== undefined);

  private paramsSubscription = rxMethod<{ textSearch: string | undefined }>(
    pipe(
      startWith({ ...this.userState.params() }),
      tap(() => patchState(this.userState, state => ({ loading: true, error: undefined }))),
      debounceTime(50),
      switchMap(({ textSearch }) => this.usersService.getUsers(textSearch)
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
    patchState(this.userState, state => ({ params: { ...params }, users: [] }));
  }

  retry(): void {
    patchState(this.userState, state => ({ params: { ...state.params }, users: [] }));
  }
}
