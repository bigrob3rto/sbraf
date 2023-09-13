import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BaseChartDirective, Label } from 'ng2-charts';
import * as ChartAnnotation from 'chartjs-plugin-annotation';

import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { NeuralService } from '../../../service/neural.service';
import Chart from 'chart.js';
import { TableLib } from '../../../prod-table/lib/table-lib';

import { formatDate } from '@angular/common';

@Component({
  selector: 'ngbd-modal-content',
  templateUrl: './iaModal.component.html',
  styleUrls: ['./elasticity-week.component.css']
})
export class NgbdModalContent {
  @Input() data;
  @Input() week_revenue;
  @ViewChild('barChart') private barChart: BaseChartDirective;  // reference to chart

  // line chart - price analysis
  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    title: {
      display: true,
      text: 'Daily Revenue vs Price',
      padding: 30,
    },
    legend: {
      position: 'top',
      display: false,
    },
    scales: {
      xAxes: [{
        ticks: {
          min: 0,
          // callback: function (value, index, values) {
          //   return value + ' day';
          // }
        }
      }]
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    },
    annotation: {
      annotations: [
        {
          // id: "vline",
          type: "line",
          mode: "vertical",
          scaleID: "x-axis-0",
          value: 3.8,
          borderWidth: 0.5,
          borderColor: "black",
          label: {
            backgroundColor: "grey",
            content: "Price",
            enabled: true,
            position: "top"
          }
        }]
    },

  };
  public barChartLabels: Label[];
  public barChartType = 'line';
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
  public barChartPlugins = [pluginDataLabels];


  public line2ChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    title: {
      display: true,
      text: 'Next week demand forecast',
      padding: 30,
    },
    legend: {
      position: 'top',
      display: false,
    },
    scales: {
      xAxes: [{
        ticks: {
          min: 0,
          // callback: function (value, index, values) {
          //   return value + ' day';
          // }
        }
      }]
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    },
  };
  public line2ChartLabels: Label[];
  public line2ChartType = 'line';
  public line2ChartLegend = true;
  public line2ChartData = [
    {
      data: [],
      label: 'Trend'
    }
  ];
  public line2ChartPlugins = [pluginDataLabels];


  constructor(public activeModal: NgbActiveModal) { }
}

@Component({
  selector: 'ia-modal-component',
  template: ``
})
export class IaModalComponent implements AfterViewInit {
  constructor(private modalService: NgbModal) { }

  /*************************************************************************
*  A lifecycle hook that is called after Angular has fully initialized 
* a component's view.  
*/
  ngAfterViewInit() {
    // chartjs annotation plugin
    let namedChartAnnotation = ChartAnnotation;
    namedChartAnnotation["id"] = "annotation";
    Chart.pluginService.register(namedChartAnnotation);
  }

  open(data, neural: NeuralService) {
    // console.log(data);
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.data = data;

    let week_revenue = [];
    let labels = [];

    for (let i = 1; i <= 25; i++) {
      // const inputs = [Number(data.product_sellprice), i, Number(data.product_foodcost)];
      let results = [];
      for (let day = 1; day <= 7; day++) {
        const inputs = [i, day, Number(data.product_foodcost)];
        results.push(neural.predict(inputs));
      }

      const res = TableLib.average(results);
      week_revenue.push(res);
      // const map = {
      //  1: 'Mon',
      //  2: 'Tue',
      //  3: 'Wed',
      //  4: 'Thu',
      //  5: 'Fri',
      //  6: 'Sat',
      //  7: 'Sun'
      // }
      // labels.push(map[i]);
      if (res > 0) {
        const price = (i + Number(data.product_foodcost)).toFixed(1);
        // const point = { x : Number(price), y : Number(res.toFixed(0)) }
        const point = Number(res.toFixed(0))
        modalRef.componentInstance.barChartData[0].data.push(point)
        labels.push(Number(price));
      }
    }
    modalRef.componentInstance.barChartLabels = labels;
    // console.log(week_revenue);
    modalRef.componentInstance.week_revenue = week_revenue;

    // annotation
    const price = Number(data.product_sellprice) // + Number(data.product_foodcost);
    modalRef.componentInstance.barChartOptions.annotation.annotations[0].value = price - labels[0];
    modalRef.componentInstance.barChartOptions.annotation.annotations[0].label.content = Number(data.product_sellprice);
    // modalRef.componentInstance.barChart.ngOnInit();

    // next week demand forecast
    let date = new Date();  //today
    // date.setDate(date.getDate() + 1);
    // const tomorrow = formatDate(date, 'EEE', 'en');
    const map = {
      'Mon': 1,
      'Tue': 2,
      'Wed': 3,
      'Thu': 4,
      'Fri': 5,
      'Sat': 6,
      'Sun': 7,
    }
    let demand = [];
    let demand_lbl = [];
    for (let day = 1; day <= 7; day++) {
      date.setDate(date.getDate() + 1);
      const dayOfWeek = formatDate(date, 'EEE', 'en');
      const price = Number(data.product_sellprice);
      const inputs = [price, map[dayOfWeek], Number(data.product_foodcost)];
      const revenue = neural.predict(inputs);
      const d = revenue / price;
      demand.push(+d.toFixed(1));
      demand_lbl.push(formatDate(date, 'yyyy/MM/dd', 'en'))
    }
    // console.log(demand_lbl, demand)
    modalRef.componentInstance.line2ChartLabels = demand_lbl;
    modalRef.componentInstance.line2ChartData[0].data = demand;

  }
}