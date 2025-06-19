import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-external-header',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './external-header.component.html',
  styleUrl: './external-header.component.css',
})
export class ExternalHeaderComponent {
  @Input()
  title = '';
}
