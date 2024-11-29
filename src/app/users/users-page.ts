import { ChangeDetectionStrategy, Component, effect, inject, OnInit, untracked } from '@angular/core';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ScrollToTop } from '../shared/scroll-to-top';
import { TextFilter } from '../shared/text-filter';
import { ModalManager } from '../shared/modal-manager';

import { UserCard } from './user/user-card';

import { UsersDataClient } from './users-data-client';
import { UsersStore } from './users-store';

@Component({
  selector: 'app-users-page',
  imports: [
    TranslocoPipe,
    ScrollToTop,
    TextFilter,
    UserCard,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    UsersDataClient,
    UsersStore,
  ],
  template: `
    <div class="container-fluid users-page">

      <div class="row">
        <div class="col-12">
          <app-text-filter (valueDidChange)="textSearchDidChange($event)"/>
        </div>
      </div>

      <div class="row">
        @for (user of usersStore.users(); track user.id) {
          <div class="col-12 col-sm-6 user">
            <app-user-card [user]="user"/>
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
    .users-page {
      padding-top: 10px;

      .user {
        padding-top: 10px;
        padding-bottom: 10px;
      }
    }`,
})
export class UsersPage implements OnInit {
  private readonly transloco = inject(TranslocoService);
  private readonly modalManager = inject(ModalManager);
  protected readonly usersStore = inject(UsersStore);

  private readonly errorWatcher = effect(() => {
    this.usersStore.error();
    untracked(() => this.showModalError());
  });

  ngOnInit() {
    this.usersStore.setup();
  }

  protected textSearchDidChange(textSearch: string) {
    this.usersStore.updateParams({ textSearch });
  }

  protected retry() {
    this.usersStore.retry();
  }

  private showModalError() {
    if (this.usersStore.error()) {
      this.modalManager.alert(
        this.transloco.translate('USERS.ERROR_ACCESS_DATA'),
        this.usersStore.error() as string,
        this.transloco.translate('USERS.CLOSE'),
      );
    }
  }
}
