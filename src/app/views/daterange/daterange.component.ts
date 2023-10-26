import { Component, Input, OnInit } from '@angular/core';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { GridApi } from 'ag-grid-community';
import { TableLib } from '../../prod-table/lib/table-lib';
import { AwsService } from '../../service/aws.service';
import { OrderCacheService } from '../../service/cache.service';
import { GlobalService } from '../../service/global.service';
import { AgGridDatePickerComponent } from './datepicker.component';


@Component({
  selector: 'app-daterange',
  templateUrl: './daterange.component.html',
  // styleUrls: ['./daterange.component.css']
})



export class DateRangeComponent implements OnInit {
  public date1: NgbDateStruct = { day: 1, month: 5, year: 2020 };  // start date input
  public date2: NgbDateStruct = { day: 11, month: 11, year: 2020 };  // stop date input this.calendar.getToday()

  // categorID selected from parent component
  @Input() start: NgbDateStruct;
  @Input() stop: NgbDateStruct;
  @Input() editable: boolean = true;


  public gridApi: GridApi;
  public gridColumnApi;
  public domLayout = 'autoHeight';

  public popupParent;

  public theme;


  columnDefs = [
    // { headerName: 'Id', field: 'product_id', width: 110, editable: true, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    { field: 'title', minWidth: 60 },
    {
      field: 'date', editable: this.checkEditFunction.bind(this), minWidth: 100,
      cellEditorFramework: AgGridDatePickerComponent,
      cellEditorParams: function (params) {
        return params.data.date;
      },
      valueFormatter: this.dateFormatter,
    },
  ]

  // return editable boolean
  checkEditFunction() {
    return this.editable; // - just as sample
  }

  rowData = [
    { title: 'From', date: this.date1 },
    { title: 'To', date: this.date2 },
  ];

  constructor(private awsService: AwsService,
    private calendar: NgbCalendar,
    protected orderCache: OrderCacheService,
    private globalService: GlobalService
  ) {
    this.popupParent = document.querySelector('body');

    // load theme from local storage
    this.theme = localStorage.getItem('ag-grid-theme');


  }

  ngOnInit() {
    // load start / stop input if present
    if (this.start)
      this.date1 = this.start;
    if (this.stop)
      this.date2 = this.stop;
  }

  dateFormatter(params) {
    if (params.value) {
      return TableLib.ngbToString(params.value);
    }
  }

  onGridSizeChanged(params) {
    params.api.sizeColumnsToFit();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
    // this.gridApi.ensureIndexVisible(1);

    this.refresh();
  }

  onCellValueChanged(params) {
    this.date1 = this.rowData[0].date;
    this.date2 = this.rowData[1].date;
  }


  refresh() {
    this.rowData[0].date = this.date1;
    this.rowData[1].date = this.date2;
    
    this.gridApi.redrawRows();
  }

  getContextMenuItems = (params) => {
    var result = [
      {
        name: 'Autosize Columns',           // copy field
        action: () => {
          params.api.sizeColumnsToFit();
        }
      }
    ]
    return result;
  }

}


