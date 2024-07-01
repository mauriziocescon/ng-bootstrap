import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import {
  catchError,
  map,
} from 'rxjs/operators';

import { AppConstantsService } from '../core/app-constants.service';

import { User } from './user.model';

@Injectable()
export class UsersService {
  private http = inject(HttpClient);
  private appConstants = inject(AppConstantsService);

  getUsers(textFilter: string | undefined): Observable<{ users: User[] }> {
    const url = this.appConstants.Api.users;
    const params = { q: textFilter || '' };

    return this.http.get<User[]>(url, { params })
      .pipe(
        map(data => ({ users: data })),
        catchError((err: HttpErrorResponse) => this.handleError(err)),
      );
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    if (err.status === 0) {
      // A client-side or network error occurred
      return throwError(() => err.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      return throwError(() => `Code ${err.status}, body: ${err.message}`);
    }
  }
}
