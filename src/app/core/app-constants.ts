import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

export class Api {
  albums = environment.apiUrl + 'albums';
  users = environment.apiUrl + 'users';
}

export class Application {
  APP_NAME = 'angular-app';
  SHOW_JSON_SERVER_API = !environment.production;
  JSON_SERVER_API_URL = environment.apiUrl;
}

export class Languages {
  DE = 'de';
  EN = 'en';
  IT = 'it';
  SUPPORTED_LANG = ['de', 'en', 'it'];
  SUPPORTED_LANG_DESC = ['Deutsch', 'English', 'Italiano'];
  DEFAULT_LANGUAGE = 'en';
}

export class LocalStorageKey {
  LANGUAGE_ID = 'LANGUAGE_ID';
}

/**
 * Get application constants
 * grouped by field
 */
@Injectable({
  providedIn: 'root',
})
export class AppConstants {
  private readonly api: Api = new Api();
  private readonly application = new Application();
  private readonly languages = new Languages();
  private readonly localStorageKey = new LocalStorageKey();

  get Api(): Api {
    return this.api;
  }

  get Application(): Application {
    return this.application;
  }

  get Languages(): Languages {
    return this.languages;
  }

  get LocalStorageKey(): LocalStorageKey {
    return this.localStorageKey;
  }
}
