import { Route } from '@angular/router';

import { UsersComponent } from './users.component';

export default [
  {
    path: '',
    component: UsersComponent,
    title: 'Users',
  },
] satisfies Route[];
