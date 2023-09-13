import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { Label } from 'ng2-charts';
import { TableLib } from '../../prod-table/lib/table-lib';
import { Order } from '../../prod-table/order/order-table.component';
import { Printable } from '../../prod-table/printable.component';
import { Product } from '../../prod-table/prod-table.component';
import { AwsService } from '../../service/aws.service';
import { GlobalService } from '../../service/global.service';
import { MessageService } from '../../service/message.service';
import { MenuProduct } from '../menu-editor/menu-editor.component';
import { Menu } from '../menu-editor/menu/menu-table.component';
import { FeatureSelectionComponent } from './feature_selection/feature_selection.component';

// debug print
var print = console.log.bind(console);

export interface Statistic {
  Price: number,
  Food_Cost: number,
  Daily_Average_QT_Sold: number,
  Daily_Average_Contribution: number,
}

@Component({
  selector: 'app-item_performance',
  templateUrl: './item_performance.component.html',
  styleUrls: ['./item_performance.component.css']
})


export class ItemPerformanceComponent extends Printable implements OnInit {

  title = "Item Performance";
  btnSave = false;
  public btnPrint = true;
  public itemList: Product[];
  public itemSelected: string = 'Please select an Item';

  public viewDisabled = false;
  public periods: any[] = [null];

  public loading = false;
  public headers = [];
  public stat: Statistic[] = [];

  // view child on selection component
  @ViewChildren(FeatureSelectionComponent) feature_sel: QueryList<FeatureSelectionComponent>;


  constructor(protected awsService: AwsService,
    protected messageService: MessageService,
    protected ngbDateParserFormatter: NgbDateParserFormatter,
    public globalService: GlobalService,
  ) {
    super();
  }

  /******************************************************** */
  public lineChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        offset: true  // offset left and right
      }]
    },
    legend: {
      position: 'bottom',
      display: true,
    },
    plugins: {
      datalabels: {
        anchor: 'top',
        align: 'center',
        rotation: 0,
        formatter: function (value, context) {
          // return TableLib.currencyFormatter( value ) ;
          return value.toFixed(1);
        }
      }
    },
  };
  public lineChartLabels: Label[] = ['Price', 'Food_Cost', 'Daily_Average_QT_Sold', 'Daily_Average_Contribution'];
  public lineChartType = 'line';
  public lineChartLegend = true;
  public lineChartData = [];

  /*************************************************************************
  *  get and modify data to display  
  */
  async ngOnInit() {
    // invoke API Gateway Service , async /await 
    this.itemList = await this.awsService.getProducts();

    // this.lineChartData.push(
    //   {
    //     data: [2, 2.1, 1.9, 2],
    //     lineTension: 0,
    //     fill: false,
    //     label: 'Test'
    //   }
    // );

    // test
    // this.itemSelected = this.itemList[1].product_name;
    // const ft = this.feature_sel.toArray()[0];
    // ft.feature.menu = ft.menuMenuHeader[0].menu_name;  // select item

  }

  onItemSelect(i) {
    this.itemSelected = this.itemList[i].product_name;  // select item

  }



  /*****************************************************
  *   + button pressed
  */
  onNewPeriod() {
    // add new period
    this.periods.push(null);
  }

  /*****************************************************
  *   print button pressed
  */
  protected printPrepare(value: boolean): void {
  }


  /*****************************************************
  *   View button pressed
  */
  async view() {
    let enable_result = true;
    this.loading = true;

    // check item selected
    if (this.itemSelected == 'Please select an Item') {
      this.messageService.show("Please select an Item")
      enable_result = false;
    }

    // reset headers length
    this.headers = [];
    let i = 1;
    this.stat = []; // reset
    let orders_all = [];

    // iteration thorugh QueryArray of FeatureSelectionComponent(s
    for (let ft of this.feature_sel.toArray()) {
      // check menu selected
      if (ft.feature.menu == 'Please select a Menu') {
        this.messageService.show("Please select a Menu")
        enable_result = false;
      }
      // console.log("Feature", ft.feature)

      // do analysis for selected period

      //load price & food_cost related to couple item/menu
      const menus = await this.awsService.getMenus(true); // get all menus
      const menuFound = menus.find(x => x.menu_name == ft.feature.menu);  // find corresponding menu

      // list of products
      const data = menuFound.menu_products;
      if (data != undefined) {  // if table has rows
        // find pruduct
        const prodFound = data.find(x => x.product_merged_name == this.itemSelected);
        if (prodFound != undefined) {

          // print("prodFound", prodFound);
          let start = this.ngbDateParserFormatter.format(ft.feature.start); // e.g. myDate = 2017-01-01
          let stop = this.ngbDateParserFormatter.format(ft.feature.stop); // e.g. myDate = 2017-01-01

          // whole period statistics
          orders_all = await this.awsService.getAllOrdersV2(start, stop);
          let orders_flt_day: Order[] = orders_all;

          // apply filter from checkboxes
          //
          // ckbox_mon : false,   1
          // ckbox_tue : false,   2
          // ckbox_wed : false,   3
          // ckbox_thu : false,   4
          // ckbox_fri : false,   5
          // ckbox_sat : false,   6
          // ckbox_sun : false,   0
          // ckbox_all : false,
          orders_flt_day = orders_all.filter(o => {
            const day_of_week = new Date(o.timestamp).getDay();

            return ft.feature.ckbox_mon && (day_of_week == 1) ||
              ft.feature.ckbox_tue && (day_of_week == 2) ||
              ft.feature.ckbox_wed && (day_of_week == 3) ||
              ft.feature.ckbox_thu && (day_of_week == 4) ||
              ft.feature.ckbox_fri && (day_of_week == 5) ||
              ft.feature.ckbox_sat && (day_of_week == 6) ||
              ft.feature.ckbox_sun && (day_of_week == 0) ||
              ft.feature.ckbox_all;
          });

          // filter by hour of day
          let orders_flt_hour: Order[] = orders_flt_day;
          orders_flt_hour = orders_flt_day.filter(o => {
            const hour = new Date(o.timestamp).getHours();

            return ft.feature.t00_04 && (hour >= 0 && hour < 4) ||
              ft.feature.t04_08 && (hour >= 4 && hour < 8) ||
              ft.feature.t08_12 && (hour >= 8 && hour < 12) ||
              ft.feature.t12_16 && (hour >= 12 && hour < 16) ||
              ft.feature.t16_20 && (hour >= 16 && hour < 20) ||
              ft.feature.t20_00 && (hour >= 20);
          });

          // print("Len", orders_flt_hour.length);

          // push to array of statistics
          this.stat.push(this.statByPeriod(orders_flt_hour, start, stop, <MenuProduct><unknown>prodFound));
          // debugger;

        }
        else
          this.messageService.show("Product " + this.itemSelected + " not found in " + ft.feature.menu);

      }

      this.headers.push('Time ' + i++);
    };

    //update chart
    i = 1;
    this.lineChartData = [];

    this.stat.forEach(s => {
      this.lineChartData.push(
        {
          data: [s.Price, s.Food_Cost, s.Daily_Average_QT_Sold, s.Daily_Average_Contribution],
          lineTension: 0,   // no spline
          fill: false,      // no fill area
          label: 'Time ' + i++
        }
      );
    });


    this.loading = false;

  }

  /*************************************** */
  // create statistics by period
  private statByPeriod(orders_all: Order[], start, stop, product: MenuProduct) {

    let stat = {
      Price: Number(product.product_sellprice),
      Food_Cost: Number(product.product_foodcost),
      Daily_Average_QT_Sold: 0,
      Daily_Average_Contribution: 0,
    };

    var date1 = new Date(start);
    var date2 = new Date(stop);
    // To calculate the time difference of two dates 
    var Difference_In_Time = date2.getTime() - date1.getTime();

    // To calculate the no. of days between two dates 
    var period_days = Difference_In_Time / (1000 * 3600 * 24) + 1;

    // filter orders by product name
    const orders = orders_all.filter(o => o.merged_product_name == product.product_name);

    let tmp: number;
    tmp = orders.reduce((sum: number, b: Order) => sum + b.quantity, 0);
    const total_order = tmp;
    tmp = total_order / period_days;
    stat.Daily_Average_QT_Sold = tmp;

    tmp = orders.reduce((sum: number, b: Order) => sum + Number(b.price), 0);
    const total_revenue = tmp;
    tmp = total_revenue / period_days;
    stat.Daily_Average_Contribution = tmp * (1 - stat.Food_Cost / stat.Price);

    // tmp = total_revenue / total_order;
    // stat.Daily_Average_Revenue_by_Order = tmp;

    return stat;
  }


  currencyFormatter(num) {
    return TableLib.currencyFormatter(num);
  }

  numberFormatter(tmp) {
    return TableLib.numberFormatter(tmp);
  }
}
