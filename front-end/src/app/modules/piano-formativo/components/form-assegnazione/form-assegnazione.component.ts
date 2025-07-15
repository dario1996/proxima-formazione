// import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { DipendentiService } from '../../../../core/services/data/dipendenti.service';
// import { CorsiService } from '../../../../core/services/data/corsi.service';
// import { IDipendente } from '../../../../../../../shared/models/Dipendente';
// import { ICorso } from '../../../../../shared/models/Corso';
// import { Modalita, AssegnazioneStato } from '../../../../../shared/models/Assegnazione';

// @Component({
//   selector: 'app-form-assegnazione',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './form-assegnazione.component.html',
//   styleUrl: './form-assegnazione.component.css'
// })
// export class FormAssegnazioneComponent implements OnInit {
//   @Input() dati: any = {};
//   @Output() conferma = new EventEmitter<any>();

//   form: FormGroup;
//   submitted = false;
//   dipendenti: IDipendente[] = [];
//   corsi: ICorso[] = [];
//   modalitaOptions = Object.values(Modalita);
//   statoOptions = Object.values(AssegnazioneStato);

//   constructor(
//     private formBuilder: FormBuilder,
//     private dipendentiService: DipendentiService,
//     private corsiService: CorsiService
//   ) {
//     this.form = this.formBuilder.group({
//       dipendenteId: ['', Validators.required],
//       corsoId: ['', Validators.required],
//       modalita: ['', Validators.required],
//       stato: [AssegnazioneStato.INIZIATO, Validators.required],
//       dataTerminePrevista: [''],
//       dataInizio: [''],
//       dataFine: [''],
//       fonteRichiesta: [''],
//       attestato: [false]
//     });
//   }

//   ngOnInit(): void {
//     this.loadDipendenti();
//     this.loadCorsi();
//     this.populateForm();
//   }

//   private loadDipendenti() {
//     this.dipendentiService.getAllDipendenti().subscribe({
//       next: (data) => {
//         this.dipendenti = data;
//       },
//       error: () => {
//         console.error('Errore nel caricamento dei dipendenti');
//       }
//     });
//   }

//   private loadCorsi() {
//     this.corsiService.getAllCorsi().subscribe({
//       next: (data) => {
//         this.corsi = data;
//       },
//       error: () => {
//         console.error('Errore nel caricamento dei corsi');
//       }
//     });
//   }

//   private populateForm() {
//     if (this.dati && Object.keys(this.dati).length > 0) {
//       this.form.patchValue({
//         dipendenteId: this.dati.dipendenteId || '',
//         corsoId: this.dati.corsoId || '',
//         modalita: this.dati.modalita || '',
//         stato: this.dati.stato || AssegnazioneStato.INIZIATO,
//         dataTerminePrevista: this.dati.dataTerminePrevista ? this.formatDateForInput(this.dati.dataTerminePrevista) : '',
//         dataInizio: this.dati.dataInizio ? this.formatDateForInput(this.dati.dataInizio) : '',
//         dataFine: this.dati.dataFine ? this.formatDateForInput(this.dati.dataFine) : '',
//         fonteRichiesta: this.dati.fonteRichiesta || '',
//         attestato: this.dati.attestato || false
//       });
//     }
//   }

//   private formatDateForInput(dateString: string): string {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toISOString().split('T')[0];
//   }

//   onSubmit() {
//     this.submitted = true;
//     if (this.form.valid) {
//       const formValue = this.form.value;
//       this.conferma.emit(formValue);
//     }
//   }
// }