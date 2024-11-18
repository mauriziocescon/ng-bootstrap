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
  standalone: true,
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

      <div class="full-width-message" [hidden]="!usersStore.loading()">{{ "USERS.LOADING" | transloco }}</div>
      <div class="full-width-message" [hidden]="!usersStore.hasNoData()">{{ "USERS.NO_RESULT" | transloco }}</div>
      <div class="full-width-message" [hidden]="!usersStore.isLoadCompleted()">{{ "USERS.LOAD_COMPLETED" | transloco }}</div>
      <div class="full-width-message" [hidden]="!usersStore.shouldRetry()" (click)="retry()"> {{ "USERS.RETRY" | transloco }}</div>
      <app-scroll-to-top/>
    </div>`,
  styles: `
    .users-component {
      padding-top: 10px;

      .user {
        padding-top: 10px;
        padding-bottom: 10px;
      }
    }
  `,
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
