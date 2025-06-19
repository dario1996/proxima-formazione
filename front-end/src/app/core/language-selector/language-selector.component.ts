import { Component, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.css',
})
export class LanguageSelectorComponent {
  private languageService = inject(LanguageService);
  currentLang = this.languageService.getCurrentLanguage();

  changeLanguage(event: Event) {
    const lang = (event.target as HTMLSelectElement).value; // ✅ Corregge il tipo di event.target
    if (lang) {
      this.languageService.changeLanguage(lang);
      this.currentLang = lang;
    }
  }
}
