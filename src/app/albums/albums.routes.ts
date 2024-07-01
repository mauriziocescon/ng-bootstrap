import { Route } from '@angular/router';

import { AlbumsComponent } from './albums.component';

export default [
  {
    path: '',
    component: AlbumsComponent,
    title: 'Albums',
  },
] satisfies Route[];
