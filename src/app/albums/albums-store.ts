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

  private readonly state = signalState<AlbumState>({
    params: { textSearch: '', pageNumber: 1 },
    albums: [],
    loading: false,
    error: undefined,
    loadCompleted: false,
  });

  readonly params = computed(() => this.state.params());
  readonly albums = computed(() => this.state.albums());
  readonly isLoading = computed(() => this.state.loading());
  readonly error = computed(() => this.state.error());
  readonly isLoadCompleted = computed<boolean>(() => this.isLoading() === false && this.albums()?.length > 0 && this.state.loadCompleted() === true);
  readonly hasNoData = computed(() => this.albums()?.length === 0 && this.isLoading() === false && this.error() === undefined);
  readonly shouldRetry = computed(() => this.isLoading() === false && this.error() !== undefined);

  readonly isInfiniteScrollDisabled = computed(() => this.isLoading() === true || this.error() !== undefined || this.state.loadCompleted() === true);

  private readonly loadAlbums = rxMethod<{ textSearch: string, pageNumber: number }>(
    pipe(
      startWith({ ...this.state.params() }),
      tap(() => patchState(this.state, state => ({
        albums: state.params.pageNumber === 1 ? [] : state.albums,
        loading: true,
        error: undefined,
      }))),
      switchMap(({ textSearch, pageNumber }) => this.albumsDataClient.getAlbums(textSearch, pageNumber)
        .pipe(
          tapResponse({
            next: data => {
              patchState(this.state, state => ({
                albums: [...state.albums, ...data.albums],
                loadCompleted: data.lastPage,
              }));
            },
            error: (err: string) => patchState(this.state, () => ({ error: err })),
            finalize: () => patchState(this.state, () => ({ loading: false })),
          }),
        ),
      ),
    ),
  );

  setup() {
    this.loadAlbums(this.state.params);
  }

  ngOnDestroy() {
    this.loadAlbums?.unsubscribe();
  }

  updateParams(params: { textSearch: string, pageNumber: number }) {
    patchState(this.state, () => ({ params: { ...params } }));
  }

  retry() {
    patchState(this.state, state => ({ params: { ...state.params } }));
  }
}
