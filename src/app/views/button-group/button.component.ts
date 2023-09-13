import { Component, Input } from '@angular/core';
import { GridApi } from 'ag-grid-community';
// import { EnumRisorse } from '../../../enums/enum-risorse.enum';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html'
})
export class ButtonComponent {
   
  @Input() btnPrint = false;
  @Input() btnRefresh = false;
  @Input() btnExport = false;
  @Input() btnGridCols = false;
  @Input() btnNew = false;
  @Input() btnSave = false;
  @Input() btnReload = false;
  

  @Input() columnDefs: any;
  @Input() refresh: () => {};
  @Input() export: (a, b) => {};
  @Input() clickCheckBox: (a) => {};
  @Input() reload: () => {};
  @Input() saveTable: (a) => {};
  @Input() openModalAddEdit: () => {};
  @Input() print: () => {};
  @Input() new: () => {};
}
