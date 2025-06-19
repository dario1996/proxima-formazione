import { Component, OnInit } from '@angular/core';
import { ExternalHeaderComponent } from '../../../../core/external-header/external-header.component';
import { AuthJwtService } from '../../../../core/services/authJwt.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [ExternalHeaderComponent, TranslateModule],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css',
})
export class ErrorComponent implements OnInit {
  titolo = 'Error';
  sottotitolo = 'Procedi ad inserire la userid e la password';

  constructor(private auth: AuthJwtService) {}

  ngOnInit(): void {
    this.auth.clearAll();
  }
}
