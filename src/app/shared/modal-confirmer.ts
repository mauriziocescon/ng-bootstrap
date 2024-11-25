import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-confirmer',
  imports: [
    NgbModalModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{ title() }}</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="dismiss()"></button>
    </div>
    <div class="modal-body">
      <p>{{ message() }}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-primary" (click)="yes()">{{ yesButtonLabel() }}</button>
      <button type="button" class="btn btn-default" (click)="no()">{{ noButtonLabel() }}</button>
    </div>`,
})
export class ModalConfirmer {
  private activeModal = inject(NgbActiveModal);

  title = signal<string | undefined>(undefined);
  message = signal<string | undefined>(undefined);
  yesButtonLabel = signal<string | undefined>(undefined);
  noButtonLabel = signal<string | undefined>(undefined);

  yes(): void {
    this.activeModal.close(true);
  }

  no(): void {
    this.activeModal.close(false);
  }

  dismiss(): void {
    this.activeModal.dismiss('Dismiss click');
  }
}
