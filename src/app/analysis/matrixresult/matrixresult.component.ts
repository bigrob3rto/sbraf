import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';

import { TableLib } from '../../prod-table/lib/table-lib';


@Component({
  selector: 'app-matrixresult',
  templateUrl: './matrixresult.component.html',
//   styleUrls: ['./matrixchart.component.css']
})



export class MatrixResultComponent {
  title = "Matrix Result";

  
  // 4 classification
  
  public outstanding: string[] = [];
  public champion: string[] = [];
  public opportunity: string[] = [];
  public trash: string[] = [];
  public anomaly: string[] = [];

  @Input() categorySelected;

  
  /**************************************************************+
   * update table
   */
  update( analysis) {

    this.outstanding = analysis.outstanding;
    this.champion = analysis.champion;
    this.opportunity = analysis.opportunity;
    this.trash = analysis.trash;
    this.anomaly = analysis.anomaly;
    

  }

}
