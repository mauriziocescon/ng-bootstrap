import { TestBed } from '@angular/core/testing';

import { TranslocoTestingModule } from '@jsverse/transloco';

import { NavigationBar } from './shared/navigation-bar';

import { App } from './app';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { de: {}, en: {}, it: {} },
          translocoConfig: {
            availableLangs: ['de', 'en', 'it'],
            defaultLang: 'en',
          },
          preloadLangs: true,
        }),
        NavigationBar,
        App,
      ],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
