import { ChangeDetectionStrategy, Component, effect, inject, OnInit, untracked } from '@angular/core';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ScrollToTopComponent } from '../shared/scroll-to-top.component';
import { TextFilterComponent } from '../shared/text-filter.component';
import { UIUtilitiesService } from '../shared/ui-utilities.service';

import { UserComponent } from './user/user.component';

import { UsersService } from './users.service';
import { UsersStore } from './users.store';

@Component({
  selector: 'app-users',
  imports: [
    TranslocoPipe,
    ScrollToTopComponent,
    TextFilterComponent,
    UserComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    UsersService,
    UsersStore,
  ],
  template: `
    <div class="container-fluid users-component">

      <div class="row">
        <div class="col-12">
          <app-text-filter (valueDidChange)="textSearchDidChange($event)"/>
        </div>
      </div>

      <div class="row">
        @for (user of usersStore.users(); track user.id) {
          <div class="col-12 col-sm-6 user">
            <app-user [user]="user"/>
          </div>
        }
      </div>

      @if (usersStore.loading()) {
        <div class="full-width-message">{{ "USERS.LOADING" | transloco }}</div>
      } @else if (usersStore.hasNoData()) {
        <div class="full-width-message">{{ "USERS.NO_RESULT" | transloco }}</div>
      } @else if (usersStore.isLoadCompleted()) {
        <div class="full-width-message">{{ "USERS.LOAD_COMPLETED" | transloco }}</div>
      } @else if (usersStore.shouldRetry()) {
        <div class="full-width-message" (click)="retry()"> {{ "USERS.RETRY" | transloco }}</div>
      }
      <app-scroll-to-top/>
      
    </div>`,
  styles: `
    .users-component {
      padding-top: 10px;

      .user {
        padding-top: 10px;
        padding-bottom: 10px;
      }
    }`,
})
export class UsersComponent implements OnInit {
  private transloco = inject(TranslocoService);
  private uiUtilities = inject(UIUtilitiesService);
  usersStore = inject(UsersStore);

  private errorWatcher = effect(() => {
    this.usersStore.error();
    untracked(() => {
      if (this.usersStore.error()) {
        this.uiUtilities.modalAlert(
          this.transloco.translate('USERS.ERROR_ACCESS_DATA'),
          this.usersStore.error() as string,
          this.transloco.translate('USERS.CLOSE'),
        );
      }
    });
  });

  ngOnInit(): void {
    this.usersStore.setup();
  }

  textSearchDidChange(textSearch: string): void {
    this.usersStore.updateParams({ textSearch });
  }

  retry(): void {
    this.usersStore.retry();
  }
}
