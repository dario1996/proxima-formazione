/* eslint-disable @angular-eslint/no-input-rename */
import { Component, Input } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent {
  @Input('count')
  notCount = 0;

  isOpenModal = false;
  modalTitle = '';

  openModal() {
    this.isOpenModal = true;
    this.modalTitle = 'Notifiche';
  }

  closeModal() {
    this.isOpenModal = false;
  }
}
