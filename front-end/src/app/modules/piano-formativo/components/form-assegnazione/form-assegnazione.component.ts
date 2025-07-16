import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IDipendenti } from '../../../../shared/models/Dipendenti';
import { ICorsi } from '../../../../shared/models/Corsi';
import { DipendentiService } from '../../../../core/services/data/dipendenti.service';
import { CorsiService } from '../../../../core/services/data/corsi.service';

@Component({
  selector: 'app-form-assegnazione',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-assegnazione.component.html',
  styleUrl: './form-assegnazione.component.css'
})
export class FormAssegnazioneComponent implements OnInit {
  @Input() dati: any = {};
  @Output() conferma = new EventEmitter<any>();

  form: FormGroup;
  dipendenti: IDipendenti[] = [];
  corsi: ICorsi[] = [];
  
  // Per la ricerca dipendenti
  dipendentiFiltrati: IDipendenti[] = [];
  showDipendentiDropdown = false;
  dipendenteSelezionato: IDipendenti | null = null;
  
  // Per la ricerca corsi
  corsiFiltrati: ICorsi[] = [];
  showCorsiDropdown = false;
  corsoSelezionato: ICorsi | null = null;

  constructor(
    private fb: FormBuilder,
    private dipendentiService: DipendentiService,
    private corsiService: CorsiService
  ) {
    this.form = this.fb.group({
      dipendenteId: ['', Validators.required],
      corsoId: ['', Validators.required],
      searchDipendente: [''],
      searchCorso: ['']
    });
  }

  ngOnInit() {
    this.loadData();
    this.setupSearchListeners();
  }

  private loadData() {
    // Carica dipendenti e corsi
    this.dipendentiService.getListaDipendenti().subscribe(dipendenti => {
      this.dipendenti = dipendenti.filter(d => d.attivo);
      this.dipendentiFiltrati = [...this.dipendenti];
    });

    this.corsiService.getListaCorsi().subscribe(corsi => {
      this.corsi = corsi.filter(c => c.stato === 'Attivo');
      this.corsiFiltrati = [...this.corsi];
    });
  }

  private setupSearchListeners() {
    // Listener per la ricerca dipendenti
    this.form.get('searchDipendente')?.valueChanges.subscribe(value => {
      this.filtraDipendenti(value);
    });

    // Listener per la ricerca corsi
    this.form.get('searchCorso')?.valueChanges.subscribe(value => {
      this.filtraCorsi(value);
    });
  }

  filtraDipendenti(searchTerm: string) {
    if (!searchTerm) {
      this.dipendentiFiltrati = [...this.dipendenti];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.dipendentiFiltrati = this.dipendenti.filter(d => 
      `${d.nome} ${d.cognome}`.toLowerCase().includes(term) ||
      d.email.toLowerCase().includes(term) ||
      d.ruolo.toLowerCase().includes(term)
    );
  }

  filtraCorsi(searchTerm: string) {
    if (!searchTerm) {
      this.corsiFiltrati = [...this.corsi];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.corsiFiltrati = this.corsi.filter(c => 
      c.nome.toLowerCase().includes(term) ||
      c.argomento?.toLowerCase().includes(term) ||
      c.piattaforma.nome?.toLowerCase().includes(term)
    );
  }

  selezionaDipendente(dipendente: IDipendenti) {
    this.dipendenteSelezionato = dipendente;
    this.form.patchValue({
      dipendenteId: dipendente.id,
      searchDipendente: `${dipendente.nome} ${dipendente.cognome}`
    });
    this.showDipendentiDropdown = false;
  }

  selezionaCorso(corso: ICorsi) {
    this.corsoSelezionato = corso;
    this.form.patchValue({
      corsoId: corso.id,
      searchCorso: corso.nome
    });
    this.showCorsiDropdown = false;
  }

  onSubmit() {
    if (this.form.valid && this.dipendenteSelezionato && this.corsoSelezionato) {
      const assegnazione = {
        dipendenteId: this.dipendenteSelezionato.id,
        corsoId: this.corsoSelezionato.id,
        dataAssegnazione: new Date(),
        stato: 'Assegnato'
      };
      this.conferma.emit(assegnazione);
    }
  }

  clearDipendente() {
    this.dipendenteSelezionato = null;
    this.form.patchValue({
      dipendenteId: '',
      searchDipendente: ''
    });
  }

  clearCorso() {
    this.corsoSelezionato = null;
    this.form.patchValue({
      corsoId: '',
      searchCorso: ''
    });
  }

  onDipendenteBlur() {
    // Ritarda la chiusura del dropdown per permettere il click
    setTimeout(() => {
      this.showDipendentiDropdown = false;
    }, 200);
  }

  onCorsoBlur() {
    // Ritarda la chiusura del dropdown per permettere il click
    setTimeout(() => {
      this.showCorsiDropdown = false;
    }, 200);
  }
}