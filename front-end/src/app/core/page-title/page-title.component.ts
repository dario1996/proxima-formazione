import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

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

  @Output() buttonClick = new EventEmitter<void>();
}
