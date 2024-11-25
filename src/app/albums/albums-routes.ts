import { Route } from '@angular/router';

import { AlbumsPage } from './albums-page';

export default [
  {
    path: '',
    component: AlbumsPage,
    title: 'Albums',
  },
] satisfies Route[];
