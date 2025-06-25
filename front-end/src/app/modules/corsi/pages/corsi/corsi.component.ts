import { Component, OnInit } from '@angular/core';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { ICorsi } from '../../../../shared/models/Corsi';
import { CorsiService } from '../../../../core/services/data/corsi.service';

@Component({
  selector: 'app-corsi',
  imports: [PageTitleComponent],
  templateUrl: './corsi.component.html',
  styleUrls: ['./corsi.component.css'],
  standalone: true
})
export class CorsiComponent implements OnInit {

  constructor(private corsiService: CorsiService) { }

  title: string = 'Corsi';
  icon: string = 'fa-solid fa-book';

  corsi: ICorsi[] = []; 

  ngOnInit(): void {
    this.loadCorsi();
  }

  private loadCorsi() {
    this.corsiService.getListaCorsi().subscribe({
      next: data => {
        this.corsi = data;
    }
  });
}

  modifica(id: number) {
    // Logica per modificare la piattaforma
    alert('Modifica corso ' + id);
  }

  elimina(id: number) {
    // Logica per eliminare la piattaforma
    alert('Elimina corso ' + id);
  }



} 