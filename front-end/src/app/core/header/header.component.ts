import { AuthJwtService } from '../services/authJwt.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { Component } from '@angular/core';
import { NotificationComponent } from '../notification/notification.component';
import { RouterModule } from '@angular/router';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { NegozioSwitcherComponent } from '../negozio-switcher/negozio-switcher.component';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [
    AvatarComponent,
    NotificationComponent,
    LanguageSelectorComponent,
    NegozioSwitcherComponent,
    RouterModule,
  ],
})
export class HeaderComponent {
  count = 1;

  constructor(public BasicAuth: AuthJwtService) {}
}
