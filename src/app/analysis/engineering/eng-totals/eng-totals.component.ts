import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { GridApi } from 'ag-grid-community';

@Component({
  selector: 'app-eng-totals',
  templateUrl: './eng-totals.component.html',
  styleUrls: ['./eng-totals.component.css']
})
export class EngTotalsComponent implements OnInit {

  public user_currency: string;

  public stat = {
    Total_Order_Sold_whole_period: 0,
    Daily_Average_QT_sold: 0,
    Daily_Average_Revenue: 0,
    Total_Revenue_whole_period: 0,
    Daily_Average_Revenue_trend: 0,
    Total_Food_Cost_whole_period: 0,
    Food_Cost_Trend: 0,
    Total_Contribution_whole_period: 0,
    Daily_Average_Contribution: 0
  };

  constructor() { }

  ngOnInit() {
    // get currency from localStorage
    this.user_currency = localStorage.getItem('user_currency');
    if (!this.user_currency)
      this.user_currency = '$';
  }

  update(gridApi: GridApi, start: string, stop: string) {
    // console.log("Update");

    this.stat = {
      Total_Order_Sold_whole_period: 0,
      Daily_Average_QT_sold: 0,
      Daily_Average_Revenue: 0,
      Total_Revenue_whole_period: 0,
      Daily_Average_Revenue_trend: 0,
      Total_Food_Cost_whole_period: 0,
      Food_Cost_Trend: 0,
      Total_Contribution_whole_period: 0,
      Daily_Average_Contribution: 0
    };

    // for each row of table filtered
    let total_orders = 0;
    gridApi.forEachNodeAfterFilter(row => {
      this.stat.Total_Order_Sold_whole_period += Number(row.data.quantity);
      this.stat.Total_Revenue_whole_period += Number(row.data.total_gross);
      total_orders += Number(row.data.order_num_per_product);
      this.stat.Total_Food_Cost_whole_period += Number(row.data.total_cost);
    });

    var date1 = new Date(start);
    var date2 = new Date(stop);
    // To calculate the time difference of two dates 
    var Difference_In_Time = date2.getTime() - date1.getTime();

    // To calculate the no. of days between two dates 
    var period_days = Difference_In_Time / (1000 * 3600 * 24);
    this.stat.Daily_Average_QT_sold = +(this.stat.Total_Order_Sold_whole_period / period_days).toFixed(1);
    this.stat.Daily_Average_Revenue = +(this.stat.Total_Revenue_whole_period / total_orders).toFixed(1);
    this.stat.Daily_Average_Revenue_trend = +(this.stat.Total_Revenue_whole_period / period_days).toFixed(1);
    this.stat.Total_Revenue_whole_period = +(this.stat.Total_Revenue_whole_period).toFixed(1);
    this.stat.Total_Food_Cost_whole_period = +(this.stat.Total_Food_Cost_whole_period).toFixed(1);
    this.stat.Food_Cost_Trend = +(this.stat.Total_Food_Cost_whole_period / this.stat.Total_Revenue_whole_period * 100).toFixed(1);
    this.stat.Total_Contribution_whole_period = +(this.stat.Total_Revenue_whole_period - this.stat.Total_Food_Cost_whole_period).toFixed(1);
    this.stat.Daily_Average_Contribution = +(this.stat.Total_Contribution_whole_period / period_days).toFixed(1);
  }



}
