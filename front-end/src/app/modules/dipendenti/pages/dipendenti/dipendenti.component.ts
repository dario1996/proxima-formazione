import { Component, OnInit } from '@angular/core';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import {
  IDipendenti,
  DipendenteCreateRequest,
} from '../../../../shared/models/Dipendenti';
import { DipendentiService } from '../../../../core/services/data/dipendenti.service';
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

@Component({
  selector: 'app-dipendenti',
  standalone: true,
  imports: [
    PageTitleComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalComponent,
    NotificationModalComponent,
    ConfirmationModalComponent,
  ],
  templateUrl: './dipendenti.component.html',
  styleUrl: './dipendenti.component.css',
})
export class DipendentiComponent implements OnInit {
  title: string = 'Dipendenti';
  icon: string = 'fa-solid fa-users';

  dipendenti: IDipendenti[] = [];
  filteredDipendenti: IDipendenti[] = [];

  // Filtri
  searchTerm: string = '';
  selectedReparto: string = '';
  selectedCommerciale: string = '';
  soloAttivi: boolean = true;

  // Liste per i filtri
  reparti: string[] = [];
  commerciali: string[] = [];

  // Modal e form
  isModalOpen: boolean = false;
  modalTitle: string = '';
  modalMode: 'add' | 'edit' = 'add';
  dipendenteForm!: FormGroup;
  editingDipendenteId: number | null = null;

  // Loading states
  isLoading: boolean = false;
  isSubmitting: boolean = false;

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
    private dipendentiService: DipendentiService,
    private formBuilder: FormBuilder,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadDipendenti();
  }

  private initializeForm() {
    this.dipendenteForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      cognome: ['', [Validators.required, Validators.maxLength(100)]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(150)],
      ],
      codiceDipendente: ['', [Validators.required, Validators.maxLength(50)]],
      reparto: ['', [Validators.maxLength(100)]],
      commerciale: ['', [Validators.maxLength(100)]],
      azienda: ['', [Validators.maxLength(100)]],
      ruolo: ['', [Validators.maxLength(100)]],
    });
  }

  private loadDipendenti() {
    this.isLoading = true;
    this.dipendentiService.getListaDipendenti().subscribe({
      next: data => {
        console.log('Dipendenti caricati:', data); // Debug log
        this.dipendenti = data;
        this.filteredDipendenti = data;
        this.extractFilterOptions();
        this.isLoading = false;
      },
      error: error => {
        console.error('Errore nel caricamento dei dipendenti:', error);
        this.isLoading = false;
        this.showNotification(
          'Errore',
          'Errore nel caricamento dei dipendenti',
          'Si è verificato un errore durante il caricamento dei dati. Riprova più tardi.',
          'error',
        );
      },
    });
  }

  private extractFilterOptions() {
    // Estrai reparti unici
    this.reparti = [
      ...new Set(
        this.dipendenti.map(d => d.reparto).filter(r => r && r.trim() !== ''),
      ),
    ];

    // Estrai commerciali unici
    this.commerciali = [
      ...new Set(
        this.dipendenti
          .map(d => d.commerciale)
          .filter(c => c && c.trim() !== ''),
      ),
    ];
  }

  applyFilters() {
    this.filteredDipendenti = this.dipendenti.filter(dipendente => {
      const matchesSearch =
        !this.searchTerm ||
        dipendente.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        dipendente.cognome
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        dipendente.email
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        dipendente.codiceDipendente
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());

      const matchesReparto =
        !this.selectedReparto || dipendente.reparto === this.selectedReparto;
      const matchesCommerciale =
        !this.selectedCommerciale ||
        dipendente.commerciale === this.selectedCommerciale;
      const matchesAttivo = !this.soloAttivi || dipendente.attivo;

      return (
        matchesSearch && matchesReparto && matchesCommerciale && matchesAttivo
      );
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onRepartoChange() {
    this.applyFilters();
  }

  onCommercialeChange() {
    this.applyFilters();
  }

  onAttivoChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedReparto = '';
    this.selectedCommerciale = '';
    this.soloAttivi = true;
    this.filteredDipendenti = this.dipendenti;
  }

  // CRUD Operations
  aggiungi() {
    this.modalMode = 'add';
    this.modalTitle = 'Aggiungi Nuovo Dipendente';
    this.editingDipendenteId = null;
    this.dipendenteForm.reset();
    this.isModalOpen = true;
  }

  modifica(id: number) {
    const dipendente = this.dipendenti.find(d => d.id === id);
    if (dipendente) {
      this.modalMode = 'edit';
      this.modalTitle = 'Modifica Dipendente';
      this.editingDipendenteId = id;

      // Popola il form con i dati esistenti
      this.dipendenteForm.patchValue({
        nome: dipendente.nome,
        cognome: dipendente.cognome,
        email: dipendente.email,
        codiceDipendente: dipendente.codiceDipendente,
        reparto: dipendente.reparto,
        commerciale: dipendente.commerciale,
        azienda: dipendente.azienda,
        ruolo: dipendente.ruolo,
      });

      this.isModalOpen = true;
    }
  }

  elimina(id: number) {
    const dipendente = this.dipendenti.find(d => d.id === id);
    if (dipendente) {
      this.showConfirmation(
        'Conferma Disabilitazione',
        `Sei sicuro di voler disabilitare il dipendente ${dipendente.nome} ${dipendente.cognome}?`,
        'Questa azione renderà il dipendente inattivo nel sistema.',
        'danger',
        () => this.performDelete(id),
      );
    }
  }

  private performDelete(id: number) {
    this.confirmation.isProcessing = true;
    this.dipendentiService.delDipendente(id).subscribe({
      next: () => {
        this.confirmation.isProcessing = false;
        this.closeConfirmation();
        this.showNotification(
          'Successo',
          'Dipendente disabilitato con successo',
          'Il dipendente è stato disabilitato e non apparirà più negli elenchi attivi.',
          'success',
        );
        this.loadDipendenti();
      },
      error: error => {
        console.error("Errore nell'eliminazione del dipendente:", error);
        this.confirmation.isProcessing = false;
        this.closeConfirmation();
        this.showNotification(
          'Errore',
          'Errore nella disabilitazione del dipendente',
          'Si è verificato un errore durante la disabilitazione. Riprova più tardi.',
          'error',
        );
      },
    });
  }

  // Modal operations
  closeModal() {
    this.isModalOpen = false;
    this.editingDipendenteId = null;
    this.dipendenteForm.reset();
  }

  onSubmit() {
    if (this.dipendenteForm.valid) {
      this.isSubmitting = true;
      const formData: DipendenteCreateRequest = this.dipendenteForm.value;

      if (this.modalMode === 'add') {
        this.dipendentiService.insDipendente(formData).subscribe({
          next: response => {
            this.isSubmitting = false;
            this.closeModal();
            this.showNotification(
              'Successo',
              'Dipendente aggiunto con successo',
              `Il dipendente ${formData.nome} ${formData.cognome} è stato registrato nel sistema.`,
              'success',
            );
            this.loadDipendenti();
          },
          error: error => {
            console.error("Errore nell'aggiunta del dipendente:", error);
            this.isSubmitting = false;
            let errorMessage =
              "Si è verificato un errore durante l'aggiunta del dipendente.";
            if (error.error && typeof error.error === 'string') {
              errorMessage = error.error;
            }
            this.showNotification(
              'Errore',
              "Errore nell'aggiunta del dipendente",
              errorMessage,
              'error',
            );
          },
        });
      } else if (this.modalMode === 'edit' && this.editingDipendenteId) {
        this.dipendentiService
          .updDipendente(this.editingDipendenteId, formData)
          .subscribe({
            next: response => {
              this.isSubmitting = false;
              this.closeModal();
              this.showNotification(
                'Successo',
                'Dipendente modificato con successo',
                `I dati di ${formData.nome} ${formData.cognome} sono stati aggiornati.`,
                'success',
              );
              this.loadDipendenti();
            },
            error: error => {
              console.error('Errore nella modifica del dipendente:', error);
              this.isSubmitting = false;
              let errorMessage =
                'Si è verificato un errore durante la modifica del dipendente.';
              if (error.error && typeof error.error === 'string') {
                errorMessage = error.error;
              }
              this.showNotification(
                'Errore',
                'Errore nella modifica del dipendente',
                errorMessage,
                'error',
              );
            },
          });
      }
    } else {
      // Marca tutti i campi come touched per mostrare gli errori
      Object.keys(this.dipendenteForm.controls).forEach(key => {
        this.dipendenteForm.get(key)?.markAsTouched();
      });
    }
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

  // Helper methods
  getNomeCompleto(dipendente: IDipendenti): string {
    return `${dipendente.nome} ${dipendente.cognome}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.dipendenteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.dipendenteForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} è obbligatorio`;
      if (field.errors['email']) return 'Email non valida';
      if (field.errors['maxlength']) return `${fieldName} troppo lungo`;
    }
    return '';
  }
}
