import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { distinctUntilChanged, Subscription } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-text-filter',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="input-group">
      <input type="text"
             class="form-control"
             placeholder="{{ 'TEXT_FILTER.PLACEHOLDER' | transloco }}"
             [formControl]="searchControl">
      <span class="input-group-text addon" (click)="resetTextFilter()">
        <span class="bi bi-search" [hidden]="isTextFilterNotEmpty()"></span>
        <span class="bi bi-x" [hidden]="!isTextFilterNotEmpty()"></span>
      </span>
    </div>`,
  styles: `
    .addon {
      color: var(--primary-color);
    }
  `,
})
export class TextFilterComponent implements OnInit, OnDestroy {
  valueDidChange = output<string>();

  searchControl = new FormControl<string>('');
  private searchControlSubscription: Subscription | undefined;

  isTextFilterNotEmpty = toSignal(this.searchControl.valueChanges.pipe(map(v => v !== '')));

  ngOnInit(): void {
    this.subscribeToSearchControlValueChanges();
  }

  ngOnDestroy(): void {
    this.searchControlSubscription?.unsubscribe();
  }

  resetTextFilter(): void {
    this.searchControl.setValue('');
  }

  private subscribeToSearchControlValueChanges(): void {
    this.searchControlSubscription?.unsubscribe();

    this.searchControlSubscription = this.searchControl
      .valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(value => this.valueDidChange.emit(value ?? ''));
  }
}
