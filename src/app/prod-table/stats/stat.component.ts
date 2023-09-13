import { BaseTableComponent } from '../base-list.component'
import { Component, OnInit } from '@angular/core';
import { Color, Label } from 'ng2-charts';
import { TableLib } from '../lib/table-lib';
import { Papa } from 'ngx-papaparse';
import { AwsService } from '../../service/aws.service';
import { MessageService } from '../../service/message.service';
import { CognitoServiceProvider } from '../../service/cognito-service';
import { NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from '../../service/global.service';
import { ChangeDetectorRef } from '@angular/core';
import { OrderCacheService } from '../../service/cache.service';

@Component({
  selector: 'app-stat',
  templateUrl: './stat.component.html',
  // styleUrls: ['./stat.component.css']
})

export class StatComponent extends BaseTableComponent implements OnInit {
  title = "Utilities";
  btnSave = false;
  public btnPrint = true;
  domLayout = 'autoHeight'
  public themeSelected = 'cosmo-dark';
  public themeArray: string[] = ['cosmo-dark', 'cosmo-light', 'cosmo-blue', 'cerulean', 'slate', 'journal', 'minty', 'solar', 'lux'];
  public imageData;

  public agThemeSelected = 'ag-theme-balham';
  public agThemeArray: string[] = ['ag-theme-balham-dark', 'ag-theme-balham', 'ag-theme-blue'];

  columnDefs = [
    { headerName: 'Field', field: 'field', resizable: true, sortable: true, width: 150, filter: 'agTextColumnFilter' },
    { headerName: 'Value', field: 'value', resizable: true, sortable: true, width: 110, filter: 'agTextColumnFilter' },
  ]

  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    title: {
      display: true,
      text: 'DB and Cache Utilities'
    },
    legend: {
      position: 'top',
      display: false,
    }
  };
  public barChartLabels: Label[] = ['Cache hits', 'DB GET', 'DB POST', 'DB DELETE'];
  public barChartType = 'horizontalBar';
  public barChartLegend = true;
  public barChartData = [
    {
      data: [],
      label: 'Data calls'
    }
  ];
  public barChartColors: Color[] = [
    { backgroundColor: 'lightgreen' },
  ]
  cache_start: any;
  cache_stop: any;
  public file;

  constructor(
    protected awsService: AwsService,
    protected messageService: MessageService,
    public cognitoService: CognitoServiceProvider,
    protected ngbDateParserFormatter: NgbDateParserFormatter,
    protected calendar: NgbCalendar,
    public globalService: GlobalService,
    public cdRef: ChangeDetectorRef,
    protected orderCache: OrderCacheService,
    private papa: Papa
  ) {
    super(awsService, messageService, cognitoService, ngbDateParserFormatter, calendar, globalService, cdRef, orderCache);
  }


  ngOnInit() {
    const theme = localStorage.getItem('theme');
    this.themeSelected = theme;
    // load theme from local storage
    const agTheme = localStorage.getItem('ag-grid-theme');
    this.agThemeSelected = agTheme;
  }

  getData() {
    const cacheHits = this.globalService.has('cacheHits') ? this.globalService.getItem('cacheHits') : 0;
    const dbGET = this.globalService.has('dbGET') ? this.globalService.getItem('dbGET') : 0;
    const dbPOST = this.globalService.has('dbPOST') ? this.globalService.getItem('dbPOST') : 0;
    const dbDELETE = this.globalService.has('dbDELETE') ? this.globalService.getItem('dbDELETE') : 0;

    // update bar chart
    // this.barChartLabels = Array.from(htSorted.keys());       // update bar chart labels
    this.barChartData[0].data = [cacheHits, dbGET, dbPOST, dbDELETE];  // update bar chart data


    //update cache view data
    const order_img = this.orderCache.info();
    if (order_img) {
      this.cache_start = order_img.start;
      this.cache_stop = order_img.stop;
    }
    else {
      this.cache_start = "";
      this.cache_stop = "empty";
    }


    if (this.globalService.order_loading)
      setTimeout(() => {
        this.refreshData();
        // console.log("set timeout");
      }, 1000);

    return Promise.resolve([
      { field: 'Cache hits', value: cacheHits },
      { field: 'DB GET calls', value: dbGET },
      { field: 'DB POST calls', value: dbPOST },
      { field: 'DB DELETE calls', value: dbDELETE },
    ]);
  }


  onGridSizeChanged(params) {
    // params.api.sizeColumnsToFit();
    this.gridApi.ensureIndexVisible(4);

  }

  /********************************************************
  *  Refresh button pressed
  */
  refresh = () => {
    this.refreshData();
  }

  saveCache() {
    if (!this.cache_start) {
      this.messageService.show("Cache empty.");
      return;
    }
    console.log("Save cache");
    this.loading = true;
    //update cache view data
    const orders_all = this.orderCache.get();  // get all
    if (orders_all) {
      TableLib.exportToCsv("Orders_" + this.cache_start + "_" + this.cache_stop + ".csv", orders_all);
    }
    this.loading = false;
  }

  /*****************************************************+++++
   * 
   */
  importCache() {
    if (!this.file) {
      this.messageService.show("Please select a file first.");
      return;
    }
    this.loading = true;
    // console.log("Save cache", this.file);
    let csvData = '"Hello","World!"';

    let fileReader = new FileReader();
    // "Orders_" + this.cache_start + "_" + this.cache_stop
    const ss = this.file.name.split("_");
    const start = ss[1];
    const stop = ss[2].split(".")[0];

    fileReader.onload = (e) => {
      // console.log(fileReader.result);
      csvData = fileReader.result.toString();

      let options = {
        // Add your options here
        header: true
      };

      // cvs parse to json
      const orders = this.papa.parse(csvData, options).data;

      // add to cache
      this.orderCache.add(orders, start, stop);

      // refresh view
      this.refreshData();
      this.messageService.show("Import complete.");
      this.loading = false;
    }
    fileReader.readAsText(this.file);

  }

  cacheClear() {
    this.orderCache.invalidate();
    this.refreshData();
    this.messageService.show("Cache cleared.");
  }


  onFileSelect(params) {
    this.file = params.target.files[0];
    console.log(this.file);
  };

  /***************************************************
   * Select theme dropdown
   */
  selectTheme(theme) {
    this.themeSelected = theme;
    this.globalService.changeSelectedTheme(theme);
    localStorage.setItem('theme', theme);
  }

  /***************************************************
   * Select theme dropdown
   */
  selectAgTheme(theme) {
    this.agThemeSelected = theme;
    localStorage.setItem('ag-grid-theme', theme);
  }
}
