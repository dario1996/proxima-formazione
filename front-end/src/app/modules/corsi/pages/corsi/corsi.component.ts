import { Component, OnInit } from '@angular/core';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { ICorsi } from '../../../../shared/models/Corsi';

@Component({
  selector: 'app-corsi',
  imports: [PageTitleComponent],
  templateUrl: './corsi.component.html',
  styleUrls: ['./corsi.component.css'],
  standalone: true
})
export class CorsiComponent implements OnInit {

  constructor() { }

  title: string = 'Corsi';
  icon: string = 'fa-solid fa-book';

  corsi: ICorsi[] = [
    { id: 1, nome: 'Java for beginners', piattaformaId: '1', statusId: 1, macro_argomento: 'Sviluppo back-end', durata: '30 ora' },
    { id: 2, nome: 'Angular', piattaformaId: '2', statusId: 2, macro_argomento: 'Sviluppo front-end', durata: '2 ore' },
    { id: 3, nome: 'Spring Boot', piattaformaId: '3', statusId: 3, macro_argomento: 'Framework per sviluppo back-end', durata: '3 ore' }
  ]; 

  modifica(id: number) {
    // Logica per modificare la piattaforma
    alert('Modifica corso ' + id);
  }

  elimina(id: number) {
    // Logica per eliminare la piattaforma
    alert('Elimina corso ' + id);
  }

  ngOnInit(): void {
  }

} 