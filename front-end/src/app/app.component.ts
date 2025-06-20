import { Component, inject, OnInit } from '@angular/core';

import { FooterComponent } from './core/footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet, FooterComponent],
})
export class AppComponent implements OnInit {
  title = 'smart-control-ui';
  private translate = inject(TranslateService);
  private defaultLang = 'it';

  ngOnInit(): void {
    const savedLang = sessionStorage.getItem('Language') || this.defaultLang;

    this.translate.setDefaultLang(this.defaultLang);
    this.translate.use(savedLang);
    this.getCurrentLanguage();
    console.log(this.translate.currentLang);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang;
  }
}
