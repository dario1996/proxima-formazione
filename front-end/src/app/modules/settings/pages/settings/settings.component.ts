import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PiattaformeComponent } from '../../components/piattaforme/piattaforme.component';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, PiattaformeComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

  selectedTab = 'piattaforme';
}
