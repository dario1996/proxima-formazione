import { Component } from '@angular/core';
import { IPiattaforme } from '../../../../shared/models/Piattaforme';

@Component({
  selector: 'app-piattaforme',
  imports: [],
  templateUrl: './piattaforme.component.html',
  styleUrl: './piattaforme.component.css'
})
export class PiattaformeComponent {

  piattaforme: IPiattaforme[] = [
    { id: 1, nome: 'Zoom', descrizione: 'Videoconferenze' },
    { id: 2, nome: 'Teams', descrizione: 'Collaborazione Microsoft' },
    { id: 3, nome: 'Google Meet', descrizione: 'Meeting Google' }
  ];

  modifica(id: number) {
    // Logica per modificare la piattaforma
    alert('Modifica piattaforma ' + id);
  }

  elimina(id: number) {
    // Logica per eliminare la piattaforma
    alert('Elimina piattaforma ' + id);
  }
}
