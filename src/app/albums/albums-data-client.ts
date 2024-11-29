import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AppConstants } from '../core/app-constants';

import { Album } from './album';

@Injectable({
  providedIn: 'root',
})
export class AlbumsDataClient {
  private readonly http = inject(HttpClient);
  private readonly appConstants = inject(AppConstants);

  getAlbums(textFilter: string | undefined, page: number) {
    const url = this.appConstants.Api.albums;
    const _start = (page - 1) * 20, _limit = 20;
    const params = { q: textFilter || '', _start, _limit };

    return this.http.get<Album[]>(url, { params, observe: 'response' })
      .pipe(
        map(response => {
          const numOfItems = parseInt(response.headers.get('X-Total-Count') || '0', 10);
          const lastPage = _start + _limit >= numOfItems;

          return { albums: response.body as Album[], lastPage };
        }),
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
