import { Component } from '@angular/core';

import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { ICellEditorAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'date-editor-cell',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.css']
})
export class AgGridDatePickerComponent implements ICellEditorAngularComp {
  private params: any;
  public selectedDate: any;

  agInit(params: any): void {
    this.params = params;
    // console.log("Received",params.value);
    this.selectedDate = params.value; // set start date
  }

  getValue(): any {
    return this.selectedDate;
  }

  isPopup(): boolean {
    return true;
  }

  onDateSelect(date: NgbDate) {
    this.selectedDate = { year: date.year, month: date.month, day: date.day };
    this.params.api.stopEditing();
  }
}