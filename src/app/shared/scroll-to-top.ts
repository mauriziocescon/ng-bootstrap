import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-scroll-to-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bi bi-arrow-up-circle go-up" (click)="scrollToTop()"></div>`,
  styles: `
    .go-up {
      font-size: 3rem;
      position: fixed;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      color: var(--primary-color);
      opacity: 0.7;
      bottom: 5px;
      right: 3%;
      transform: translateX(-50%);
      z-index: 200;
    }`,
})
export class ScrollToTop implements OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);

  private sub: Subscription | undefined = undefined;

  private readonly domReady = afterNextRender(() => {
    this.sub = this.zone.runOutsideAngular(() =>
      fromEvent(window, 'scroll')
        .pipe(debounceTime(250))
        .subscribe(() => this.zone.run(() => this.scroll())),
    );
  });

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  scrollToTop() {
    this.document.documentElement.scrollTop = 0;
  }

  private scroll() {
    const scrollTopHeight = this.document.documentElement.scrollTop || 0;
    if (scrollTopHeight > 100) {
      this.renderer.setStyle(this.el.nativeElement, 'visibility', 'visible');
    } else {
      this.renderer.setStyle(this.el.nativeElement, 'visibility', 'hidden');
    }
  }
}
