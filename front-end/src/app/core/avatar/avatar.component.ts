import { Component, Input } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css',
})
export class AvatarComponent {
  @Input()
  isLogged = false;
  @Input()
  userName: string | null = '';
}
