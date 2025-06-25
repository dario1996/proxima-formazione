import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PiattaformeComponent } from '../../components/piattaforme/piattaforme.component';
import { PageTitleComponent } from "../../../../core/page-title/page-title.component";
import { PiattaformeService } from '../../../../core/services/data/piattaforme.service';
import { IPiattaforma } from '../../../../shared/models/Piattaforma';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, PiattaformeComponent, PageTitleComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  providers: [PiattaformeService]
})
export class SettingsComponent implements OnInit {

  title: string = 'Settings';
  icon: string = 'fa-solid fa-gears';
  selectedTab = 'piattaforme'; // puoi cambiare la tab di default qui

  piattaforme: IPiattaforma[] = [];
  piattaformeLoaded = false;

  constructor(private piattaformeService: PiattaformeService) {}

  ngOnInit() {
    this.onTabClick(this.selectedTab);
  }

  onTabClick(tab: string) {
    this.selectedTab = tab;
    if (tab === 'piattaforme') {
      this.loadPiattaforme();
    }
    // qui puoi aggiungere altre logiche per altre tab se servono
  }

  private loadPiattaforme() {
    this.piattaformeService.getListaPiattaforme().subscribe({
      next: (data) => {
        this.piattaforme = data;
        this.piattaformeLoaded = true;
      },
      error: (err) => {
        this.piattaforme = [];
        this.piattaformeLoaded = false;
      }
    });
  }
}
