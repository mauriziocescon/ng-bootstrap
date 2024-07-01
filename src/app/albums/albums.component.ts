import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { EMPTY, Subscription } from 'rxjs';
import {
  catchError,
  debounceTime,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

import { ScrollToTopComponent } from '../shared/scroll-to-top.component';
import { TextFilterComponent } from '../shared/text-filter.component';
import { UIUtilitiesService } from '../shared/ui-utilities.service';

import { AlbumComponent } from './album/album.component';

import { AlbumsService } from './albums.service';
import { Album } from './album.model';

@Component({
  selector: 'app-albums',
  standalone: true,
  imports: [
    TranslocoPipe,
    InfiniteScrollDirective,
    ScrollToTopComponent,
    TextFilterComponent,
    AlbumComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    AlbumsService,
  ],
  template: `
    <div class="container-fluid albums-component"
         infiniteScroll
         [infiniteScrollDisabled]="isInfiniteScrollDisabled()"
         (scrolled)="onScroll()">

      <div class="row">
        <div class="col-12">
          <app-text-filter (valueDidChange)="textSearchDidChange($event)"/>
        </div>
      </div>

      <div class="row">
        @for (album of this.albums(); track album.id) {
          <div class="col-12 col-sm-6 album">
            <app-album [album]="album"/>
          </div>
        }
      </div>

      <div class="full-width-message" [hidden]="!isLoading()">{{ "ALBUMS.LOADING" | transloco }}</div>
      <div class="full-width-message" [hidden]="!hasNoData()">{{ "ALBUMS.NO_RESULT" | transloco }}</div>
      <div class="full-width-message" [hidden]="!isLoadCompleted()">{{ "ALBUMS.LOAD_COMPLETED" | transloco }}</div>
      <div class="full-width-message" [hidden]="!shouldRetry()" (click)="retry()"> {{ "ALBUMS.RETRY" | transloco }}
      </div>
      <app-scroll-to-top/>
    </div>`,
  styles: `
    .albums-component {
      padding-top: 10px;

      .album {
        padding-top: 10px;
        padding-bottom: 10px;
      }
    }
  `,
})
export class AlbumsComponent implements OnInit, OnDestroy {
  private transloco = inject(TranslocoService);
  private uiUtilities = inject(UIUtilitiesService);
  private albumsService = inject(AlbumsService);

  params = signal<{ textSearch: string | undefined, pageNumber: number }>({ textSearch: undefined, pageNumber: 1 });
  albums = signal<Album[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | undefined>(undefined);
  loadCompleted = signal<boolean>(false);
  isLoadCompleted = computed<boolean>(() => this.isLoading() === false && this.albums()?.length > 0 && this.loadCompleted() === true);
  hasNoData = computed(() => this.albums()?.length === 0 && this.isLoading() === false && this.error() === undefined);
  shouldRetry = computed(() => this.isLoading() === false && this.error() !== undefined);

  isInfiniteScrollDisabled = computed(() => this.isLoading() === true || this.error() !== undefined || this.loadCompleted() === true);

  private params$ = toObservable(this.params);
  private paramsSubscription: Subscription | undefined;

  ngOnInit(): void {
    this.params.set({ textSearch: undefined, pageNumber: 1 });
    this.albums.set([]);
    this.isLoading.set(false);
    this.error.set(undefined);
    this.loadCompleted.set(false);
    this.loadData();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  textSearchDidChange(textSearch: string): void {
    this.params.set({ textSearch, pageNumber: 1 });
    this.albums.set([]);
  }

  onScroll(): void {
    if (!this.loadCompleted() && !this.isLoading()) {
      if (this.error()) {
        this.params.update(v => ({ ...v }));
      } else {
        this.params.update(v => ({ ...v, pageNumber: v.pageNumber + 1 }));
      }
    }
  }

  loadData(): void {
    this.paramsSubscription?.unsubscribe();

    this.paramsSubscription = this.params$
      .pipe(
        startWith({ ...this.params() }),
        tap(() => this.isLoading.set(true)),
        tap(() => this.error.set(undefined)),
        debounceTime(50),
        switchMap(({ textSearch, pageNumber }) => this.albumsService.getAlbums(textSearch, pageNumber)
          .pipe(catchError(err => {
              this.isLoading.set(false);
              this.error.set(err);
              this.uiUtilities.modalAlert(
                this.transloco.translate('ALBUMS.ERROR_ACCESS_DATA'),
                err,
                this.transloco.translate('ALBUMS.CLOSE'),
              );
              return EMPTY;
            }),
          )),
        tap(() => this.isLoading.set(false)),
      )
      .subscribe(data => {
        this.albums.update(a => [...a, ...(data.albums)]);
        this.loadCompleted.set(data.lastPage);
      });
  }

  retry(): void {
    this.loadData();
  }

  unsubscribeAll(): void {
    this.paramsSubscription?.unsubscribe();
  }
}
