import { Injectable } from '@angular/core';
import { ToastrService as NgxToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class ToastrService {
  constructor(private toastr: NgxToastrService) {}

  success(message: string, title?: string) {
    this.toastr.success(message, title);
  }
  error(message: string, title?: string) {
    this.toastr.error(message, title);
  }
  warning(message: string, title?: string) {
    this.toastr.warning(message, title);
  }
  info(message: string, title?: string) {
    this.toastr.info(message, title);
  }
}
