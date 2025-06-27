import { Component, OnInit } from '@angular/core';
import { ICorsi } from '../../../../shared/models/Corsi';
import { CorsiService } from '../../../../core/services/data/corsi.service';
import { ToastrService } from 'ngx-toastr';
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../core/modal/modal.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  DataTableComponent,
  TableColumn,
  TableAction,
  TableConfig,
} from '../../../../shared/components/data-table/data-table.component';
import { PiattaformeService } from '../../../../core/services/data/piattaforme.service';
import { IPiattaforma } from '../../../../shared/models/Piattaforma';

@Component({
  selector: 'app-corsi',
  imports: [
    ToastrModule,
    CommonModule,
    ModalComponent,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
  ],
  templateUrl: './corsi.component.html',
  styleUrls: ['./corsi.component.css'],
  standalone: true,
})
export class CorsiComponent implements OnInit {
  corsi: ICorsi[] = [];
  piattaforme: IPiattaforma[] = [];
  modalActionType: string = '';
  isOpenModal = false;
  modalTitle: string = '';
  corsoToDelete: number = 0;
  form!: FormGroup;
  submitted = false;

  // Data table configuration
  columns: TableColumn[] = [
    {
      key: 'nome',
      label: 'Nome',
      sortable: true,
      type: 'text',
    },
    {
      key: 'argomento',
      label: 'Macro argomento',
      sortable: true,
      type: 'text',
    },
    {
      key: 'durata',
      label: 'Durata',
      sortable: true,
      type: 'text',
    },
    {
      key: 'piattaforma.nome',
      label: 'Piattaforma',
      sortable: true,
      type: 'text',
    },
  ];

  actions: TableAction[] = [
    {
      label: 'Modifica',
      icon: 'edit',
      type: 'secondary',
      handler: (corso: ICorsi) => this.openModal('EDIT', corso),
      visible: () => true,
    },
    {
      label: 'Elimina',
      icon: 'delete',
      type: 'danger',
      handler: (corso: ICorsi) => this.openModal('DELETE', corso),
      visible: () => true,
    },
  ];

  tableConfig: TableConfig = {
    loading: false,
    selectable: false,
    emptyMessage: 'Nessun corso disponibile',
  };

  constructor(
    private corsiService: CorsiService,
    private piattaformeService: PiattaformeService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loadCorsi();
    this.initializeForm();
  }

  private loadCorsi() {
    this.tableConfig.loading = true;
    this.corsiService.getListaCorsi().subscribe({
      next: data => {
        console.log('Corsi data received:', data);
        this.corsi = data;
        this.tableConfig.loading = false;
      },
      error: error => {
        console.error('Error loading corsi:', error);
        this.tableConfig.loading = false;
        this.toastr.error('Errore nel caricamento dei corsi');
      },
    });
  }

  private loadPiattaforme() {
    this.piattaformeService.getListaPiattaforme().subscribe({
      next: data => {
        this.piattaforme = data;
      },
    });
  }

  deleteCorso(id: number) {
    this.corsiService.deleteCorso(id).subscribe({
      next: () => {
        this.loadCorsi();
        this.toastr.success('Corso eliminato con successo');
      },
      error: error => {
        console.error("Errore durante l'eliminazione del corso:", error);
        this.toastr.error("Errore durante l'eliminazione del corso");
      },
    });
    this.closeModal();
  }

  addCorso(corso: ICorsi) {
    const corsoToSave = {
      ...this.form.value,
      piattaforma: {
        id: parseInt(this.form.value.piattaforma),
      },
    };

    this.corsiService.createCorso(corsoToSave).subscribe({
      next: () => {
        this.loadCorsi();
        this.toastr.success('Corso aggiunto con successo');
      },
      error: error => {
        this.toastr.error("Errore durante l'aggiunta del corso");
      },
    });
    this.closeModal();
  }

  updateCorso(id: number) {
    const corsoToSave = {
      ...this.form.value,
      piattaforma: {
        id: parseInt(this.form.value.piattaforma),
      },
    };

    this.corsiService.updateCorso(id, corsoToSave).subscribe({
      next: () => {
        this.loadCorsi();
        this.toastr.success('Corso modificato con successo');
      },
      error: error => {
        this.toastr.error('Errore durante la modifica del corso');
      },
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
    this.onReset();
    if (type === 'EDIT' && corso) {
      this.corsoToDelete = corso.id;
      this.form.patchValue({
        nome: corso.nome,
        argomento: corso.argomento,
        durata: corso.durata,
        piattaforma: corso.piattaforma?.id || '',
      });
    } else if (type === 'DELETE' && corso) {
      this.corsoToDelete = corso.id;
    }
  }

  setModalTitle() {
    const titles: Record<string, string> = {
      EDIT: 'Modifica Corso',
      ADD: 'Aggiungi Corso',
      DELETE: 'Elimina Corso',
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
        this.updateCorso(this.corsoToDelete);
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

  onReset() {
    this.form.reset();
    this.submitted = false;
  }
}
