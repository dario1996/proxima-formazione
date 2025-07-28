import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ButtonConfig {
  text: string;
  icon?: string;
  class?: string;
  action?: string;
}

@Component({
  selector: 'app-page-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-title.component.html',
  styleUrl: './page-title.component.css'
})
export class PageTitleComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showButton: boolean = false;
  @Input() buttonText: string = '';
  @Input() buttons: ButtonConfig[] = [];
  @Input() activeFiltersCount: number = 0;

  @Output() buttonClick = new EventEmitter<void>();
  @Output() buttonActionClick = new EventEmitter<string>();

  // 🔥 NUOVO: Metodo per determinare le classi del pulsante
  getButtonClasses(button: ButtonConfig): string {
    // Se è il pulsante filtri, usa lo stile Double Take
    if (button.action === 'filter' || button.action === 'assegnazioni') {
      return 'btn-filter-fx';
    }
    
    // Per tutti gli altri pulsanti, usa le classi normali
    return button.class || 'btn-primary';
  }
}
