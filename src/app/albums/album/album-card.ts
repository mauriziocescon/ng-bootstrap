import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Album } from '../album';

@Component({
  selector: 'app-album-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <div class="card-body">
        <h4 class="card-title">{{ title() }}</h4>
        <h6 class="card-subtitle mb-2 text-muted">{{ subtitle() }}</h6>
      </div>
    </div>`,
})
export class AlbumCard {
  readonly album = input.required<Album>();
  protected readonly title = computed(() => this.album().id);
  protected readonly subtitle = computed(() => this.album().title);
}
