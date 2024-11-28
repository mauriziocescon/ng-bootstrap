import { computed, inject, Injectable, OnDestroy } from '@angular/core';

import { pipe } from 'rxjs';
import { startWith, switchMap, tap } from 'rxjs/operators';
import { patchState, signalState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { Album } from './album';

import { AlbumsDataClient } from './albums-data-client';

type AlbumState = {
  params: { textSearch: string, pageNumber: number };
  albums: Album[],
  loading: boolean;
  error: string | undefined,
  loadCompleted: boolean,
};

@Injectable()
export class AlbumsStore implements OnDestroy {
  private readonly albumsDataClient = inject(AlbumsDataClient);

  private readonly albumState = signalState<AlbumState>({
    params: { textSearch: '', pageNumber: 1 },
    albums: [],
    loading: false,
    error: undefined,
    loadCompleted: false,
  });

  readonly params = computed(() => this.albumState.params());
  readonly albums = computed(() => this.albumState.albums());
  readonly isLoading = computed(() => this.albumState.loading());
  readonly error = computed(() => this.albumState.error());
  readonly isLoadCompleted = computed<boolean>(() => this.isLoading() === false && this.albums()?.length > 0 && this.albumState.loadCompleted() === true);
  readonly hasNoData = computed(() => this.albums()?.length === 0 && this.isLoading() === false && this.error() === undefined);
  readonly shouldRetry = computed(() => this.isLoading() === false && this.error() !== undefined);

  readonly isInfiniteScrollDisabled = computed(() => this.isLoading() === true || this.error() !== undefined || this.albumState.loadCompleted() === true);

  private readonly paramsSubscription = rxMethod<{ textSearch: string, pageNumber: number }>(
    pipe(
      startWith({ ...this.albumState.params() }),
      tap(() => patchState(this.albumState, state => ({
        albums: state.params.pageNumber === 1 ? [] : state.albums,
        loading: true,
        error: undefined,
      }))),
      switchMap(({ textSearch, pageNumber }) => this.albumsDataClient.getAlbums(textSearch, pageNumber)
        .pipe(
          tapResponse({
            next: data => {
              patchState(this.albumState, state => ({
                albums: [...state.albums, ...data.albums],
                loadCompleted: data.lastPage,
              }));
            },
            error: (err: string) => patchState(this.albumState, state => ({ error: err })),
            finalize: () => patchState(this.albumState, state => ({ loading: false })),
          }),
        ),
      ),
    ),
  );

  setup(): void {
    this.paramsSubscription(this.albumState.params);
  }

  ngOnDestroy(): void {
    this.paramsSubscription?.unsubscribe();
  }

  updateParams(params: { textSearch: string, pageNumber: number }): void {
    patchState(this.albumState, state => ({ params: { ...params } }));
  }

  retry(): void {
    patchState(this.albumState, state => ({ params: { ...state.params } }));
  }
}
