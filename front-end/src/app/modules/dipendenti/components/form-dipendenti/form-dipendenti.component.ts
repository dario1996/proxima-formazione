import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PiattaformeService } from '../../../../core/services/data/piattaforme.service';
import { ModaleService } from '../../../../core/services/modal.service';
import { IPiattaforma } from '../../../../shared/models/Piattaforma';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-dipendenti',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './form-dipendenti.component.html',
  styleUrl: './form-dipendenti.component.css',
})
export class FormDipendentiComponent {
  @Output() conferma = new EventEmitter<any>();
  form!: FormGroup;
  submitted = false;
  dati: any;
  piattaforme: IPiattaforma[] = []; // <-- Aggiungi questa riga

  private modaleService = inject(ModaleService);
  private piattaformeService = inject(PiattaformeService);

  ngOnInit() {
    console.log('FormCorsiComponent ngOnInit, dati:', this.dati);
    this.modaleService.config$.subscribe(config => {
      if (config?.dati) {
        this.dati = config.dati;
        if (this.form) {
          this.form.patchValue({
            nome: this.dati.nome || '',
            argomento: this.dati.argomento || '',
            durata: this.dati.durata || '',
            piattaforma: this.dati.piattaforma?.id || '',
          });
        }
      }
    });
    this.initForm();
    this.piattaformeService.getListaPiattaforme().subscribe({
      next: data => (this.piattaforme = data),
    });
  }

  initForm() {
    this.form = new FormBuilder().group({
      nome: [
        this.dati?.nome || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(99),
        ],
      ],
      cognome: [
        this.dati?.cognome || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(99),
        ],
      ],
      email: [
        this.dati?.email || '',
        [
          Validators.required,
          Validators.email,
        ],
      ],
      isms: [
        this.dati?.isms || '',
        [
          Validators.required,
        ],
      ],
      ruolo: [
        this.dati?.isms || '',
        [
          Validators.required,
        ],
      ],
      azienda: [
        this.dati?.isms || '',
        [
          Validators.required,
        ],
      ],
      sede: [
        this.dati?.isms || '',
        [
          Validators.required,
        ],
      ],
      community: [
        this.dati?.isms || '',
        [
          Validators.required,
        ],
      ],
      responsabile: [
        this.dati?.isms || '',
        [
          Validators.required,
        ],
      ],
      stato: [
        this.dati?.isms || '',
        [
          Validators.required,
        ],
      ],
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    this.conferma.emit(this.form.value);
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  confermaForm() {
    this.onSubmit();
  }
}
