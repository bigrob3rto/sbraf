import { BaseTableComponent } from '../base-list.component';
import { AfterContentInit, Component, OnInit, ViewChild } from '@angular/core';
import { TableLib } from '../lib/table-lib';
import { formatDate } from '@angular/common';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Product } from '../prod-table.component';
import { DateRangeComponent } from '../../views/daterange/daterange.component';
import { Topping } from '../../analysis/dbd/topping/topping.component';


export interface order_content {
  id: number,
  name: string,
  price: string,
  quantity: number
}

export interface Order {
  prod_id: number,
  item_id: number,
  item_price: string,
  item_quantity: number,
  item_forecast_id: null,
  item_product_id: number,
  item_timestamp: string,
  item_code: string,
  item_code_original: string,
  // item_note: any,
  item_input_source: string,
  item_order_id: string,
  merged_product_name: string,
  // order_content: []
  forecast_item_options: any,
  product_id: number,
  optionItems : Topping[],
  price : number,
  quantity : number,
  timestamp : string,
}

@Component({
  selector: 'app-menu-table',
  templateUrl: './order-table.component.html',
  styleUrls: ['./order-table.component.css']
})

export class OrderTableComponent extends BaseTableComponent implements AfterContentInit {

  title = "Order";
  public btnSave = false;
  start: string;   // start date
  stop: string;    // stop date
  public pb_current: number = 0;
  @ViewChild(DateRangeComponent, { static: false }) daterangeComponent: DateRangeComponent;
  public stopBtn = false;

  columnDefs = [
    { headerName: 'Order id', field: "item_order_id", resizable: true, width: 100, sortable: true, filter: 'agTextColumnFilter' },
    { headerName: 'P ID', field: "prod_id", width: 100, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    { headerName: 'Merged', field: "merged_product_name", width: 150, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    { headerName: 'Product', field: "prod_name", width: 150, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'I ID', field: "item_id", width: 100, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    {
      headerName: 'Price', field: "item_price", width: 100, resizable: true, sortable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => (params.data) ? TableLib.currencyFormatter(params.value) : 'wait..'
    },
    { headerName: 'Qty', field: "item_quantity", width: 70, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'F ID', field: "forecast_id", resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'IP ID', field: "item_product_id", width: 100, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    {
      headerName: 'Time', field: "item_timestamp", resizable: true, sortable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => (params.data) ? formatDate(params.value, 'yyyy.MM.dd hh:mm', 'en-US') : 'wait..'
    },
    // { headerName: 'Code', field: "item_code", resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Original', field: "item_code_original", resizable: true, width: 110, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Note', field: "item_note", resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Source', field: "item_input_source", resizable: true, width: 100, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Options', field: "forecast_item_options", resizable: true, sortable: true, filter: 'agTextColumnFilter' }
  ];



  ngOnInit(): void {

    this.globalService.loadStatus.subscribe(async message => {
      if (message) {
        this.pb_current = Number(message[0]) / Number(message[1]) * 100;
        // console.log("received:", this.pb_current);
        if (this.pb_current == 100)
          setTimeout(() => {                           //<<<---using ()=> syntax
            this.pb_current = 101;
          }, 1000);

      }
    });

    // load theme from local storage
    this.theme = localStorage.getItem('ag-grid-theme');
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      //update cache view data
      const order_img = this.orderCache.info();
      if (order_img) {
        this.daterangeComponent.date1 = TableLib.utcToNgb(order_img.start);
        this.daterangeComponent.date2 = TableLib.utcToNgb(order_img.stop);
      }
    });
  }

  stopQuery() {
    this.awsService.stopOldQuery = true;
    this.awsService.queryExist = false;
    this.stopBtn = false;
    // this.pb_current = 100;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

  }

  async getData() {
    this.start = this.ngbDateParserFormatter.format(this.daterangeComponent.date1); // e.g. myDate = 2017-01-01
    this.stop = this.ngbDateParserFormatter.format(this.daterangeComponent.date2); // e.g. myDate = 2017-01-01

    this.stopBtn = true;
    let orders: Order[]
    // if (this.awsService.getStrId() == 52)
      orders = await this.awsService.getAllOrdersV2(this.start, this.stop);
    // else
    //   orders = await this.awsService.getAllOrders(this.start, this.stop);
    // const orders: Order[] = await this.awsService.getAllOrders(this.start, this.stop);
    this.stopBtn = false;

    // find product description
    const products: Product[] = await this.awsService.getProducts();
    // elaborazione prodotti da mostrare
    orders.forEach(order => {   // for each row in table Engineering
      if (order['product_id']) {
        order.item_order_id = order['order_id'];
        order.prod_id = order['product_id'];
        order.item_product_id = order['product_id'];
        order["prod_name"] = order['merged_product_name'];
        order.item_price = String(order.price);
        order.item_quantity = order.quantity;
        order.item_timestamp = order.timestamp;
      }
      else {
        let prodFound = products.find(x => x.product_id == order.prod_id);  // find corresponding category
        if (prodFound)
          order["prod_name"] = prodFound.product_name;
      }
    });

    this.messageService.show("Processed " + orders.length + " orders.")
    return orders;
  }


  refresh = () => {
    this.refreshData();
  }

  reload = () => {
    this.orderCache.invalidate();   // force reload from db
    this.refresh();
  }



  getContextMenuItems = (params) => {
    var result = [
      {
        name: 'Autosize Columns',           // copy field
        action: () => {
          params.api.sizeColumnsToFit();
        }
      },
      {
        name: 'Copy',
        action: () => {
          this.onMenuClipboard(params.value);
        }
      },
      {
        name: 'Export',
        tooltip: 'Export table',
        subMenu: [
          {
            name: 'Export as csv',
            action: () => {
              params.api.exportDataAsCsv(params);
            }
          },
          {
            name: 'Export to Excel',
            action: () => {
              params.api.exportDataAsExcel(params);
            }
          }
        ] //end row submenu
      }
    ];
    return result;
  }
}

