import { Component } from '@angular/core';
import { PageTitleComponent } from "../../../../core/page-title/page-title.component";

@Component({
  selector: 'app-dipendenti',
  standalone: true,
  imports: [PageTitleComponent],
  templateUrl: './dipendenti.component.html',
  styleUrl: './dipendenti.component.css'
})
export class DipendentiComponent {

  title: string = 'Dipendenti';
  icon: string = 'fa-solid fa-users';

  constructor() { 
    // You can initialize any properties or services here if needed
  }
}
