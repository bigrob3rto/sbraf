// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbdTimepickerComponent } from './timerpicker.component';
import { TimeRangeComponent } from './timerange.component';


@NgModule({
  imports: [
    CommonModule,
    NgbModule ,
    FormsModule
  ],
  declarations: [
    TimeRangeComponent,
    NgbdTimepickerComponent,
  ],
  exports: [
    TimeRangeComponent,
    NgbdTimepickerComponent,
  ],
  entryComponents: [NgbdTimepickerComponent],
})
export class TimeRangeModule { }
