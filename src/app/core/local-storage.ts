import { inject, Injectable } from '@angular/core';

import { AppConstants } from './app-constants';

/**
 * Manage data in
 * local storage for the
 * application
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorage {
  private readonly appConstants = inject(AppConstants);

  private readonly prefix = this.appConstants.Application.APP_NAME;

  getData<T>(key: string): T | undefined {
    try {
      const result = localStorage.getItem(`${this.prefix}_${key}`);
      return result !== null ? JSON.parse(result) : undefined;
    } catch (e: any) {
      console.warn(e.toString());
      return undefined;
    }
  }

  setData(key: string, data: any) {
    try {
      if (data === undefined) {
        localStorage.removeItem(`${this.prefix}_${key}`);
      } else {
        const result = JSON.stringify(data);
        localStorage.setItem(this.prefix + '_' + key, result);
      }
    } catch (e: any) {
      console.warn(e.toString());
    }
  }

  removeData(key: string) {
    try {
      localStorage.removeItem(this.prefix + '_' + key.toString());
    } catch (e: any) {
      console.warn(e.toString());
    }
  }

  removeAllData() {
    try {
      for (const key in localStorage) {
        if (key.startsWith(`${this.prefix}_`)) {
          localStorage.removeItem(key);
        }
      }
    } catch (e: any) {
      console.warn(e.toString());
    }
  }
}
