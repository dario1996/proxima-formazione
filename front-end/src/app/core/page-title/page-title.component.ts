import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

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
  @Input() showButton: boolean = true;
  @Input() buttonText: string = '';
  @Input() buttons: ButtonConfig[] = [];

  @Output() buttonClick = new EventEmitter<void>();
  @Output() buttonActionClick = new EventEmitter<string>();
}
