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
  submitted = false;

  // Per la ricerca dipendenti
  dipendentiFiltrati: IDipendenti[] = [];
  showDipendentiDropdown = false;
  dipendenteSelezionato: IDipendenti | null = null;
  
  // Per la ricerca corsi
  corsiFiltrati: ICorsi[] = [];
  showCorsiDropdown = false;
  corsoSelezionato: ICorsi | null = null;

  // Cambia da singolo a array
  dipendentiSelezionati: IDipendenti[] = [];

  constructor(
    private fb: FormBuilder,
    private dipendentiService: DipendentiService,
    private corsiService: CorsiService
  ) {
    this.form = this.fb.group({
      dipendentiIds: [[], Validators.required], // Array di IDs
      corsoId: ['', Validators.required],
      searchDipendente: [''],
      searchCorso: [''],
      obbligatorio: [false],
      dataTerminePrevista: ['']
    });
  }

  ngOnInit() {
    this.loadData();
    this.setupSearchListeners();
  }

  private loadData() {
    // Carica dipendenti
    this.dipendentiService.getListaDipendenti().subscribe({
      next: (dipendenti) => {
        this.dipendenti = dipendenti.filter(d => d.attivo);
        this.dipendentiFiltrati = [...this.dipendenti];
      },
      error: (error) => {
        console.error('❌ Errore caricamento dipendenti:', error);
      }
    });

    // Carica corsi
    this.corsiService.getListaCorsi().subscribe({
      next: (corsi) => {
        if (corsi && corsi.length > 0) {
          // RIMOSSO IL FILTRO PER ORA - prendiamo tutti i corsi
          this.corsi = corsi;
          this.corsiFiltrati = [...this.corsi];
        }
      },
      error: (error) => {
        console.error('❌ Errore caricamento corsi:', error);
      }
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
    // Mostra dropdown solo se c'è un termine di ricerca
    if (!searchTerm || searchTerm.length === 0) {
      this.dipendentiFiltrati = [];
      this.showDipendentiDropdown = false;
      return;
    }
    // Mostra dropdown solo se c'è almeno 1 carattere
    if (searchTerm.length < 1) {
      this.dipendentiFiltrati = [];
      this.showDipendentiDropdown = false;
      return;
    }

    const term = searchTerm.toLowerCase();
    this.dipendentiFiltrati = this.dipendenti.filter(d => 
      d.nome.toLowerCase().includes(term) ||
      d.cognome.toLowerCase().includes(term) ||
      d.email.toLowerCase().includes(term) ||
      `${d.nome} ${d.cognome}`.toLowerCase().includes(term)
    );

    // Mostra dropdown solo se ci sono risultati
    this.showDipendentiDropdown = this.dipendentiFiltrati.length > 0;
  }

  filtraCorsi(searchTerm: string) {
    // Mostra dropdown solo se c'è un termine di ricerca
    if (!searchTerm || searchTerm.length === 0) {
      this.corsiFiltrati = [];
      this.showCorsiDropdown = false;
      return;
    }

    // Mostra dropdown solo se c'è almeno 1 carattere
    if (searchTerm.length < 1) {
      this.corsiFiltrati = [];
      this.showCorsiDropdown = false;
      return;
    }

    const term = searchTerm.toLowerCase();
    this.corsiFiltrati = this.corsi.filter(c => {
      const matchNome = c.nome?.toLowerCase().includes(term);
      const matchArgomento = c.argomento?.toLowerCase().includes(term);
      const matchPiattaforma = c.piattaforma?.nome?.toLowerCase().includes(term);
      
      return matchNome || matchArgomento || matchPiattaforma;
    });

    // Mostra dropdown solo se ci sono risultati
    this.showCorsiDropdown = this.corsiFiltrati.length > 0;
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
  
  aggiungiDipendente(dipendente: IDipendenti) {
    // Controlla se già selezionato
    if (!this.dipendentiSelezionati.find(d => d.id === dipendente.id)) {
      this.dipendentiSelezionati.push(dipendente);
      this.aggiornaDipendentiIds();
    }
    
    // Reset campo ricerca
    this.form.get('searchDipendente')?.setValue('');
    this.showDipendentiDropdown = false;
  }

  rimuoviDipendente(index: number) {
    this.dipendentiSelezionati.splice(index, 1);
    this.aggiornaDipendentiIds();
  }

  private aggiornaDipendentiIds() {
    const ids = this.dipendentiSelezionati.map(d => d.id);
    this.form.get('dipendentiIds')?.setValue(ids);
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = {
        dipendentiIds: this.form.value.dipendentiIds,
        corsoId: this.form.value.corsoId,
        obbligatorio: this.form.value.obbligatorio,
        dataTerminePrevista: this.form.value.dataTerminePrevista
      };
      this.conferma.emit(formData);
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

  confermaForm() {
    this.onSubmit();
  }

  onSearchDipendente(event: any) {
    const searchTerm = event.target.value;
    if (searchTerm.length >= 2) {
      this.filtraDipendenti(searchTerm);
      this.showDipendentiDropdown = true;
    } else {
      this.dipendentiFiltrati = [];
      this.showDipendentiDropdown = false;
    }
  }
}
