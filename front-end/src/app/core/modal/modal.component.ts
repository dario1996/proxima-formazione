import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  @Input() title = '';
  @Input() isOpen = false;
  // @Output() save = new EventEmitter<void>();
  // @Output() delete = new EventEmitter<void>();
  // @Output() add = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();
  @Output() action = new EventEmitter<void>();

  // onSave() {
  //   this.save.emit();
  // }

  // onDelete() {
  //   this.delete.emit();
  // }

  // onAdd() {
  //   this.add.emit();
  // }

  onCloseModal() {
    this.closeModal.emit();
  }

  onActionClick() {
    this.action.emit();
  }
}
