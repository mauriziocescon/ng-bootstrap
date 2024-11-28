import { inject, Injectable } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeEn from '@angular/common/locales/en';
import localeIt from '@angular/common/locales/it';

import { TranslocoService } from '@jsverse/transloco';

import { AppConstants } from './app-constants';
import { LocalStorage } from './local-storage';

@Injectable({
  providedIn: 'root',
})
export class AppLanguage {
  private readonly transloco = inject(TranslocoService);
  private readonly appConstants = inject(AppConstants);
  private readonly localStorage = inject(LocalStorage);

  private selectedLanguageId: string;

  constructor() {
    this.selectedLanguageId = this.getDefaultLanguageId();

    this.setup();
    this.transloco.setAvailableLangs(this.appConstants.Languages.SUPPORTED_LANG);
    this.transloco.setDefaultLang(this.appConstants.Languages.DEFAULT_LANGUAGE);
    this.transloco.setActiveLang(this.getLanguageId());
  }

  getLanguageId() {
    return this.selectedLanguageId;
  }

  setLanguageId(languageId: string) {
    if (languageId !== undefined &&
      languageId !== this.selectedLanguageId &&
      this.appConstants.Languages.SUPPORTED_LANG.indexOf(languageId) !== -1) {
      this.localStorage.setData(this.appConstants.LocalStorageKey.LANGUAGE_ID, languageId);
      location.reload();
    }
  }

  getSupportedLanguagesList() {
    return this.appConstants.Languages.SUPPORTED_LANG;
  }

  private getDefaultLanguageId() {
    return this.appConstants.Languages.DEFAULT_LANGUAGE;
  }

  private setup() {
    const localStorageLang = this.localStorage.getData<string>(this.appConstants.LocalStorageKey.LANGUAGE_ID);
    const browserLang = this.getBrowserLang();
    const defaultLang = this.getDefaultLanguageId();

    if (localStorageLang && this.appConstants.Languages.SUPPORTED_LANG.indexOf(localStorageLang) !== -1) {
      this.selectedLanguageId = localStorageLang;
      this.registerLocale();
    } else {
      this.selectedLanguageId = this.appConstants.Languages.SUPPORTED_LANG.indexOf(browserLang) === -1 ? defaultLang : browserLang;
      this.localStorage.setData(this.appConstants.LocalStorageKey.LANGUAGE_ID, this.selectedLanguageId);
      this.registerLocale();
    }
  }

  private getBrowserLang() {
    let lang: string = navigator.language;

    if (lang.length > 0) {
      lang = lang.toLowerCase();
    }

    if (lang.length > 2) {
      lang = lang.substring(0, 2);
    }

    return lang;
  }

  private registerLocale() {
    switch (this.selectedLanguageId) {
      case this.appConstants.Languages.DE: {
        registerLocaleData(localeDe);
        break;
      }
      case this.appConstants.Languages.IT: {
        registerLocaleData(localeIt);
        break;
      }
      default: {
        registerLocaleData(localeEn);
      }
    }
  }
}
