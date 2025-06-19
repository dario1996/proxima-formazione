import { CommonModule } from '@angular/common';
import { ImgFallbackDirective } from './directives/img-fallback.directive';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [],
  imports: [CommonModule, ImgFallbackDirective],
  exports: [ImgFallbackDirective],
})
export class SharedModule {}
