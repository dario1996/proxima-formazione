import { Component, OnInit } from '@angular/core';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';

@Component({
  selector: 'app-corsi',
  imports: [PageTitleComponent],
  templateUrl: './corsi.component.html',
  styleUrls: ['./corsi.component.css'],
  standalone: true
})
export class CorsiComponent implements OnInit {

  constructor() { }

  title: string = 'Corsi';
  icon: string = 'fa-solid fa-book';

  ngOnInit(): void {
  }

} 