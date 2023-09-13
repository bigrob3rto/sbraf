import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Printable } from '../../prod-table/printable.component';
import { MessageService } from '../../service/message.service';
import { TableLib } from '../../prod-table/lib/table-lib';
import { formatDate } from '@angular/common';
import { DateRangeComponent } from '../../views/daterange/daterange.component';
import { AwsService } from '../../service/aws.service';
import { Order } from '../../prod-table/order/order-table.component';
import { Label } from 'ng2-charts';
import { GlobalService } from '../../service/global.service';

export interface Period {
  start: NgbDateStruct,
  stop: NgbDateStruct
}

export interface Statistic {
  Total_Revenue: string,
  Daily_Average_Revenue: string,
  Total_Order: string,
  Daily_Average_QT_order: string,
  Daily_Average_Revenue_by_Order: string,
}

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})

export class DashboardComponent extends Printable implements AfterViewInit {
  public loading: boolean = false;
  public title = "Dashboard"
  public active = 1;

  btnRefresh = true;

  // @ViewChild('flow') flow: FlowComponent;
  // @ViewChild('revenue') revenue: RevenueComponent;
  public periods: Period[] = [];
  @ViewChildren(DateRangeComponent) dateranges: QueryList<DateRangeComponent>;

  public drArray: DateRangeComponent[] = [];

  public stat: Statistic[] = [];
  public headers = [];

  label = {
    1: "Revenue and Profit Area",
    2: 'Flow Area',
    3: 'Profit and Food Cost Area'
  }

  constructor(private messageService: MessageService,
    protected ngbDateParserFormatter: NgbDateParserFormatter,
    protected awsService: AwsService,
    protected globalService: GlobalService,
    protected cdRef: ChangeDetectorRef) {
    super();

    const p1: Period = { start: { day: 1, month: 1, year: 2020 }, stop: { day: 31, month: 1, year: 2020 } }
    this.periods.push(p1);

  }


  //************************************ */
  // CHARTS
  // Daily Revenue
  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: false,
    title: {
      display: true,
      text: 'Monthly Revenue',
      padding: 30,
    },
    legend: {
      position: 'top',
      display: false,
    },
    plugins: {
      datalabels: {
        anchor: 'center',
        align: 'end',
        rotation: -90,
        formatter: function (value, context) {
          return TableLib.currencyFormatter(value);
        }
      }
    },
  };
  public barChartLabels: Label[];
  public barChartType = 'bar';
  public barChartLegend = true;
  public barChartData = [
    {
      data: [],
      label: 'Trend'
    }
  ];
  public chartColors: Array<any> = [
    { // all colors in order
      // backgroundColor: ['gray']
    }
  ]

  //************************************ */
  // Monthly revenue
  public barChart2Options = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: false,
    title: {
      display: true,
      text: 'Daily Revenue',
      padding: 30,
    },
    legend: {
      position: 'top',
      display: false,
    },
    plugins: {
      datalabels: {
        anchor: 'center',
        align: 'end',
        rotation: -90,
        formatter: function (value, context) {
          return TableLib.currencyFormatter(value);
        }
      }
    },
  };
  public barChart2Labels: Label[];
  public barChart2Data = [
    {
      data: [],
      label: 'Trend'
    }
  ];


  /******************************************************** */
  public barChart3Options = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: false,
    title: {
      display: true,
      text: 'Flow Index',
      padding: 30,
    },
    legend: {
      position: 'top',
      display: false,
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'top',
        rotation: -90,
        formatter: function (value, context) {
          return TableLib.currencyFormatter(value);
        }
      }
    },
  };
  public barChart3Labels: Label[];
  public barChart3Data = [
    {
      data: [],
      label: 'Trend'
    }
  ];


  /******************************************************** */
  public lineChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: false,
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
  public lineChartLabels: Label[];
  public lineChartType = 'line';
  public lineChartLegend = true;
  public lineChartData = [
    {
      data: [],
      label: 'Avg $ Ord'
    },
    {
      data: [],
      label: 'Master Flow'
    }
  ];

  /******************************************************** */
  public barChart4Options = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: false,
    title: {
      display: true,
      text: 'Food Cost Trend',
      padding: 30,
    },
    legend: {
      position: 'top',
      display: false,
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'top',
        rotation: -90,
        formatter: function (value, context) {
          return TableLib.currencyFormatter(value);
        }
      }
    },
  };
  public barChart4Labels: Label[];
  public barChart4Data = [
    {
      data: [],
      label: 'Trend'
    }
  ];

  /******************************************************** */
  public barChart5Options = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: false,
    title: {
      display: true,
      text: 'Profit Trend',
      padding: 30,
    },
    legend: {
      position: 'top',
      display: false,
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'top',
        rotation: -90,
        formatter: function (value, context) {
          return TableLib.currencyFormatter(value);
        }
      }
    },
  };
  public barChart5Labels: Label[];
  public barChart5Data = [
    {
      data: [],
      label: 'Trend'
    }
  ];



  ngAfterViewInit() {
    // subscribe to dateranges changes and convert to array
    this.dateranges.changes.subscribe(value => {
      this.drArray = this.dateranges.toArray();
      this.cdRef.detectChanges()
    });
  }


  setLoading(value) {
    this.loading = value;
    // console.log("Received", value)
  }

  refresh = async () => {
    this.loading = true;

    this.stat = []; // reset
    let i = 1;
    this.headers = [];
    let orders_all = [];

    for (let dr of this.dateranges.toArray()) {
      this.headers.push('Period ' + i++);

      let start = this.ngbDateParserFormatter.format(dr.date1); // e.g. myDate = 2017-01-01
      let stop = this.ngbDateParserFormatter.format(dr.date2); // e.g. myDate = 2017-01-01

      // whole period statistics
      orders_all = await this.awsService.getAllOrdersV2(start, stop);

      // push to array of statistics
      this.stat.push(this.statByPeriod(orders_all, start, stop));

    };

    // this month statistics
    const ngbDate = this.dateranges.toArray()[0].date2;
    let lastDay = new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);  //new Date('2020-12-31');
    let y = lastDay.getFullYear()
    let m = lastDay.getMonth();
    let firstDay = new Date(y, m, 1);
    lastDay = new Date(firstDay.getFullYear(), firstDay.getMonth()+1, 0);
    m = m - 1;
    // firstDay = new Date(y, m, 1);
    const orders_1 = orders_all.filter(o => TableLib.dateInRange(new Date(o.timestamp), firstDay, lastDay))

    // populate barChart Monthly revenue
    // classify by yyyy-MM
    let orders;
    let labels = orders_all.map(o => formatDate(o.timestamp, 'yyyy-MM', 'en'))
    // filter unique and sort
    labels = labels.filter((x, i, a) => a.indexOf(x) == i).sort((a, b) => (a < b ? -1 : 1))
    // set chart x axes
    this.barChartLabels = labels;
    this.lineChartLabels = labels;
    labels.forEach(async lbl => {
      // locate first day of month
      let firstDay = new Date(lbl);
      // locate last day of month
      lastDay = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0);
      // filter order array
      orders = orders_all.filter(o => TableLib.dateInRange(new Date(o.timestamp), firstDay, lastDay))

      // calculate revenue and statistics
      const stat = await this.statByPeriod_numeric(orders, firstDay, lastDay)

      // push to chart
      this.barChartData[0].data.push(stat.Total_Revenue)
      this.lineChartData[0].data.push(stat.Daily_Average_Revenue_by_Order)
      this.lineChartData[1].data.push(stat.Daily_Average_QT_order)
    })

    // calculate section RIGHT charts
    // classify by yyyy-MM-dd
    labels = orders_1.map(o => formatDate(o.timestamp, 'yyyy-MM-dd', 'en'))
    // filter unique and sort
    labels = labels.filter((x, i, a) => a.indexOf(x) == i).sort((a, b) => (a < b ? -1 : 1))
    // set chart x axes
    this.barChart2Labels = labels;
    this.barChart3Labels = labels;
    this.barChart4Labels = labels;
    this.barChart5Labels = labels;

    labels.forEach(async lbl => {
      // locate first day of month
      let date = new Date(lbl);
      // filter order array
      orders = orders_1.filter(o => {
        const date = formatDate(o.timestamp, 'yyyy-MM-dd', 'en')
        return lbl == date;
      })

      // calculate revenue and statistics
      const stat = await this.statByPeriod_numeric(orders, lbl, lbl)

      // push to chart
      this.barChart2Data[0].data.push(stat.Total_Revenue)
      this.barChart3Data[0].data.push(stat.Daily_Average_Revenue_by_Order)
      this.barChart4Data[0].data.push(stat.Food_Cost_Range)

    })
    this.loading = false;

    // Update analysis status
    this.globalService.changeAnalStatus("Dashboard");

  }


  printPrepare(v) {
    // if (this.active == 2)
    //   this.flow.printPrepare(v);
  };

  onNewPeriod() {
    // console.log("onNewPeriod");
    if (this.periods.length < 3) {
      const p: Period = { start: { day: 1, month: 1, year: 2020 }, stop: { day: 31, month: 1, year: 2020 } }
      this.periods.push(p);
      this.messageService.show("Added new analysis period");
    }
    else
      this.messageService.show("You can have max 3 periods");
  }

  public ngbToString(date) {
    return TableLib.ngbToString(date);
  }

  public ngbDays(start, stop) {
    // debugger;
    var date1 = new Date(TableLib.ngbToString(start));
    var date2 = new Date(TableLib.ngbToString(stop));
    // To calculate the time difference of two dates 
    var Difference_In_Time = date2.getTime() - date1.getTime();

    // To calculate the no. of days between two dates 
    var period_days = Difference_In_Time / (1000 * 3600 * 24);
    return period_days;
  }

  /*************************************** */
  // create statistics by period
  private statByPeriod(orders: Order[], start, stop): Statistic {

    let stat: Statistic = {
      Total_Revenue: '-',
      Daily_Average_Revenue: '-',
      Total_Order: '-',
      Daily_Average_QT_order: '-',
      Daily_Average_Revenue_by_Order: '-',
    }

    var date1 = new Date(start);
    var date2 = new Date(stop);
    // To calculate the time difference of two dates 
    var Difference_In_Time = date2.getTime() - date1.getTime();

    // To calculate the no. of days between two dates 
    var period_days = Difference_In_Time / (1000 * 3600 * 24);

    let tmp: number;
    tmp = orders.reduce((sum: number, b: Order) => sum + Number(b.price), 0);
    stat.Total_Revenue = TableLib.currencyFormatter(tmp);
    const total_revenue = tmp;
    tmp = total_revenue / period_days;
    stat.Daily_Average_Revenue = TableLib.currencyFormatter(tmp);

    tmp = orders.reduce((sum: number, b: Order) => sum + b.quantity, 0);
    stat.Total_Order = TableLib.numberFormatter(tmp);
    const total_order = tmp;
    tmp = total_order / period_days;
    stat.Daily_Average_QT_order = TableLib.numberFormatter(tmp);

    tmp = total_revenue / total_order;
    stat.Daily_Average_Revenue_by_Order = TableLib.currencyFormatter(tmp);

    return stat;
  }


  /*************************************** */
  // create statistics by period
  private async statByPeriod_numeric(orders: Order[], start, stop) {

    let stat = {
      Total_Revenue: 0,
      Daily_Average_Revenue: 0,
      Total_Order: 0,
      Daily_Average_QT_order: 0,
      Daily_Average_Revenue_by_Order: 0,
      Food_Cost_Range: 0,
      Total_Contribution: 0,
    };

    var date1 = new Date(start);
    var date2 = new Date(stop);
    // To calculate the time difference of two dates 
    var Difference_In_Time = date2.getTime() - date1.getTime();

    // To calculate the no. of days between two dates 
    var period_days = Difference_In_Time / (1000 * 3600 * 24) + 1;

    let tmp: number;
    tmp = orders.reduce((sum: number, b: Order) => sum + Number(b.price), 0);
    stat.Total_Revenue = tmp;
    const total_revenue = tmp;
    tmp = total_revenue / period_days;
    stat.Daily_Average_Revenue = tmp;

    tmp = orders.reduce((sum: number, b: Order) => sum + b.quantity, 0);
    stat.Total_Order = tmp;
    const total_order = tmp;
    tmp = total_order / period_days;
    stat.Daily_Average_QT_order = tmp;

    tmp = total_revenue / total_order;
    stat.Daily_Average_Revenue_by_Order = tmp;

    // Food cost range
    // const products = await this.awsService.getProducts();
    // const food_costs_range = orders.map( o=> products.find( p=> p.product_id == o.product_id).product_food_cost_ext / o.price);
    // stat.Food_Cost_Range = TableLib.average(food_costs_range);
    stat.Food_Cost_Range = 0;
    return stat;
  }

}

