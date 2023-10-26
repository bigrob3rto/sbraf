// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridDatePickerComponent } from './datepicker.component';
import { DateRangeComponent } from './daterange.component';


@NgModule({
    imports: [
        CommonModule,
        AgGridModule.withComponents([]),
        NgbModule,
        FormsModule
    ],
    declarations: [
        DateRangeComponent,
        AgGridDatePickerComponent
    ],
    exports: [
        DateRangeComponent,
        AgGridDatePickerComponent
    ]
})
export class DateRangeModule { }
