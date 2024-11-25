import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavigationBar } from './shared/navigation-bar';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavigationBar,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-bar/>
    <div class="main-view">
      <router-outlet/>
    </div>`,
  styles: `
    .main-view {
      padding-top: var(--main-view-pt);
    }`,
})
export class App {
}
