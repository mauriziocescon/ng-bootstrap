import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { UsersDataClient } from './users-data-client';

@Injectable({
  providedIn: 'root',
})
export class UsersStore {
  private readonly usersDataClient = inject(UsersDataClient);

  private readonly params = signal({ textSearch: '' });

  private readonly usersResource = rxResource({
    request: this.params,
    loader: ({ request }) => this.usersDataClient.getUsers(request.textSearch),
    defaultValue: [],
  });

  readonly users = computed(() => this.usersResource.value());
  readonly loading = computed(() => this.usersResource.isLoading());
  readonly error = computed(() => this.usersResource.error());
  readonly isLoadCompleted = computed(() => this.users()?.length > 0);
  readonly hasNoData = computed(() => this.users()?.length === 0 && !this.loading() && this.error() === undefined);
  readonly shouldRetry = computed(() => !this.loading() && this.error() !== undefined);

  updateParams(params: { textSearch: string }) {
    this.params.set(params);
  }

  retry() {
    this.usersResource.reload();
  }
}
