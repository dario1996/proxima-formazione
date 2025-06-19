import { Component, OnInit } from '@angular/core';
import { INegozi } from '../../shared/models/Negozi';
import { NegoziService } from '../services/data/negozi.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-negozio-switcher',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './negozio-switcher.component.html',
  styleUrl: './negozio-switcher.component.css',
})
export class NegozioSwitcherComponent implements OnInit {
  negozi: INegozi[] = [];
  negozioAttivo: INegozi | null = null;
  negozioAttivoId: string | null = null; // 🔹 Contiene l'ID selezionato

  constructor(private negozioService: NegoziService) {}

  ngOnInit() {
    this.negozioService.caricaNegozi();
    this.negozioService.getNegoziDisponibili().subscribe(negozi => {
      this.negozi = negozi;
    });

    this.negozioService.getNegozioCorrente().subscribe(negozio => {
      this.negozioAttivo = negozio;
      this.negozioAttivoId = negozio?.shopId ?? null; // 🔹 Aggiorna il valore selezionato
    });
  }

  switchNegozio() {
    const negozio = this.negozi.find(n => n.shopId === this.negozioAttivoId);
    if (negozio) {
      this.negozioService.switchNegozio(negozio);
    }
  }
}
