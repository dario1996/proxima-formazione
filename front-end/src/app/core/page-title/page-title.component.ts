import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-page-title',
  standalone: true,
  imports: [],
  templateUrl: './page-title.component.html',
  styleUrl: './page-title.component.css'
})
export class PageTitleComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';

  @Output() nuovoCorso = new EventEmitter<void>();
}
