import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AppConstants } from '../core/app-constants';

import { User } from './user';

@Injectable({
  providedIn: 'root',
})
export class UsersDataClient {
  private readonly http = inject(HttpClient);
  private readonly appConstants = inject(AppConstants);

  getUsers(textFilter: string | undefined) {
    const url = this.appConstants.Api.users;
    const params = { q: textFilter || '' };

    return this.http.get<User[]>(url, { params })
      .pipe(
        map(data => data),
        catchError((err: HttpErrorResponse) => this.handleError(err)),
      );
  }

  private handleError(err: HttpErrorResponse) {
    if (err.status === 0) {
      // A client-side or network error occurred
      return throwError(() => err.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      return throwError(() => `Code ${err.status}, body: ${err.message}`);
    }
  }
}
