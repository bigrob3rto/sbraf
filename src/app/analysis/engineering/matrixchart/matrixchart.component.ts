import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';

import { BaseChartDirective, Color, Label } from 'ng2-charts';
import { ChartDataSets, ChartOptions, ChartPoint, ChartType } from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import * as Chart from 'chart.js';

import { TableLib } from '../../../prod-table/lib/table-lib';
import { GridApi } from 'ag-grid-community';
import { MatrixResultComponent } from '../../matrixresult/matrixresult.component';
import { GlobalService } from '../../../service/global.service';


@Component({
  selector: 'app-matrixchart',
  templateUrl: './matrixchart.component.html',
  styleUrls: ['./matrixchart.component.css']
})



export class MatrixChartComponent implements AfterViewInit {
  title = "Matrix Chart";

  @ViewChild('bubbleChart') private bubbleChart: BaseChartDirective;  // reference to bubblechart
  @ViewChild('bubbleChart2') private bubbleChart2: BaseChartDirective;  // reference to bubblechart2
  @ViewChild(MatrixResultComponent, { static: false }) matrixResultComponent: MatrixResultComponent;

  // 4 classification
  public star1: string[] = [];
  public worst1: string[] = [];
  public leader1: string[] = [];
  public puzzle1: string[] = [];

  public star2: string[] = [];
  public worst2: string[] = [];
  public leader2: string[] = [];
  public puzzle2: string[] = [];

  public outstanding: string[] = [];
  public champion: string[] = [];
  public opportunity: string[] = [];
  public trash: string[] = [];
  public anomaly: string[] = [];

  public gridApi: GridApi;
  @Input() menuSelected;
  @Input() categorySelected;

  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    title: {
      display: true,
      text: '# Orders per product'
    },
    legend: {
      position: 'top',
      display: false,
    }
  };
  public barChartLabels: Label[];
  public barChartType = 'bar';
  public barChartLegend = true;
  public barChartData = [
    {
      data: [],
      label: 'Order per product'
    }
  ];


  public bubbleChartOptions: (ChartOptions & { annotation: any }) = {
    title: {
      display: true,
      text: 'KASAVANA SMITH Matrix'
    },
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Item Contribution'
        },
        ticks: {}
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Seles quantity'
        },
        ticks: {}
      }]

    },
    responsive: true,
    legend: { position: 'bottom', display: false },
    annotation: {
      annotations: [{
        // id: "hline",
        type: "line",
        mode: "horizontal",
        scaleID: "y-axis-0",
        value: 20,
        borderColor: "black",
        borderWidth: 0.5,
        label: {
          backgroundColor: "grey",
          content: "Target line",
          enabled: true,
          position: 'right'
        }
      },
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
          content: "TODAY",
          enabled: true,
          position: "top"
        }
      }]
    },

  };


  public bubbleChartOptions2: (ChartOptions & { annotation: any }) = {
    title: {
      display: true,
      text: 'KASAVANA SMITH Matrix'
    },
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Food cost'
        },
        ticks: {}
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Seles quantity'
        },
        ticks: {}
      }]

    },
    responsive: true,
    legend: { position: 'bottom', display: false },
    annotation: {
      annotations: [{
        // id: "hline",
        type: "line",
        mode: "horizontal",
        scaleID: "y-axis-0",
        value: 20,
        borderColor: "black",
        borderWidth: 0.5,
        label: {
          backgroundColor: "grey",
          content: "Target line",
          enabled: true,
          position: 'right'
        }
      },
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
          content: "TODAY",
          enabled: true,
          position: "top"
        }
      }]
    },

  };
  public bubbleChartType: ChartType = 'bubble';
  public bubbleChartLegend = true;

  public bubbleChartData: ChartDataSets[] = [
    {
      data: [],
      label: 'Contribution/Qty',
      borderColor: 'grey',
      hoverBackgroundColor: 'lightgreen',
      hoverBorderColor: 'darkgreen',
    }
  ];

  public bubbleChartData2: ChartDataSets[] = [
    {
      data: [],
      label: 'Contribution/Qty',
      borderColor: 'grey',
      hoverBackgroundColor: 'lightgreen',
      hoverBorderColor: 'darkgreen',
    }
  ];



  public bubbleChartColors: Color[] = [
    {
      backgroundColor: []
    }
  ];


  constructor(
    private globalService: GlobalService) { }

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




  /**************************************************************+
   * update table
   */
  update(gridApi) {

    this.bubbleChartData = [
      {
        data: [],
      },
    ];

    this.bubbleChartData2 = [
      {
        data: [],
      },
    ];

    let ht: Map<string, number> = new Map();   // hash map for sumOrders
    let hti: Map<string, number> = new Map();   // hash map for sumIncome
    let y_values: number[] = [];             // array of y axes - bubble chart
    let x_values: number[] = [];             // array of x axes - bubble chart
    let x2_values: number[] = [];             // array of x axes - bubble chart 2



    // for each row of table filtered
    gridApi.forEachNodeAfterFilter(row => {
      // console.log('Row',row.data);
      let sumOrders = 0;
      let sumIncome = 0;
      if (ht.has(row.data.prod_category_id)) {   // per category ID
        sumOrders = ht.get(row.data.prod_name);   // calc #Order from hash table
        sumIncome = hti.get(row.data.prod_name);  // calc Sum_Income from hash table
      }

      // put new value to hash table
      ht.set(row.data.merged_product_name, sumOrders + Number(row.data.order_num_per_product));
      hti.set(row.data.merged_product_name, sumIncome + Number(row.data.price * Number(row.data.quantity)));

      // bubblechart data
      const incidence = row.data.item_incidence;
      const bubble: ChartDataSets = {
        data: [{
          x: Number(row.data.item_contrib.toFixed(1)),
          y: Number(row.data.quantity),
          r: +(3 + row.data.price / 3).toFixed(1)
        }
        ],
        label: row.data.merged_product_name,
        borderColor: 'grey',
        hoverBackgroundColor: 'white',
        hoverBorderColor: 'darkgreen'
      };

      // push new bubble into chart
      this.bubbleChartData.push(bubble);
      y_values.push(Number(row.data.quantity));   // array of y values
      if (row.data.item_contrib)
        x_values.push(Number(row.data.item_contrib));     // array of x values
      if (row.data.prod_food_cost)
        x2_values.push(Number(row.data.prod_food_cost));     // array of x values


      // update MAtrix 2
      if (row.data.prod_food_cost) {
        const bubble2: ChartDataSets = {
          data: [{
            x: Number(row.data.prod_food_cost.toFixed(1)),
            y: Number(row.data.quantity),
            r: +(3 + row.data.price / 3).toFixed(1)
          }
          ],
          label: row.data.merged_product_name,
          backgroundColor: 'lightgreen',
          borderColor: 'grey',
          hoverBackgroundColor: 'white',
          hoverBorderColor: 'darkgreen',
        };

        // push new bubble into chart
        this.bubbleChartData2.push(bubble2);
      }
    });

    let hx = TableLib.median(x_values);
    let my = TableLib.median(y_values);
    // adjust horizontal  line
    this.bubbleChartOptions.annotation.annotations[0].value = my.toFixed(1);
    this.bubbleChartOptions.annotation.annotations[0].label.content = my.toFixed(1);
    // adjust vertical  line
    this.bubbleChartOptions.annotation.annotations[1].value = hx.toFixed(1);
    this.bubbleChartOptions.annotation.annotations[1].label.content = hx.toFixed(1);

    // clear array 4 classification
    this.star1 = [];
    this.worst1 = [];
    this.leader1 = [];
    this.puzzle1 = [];

    this.star2 = [];
    this.worst2 = [];
    this.leader2 = [];
    this.puzzle2 = [];

    this.outstanding = [];
    this.champion = [];
    this.opportunity = [];
    this.trash = [];
    this.anomaly = [];

    // fill up 4 cards - star worst leader puzzle -step 1
    this.bubbleChartData.forEach(bb => {
      const el = bb.data[0];
      if (el) {
        if (el['x'] > hx && el['y'] > my && !this.star1.includes(bb.label))
          this.star1.push(bb.label);
        if (el['x'] > hx && el['y'] < my && !this.puzzle1.includes(bb.label))
          this.puzzle1.push(bb.label);
        if (el['x'] < hx && el['y'] > my && !this.leader1.includes(bb.label))
          this.leader1.push(bb.label);
        if (el['x'] < hx && el['y'] < my && !this.worst1.includes(bb.label))
          this.worst1.push(bb.label);
      }
    });
    // console.log(this.worst1);

    // scales
    let x_max = Math.max(...x_values);
    let x_min = Math.min(...x_values);
    let x_range = Math.max(x_max - hx, hx - x_min);
    this.bubbleChartOptions.scales.xAxes[0].ticks.max = hx + x_range * 1.2;
    this.bubbleChartOptions.scales.xAxes[0].ticks.min = hx - x_range * 1.2;

    const y_max = Math.max(...y_values);
    const y_min = Math.min(...y_values);
    const y_range = Math.max(y_max - my, my - y_min);
    this.bubbleChartOptions.scales.yAxes[0].ticks.max = my + y_range * 1.2;
    this.bubbleChartOptions.scales.yAxes[0].ticks.min = my - y_range * 1.2;

    this.bubbleChart.ngOnInit();    // force redraw


    //Matrix 2 update
    hx = TableLib.harmonicMean(x2_values);
    my = TableLib.median(y_values);
    // adjust horizontal  line
    this.bubbleChartOptions2.annotation.annotations[0].value = my.toFixed(1);
    this.bubbleChartOptions2.annotation.annotations[0].label.content = my.toFixed(1);
    // adjust vertical  line
    this.bubbleChartOptions2.annotation.annotations[1].value = hx.toFixed(1);
    this.bubbleChartOptions2.annotation.annotations[1].label.content = hx.toFixed(1);

    // fill up 4 cards - star worst leader puzzle -step 2
    this.bubbleChartData2.forEach(bb => {
      const el = bb.data[0];
      if (el) {
        if (el['x'] > hx && el['y'] > my && !this.star2.includes(bb.label))
          this.star2.push(bb.label);
        if (el['x'] > hx && el['y'] < my && !this.puzzle2.includes(bb.label))
          this.puzzle2.push(bb.label);
        if (el['x'] < hx && el['y'] > my && !this.leader2.includes(bb.label))
          this.leader2.push(bb.label);
        if (el['x'] < hx && el['y'] < my && !this.worst2.includes(bb.label))
          this.worst2.push(bb.label);
      }
    });


    // outstanding - champion - opportunity - trash
    this.bubbleChartData.forEach(bb => {
      const el = bb.label;

      if (el) {
        // outstanding
        if (this.star1.includes(el) && this.star2.includes(el) && !this.outstanding.includes(el) )
          this.outstanding.push(el);
        // trash
        if (this.worst1.includes(el) && this.worst2.includes(el)  && !this.trash.includes(el) )
          this.trash.push(el);

        // champion
        if ((this.star1.includes(el) && this.leader2.includes(el) ||
          this.leader1.includes(el) && this.star2.includes(el) ||
          this.puzzle1.includes(el) && this.star2.includes(el) ) && !this.champion.includes(el)
        )
          this.champion.push(el);

        // opportunity
        if ((this.worst1.includes(el) && this.leader2.includes(el) ||
          this.worst1.includes(el) && this.puzzle2.includes(el) ||
          this.leader1.includes(el) && this.leader2.includes(el) ||
          this.puzzle1.includes(el) && this.worst2.includes(el) ||
          this.puzzle1.includes(el) && this.puzzle2.includes(el))  && !this.opportunity.includes(el)
        )
          this.opportunity.push(el);

        // anomaly
        if ((this.star1.includes(el) && this.worst2.includes(el) ||
          this.star1.includes(el) && this.puzzle2.includes(el) ||
          this.worst1.includes(el) && this.star2.includes(el) ||
          this.leader1.includes(el) && this.worst2.includes(el) ||
          this.leader1.includes(el) && this.puzzle2.includes(el) ||
          this.puzzle1.includes(el) && this.leader2.includes(el) )  && !this.anomaly.includes(el)
        )
          this.anomaly.push(el);
      }
    });


    // scales
    x_max = Math.max(...x2_values);
    x_min = Math.min(...x2_values);
    x_range = Math.max(x_max - hx, hx - x_min);
    this.bubbleChartOptions2.scales.xAxes[0].ticks.max = hx + x_range * 1.2;
    this.bubbleChartOptions2.scales.xAxes[0].ticks.min = hx - x_range * 1.2;

    this.bubbleChartOptions2.scales.yAxes[0].ticks.max = my + y_range * 1.2;
    this.bubbleChartOptions2.scales.yAxes[0].ticks.min = my - y_range * 1.2;

    this.bubbleChart2.ngOnInit();    // force redraw

    // Array.from(ht.entries())
    //   let key = entry[0];    
    //   let value = entry[1];
    // 
    // convert to array, and sort
    let arr = Array.from(ht.entries()).sort((a, b) => a[1] < b[1] ? 1 : -1);
    // convert to map again
    let htSorted = new Map(arr);

    // update bar chart
    this.barChartLabels = Array.from(htSorted.keys());       // update bar chart labels
    this.barChartData[0].data = Array.from(htSorted.values());  // update bar chart data


    if (this.barChartLabels.length) { // push analysis to cache for later use
      setTimeout(() => {
        const result = {
          name: this.menuSelected + "_" + this.categorySelected,
          outstanding: this.outstanding,
          champion: this.champion,
          opportunity: this.opportunity,
          trash: this.trash,
          anomaly: this.anomaly
        }
        // update matrix result
        this.matrixResultComponent.update(result);
        // save to cache
        this.globalService.setItem(result.name, result);
        // console.log("Matrix push", result);
      });
    }
  }

  canvasReport(params) {
    this.globalService.canvasReport(params);
  }
}
