import { Component, OnInit } from '@angular/core';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { ICorsi } from '../../../../shared/models/Corsi';
import { CorsiService } from '../../../../core/services/data/corsi.service';
import { ToastrService } from 'ngx-toastr';
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../core/modal/modal.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PiattaformeService } from '../../../../core/services/data/piattaforme.service';
import { IPiattaforma } from '../../../../shared/models/Piattaforma';

@Component({
  selector: 'app-corsi',
  imports: [PageTitleComponent, ToastrModule, CommonModule, ModalComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './corsi.component.html',
  styleUrls: ['./corsi.component.css'],
  standalone: true
})

export class CorsiComponent implements OnInit {
  title: string = 'Corsi';
  icon: string = 'fa-solid fa-book';
  corsi: ICorsi[] = [];
  piattaforme: IPiattaforma[] = [];
  modalActionType: string = '';
  isOpenModal = false;
  modalTitle: string = '';
  corsoToDelete: number = 0;
  form!: FormGroup;
  submitted = false;


  constructor(
    private corsiService: CorsiService,
    private piattaformeService: PiattaformeService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder
  ) {

  }

  ngOnInit(): void {
    this.loadCorsi();
    this.initializeForm();
  }


  private loadCorsi() {
    this.corsiService.getListaCorsi().subscribe({
      next: data => {
        this.corsi = data;
      }
    });
  }

  private loadPiattaforme() {
    this.piattaformeService.getListaPiattaforme().subscribe({
      next: data => {
        this.piattaforme = data;
      }
    });
  }

  deleteCorso(id: number) {
    this.corsiService.deleteCorso(id).subscribe({
      next: () => {
        this.loadCorsi();
        this.toastr.success('Corso eliminato con successo');
      },
      error: (error) => {
        console.error('Errore durante l\'eliminazione del corso:', error);
        this.toastr.error('Errore durante l\'eliminazione del corso');
      }
    });
    this.closeModal();
}



  addCorso(corso: ICorsi) {
      this.corsiService.createCorso(corso).subscribe({
        next: () => {
          this.loadCorsi();
          this.toastr.success('Corso eliminato con successo');
        },
        error: (error) => {
          console.error('Errore durante l\'eliminazione del corso:', error);
          this.toastr.error('Errore durante l\'eliminazione del corso');
        }
      });
      this.closeModal();
  }


  openModal(type: string, corso?: ICorsi) {
    if (type === 'ADD' || type === 'EDIT') {
      this.loadPiattaforme();
    }
    this.modalActionType = type;
    this.isOpenModal = true;
    this.setModalTitle();
    if (type === 'EDIT' && corso) {
      //this.corsoToDelete = corso.id; // Salva il corso selezionato
      this.form.patchValue({
        nome: corso.nome,
        argomento: corso.argomento,
        durata: corso.durata,
        piattaforma: corso.piattaforma?.id || ''
      });
    } else if (type === 'DELETE' && corso) {
      this.corsoToDelete = corso.id; // Per DELETE salva solo il riferimento
    }

  }

  
  setModalTitle() {
    const titles: Record<string, string> = {
      EDIT: 'Modifica Corso',
      ADD: 'Aggiungi Corso',
      DELETE: 'Elimina Corso'
    };
    this.modalTitle = titles[this.modalActionType] || '';
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
      argomento: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(499),
        ],
      ],
      durata: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(254),
        ],
      ],
      piattaforma: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.modalActionType === 'EDIT' || this.modalActionType === 'ADD') {
      if (this.form.invalid) return;
    }
    this.performAction();
  }

  async performAction() {
    switch (this.modalActionType) {
      case 'EDIT':
        //this.updateService(negozio.shopId);
        break;
      case 'ADD':
        this.addCorso(this.form.value);
        break;
      case 'DELETE':
        this.deleteCorso(this.corsoToDelete);
        break;
      default:
        console.error('Azione non supportata');
    }
  }

  closeModal() {
    this.isOpenModal = false;
  }



} 