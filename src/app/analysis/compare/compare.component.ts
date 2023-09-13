import { AfterViewInit, Component, Input, isDevMode, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Label } from 'ng2-charts';

import { TableLib } from '../../prod-table/lib/table-lib';
import { Order } from '../../prod-table/order/order-table.component';
import { DateRangeComponent } from '../../views/daterange/daterange.component';
import { Menu } from '../menu-editor/menu/menu-table.component';

import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { MCFilterComponent } from '../../views/mcfilter/mcfilter.component';
import { CompareChartComponent } from './comp-chart/comp-chart.component';
import { MessageService } from '../../service/message.service';
import { GlobalService } from '../../service/global.service';
import { AwsService } from '../../service/aws.service';
import { Category } from '../../prod-table/cat-table.component';
import { Printable } from '../../prod-table/printable.component';



@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  // styleUrls: ['./compare.component.css']
})



export class CompareComponent extends Printable implements OnInit {
  title = "Compare";
  btnSave = false;
  public btnPrint = true;
  public btnRefresh = true;
  public btnExport = true;

  public domLayout = 'autoHeight';

  public pb_current: number = 0;
  dbd_stopBtn: boolean;
  public cache_start = "";
  public cache_stop = "";
  public loading = false;

  public categoryToShow: Category[] = [];

  // view children components
  @ViewChild('daterange1') daterangeComponent: DateRangeComponent;
  @ViewChild('daterange2') daterangeComponent2: DateRangeComponent;
  @ViewChild('mcfilter1') mcfilter1: MCFilterComponent;
  @ViewChild('mcfilter2') mcfilter2: MCFilterComponent;

  @ViewChildren(CompareChartComponent) compCharts: QueryList<CompareChartComponent>

  public columnDefs = [
    {
      headerName: 'Item', field: 'item', sortable: true, resizable: true, width: 300
    },
    {
      headerName: 'Menu1', field: 'menu1', sortable: true, resizable: true, width: 150,
      valueFormatter: params => {
        if (params.data.item == 'Daily Average Contribution')
          return TableLib.currencyFormatter(parseFloat(params.value));
        if (params.data.item == 'Food Cost Range trend')
          return TableLib.percentageFormatter(parseFloat(params.value));
        return;
      }
    },
    {
      headerName: 'Menu2', field: 'menu2', sortable: true, resizable: true, width: 150,
      valueFormatter: params => {
        if (params.data.item == 'Daily Average Contribution')
          return TableLib.currencyFormatter(parseFloat(params.value));
        if (params.data.item == 'Food Cost Range trend')
          return TableLib.percentageFormatter(parseFloat(params.value));
        return;
      }
    },
  ];
  public orders_all: Order[] = [];

  // horizontal bar chart
  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    title: {
      display: true,
      text: 'Performance Trend compare'
    },
    legend: {
      position: 'top',
      display: false,
    },
    scales: {
      xAxes: [{
        ticks: {
          min: 0,
          callback: function (value, index, values) {
            return value + '%';
          }
        }
      }]
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
  public barChartLabels: Label[];
  public barChartType = 'horizontalBar';
  public barChartLegend = true;
  public barChartData = [
    {
      data: [],
      label: 'Trend'
    }
  ];
  public chartColors: Array<any> = [
    { // all colors in order
      backgroundColor: ['gray', 'darkblue', 'green']
    }
  ]
  public barChartPlugins = [pluginDataLabels];




  constructor(
    protected messageService: MessageService,
    public globalService: GlobalService,
    protected awsService: AwsService,
  ) {
    super();
  }


  /*************************************************************************
  *  get and modify data to display  
  */
  async ngOnInit() {

    // receive message for loading status
    this.globalService.loadStatus.subscribe(async message => {
      if (message) {
        this.pb_current = Number(message[0]) / Number(message[1]) * 100;
        // console.log("received:", this.pb_current);
        if (this.pb_current == 100)
          setTimeout(() => {                           //<<<---using ()=> syntax
            this.pb_current = 101;
          }, 1000);

      }
    });

  }

  onCategorySelect1(catName: string) {
    // console.log("Category selected",category);
    if (catName == 'All')
      this.categoryToShow = this.mcfilter1.categoryMenuHeader;
    else {
      this.categoryToShow = [this.mcfilter1.categoryMenuHeader.find(c => c.name == this.mcfilter1.categorySelected)];
      if (this.mcfilter2.categoryMenuHeader.find(c => c.name == this.mcfilter1.categorySelected)) {
        this.mcfilter2.categorySelected = this.mcfilter1.categorySelected;
        this.mcfilter2.categorySelectedID = this.mcfilter1.categorySelectedID;
      }
      else
        this.messageService.show("Category " + this.mcfilter1.categorySelected + " not found in Menu2");
    }
  }


  /**************************************************************+
   * extends  baseList refreshData
   */
  public refreshData() {
    // check store selected
    if (!this.awsService.getStrId()) {
      this.messageService.show("Please select Store first.")
      return;
    }
    this.loading = true;

    // update each children component
    this.compCharts.forEach(instance => instance.update(
      this.mcfilter1.menuSelected, this.daterangeComponent,
      this.mcfilter2.menuSelected, this.daterangeComponent2));


    // update analysis status
    this.globalService.changeAnalStatus("Compare");

    this.loading = false;             // reset loading spinner 

  }


  refresh = () => {
    // if no menu selected
    if (!this.mcfilter1.productXcategory.length || !this.mcfilter2.productXcategory.length) {
      this.messageService.show("Please select menus to compare.");
      return;
    }
    this.pb_current = 0;
    this.refreshData();
  }

  // received event from mvfilter component
  onMenuSelect1(menu: Menu) {
    // console.log("Received select: ", menu.menu_name);
    this.daterangeComponent.date1 = TableLib.utcToNgb(menu.menu_from);
    this.daterangeComponent.date2 = TableLib.utcToNgb(menu.menu_to);
    this.daterangeComponent.refresh();
  }

  // received event from mvfilter component
  onMenuSelect2(menu: Menu) {
    // console.log("Received select: ", menu.menu_name);
    this.daterangeComponent2.date1 = TableLib.utcToNgb(menu.menu_from);
    this.daterangeComponent2.date2 = TableLib.utcToNgb(menu.menu_to);
    this.daterangeComponent2.refresh();
  }

  // stopQuery() {}
  saveTable() { }
  export() { }
  printPrepare(v) { };


  canvasReport(params) {
    this.globalService.canvasReport(params);
  }


}
