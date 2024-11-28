import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { User } from '../user';

@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <div class="card-body">
        <h4 class="card-title">{{ title() }}</h4>
        <h6 class="card-subtitle mb-2 text-muted">{{ subtitle() }}</h6>
        <p class="card-text">{{ content() }}</p>
      </div>
    </div>`,
})
export class UserCard {
  readonly user = input.required<User>();
  protected readonly title = computed(() => this.user().id);
  protected readonly subtitle = computed(() => this.user().username);
  protected readonly content = computed(() => `${this.user().email} - ${this.user().website}`);
}
