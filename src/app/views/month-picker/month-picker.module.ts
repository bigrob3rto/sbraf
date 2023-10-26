// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MonthPickerComponent } from './month-picker.component';


@NgModule({
  imports: [
    CommonModule,
    NgbModule ,
    FormsModule
  ],
  declarations: [
    MonthPickerComponent,
  ],
  exports: [
    MonthPickerComponent,
  ],
})
export class MonthPickerModule { }
