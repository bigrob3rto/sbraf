import { AfterViewChecked, AfterViewInit, Component, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';

import { TableLib } from '../../prod-table/lib/table-lib';
import { AwsService } from '../../service/aws.service';
import { GlobalService } from '../../service/global.service';
import { MessageService } from '../../service/message.service';

import { Printable } from '../printable.component';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})



export class ReportComponent extends Printable implements OnInit {
  public title = "Report";
  public reportItems = [];
  public sessionItems = [];
  public btnRefresh = true;
  public btnPrint = true;
  public loading = false;

  constructor(
    private awsService: AwsService,
    private globalService: GlobalService,
    private messageService: MessageService) {
    super();
  }


  ngOnInit() {
    //blob update
    this.refresh();
  }

  refresh = () => {
    // console.log("Refresh");
    //blob update
    this.sessionItems = sessionStorage.getObj('blob');
    // this.reportItems = this.sessionItems;
  }

  clearAll() {
    sessionStorage.removeItem('blob');
    this.refresh();
    this.messageService.show("Analysis cleared.");
  }

  clearReport() {
    this.reportItems.length = 0;
    this.messageService.show("Report cleared.");
  }

  addItem(r) {
    this.reportItems.push(r);
    this.messageService.show("New Item added.");
    // this.reportItems = this.reportItems;

  }

  deleteBlobItem = (i) => {
    this.sessionItems.splice(i, 1);
    this.messageService.show("Item removed.");
  }

  deleteItem(i) {
    this.reportItems.splice(i, 1);
    this.messageService.show("Item removed.");
  }

  moveUp(i) {
    move(this.reportItems, i, -1);
    this.messageService.show("Item up.");
  }

  moveDown(i) {
    move(this.reportItems, i, +1);
    this.messageService.show("Item down.");
  }

  printPrepare(v) {
    // update analysis status
    this.globalService.changeAnalStatus("Report");
  };


}

var move = function (array, index, delta) {
  var newIndex = index + delta;
  if (newIndex < 0 || newIndex == array.length) return; //Already at the top or bottom.
  var indexes = [index, newIndex].sort(); //Sort the indixes
  array.splice(indexes[0], 2, array[indexes[1]], array[indexes[0]]); //Replace from lowest index, two elements, reverting the order
};