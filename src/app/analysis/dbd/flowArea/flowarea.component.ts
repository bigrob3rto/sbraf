import { Component } from '@angular/core';
import { Color, Label } from 'ng2-charts';

import { TableLib } from '../../../prod-table/lib/table-lib';
import { GridApi } from 'ag-grid-community';
import { Order } from '../../../prod-table/order/order-table.component';
import { AwsService } from '../../../service/aws.service';
import { formatDate } from '@angular/common';


@Component({
  selector: 'app-flowarea',
  templateUrl: './flowarea.component.html',
  styleUrls: ['./flowarea.component.css']
})



export class FlowAreaComponent {
  title = "Flow Area";


  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    title: {
      display: true,
      text: 'Total Order'
    },
    legend: {
      position: 'top',
      display: false,
    },
    scales: {
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
      label: 'Total Order'
    }
  ];

  public barChartOptions2 = {
    scaleShowVerticalLines: false,
    responsive: true,
    title: {
      display: true,
      text: 'AVG QT ORDER DAILY'
    },
    legend: {
      position: 'top',
      display: false,
    },
    scales: {
      yAxes: [{
        ticks: {
          min: 0
        }
      }]
    }
  };
  public barChartLabels2: Label[];
  public barChartType2 = 'bar';
  public barChartLegend2 = true;
  public barChartData2 = [
    {
      data: [],
      label: 'Total Order'
    }
  ];
  public barChartColors2: Color[] = [
    { backgroundColor: 'green' },
  ]

  // lineChart
  public lineChartData: Array<any> = [
    { data: [], label: 'AVG $ DAILY ORDER' }
  ];
  public lineChartLabels: Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions: any = {
    title: {
      display: true,
      text: 'AVG $ DAILY ORDER'
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
  async update(gridApi: GridApi, footerData: any[], INIT_COL_NUM: number, orders : Order[]) {

    // update barChar1
    // get headers from gridApi
    const cols = gridApi.getColumnDefs();
    let x_values = [];    // x axes
    let y_values = [];    // y axes
    let y_order_values = [];
    for (var _i = INIT_COL_NUM; _i < cols.length; _i++) {   // columsn with date
      var colName = cols[_i]['field'];      // column title
      x_values.push(colName);                 // push to x axe
      y_values.push(footerData[0][colName]);     // 'orders' row -> 0

      // average order value
      y_order_values.push(footerData[2][colName]); // 'average' row -> 2
    }

    // update bar chart
    this.barChartLabels = x_values;       // update bar chart labels
    this.barChartData[0].data = y_values; // update bar chart data

    // update linechart
    this.lineChartLabels = x_values;
    this.lineChartData[0].data = y_order_values; // update line chart data

    // update barChar2
    // calculate AVG QT ORDER DAILY
    const DAILY_FORMAT = 'yyyy_MM_dd_EEE';

    // hash map/table
    let htDay: Map<string, number> = new Map();
    let htDates: Map<string, number> = new Map();


    // elaborazione ordini/giorno
    orders.forEach(row => {   // for each row in table Engineering
      // create date to be used a sindex
      const fDate = formatDate(row.item_timestamp, DAILY_FORMAT, 'en-US');
      let sum = (htDay.has(fDate)) ? htDay.get(fDate) + 1 : 1;  // sum orders
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

    const sortedMap = new Map(Array.from(htDates.entries()).sort((a, b) => a[0] > b[0] ? 1 : -1)); // sort by keys
    this.barChartLabels2 = Array.from(sortedMap.keys());        // update bar chart labels
    this.barChartData2[0].data = Array.from(sortedMap.values());; //Array.from(htDates.values());  // update bar chart data


  }



}
