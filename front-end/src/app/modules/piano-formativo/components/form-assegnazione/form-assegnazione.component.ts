import { Component, EventEmitter, inject, Output, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModaleService } from '../../../../core/services/modal.service';
import { AssegnazioniService } from '../../../../core/services/data/assegnazioni.service';
import { CommonModule } from '@angular/common';
import { 
  IAssegnazione, 
  AssegnazioneStato, 
  AssegnazioneUpdateRequest 
} from '../../../../shared/models/Assegnazione';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-form-assegnazione',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './form-assegnazione.component.html',
  styleUrl: './form-assegnazione.component.css',
})
export class FormAssegnazioneComponent implements OnInit {
  @Output() conferma = new EventEmitter<any>();
  form!: FormGroup;
  submitted = false;
  dati: IAssegnazione | null = null;
  isEdit = false;

  // Enum per il template
  AssegnazioneStato = AssegnazioneStato;
  
  // Opzioni per i dropdown
  statoOptions = [
    { value: AssegnazioneStato.DA_INIZIARE, label: 'Da iniziare' },
    { value: AssegnazioneStato.IN_CORSO, label: 'In corso' },
    { value: AssegnazioneStato.TERMINATO, label: 'Terminato' },
    { value: AssegnazioneStato.INTERROTTO, label: 'Interrotto' },
  ];

  private modaleService = inject(ModaleService);
  private assegnazioniService = inject(AssegnazioniService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  ngOnInit() {
    this.initForm();
    
    this.modaleService.config$.subscribe(config => {
      if (config?.dati) {
        this.dati = config.dati;
        this.isEdit = !!this.dati?.id;
        this.precompileForm();
      }
    });
  }

  initForm() {
    this.form = this.fb.group({
      stato: [AssegnazioneStato.DA_INIZIARE, Validators.required],
      percentualeCompletamento: [0, [Validators.min(0), Validators.max(100)]],
      oreCompletate: [0, [Validators.min(0)]],
      valutazione: [null, [Validators.min(1), Validators.max(10)]],
      noteFeedback: [''],
      competenzeAcquisite: [''],
      certificatoOttenuto: [false],
      feedbackFornito: [false],
      esito: [''],
      fonteRichiesta: [''],
      impattoIsms: [false],
      attestato: [false],
      dataInizio: [''],
      dataCompletamento: [''],
    });
  }

  precompileForm() {
    if (this.dati && this.form) {
      this.form.patchValue({
        stato: this.dati.stato || AssegnazioneStato.DA_INIZIARE,
        percentualeCompletamento: this.dati.percentualeCompletamento || 0,
        oreCompletate: this.dati.oreCompletate || 0,
        valutazione: this.dati.valutazione || null,
        noteFeedback: this.dati.noteFeedback || '',
        competenzeAcquisite: this.dati.competenzeAcquisite || '',
        certificatoOttenuto: this.dati.certificatoOttenuto || false,
        feedbackFornito: this.dati.feedbackFornito || false,
        esito: this.dati.esito || '',
        fonteRichiesta: this.dati.fonteRichiesta || '',
        impattoIsms: this.dati.impattoIsms || false,
        attestato: this.dati.attestato || false,
        dataInizio: this.dati.dataInizio || '',
        dataCompletamento: this.dati.dataCompletamento || '',
      });
    }
  }

  onSubmit() {
    this.confermaForm();
  }

  // This method will be called by the modal when "Conferma" is clicked
  confermaForm() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const formData = this.form.value;
    const updateData: AssegnazioneUpdateRequest = {
      stato: formData.stato,
      percentualeCompletamento: formData.percentualeCompletamento,
      oreCompletate: formData.oreCompletate,
      valutazione: formData.valutazione,
      noteFeedback: formData.noteFeedback,
      competenzeAcquisite: formData.competenzeAcquisite,
      certificatoOttenuto: formData.certificatoOttenuto,
      feedbackFornito: formData.feedbackFornito,
      esito: formData.esito,
      fonteRichiesta: formData.fonteRichiesta,
      impattoIsms: formData.impattoIsms,
      attestato: formData.attestato,
      dataInizio: formData.dataInizio || null,
      dataCompletamento: formData.dataCompletamento || null,
    };

    if (this.isEdit && this.dati?.id) {
      console.log('Sending update request for assignment ID:', this.dati.id);
      console.log('Update data:', updateData);
      
      this.assegnazioniService.updateAssegnazione(this.dati.id, updateData).subscribe({
        next: (response) => {
          console.log('Update response:', response);
          this.toastr.success('Assegnazione aggiornata con successo');
          this.conferma.emit(response);
        },
        error: (error) => {
          console.error('Component error handler triggered');
          console.error('Full error object:', error);
          console.error('Error status:', error?.status);
          console.error('Error statusText:', error?.statusText);
          console.error('Error message:', error?.message);
          console.error('Error error:', error?.error);
          console.error('Error type:', typeof error);
          console.error('Error constructor name:', error?.constructor?.name);
          
          // Don't show the error toast for now to avoid confusion
          // this.toastr.error('Errore durante l\'aggiornamento dell\'assegnazione');
        }
      });
    }
  }

  // Metodo di utilità per verificare se un campo è invalido
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  // Metodo per ottenere il messaggio di errore per un campo
  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} è richiesto`;
      if (field.errors['min']) return `Valore minimo: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valore massimo: ${field.errors['max'].max}`;
    }
    return '';
  }
}
