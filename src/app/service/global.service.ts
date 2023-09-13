import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import html2canvas from 'html2canvas';
import { GridApi } from 'ag-grid-community';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})

export class GlobalService {
  public order_loading: boolean = false;
  public dbd_stopBtn: boolean = false;


  constructor(messageService: MessageService) { }

  // item notification -  send selectedStructure change to all interested components
  private messageSource1 = new BehaviorSubject(null);
  selectedStructure = this.messageSource1.asObservable();
  changeSelectedStructure(value: string) {
    this.messageSource1.next(value)
  }


  // item notification - load orders status / total
  private messageSource4 = new BehaviorSubject([0, 0]);
  loadStatus = this.messageSource4.asObservable();
  loadingStatus(value) {
    this.messageSource4.next(value)
  }

  private theme: string = localStorage.getItem('theme');
  // item notification - load orders status / total
  private messageSource5 = new BehaviorSubject(this.theme);
  selectedTheme = this.messageSource5.asObservable();
  changeSelectedTheme(value) {
    this.messageSource5.next(value)
  }

  // item notification -  send selectedStructure change to all interested components
  private messageSource6 = new BehaviorSubject(null);
  analStatus = this.messageSource6.asObservable();
  changeAnalStatus(value: string) {
    this.messageSource6.next(value)
  }

  /************************************************************* */
  private hmap = new Map();

  // RAM storage function
  setItem(key, value) {
    this.hmap.set(key, value);
  }

  getItem(key): any {
    return this.hmap.get(key);
  }

  has(key): boolean {
    return this.hmap.has(key);
  }

  delete(key) {
    return this.hmap.delete(key);
  }



  canvasReport(params) {
    // console.log("Report",params.target);
    let element = params.target.parentElement;  // print parent
    element.style.height = "auto";
    element.style.overflow = "show";


    // process ag-grid properties
    const gridElement = element.querySelector('.ag-theme-balham');  //TODO not exists
    let domLayout;
    let gridComponent;
    if (gridElement) {
      gridComponent = element.querySelector('.ag-root-wrapper').__agComponent;
      const gridOptions = gridComponent.gridOptions;
      domLayout = gridOptions.domLayout;
      const gridApi = gridComponent.gridApi;
      gridApi.setDomLayout('print');
    }

    html2canvas(element, {
      scrollX: 1,   // 0 = bug
      scrollY: 1,   // 0 = bug
    }).then(function (canvas) {
      /**
       * Convert the canvas to data URI containing a representation of the image in the format 
       * specified by the type parameter (defaults to PNG). 
       * The returned image is in a resolution of 96 dpi.
       */
      let storageFiles = sessionStorage.getObj('blob');
      if (!storageFiles)
        storageFiles = [];
      storageFiles.push(canvas.toDataURL("image/png"));
      sessionStorage.setObj('blob', storageFiles);
      this.messageService.show("Item saved for reporting.");
    });

    const oldStyle = element.style['background-color'];
    element.style.border = '1px solid #f0ad4e';
    // element.style['background-color']= '#f0ad4e';
    setTimeout(() => {
      // element.style['background-color'] = oldStyle;
      element.style.border = oldStyle;
    }, 200);

    // restore original domLayout
    if (gridComponent) {
      gridComponent.gridApi.setDomLayout(domLayout);
    }
  }
}


Storage.prototype.setObj = function (key, obj) {
  return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function (key) {
  return JSON.parse(this.getItem(key))
}
