import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonComponent } from './button.component';

// Angular

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ButtonComponent
  ],
  exports: [
    ButtonComponent
  ]
})
export class ButtonGroupModule { }
