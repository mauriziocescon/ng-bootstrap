import { Route } from '@angular/router';

import { UsersPage } from './users-page';

export default [
  {
    path: '',
    component: UsersPage,
    title: 'Users',
  },
] satisfies Route[];
