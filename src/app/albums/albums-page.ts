import { ChangeDetectionStrategy, Component, effect, inject, OnInit, untracked } from '@angular/core';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

import { ScrollToTop } from '../shared/scroll-to-top';
import { TextFilter } from '../shared/text-filter';
import { ModalManager } from '../shared/modal-manager';

import { AlbumCard } from './album/album-card';

import { AlbumsDataClient } from './albums-data-client';
import { AlbumsStore } from './albums-store';

@Component({
  selector: 'app-albums',
  imports: [
    TranslocoPipe,
    InfiniteScrollDirective,
    ScrollToTop,
    TextFilter,
    AlbumCard,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    AlbumsDataClient,
    AlbumsStore,
  ],
  template: `
    <div class="container-fluid albums-page"
         infiniteScroll
         [infiniteScrollDisabled]="albumsStore.isInfiniteScrollDisabled()"
         (scrolled)="updateParams()">

      <div class="row">
        <div class="col-12">
          <app-text-filter (valueDidChange)="textSearchDidChange($event)"/>
        </div>
      </div>

      <div class="row">
        @for (album of albumsStore.albums(); track album.id) {
          <div class="col-12 col-sm-6 album">
            <app-album [album]="album"/>
          </div>
        }
      </div>

      @if (albumsStore.isLoading()) {
        <div class="full-width-message">{{ "ALBUMS.LOADING" | transloco }}</div>
      } @else if (albumsStore.hasNoData()) {
        <div class="full-width-message">{{ "ALBUMS.NO_RESULT" | transloco }}</div>
      } @else if (albumsStore.isLoadCompleted()) {
        <div class="full-width-message">{{ "ALBUMS.LOAD_COMPLETED" | transloco }}</div>
      } @else if (albumsStore.shouldRetry()) {
        <div class="full-width-message" (click)="retry()"> {{ "ALBUMS.RETRY" | transloco }}</div>
      }
      <app-scroll-to-top/>

    </div>`,
  styles: `
    .albums-page {
      padding-top: 10px;

      .album {
        padding-top: 10px;
        padding-bottom: 10px;
      }
    }`,
})
export class AlbumsPage implements OnInit {
  private transloco = inject(TranslocoService);
  private modalManager = inject(ModalManager);
  albumsStore = inject(AlbumsStore);

  private errorWatcher = effect(() => {
    this.albumsStore.error();
    untracked(() => {
      if (this.albumsStore.error()) {
        this.modalManager.modalAlert(
          this.transloco.translate('ALBUMS.ERROR_ACCESS_DATA'),
          this.albumsStore.error() as string,
          this.transloco.translate('ALBUMS.CLOSE'),
        );
      }
    });
  });

  ngOnInit(): void {
    this.albumsStore.setup();
  }

  textSearchDidChange(textSearch: string): void {
    this.albumsStore.updateParams({ textSearch, pageNumber: 1 });
  }

  updateParams(): void {
    if (!this.albumsStore.isLoadCompleted() && !this.albumsStore.isLoading()) {
      if (this.albumsStore.error()) {
        this.albumsStore.updateParams({ ...this.albumsStore.params() });
      } else {
        this.albumsStore.updateParams({
          ...this.albumsStore.params(),
          pageNumber: this.albumsStore.params().pageNumber + 1,
        });
      }
    }
  }

  retry(): void {
    this.albumsStore.retry();
  }
}
