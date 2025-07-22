import { ChangeDetectionStrategy, Component, computed, OnDestroy, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
        [(ngModel)]="value"
        (ngModelChange)="valueChange()">
      <span class="input-group-text addon" (click)="resetTextFilter()">
        <span class="bi bi-search" [hidden]="isNotEmpty()"></span>
        <span class="bi bi-x" [hidden]="!isNotEmpty()"></span>
      </span>
    </div>`,
  styles: `
    .addon {
      color: var(--primary-color);
    }`,
})
export class TextFilter implements OnDestroy {
  readonly valueDidChange = output<string>();

  protected readonly value = signal('');
  protected readonly isNotEmpty = computed(() => !isEmpty(this.value()));
  protected timeoutRef: number | undefined = undefined;
  
  ngOnDestroy() {
    clearTimeout(this.timeoutRef);
  }

  valueChange() {
    clearTimeout(this.timeoutRef);

    this.timeoutRef = setTimeout(() => {
      this.valueDidChange.emit(this.value());
    }, 500);
  }

  resetTextFilter() {
    this.value.set('');
    this.valueDidChange.emit(this.value());
  }
}
