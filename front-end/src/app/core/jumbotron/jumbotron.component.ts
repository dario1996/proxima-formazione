import { Component, Input } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-jumbotron',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './jumbotron.component.html',
  styleUrl: './jumbotron.component.css',
})
export class JumbotronComponent {
  @Input()
  Titolo = '';
  @Input()
  SottoTitolo = '';
  @Input()
  Show = true;
}
