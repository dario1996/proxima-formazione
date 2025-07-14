import { Component, OnInit } from '@angular/core';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalComponent } from '../../../../core/modal/modal.component';
import { NotificationModalComponent } from '../../../../core/modal/notification-modal.component';
import { ConfirmationModalComponent } from '../../../../core/modal/confirmation-modal.component';

import {
  IAssegnazione,
  AssegnazioneStato,
} from '../../../../shared/models/Assegnazione';
import { IDipendenti } from '../../../../shared/models/Dipendenti';
import { ICorsi } from '../../../../shared/models/Corsi';

import { AssegnazioniService } from '../../../../core/services/data/assegnazioni.service';
import { DipendentiService } from '../../../../core/services/data/dipendenti.service';
import { CorsiService } from '../../../../core/services/data/corsi.service';
import { forkJoin } from 'rxjs';
import { TabellaGenericaComponent } from '../../../../shared/components/tabella-generica/tabella-generica.component';
import { FiltriGenericiComponent } from '../../../../shared/components/filtri-generici/filtri-generici.component';
import { PaginationFooterComponent } from '../../../../shared/components/pagination-footer/pagination-footer.component';

@Component({
  selector: 'app-piano-formativo',
  standalone: true,
  imports: [
    PageTitleComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NotificationModalComponent,
    ConfirmationModalComponent,
    TabellaGenericaComponent,
    FiltriGenericiComponent,
    PaginationFooterComponent,
  ],
  templateUrl: './piano-formativo.component.html',
  styleUrl: './piano-formativo.component.css',
})
export class PianoFormativoComponent implements OnInit {
  title: string = 'Piano Formativo';
  icon: string = 'fa-solid fa-graduation-cap';

  // Data
  assegnazioni: IAssegnazione[] = [];
  filteredAssegnazioni: IAssegnazione[] = [];
  dipendenti: IDipendenti[] = [];
  corsi: ICorsi[] = [];

  // Filtri
  searchTerm: string = '';
  selectedStato: string = '';
  selectedDipendente: string = '';
  selectedCorso: string = '';
  soloObbligatorie: boolean = false;
  richiedeFeedback: boolean = false;

  // Modal per nuova assegnazione
  isAssignModalOpen: boolean = false;
  assignForm!: FormGroup;

  // Search functionality for assign modal
  dipendenteSearchTerm: string = '';
  corsoSearchTerm: string = '';
  filteredDipendenti: IDipendenti[] = [];
  filteredCorsi: ICorsi[] = [];
  assignSelectedDipendente: IDipendenti | null = null;
  assignSelectedCorso: ICorsi | null = null;
  showDipendentiDropdown: boolean = false;
  showCorsiDropdown: boolean = false;

  // Modal per modifica stato
  isStatusModalOpen: boolean = false;
  statusForm!: FormGroup;
  editingAssegnazione: IAssegnazione | null = null;

  // Loading states
  isLoading: boolean = false;
  isSubmitting: boolean = false;

  // Stati disponibili
  stati = Object.values(AssegnazioneStato);

  // Notification and Confirmation modals
  notification = {
    isOpen: false,
    title: '',
    message: '',
    details: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
  };

  confirmation = {
    isOpen: false,
    title: '',
    message: '',
    details: '',
    type: 'warning' as 'danger' | 'warning' | 'info' | 'success',
    action: null as (() => void) | null,
    isProcessing: false,
  };

  constructor(
    private assegnazioniService: AssegnazioniService,
    private dipendentiService: DipendentiService,
    private corsiService: CorsiService,
    private formBuilder: FormBuilder,
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadData();
  }

  private initializeForms() {
    this.assignForm = this.formBuilder.group({
      dipendenteId: ['', [Validators.required]],
      corsoId: ['', [Validators.required]],
      obbligatorio: [false],
    });

    this.statusForm = this.formBuilder.group({
      stato: ['', [Validators.required]],
      percentualeCompletamento: [0, [Validators.min(0), Validators.max(100)]],
      oreCompletate: [0, [Validators.min(0)]],
      valutazione: [null, [Validators.min(1), Validators.max(5)]],
      noteFeedback: [''],
      competenzeAcquisite: [''],
      certificatoOttenuto: [false],
    });
  }

  private loadData() {
    this.isLoading = true;

    // Carica dipendenti, corsi e assegnazioni in parallelo
    forkJoin({
      dipendenti: this.dipendentiService.getListaDipendenti(),
      corsi: this.corsiService.getListaCorsi(),
      assegnazioni: this.assegnazioniService.getAllAssegnazioni(
        undefined,
        false,
        false,
      ),
    }).subscribe({
      next: (result: {
        dipendenti: IDipendenti[];
        corsi: ICorsi[];
        assegnazioni: IAssegnazione[];
      }) => {
        this.dipendenti = result.dipendenti || [];
        this.corsi = result.corsi || [];
        this.assegnazioni = result.assegnazioni || [];
        this.filteredAssegnazioni = this.assegnazioni;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Errore nel caricamento dei dati:', error);
        this.isLoading = false;
        this.showNotification(
          'Errore',
          'Errore nel caricamento dei dati',
          'Si è verificato un errore durante il caricamento. Riprova più tardi.',
          'error',
        );
      },
    });
  }

  // Filtri
  applyFilters() {
    this.filteredAssegnazioni = this.assegnazioni.filter(assegnazione => {
      const matchesSearch =
        !this.searchTerm ||
        assegnazione.dipendente.nome
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        assegnazione.dipendente.cognome
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        assegnazione.corso.nome
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());

      const matchesStato =
        !this.selectedStato || assegnazione.stato === this.selectedStato;
      const matchesDipendente =
        !this.selectedDipendente ||
        assegnazione.dipendente.id.toString() === this.selectedDipendente;
      const matchesCorso =
        !this.selectedCorso ||
        assegnazione.corso.id.toString() === this.selectedCorso;
      const matchesObbligatorie =
        !this.soloObbligatorie || assegnazione.obbligatorio;
      const matchesFeedback =
        !this.richiedeFeedback ||
        (assegnazione.corso.feedbackRichiesto && !assegnazione.feedbackFornito);

      return (
        matchesSearch &&
        matchesStato &&
        matchesDipendente &&
        matchesCorso &&
        matchesObbligatorie &&
        matchesFeedback
      );
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onStatoChange() {
    this.applyFilters();
  }

  onDipendenteChange() {
    this.applyFilters();
  }

  onCorsoChange() {
    this.applyFilters();
  }

  onObbligatorieChange() {
    this.applyFilters();
  }

  onFeedbackChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStato = '';
    this.selectedDipendente = '';
    this.selectedCorso = '';
    this.soloObbligatorie = false;
    this.richiedeFeedback = false;
    this.filteredAssegnazioni = this.assegnazioni;
  }

  // Azioni CRUD
  openAssignModal() {
    this.assignForm.reset();
    this.resetAssignModal();
    this.filteredDipendenti = [...this.dipendenti];
    this.filteredCorsi = [...this.corsi];
    this.isAssignModalOpen = true;
  }

  closeAssignModal() {
    this.isAssignModalOpen = false;
    this.resetAssignModal();
  }

  private resetAssignModal() {
    this.assignForm.reset();
    this.dipendenteSearchTerm = '';
    this.corsoSearchTerm = '';
    this.assignSelectedDipendente = null;
    this.assignSelectedCorso = null;
    this.showDipendentiDropdown = false;
    this.showCorsiDropdown = false;
    this.filteredDipendenti = [];
    this.filteredCorsi = [];
  }

  // Search functionality for dipendenti
  onDipendenteSearchChange() {
    console.log('Dipendente search changed:', this.dipendenteSearchTerm);
    if (this.dipendenteSearchTerm.trim() === '') {
      this.filteredDipendenti = [...this.dipendenti];
    } else {
      this.filteredDipendenti = this.dipendenti.filter(
        dipendente =>
          this.getDipendenteNomeCompleto(dipendente)
            .toLowerCase()
            .includes(this.dipendenteSearchTerm.toLowerCase()) ||
          dipendente.email
            .toLowerCase()
            .includes(this.dipendenteSearchTerm.toLowerCase()) ||
          dipendente.reparto
            .toLowerCase()
            .includes(this.dipendenteSearchTerm.toLowerCase()),
      );
    }
    console.log('Filtered dipendenti:', this.filteredDipendenti.length);
    this.showDipendentiDropdown = true;
  }

  onDipendenteFocus() {
    this.filteredDipendenti = [...this.dipendenti];
    this.showDipendentiDropdown = true;
  }

  onDipendenteBlur() {
    // Delay hiding to allow click on dropdown items
    setTimeout(() => {
      this.showDipendentiDropdown = false;
    }, 200);
  }

  selectDipendente(dipendente: IDipendenti) {
    this.assignSelectedDipendente = dipendente;
    this.dipendenteSearchTerm = this.getDipendenteNomeCompleto(dipendente);
    this.assignForm.patchValue({ dipendenteId: dipendente.id });
    this.showDipendentiDropdown = false;
  }

  clearDipendenteSelection() {
    this.assignSelectedDipendente = null;
    this.dipendenteSearchTerm = '';
    this.assignForm.patchValue({ dipendenteId: '' });
    this.showDipendentiDropdown = false;
    this.filteredDipendenti = [...this.dipendenti];
  }

  // Search functionality for corsi
  onCorsoSearchChange() {
    console.log('Corso search changed:', this.corsoSearchTerm);
    if (this.corsoSearchTerm.trim() === '') {
      this.filteredCorsi = [...this.corsi];
    } else {
      this.filteredCorsi = this.corsi.filter(
        corso =>
          corso.nome
            .toLowerCase()
            .includes(this.corsoSearchTerm.toLowerCase()) ||
          corso.piattaforma.nome
            .toLowerCase()
            .includes(this.corsoSearchTerm.toLowerCase()) ||
          corso.categoria
            .toLowerCase()
            .includes(this.corsoSearchTerm.toLowerCase()) ||
          corso.argomento
            .toLowerCase()
            .includes(this.corsoSearchTerm.toLowerCase()),
      );
    }
    console.log('Filtered corsi:', this.filteredCorsi.length);
    this.showCorsiDropdown = true;
  }

  onCorsoFocus() {
    this.filteredCorsi = [...this.corsi];
    this.showCorsiDropdown = true;
  }

  onCorsoBlur() {
    // Delay hiding to allow click on dropdown items
    setTimeout(() => {
      this.showCorsiDropdown = false;
    }, 200);
  }

  selectCorso(corso: ICorsi) {
    this.assignSelectedCorso = corso;
    this.corsoSearchTerm = `${corso.nome} - ${corso.piattaforma.nome}`;
    this.assignForm.patchValue({ corsoId: corso.id });
    this.showCorsiDropdown = false;
  }

  clearCorsoSelection() {
    this.assignSelectedCorso = null;
    this.corsoSearchTerm = '';
    this.assignForm.patchValue({ corsoId: '' });
    this.showCorsiDropdown = false;
    this.filteredCorsi = [...this.corsi];
  }

  onAssignSubmit() {
    if (this.assignForm.valid) {
      this.isSubmitting = true;
      const { dipendenteId, corsoId, obbligatorio } = this.assignForm.value;

      this.assegnazioniService
        .assignCorsoToDipendente(dipendenteId, corsoId, obbligatorio || false)
        .subscribe({
          next: response => {
            this.isSubmitting = false;
            this.closeAssignModal();
            this.showNotification(
              'Successo',
              'Corso assegnato con successo',
              `Il corso è stato assegnato al dipendente.`,
              'success',
            );
            this.loadData();
          },
          error: error => {
            console.error("Errore nell'assegnazione del corso:", error);
            this.isSubmitting = false;
            let errorMessage =
              "Si è verificato un errore durante l'assegnazione.";
            if (error.error && typeof error.error === 'string') {
              errorMessage = error.error;
            }
            this.showNotification(
              'Errore',
              "Errore nell'assegnazione",
              errorMessage,
              'error',
            );
          },
        });
    } else {
      Object.keys(this.assignForm.controls).forEach(key => {
        this.assignForm.get(key)?.markAsTouched();
      });
    }
  }

  openStatusModal(assegnazione: IAssegnazione) {
    this.editingAssegnazione = assegnazione;
    this.statusForm.patchValue({
      stato: assegnazione.stato,
      percentualeCompletamento: assegnazione.percentualeCompletamento,
      oreCompletate: assegnazione.oreCompletate,
      valutazione: assegnazione.valutazione,
      noteFeedback: assegnazione.noteFeedback,
      competenzeAcquisite: assegnazione.competenzeAcquisite,
      certificatoOttenuto: assegnazione.certificatoOttenuto,
    });
    this.isStatusModalOpen = true;
  }

  closeStatusModal() {
    this.isStatusModalOpen = false;
    this.editingAssegnazione = null;
    this.statusForm.reset();
  }

  onStatusSubmit() {
    if (this.statusForm.valid && this.editingAssegnazione) {
      this.isSubmitting = true;
      const formValue = this.statusForm.value;

      // Prepara i dati per l'aggiornamento completo
      const updateData: any = {};

      if (formValue.stato) updateData.stato = formValue.stato;
      if (
        formValue.percentualeCompletamento !== null &&
        formValue.percentualeCompletamento !== undefined
      ) {
        updateData.percentualeCompletamento =
          formValue.percentualeCompletamento;
      }
      if (
        formValue.oreCompletate !== null &&
        formValue.oreCompletate !== undefined
      ) {
        updateData.oreCompletate = formValue.oreCompletate;
      }
      if (formValue.valutazione) updateData.valutazione = formValue.valutazione;
      if (formValue.noteFeedback)
        updateData.noteFeedback = formValue.noteFeedback;
      if (formValue.competenzeAcquisite)
        updateData.competenzeAcquisite = formValue.competenzeAcquisite;
      if (
        formValue.certificatoOttenuto !== null &&
        formValue.certificatoOttenuto !== undefined
      ) {
        updateData.certificatoOttenuto = formValue.certificatoOttenuto;
      }

      this.assegnazioniService
        .updateAssegnazione(this.editingAssegnazione.id, updateData)
        .subscribe({
          next: response => {
            this.isSubmitting = false;
            this.closeStatusModal();
            this.showNotification(
              'Successo',
              'Assegnazione aggiornata con successo',
              "I dettagli dell'assegnazione sono stati modificati.",
              'success',
            );
            this.loadData();
          },
          error: error => {
            console.error(
              "Errore nell'aggiornamento dell'assegnazione:",
              error,
            );
            this.isSubmitting = false;
            this.showNotification(
              'Errore',
              "Errore nell'aggiornamento",
              "Si è verificato un errore durante l'aggiornamento.",
              'error',
            );
          },
        });
    }
  }

  deleteAssegnazione(assegnazione: IAssegnazione) {
    this.showConfirmation(
      'Conferma Eliminazione',
      `Sei sicuro di voler eliminare l'assegnazione del corso "${assegnazione.corso.nome}" al dipendente "${assegnazione.dipendente.nome} ${assegnazione.dipendente.cognome}"?`,
      'Questa azione non può essere annullata.',
      'danger',
      () => this.performDelete(assegnazione.id),
    );
  }

  private performDelete(assegnazioneId: number) {
    this.confirmation.isProcessing = true;
    this.assegnazioniService.deleteAssegnazione(assegnazioneId).subscribe({
      next: () => {
        this.confirmation.isProcessing = false;
        this.closeConfirmation();
        this.showNotification(
          'Successo',
          'Assegnazione eliminata con successo',
          "L'assegnazione è stata rimossa dal sistema.",
          'success',
        );
        this.loadData();
      },
      error: error => {
        console.error("Errore nell'eliminazione dell'assegnazione:", error);
        this.confirmation.isProcessing = false;
        this.closeConfirmation();
        this.showNotification(
          'Errore',
          "Errore nell'eliminazione",
          "Si è verificato un errore durante l'eliminazione.",
          'error',
        );
      },
    });
  }

  // Helper methods
  getDipendenteNomeCompleto(dipendente: IDipendenti): string {
    return `${dipendente.nome} ${dipendente.cognome}`;
  }

  getStatoLabel(stato: AssegnazioneStato): string {
    const labels: Record<AssegnazioneStato, string> = {
      [AssegnazioneStato.ASSEGNATO]: 'Assegnato',
      [AssegnazioneStato.IN_CORSO]: 'In Corso',
      [AssegnazioneStato.COMPLETATO]: 'Completato',
      [AssegnazioneStato.NON_INIZIATO]: 'Non Iniziato',
      [AssegnazioneStato.SOSPESO]: 'Sospeso',
      [AssegnazioneStato.ANNULLATO]: 'Annullato',
    };
    return labels[stato] || stato;
  }

  getStatoBadgeClass(stato: AssegnazioneStato): string {
    const classes: Record<AssegnazioneStato, string> = {
      [AssegnazioneStato.ASSEGNATO]: 'bg-primary',
      [AssegnazioneStato.IN_CORSO]: 'bg-warning',
      [AssegnazioneStato.COMPLETATO]: 'bg-success',
      [AssegnazioneStato.NON_INIZIATO]: 'bg-secondary',
      [AssegnazioneStato.SOSPESO]: 'bg-danger',
      [AssegnazioneStato.ANNULLATO]: 'bg-dark',
    };
    return classes[stato] || 'bg-secondary';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  }

  isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} è obbligatorio`;
      if (field.errors['min']) return `Valore minimo non rispettato`;
      if (field.errors['max']) return `Valore massimo superato`;
    }
    return '';
  }

  // Notification modal methods
  private showNotification(
    title: string,
    message: string,
    details: string = '',
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
  ) {
    this.notification = {
      isOpen: true,
      title,
      message,
      details,
      type,
    };
  }

  closeNotification() {
    this.notification.isOpen = false;
  }

  // Confirmation modal methods
  private showConfirmation(
    title: string,
    message: string,
    details: string = '',
    type: 'danger' | 'warning' | 'info' | 'success' = 'warning',
    action: () => void,
  ) {
    this.confirmation = {
      isOpen: true,
      title,
      message,
      details,
      type,
      action,
      isProcessing: false,
    };
  }

  closeConfirmation() {
    this.confirmation.isOpen = false;
    this.confirmation.action = null;
    this.confirmation.isProcessing = false;
  }

  onConfirmationConfirmed() {
    if (this.confirmation.action) {
      this.confirmation.action();
    }
  }

  get completateCount(): number {
    return this.filteredAssegnazioni.filter(a => a.stato === 'COMPLETATO')
      .length;
  }

  get inCorsoCount(): number {
    return this.filteredAssegnazioni.filter(a => a.stato === 'IN_CORSO').length;
  }

  get assegnateCount(): number {
    return this.filteredAssegnazioni.filter(a => a.stato === 'ASSEGNATO')
      .length;
  }
}
