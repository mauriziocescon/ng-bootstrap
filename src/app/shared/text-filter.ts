import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { outputFromObservable, toObservable } from '@angular/core/rxjs-interop';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import isEmpty from 'lodash/isEmpty';

import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-text-filter',
  imports: [
    FormsModule,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="input-group">
      <input
        type="text"
        class="form-control"
        placeholder="{{ 'TEXT_FILTER.PLACEHOLDER' | transloco }}"
        [(ngModel)]="value">
      <span class="input-group-text addon" (click)="resetTextFilter()">
        <span class="bi bi-search" [hidden]="isNotEmpty()"></span>
        <span class="bi bi-x" [hidden]="!isNotEmpty()"></span>
      </span>
    </div>`,
  styles: `
    .addon {
      color: var(--primary-color);
    }
  `,
})
export class TextFilter {
  protected readonly value = signal('');
  protected readonly isNotEmpty = computed(() => !isEmpty(this.value()));

  protected readonly value$ = toObservable(this.value).pipe(debounceTime(500), distinctUntilChanged());
  readonly valueDidChange = outputFromObservable(this.value$);

  resetTextFilter() {
    this.value.set('');
  }
}
