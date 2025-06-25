import { AuthJwtService } from '../services/authJwt.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { Component } from '@angular/core';
import { NotificationComponent } from '../notification/notification.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [
    AvatarComponent,
    NotificationComponent,
    RouterModule,
  ],
})
export class HeaderComponent {
  count = 1;

  constructor(public BasicAuth: AuthJwtService) {}

  toggleSidebar() {
    // Emit an event that will be caught by the parent component to toggle the sidebar
    document.body.classList.toggle('sidebar-open');
  }
}
