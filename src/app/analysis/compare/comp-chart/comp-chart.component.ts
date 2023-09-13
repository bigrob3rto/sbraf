import { AfterViewInit, Component, Input, isDevMode, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { Label } from 'ng2-charts';

import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { ColumnApi, GridApi } from 'ag-grid-community';
import { AwsService } from '../../../service/aws.service';
import { MessageService } from '../../../service/message.service';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { TableLib } from '../../../prod-table/lib/table-lib';
import { Order } from '../../../prod-table/order/order-table.component';
import { Menu } from '../../menu-editor/menu/menu-table.component';
import { Engineering } from '../../engineering/engineering.component';



@Component({
  selector: 'app-comp-chart',
  templateUrl: './comp-chart.component.html',
  // styleUrls: ['./compare.component.css']
})



export class CompareChartComponent implements OnInit {
  public gridApi: GridApi;
  public gridColumnApi: ColumnApi;
  public rowData;
  public domLayout = 'autoHeight';

  public cache_start = "";
  public cache_stop = "";

  // categorID selected from parent component
  @Input() categorySelectedID : number;


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

  public theme;
  
  /*************************************************************************
  *  get and modify data to display  
  */
  async ngOnInit() {
    // console.log(this.categorySelected);
  }

  constructor(private awsService: AwsService,
    protected ngbDateParserFormatter: NgbDateParserFormatter,
    private messageService: MessageService) {
    // load theme from local storage
    this.theme = localStorage.getItem('ag-grid-theme');
  }

  async analyze(menuSelected, categorySelectedID, daterangeComponent) {
    // load menu dropdown
    const menuArr = await this.awsService.getMenus();
    const menuFound: Menu = menuArr.find(menu => menu.menu_name == menuSelected);

    // load orders
    const start = this.ngbDateParserFormatter.format(daterangeComponent.date1); // e.g. myDate = 2017-01-01
    const stop = this.ngbDateParserFormatter.format(daterangeComponent.date2); // e.g. myDate = 2017-01-01

    // get eng data    invoke API Gateway Service , async /await 
    let engArr_all: Engineering[] = await this.awsService.getEngineeringV2(start, stop);
    // get  MenuProduct array
    const menu_products = menuFound.menu_products;
    if (!menu_products) {
      this.messageService.show("Menu empty.");
      return;
    }
    // map id
    const menu_products_id = menu_products.map(mp => mp.product_id);
    // filter orders by product id (contained in menu)
    let engArr = engArr_all.filter(item => menu_products_id.includes(item.prod_id));
    if (categorySelectedID)
      engArr = engArr.filter(item => Number(item.prod_category_id) == categorySelectedID);
    // calcualte total quantity sold
    const Total_Qty_Sold_whole_period = engArr.reduce((sum, v) => sum + Number(v.item_quantity_sum), 0);
    const Total_Contribution_whole_period = engArr.reduce((sum, v) => sum + v.total_contrib, 0);
    const Total_Food_Cost_whole_period = engArr.reduce((sum, v) => sum + v.prod_food_cost * Number(v.item_quantity_sum), 0);
    const Total_Revenue_whole_period = engArr.reduce((sum, v) => sum + v.item_price * Number(v.item_quantity_sum), 0);

    var date1 = new Date(start);
    var date2 = new Date(stop);
    // To calculate the time difference of two dates 
    var Difference_In_Time = date2.getTime() - date1.getTime();
    // To calculate the no. of days between two dates 
    var period_days = Difference_In_Time / (1000 * 3600 * 24);

    let result = {
      'Daily_Average_Sold': (Total_Qty_Sold_whole_period / period_days).toFixed(1),
      'Daily_Average_Contribution': Total_Contribution_whole_period / period_days,
      'Food_Cost_Range': Total_Food_Cost_whole_period / Total_Revenue_whole_period * 100
    }
    return result;
  }

  // extend to avoid inital refresh
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  onGridSizeChanged(params) {
    params.api.sizeColumnsToFit();
  }

  /**************************************************************+
   * Update barchart
   */
  updateChart(data) {
    // this.gridApi.sizeColumnsToFit();
    // update bar chart labels
    this.barChartLabels = data.map(row => row.item);
    // update bar chart data
    this.barChartData[0].data = [
      (Number(data[0].menu2) / Number(data[0].menu1) * 100).toFixed(1),
      (Number(data[1].menu2) / Number(data[1].menu1) * 100).toFixed(1),
      (Number(data[2].menu2) / Number(data[2].menu1) * 100).toFixed(1),
    ];

  }

  /**************************************************************+
   * update component
   */
  public async update(menuSelected1, daterangeComponent1, menuSelected2, daterangeComponent2) {

    // analyze first menu
    const menu1 = await this.analyze(menuSelected1, this.categorySelectedID, daterangeComponent1);
    const menu2 = await this.analyze(menuSelected2, this.categorySelectedID, daterangeComponent2);

    let table = [
      { item: 'Daily Average Sold', menu1: menu1['Daily_Average_Sold'], menu2: menu2['Daily_Average_Sold'] },
      { item: 'Daily Average Contribution', menu1: menu1['Daily_Average_Contribution'], menu2: menu2['Daily_Average_Contribution'] },
      { item: 'Food Cost Range trend', menu1: menu1['Food_Cost_Range'], menu2: menu2['Food_Cost_Range'] },
    ];


    // console.log("received: ", data);
    this.rowData = table;              // assign new data table
    // const colDefs = this.gridApi.getColumnDefs();

    this.updateChart(table);

  }

}
