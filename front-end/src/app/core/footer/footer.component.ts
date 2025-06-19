import { Observable, interval, map } from 'rxjs';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  currentDate: Date = new Date();

  currentTime$: Observable<Date>;

  constructor() {
    /* Create an observable that emits the current time every second */
    this.currentTime$ = interval(1000).pipe(map(() => new Date()));
  }
}
