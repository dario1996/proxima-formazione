import { Component, Input } from '@angular/core';
import { IPiattaforma } from '../../../../shared/models/Piattaforma';

@Component({
  selector: 'app-piattaforme',
  standalone: true,
  imports: [],
  templateUrl: './piattaforme.component.html',
  styleUrl: './piattaforme.component.css'
})
export class PiattaformeComponent {
  @Input() piattaforme: IPiattaforma[] = [];

  modifica(id: number) {
    alert('Modifica piattaforma ' + id);
  }

  elimina(id: number) {
    alert('Elimina piattaforma ' + id);
  }
}
