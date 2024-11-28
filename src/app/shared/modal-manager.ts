import { inject, Injectable } from '@angular/core';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ModalAlert } from './modal-alert';
import { ModalConfirmer } from './modal-confirmer';

@Injectable({
  providedIn: 'root',
})
export class ModalManager {
  private readonly ngbModal = inject(NgbModal);

  alert(title: string, message: string, buttonLabel: string) {
    const modalRef = this.ngbModal.open(ModalAlert);
    modalRef.componentInstance.title.set(title);
    modalRef.componentInstance.message.set(message);
    modalRef.componentInstance.buttonLabel.set(buttonLabel);

    modalRef.result
      .then(result => console.log(`Closed with: ${result}`))
      .catch(reason => console.log(`Dismissed ${this.getDismissReason(reason)}`));
  }

  confirmer(title: string, message: string, yesButtonLabel: string, noButtonLabel: string, callback: (result: boolean) => void) {
    const modalRef = this.ngbModal.open(ModalConfirmer);
    modalRef.componentInstance.title.set(title);
    modalRef.componentInstance.message.set(message);
    modalRef.componentInstance.yesButtonLabel.set(yesButtonLabel);
    modalRef.componentInstance.noButtonLabel.set(noButtonLabel);

    modalRef.result
      .then(result => {
        console.log(`Closed with: ${result}`);
        callback(result);
      })
      .catch(reason => console.log(`Dismissed ${this.getDismissReason(reason)}`));
  }

  private getDismissReason(reason: any) {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
