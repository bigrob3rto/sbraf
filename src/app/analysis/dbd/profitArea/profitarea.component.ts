import { Component } from '@angular/core';
import { Color, Label } from 'ng2-charts';

import { TableLib } from '../../../prod-table/lib/table-lib';
import { GridApi } from 'ag-grid-community';
import { Order } from '../../../prod-table/order/order-table.component';
import { AwsService } from '../../../service/aws.service';
import { formatDate } from '@angular/common';
import { Product } from '../../../prod-table/prod-table.component';
import { MenuProduct } from '../../menu-editor/menu-editor.component';


@Component({
  selector: 'app-profitarea',
  templateUrl: './profitarea.component.html',
  styleUrls: ['./profitarea.component.css']
})



export class ProfitAreaComponent {
  title = "Profit Area";


  public line2ChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    title: {
      display: true,
      text: 'CONTRIBUTION \\ FOOD COST %'
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
  public line2ChartLabels: Label[];
  public line2ChartType = 'line';
  public line2ChartLegend = true;
  public line2ChartData = [
    {
      data: [],
      label: 'CONTRIBUTION \\ FOOD COST'
    }
  ];
  public line2ChartColours: Array<any> = [
    { // grey
      backgroundColor: '#90ee98',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];

  // lineChart
  public lineChartData: Array<any> = [
    { data: [], label: 'AVG $ DAILY CONTRIBUTION' }
  ];
  public lineChartLabels: Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions: any = {
    title: {
      display: true,
      text: 'AVG $ DAILY CONTRIBUTION'
    },
    animation: true,
    responsive: true,
    elements: {
      line: {
        tension: 0
      }
    },
    scales: {
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


  constructor(
    private awsService: AwsService,
  ) { }



  /**************************************************************+
   * update table
   */
  async update(gridApi: GridApi, rowData: any[], INIT_COL_NUM: number, orders: Order[], menuProducts) {

    // update barChar1
    // get headers from gridApi
    const cols = gridApi.getColumnDefs();

    let x_values = [];    // x axes
    let y_values = [];    // y axe

    // get products
    // const products: Product[] = await this.awsService.getProducts();

    // CHART 1 - Contribution \ Food Cost%
    for (var _i = INIT_COL_NUM; _i < cols.length; _i++) {   // columsn with date
      var colName = cols[_i]['field'];    // column title
      x_values.push(colName);                 // push to x axe

      // extract array from rowData
      const incidenceArr = rowData.map(row => {
        let prodFound = menuProducts.find(x => x.product_id == row.product_id);  // find corresponding category
        if (row[colName])
          return Number(prodFound.product_foodcost) / Number(prodFound.product_sellprice) * 100;
        else
          return 0;
      });
      y_values.push(TableLib.average(incidenceArr).toFixed(1));
    }

    this.line2ChartLabels = x_values;       // update bar chart labels
    this.line2ChartData[0].data = y_values; // update bar chart data


    // CHART 2 - AVG Daily contribution by months
    // calculate AVG QT ORDER DAILY
    const DAILY_FORMAT = 'yyyy_MM_dd_EEE';

    // hash map/table
    let htDay: Map<string, number> = new Map();
    let htDates: Map<string, number> = new Map();


    // elaborazione ordini/giorno
    orders.forEach(row => {   // for each row in table Engineering
      let prodFound : MenuProduct = menuProducts.find(x => x.product_id == Number(row.item_product_id));  // find corresponding product
      if (prodFound) {
        const contribution = Number(prodFound.product_sellprice) - Number(prodFound.product_foodcost);
        // create date to be used as index
        const fDate = formatDate(row.item_timestamp, DAILY_FORMAT, 'en-US');
        let sum = (htDay.has(fDate)) ? htDay.get(fDate) + contribution : contribution;  // sum orders
        // push into hash map 
        htDay.set(fDate, sum);
      }
      else
        console.log("ProfitArea / Update : Product not found: " + row.item_product_id);

    });
    // product['ccc_contribution'] = +(product.product_sell_price - product.product_food_cost_ext).toFixed(1);


    const DATE_FORMAT = 'yyyy_MM';

    orders.forEach(row => {
      const fDate = formatDate(row.item_timestamp, DATE_FORMAT, 'en-US');
      htDates.set(fDate, 0);    // x_values
    });

    htDates.forEach((value, key, map) => {
      let group: number[] = [];
      htDay.forEach((v, k, m) => {
        if (k.includes(key))
          group.push(v);  // push sum order to array
      });
      const avg = +TableLib.average(group).toFixed(1);
      map.set(key, avg);  // save average to map
    });

    // update linechart
    const sortedMap = new Map(Array.from(htDates.entries()).sort((a, b) => a[0] > b[0] ? 1 : -1)); // sort by keys
    this.lineChartLabels = Array.from(sortedMap.keys());        // update bar chart labels
    this.lineChartData[0].data = Array.from(sortedMap.values());; // update bar chart data


  }



}
