import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PiattaformeComponent } from '../../components/piattaforme/piattaforme.component';
import { PageTitleComponent } from "../../../../core/page-title/page-title.component";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, PiattaformeComponent, PageTitleComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

  title: string = 'Settings';
  icon: string = 'fa-solid fa-gears';
  selectedTab = 'piattaforme';
}
