import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-alert',
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
      <button type="button" class="btn btn-primary" (click)="close()">{{ buttonLabel() }}</button>
    </div>`,
})
export class ModalAlert {
  private readonly activeModal = inject(NgbActiveModal);

  readonly title = signal<string | undefined>(undefined);
  readonly message = signal<string | undefined>(undefined);
  readonly buttonLabel = signal<string | undefined>(undefined);

  close() {
    this.activeModal.close('Close click');
  }

  dismiss() {
    this.activeModal.dismiss('Dismiss click');
  }
}
