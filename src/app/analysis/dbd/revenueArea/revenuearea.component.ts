import { Component } from '@angular/core';
import { Color, Label } from 'ng2-charts';

import { TableLib } from '../../../prod-table/lib/table-lib';
import { GridApi } from 'ag-grid-community';
import { Order } from '../../../prod-table/order/order-table.component';
import { AwsService } from '../../../service/aws.service';
import { formatDate } from '@angular/common';


@Component({
  selector: 'app-revenuearea',
  templateUrl: './revenuearea.component.html',
  styleUrls: ['./revenuearea.component.css']
})



export class RevenueAreaComponent {
  title = "Revenue Area";


  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    title: {
      display: true,
      text: 'TOTAL REVENUE by period'
    },
    legend: {
      position: 'top',
      display: false,
    },
    scales : {
      yAxes: [{
         ticks: {
            min: 0
          }
      }]
    }
  };
  public barChartLabels: Label[];
  public barChartType = 'bar';
  public barChartLegend = true;
  public barChartData = [
    {
      data: [],
      label: 'TOTAL REVENUE'
    }
  ];
  public barChartColours: Array<any> = [
    { // grey
      backgroundColor: 'eecd90',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];


  // lineChart
  public lineChartData: Array<any> = [
    { data: [], label: 'AVG $ DAILY REVENUE by Months' }
  ];
  public lineChartLabels: Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions: any = {
    title: {
      display: true,
      text: 'AVG $ DAILY REVENUE by Months'
    },
    animation: true,
    responsive: true,
    elements: {
      line: {
        tension: 0
      }
    },
    scales : {
      yAxes: [{
         ticks: {
            min: 0
          }
      }]
    }
  };
  public lineChartColours: Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = false;
  public lineChartType = 'line';


  constructor(private awsService: AwsService) { }


  /**************************************************************+
   * update table
   */
  async update(gridApi: GridApi, rowData: any[], INIT_COL_NUM: number, orders : Order[]) {

    // update barChar1
    // get headers from gridApi
    const cols = gridApi.getColumnDefs();
    let x_values = [];    // x axes
    let y_values = [];    // y axe
    for (var _i = INIT_COL_NUM; _i < cols.length; _i++) {   // columsn with date
      var colName = cols[_i]['field'];       // column title
      x_values.push(colName);                 // push to x axe
      y_values.push(rowData[1][colName]);     // 'Amount' row -> 1
    }
    const order_revenue = y_values;   // save to daily_order_revenue array

    // update bar chart
    this.barChartLabels = x_values;       // update bar chart labels
    this.barChartData[0].data = y_values; // update bar chart data


    // update barChar2
    // calculate AVG QT ORDER DAILY
    const DAILY_FORMAT = 'yyyy_MM_dd_EEE';

    // hash map/table
    let htDay: Map<string, number> = new Map();
    let htDates: Map<string, number> = new Map();

    // let order_value = 0;

    // elaborazione ordini/giorno
    orders.forEach(row => {   // for each row in table Engineering
      // create date to be used a sindex
      const fDate = formatDate(row.item_timestamp, DAILY_FORMAT, 'en-US');
      const order_total = Number(row.item_price) * row.item_quantity;
      let sum = (htDay.has(fDate)) ? htDay.get(fDate) + order_total : order_total;  // sum orders
      // push into hash map 
      htDay.set(fDate, sum);
    });

    const DATE_FORMAT = 'yyyy_MM';

    orders.forEach(row => {
      const fDate = formatDate(row.item_timestamp, DATE_FORMAT, 'en-US');
      htDates.set(fDate, 0);    // x_values
    });

    htDates.forEach((value, key, map) => {
      let group: number[] = [];
      htDay.forEach((v, k, m) => {
        if (k.includes(key))
          group.push(v);  // push sum oorder to array
      });
      map.set(key, +TableLib.average(group).toFixed(1));  // save average to map
    });

    // update linechart
    const sortedMap = new Map(Array.from(htDates.entries()).sort((a, b) => a[0] > b[0] ? 1 : -1)); // sort by keys
    this.lineChartLabels = Array.from(sortedMap.keys());        // update bar chart labels
    this.lineChartData[0].data = Array.from(sortedMap.values());; // update bar chart data


  }



}
