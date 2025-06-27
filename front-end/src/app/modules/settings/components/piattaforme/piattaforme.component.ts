import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { IPiattaforma } from '../../../../shared/models/Piattaforma';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../core/modal/modal.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-piattaforme',
  standalone: true,
  imports: [CommonModule, ModalComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './piattaforme.component.html',
  styleUrl: './piattaforme.component.css',
})
export class PiattaformeComponent {
  @Input() piattaforme: IPiattaforma[] = [];
  @Input() closeModalSignal = 0;
  @Output() action = new EventEmitter<{
    tab: string;
    type: string;
    payload?: any;
  }>();

  // Modale
  isOpenModal = false;
  modalTitle = '';
  modalActionType = '';
  selectedPiattaforma?: IPiattaforma;

  // Form
  form!: FormGroup;
  submitted = false;

  constructor(private formBuilder: FormBuilder) {}

  openModal(type: string, piattaforma?: IPiattaforma) {
    this.initializeForm();
    this.modalActionType = type;
    this.selectedPiattaforma = piattaforma;
    this.isOpenModal = true;
    this.setModalTitle();

    // Autocompila i campi se in modalità EDIT e piattaforma presente
    if (type === 'EDIT' && piattaforma) {
      this.form.patchValue({
        nome: piattaforma.nome,
        descrizione: piattaforma.descrizione,
        urlSito: piattaforma.urlSito,
        attiva: piattaforma.attiva ? 'true' : 'false',
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['closeModalSignal'] &&
      !changes['closeModalSignal'].firstChange
    ) {
      this.closeModal();
    }
  }

  initializeForm() {
    this.form = this.formBuilder.group({
      nome: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(99),
        ],
      ],
      descrizione: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(499),
        ],
      ],
      urlSito: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(254),
        ],
      ],
      attiva: ['', [Validators.required]],
    });
  }

  setModalTitle() {
    const titles: Record<string, string> = {
      EDIT: 'Modifica Piattaforma',
      ADD: 'Aggiungi Piattaforma',
      DELETE: 'Conferma Eliminazione',
    };
    this.modalTitle = titles[this.modalActionType] || '';
  }

  closeModal() {
    this.isOpenModal = false;
    this.onReset();
  }

  onReset() {
    this.submitted = false;
    this.form?.reset();
  }

  onSubmit() {
    this.submitted = true;
    if (
      (this.modalActionType === 'EDIT' || this.modalActionType === 'ADD') &&
      this.form.invalid
    )
      return;

    let payload;
    if (this.modalActionType === 'DELETE') {
      payload = this.selectedPiattaforma;
    } else if (this.modalActionType === 'EDIT') {
      payload = { ...this.form.value, id: this.selectedPiattaforma?.id };
    } else {
      payload = this.form.value;
    }

    this.action.emit({
      tab: 'piattaforme',
      type: this.modalActionType,
      payload,
    });
    this.closeModal();
  }

  // Questi metodi aprono la modale con il giusto tipo
  modifica(id: number) {
    const piattaforma = this.piattaforme.find(p => p.id === id);
    this.openModal('EDIT', piattaforma);
  }

  elimina(id: number) {
    const piattaforma = this.piattaforme.find(p => p.id === id);
    this.openModal('DELETE', piattaforma);
  }
}
