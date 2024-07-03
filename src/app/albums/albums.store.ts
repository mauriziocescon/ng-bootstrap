import { computed, inject, Injectable, OnDestroy } from '@angular/core';

import { pipe } from 'rxjs';
import { debounceTime, startWith, switchMap, tap } from 'rxjs/operators';
import { patchState, signalState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { Album } from './album.model';

import { AlbumsService } from './albums.service';

type AlbumState = {
  params: { textSearch: string | undefined, pageNumber: number };
  albums: Album[],
  loading: boolean;
  error: string | undefined,
  loadCompleted: boolean,
};

@Injectable()
export class AlbumsStore implements OnDestroy {
  private albumsService = inject(AlbumsService);

  private albumState = signalState<AlbumState>({
    params: { textSearch: undefined, pageNumber: 1 },
    albums: [],
    loading: false,
    error: undefined,
    loadCompleted: false,
  });

  params = computed(() => this.albumState.params());
  albums = computed(() => this.albumState.albums());
  isLoading = computed(() => this.albumState.loading());
  error = computed(() => this.albumState.error());
  isLoadCompleted = computed<boolean>(() => this.isLoading() === false && this.albums()?.length > 0 && this.albumState.loadCompleted() === true);
  hasNoData = computed(() => this.albums()?.length === 0 && this.isLoading() === false && this.error() === undefined);
  shouldRetry = computed(() => this.isLoading() === false && this.error() !== undefined);

  isInfiniteScrollDisabled = computed(() => this.isLoading() === true || this.error() !== undefined || this.albumState.loadCompleted() === true);

  private paramsSubscription = rxMethod<{ textSearch: string | undefined, pageNumber: number }>(
    pipe(
      startWith({ ...this.albumState.params() }),
      tap(() => patchState(this.albumState, state => ({
        albums: state.params.pageNumber === 1 ? [] : state.albums,
        loading: true,
        error: undefined,
      }))),
      debounceTime(50),
      switchMap(({ textSearch, pageNumber }) => this.albumsService.getAlbums(textSearch, pageNumber)
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

  updateParams(params: { textSearch: string | undefined, pageNumber: number }): void {
    patchState(this.albumState, state => ({ params: { ...params }, users: [] }));
  }

  retry(): void {
    patchState(this.albumState, state => ({ params: { ...state.params }, albums: [] }));
  }
}
