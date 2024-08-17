import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavigationBarComponent } from './shared/navigation-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavigationBarComponent,
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
export class AppComponent {
}
