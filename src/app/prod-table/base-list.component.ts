import { OnInit, Injectable, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { AwsService } from '../service/aws.service';
import { MessageService } from '../service/message.service';
import { CognitoServiceProvider } from '../service/cognito-service'
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GridApi, GridOptions } from 'ag-grid-community';
import 'ag-grid-enterprise';
import { TableLib } from './lib/table-lib';
import { NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

import { GlobalService } from '../service/global.service';
import { OrderCacheService } from '../service/cache.service';
import { Printable } from './printable.component';



@Injectable()

export abstract class BaseTableComponent extends Printable implements OnInit {
  public gridApi: GridApi;
  public gridOptions: GridOptions;
  public gridColumnApi;
  public loading: boolean;
  public unsaved: boolean = false;

  // app button
  public btnRefresh = true;
  public btnSave = true;
  public btnExport = true;
  public btnReload = true;

  // theme
  public theme = 'ag-theme-blue';


  @ViewChild('myModal') public myModal: ModalDirective; //prompt on refresh with unsaved data


  // abstract defaultColDefs = [];
  public rowData: any = [];
  public domLayout = 'normal';

  abstract title: string;

  public defaultColDef = {
    minWidth: 80,
    flex: 1,
    resizable: true,
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: { newRowsAction: 'keep' },
  };
  public rowSelection = 'multiple';

  constructor(protected awsService: AwsService,
    protected messageService: MessageService,
    public cognitoService: CognitoServiceProvider,
    protected ngbDateParserFormatter: NgbDateParserFormatter,
    protected calendar: NgbCalendar,
    public globalService: GlobalService,
    public cdRef: ChangeDetectorRef,
    protected orderCache: OrderCacheService,
  ) {
    super();
  }

  ngOnInit(): void {
    // receive updates about selected structure
    this.globalService.selectedStructure.subscribe(async message => {
      if (message) {

        /*****************************************************
         *  clear table - when selected store changes
         * */
        if (this.gridApi)
          this.gridApi.setRowData([]);
        // this.refresh();
      }
    });

    // load theme from local storage
    this.theme = localStorage.getItem('ag-grid-theme');

  }

  //prompt on page change with unsaved data
  canDeactivate() {
    // console.log('i am navigating away');
    if (this.unsaved) {
      return window.confirm('Unsaved table. Discard changes?');
    }

    return true;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // console.log("*** onGridReady BS call refreshData");
    this.refreshData();
    // params.api.sizeColumnsToFit();
    // params.api.resetRowHeights();
  }

  isUserLogged(): boolean {
    return this.cognitoService.isUserLogged();

    // this.awsService.sessionTimeout();
  }

  /*******************************************************
   * to be extended in children classes
   */
  reload() {
    console.log("Reload from DB");
  }


  /**************************************************
   * every class shoud implement its own
   */
  abstract getData(): Promise<any[]>;


  /**************************************************
 * Refresh data
 */
  public refreshData() {
    // check store selected
    if (!this.awsService.getStrId()) {
      this.messageService.show("Please select Store first.");
      return;
    }
    this.loading = true;

    this.getData().then(data => {    // call async with Promise
      // console.log("received: ", data);
      this.rowData = data;              // assign new data table

      this.loading = false;             // reset loading spinner 
    });
  }

  @HostListener('window:pagehide', ['$event'])
  public onPageUnload($event: BeforeUnloadEvent) {
    $event.returnValue = true;
  }

  /********************************************************
   *  Save button pressed
   */
  saveTable = () => {
    /********* To be extende in children classes *********/
  }

  /********************************************************
   *  Refresh button pressed
   */
  refresh = () => {
    // console.log("Refresh");
    if (this.unsaved) {
      // ask confirmation
      var modalInstance = this.myModal.show();
    }
    else
      this.refreshData();
  }

  modalCancel() {
    this.myModal.hide();
  }

  modalProceed() {
    this.myModal.hide();
    this.unsaved = false;
    this.refreshData();
    this.gridApi.redrawRows();
  }


  onCellValueChanged(params) {
    params.node.data['changed'] = true
    this.unsaved = true;

    params.colDef.cellStyle = function (params2) {
      if (params2.node.group)
        return;
      if (params2.node.data['changed'] || params2.node.data['groupChange'])
        return { color: 'red' };
    }
    this.gridApi.redrawRows();
  }

  // set row style by parameter
  getRowStyle(params) {
    // console.log("ciao");
    if (params.node.data && params.node.data.deleted) {
      return { color: '#aaa' };
    }
  }
  disableRow(row: any, value: boolean) {
    // var res = gridApi.applyTransaction({ remove: selectedData });
    row.deleted = value;  // disable product
    row.changed = true;
  }

  // resize table auto
  onGridSizeChanged(params) {
    // params.api.sizeColumnsToFit();

  }

  // launch menu action to CMD2.php
  onMenuClipboard(text) {
    TableLib.copytoClipboard(text);   // copy to clipboard
  }

  // export button pressed
  export = () => {
    console.log("Export");

    const params = {};
    this.gridApi.exportDataAsExcel(params);
  }

  // to be extended by children
  getContextMenuItems = (params) => { };
  ;

  checkUnsaved() {
    this.unsaved = false;
    this.gridApi.forEachNode(row => {
      if (row.data['changed'] || row.data['groupChange'])
        this.unsaved = true;
      return;
    });
  }



  canvasReport(params) {
    // console.log("Report",params.target);
    this.globalService.canvasReport(params);
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(document.getElementById('filter-text-box')['value']);
  }

  /*********************************** 
   * Extends parent function
  */
  public printPrepare(value: boolean) {
    if (value) {
      this.gridApi.setDomLayout('print');
    }
    else {
      this.gridApi.setDomLayout('normal');

    }
  }

}

