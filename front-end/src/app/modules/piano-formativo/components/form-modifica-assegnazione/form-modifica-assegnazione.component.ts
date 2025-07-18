import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-modifica-assegnazione',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-modifica-assegnazione.component.html',
  styleUrls: ['./form-modifica-assegnazione.component.css']
})
export class FormModificaAssegnazioneComponent implements OnInit {
  @Input() datiIniziali: any = {};
  assegnazioneForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.assegnazioneForm = this.fb.group({
      // Solo i campi modificabili che sono visibili nella tabella
      stato: [this.mapStatoFromDisplay(this.datiIniziali.statoDisplay) || 'DA_INIZIARE', Validators.required],
      dataInizio: [this.formatDateForInput(this.datiIniziali.dataInizio)],
      dataCompletamento: [this.formatDateForInput(this.datiIniziali.dataCompletamento)],
      attestato: [this.datiIniziali.attestato || false],
      obbligatorio: [this.datiIniziali.obbligatorio || false]
    });
  }
    mapStatoFromDisplay(statoDisplay: any): any {
        throw new Error('Method not implemented.');
    }

  private formatDateForInput(dateValue: any): string {
    if (!dateValue) return '';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  onSubmit() {
    if (this.assegnazioneForm.valid) {
      return this.assegnazioneForm.value;
    }
    return null;
  }

  get isValid(): boolean {
    return this.assegnazioneForm.valid;
  }

  get formValue(): any {
    return this.assegnazioneForm.value;
  }
}