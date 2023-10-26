import { Component } from '@angular/core';

@Component({
  selector: 'app-timerange',
  templateUrl: './timerange.component.html',
  // styleUrls: ['./daterange.component.css']
})



export class TimeRangeComponent  {

  public popupParent;

  public time = {hour:0, minute:0};


  constructor() {
    this.popupParent = document.querySelector('body');

  }


}


