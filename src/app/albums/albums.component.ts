import { ChangeDetectionStrategy, Component, effect, inject, OnInit, untracked } from '@angular/core';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

import { ScrollToTopComponent } from '../shared/scroll-to-top.component';
import { TextFilterComponent } from '../shared/text-filter.component';
import { UIUtilitiesService } from '../shared/ui-utilities.service';

import { AlbumComponent } from './album/album.component';

import { AlbumsService } from './albums.service';
import { AlbumsStore } from './albums.store';

@Component({
  selector: 'app-albums',
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
    AlbumsStore,
  ],
  template: `
    <div class="container-fluid albums-component"
         infiniteScroll
         [infiniteScrollDisabled]="albumsStore.isInfiniteScrollDisabled()"
         (scrolled)="onScroll()">

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
    .albums-component {
      padding-top: 10px;

      .album {
        padding-top: 10px;
        padding-bottom: 10px;
      }
    }`,
})
export class AlbumsComponent implements OnInit {
  private transloco = inject(TranslocoService);
  private uiUtilities = inject(UIUtilitiesService);
  albumsStore = inject(AlbumsStore);

  private errorWatcher = effect(() => {
    this.albumsStore.error();
    untracked(() => {
      if (this.albumsStore.error()) {
        this.uiUtilities.modalAlert(
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

  onScroll(): void {
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
