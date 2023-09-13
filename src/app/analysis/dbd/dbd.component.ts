import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BaseTableComponent } from '../../prod-table/base-list.component'

import { TableLib } from '../../prod-table/lib/table-lib';
import { Product } from '../../prod-table/prod-table.component';
import { Order } from '../../prod-table/order/order-table.component';
import { formatDate } from '@angular/common';
import { GridApi } from 'ag-grid-community';
import { FlowAreaComponent } from './flowArea/flowarea.component';
import { RevenueAreaComponent } from './revenueArea/revenuearea.component';
import { ProfitAreaComponent } from './profitArea/profitarea.component';
import { DateRangeComponent } from '../../views/daterange/daterange.component';
import { Menu } from '../menu-editor/menu/menu-table.component';
import { MenuProduct } from '../menu-editor/menu-editor.component';
import { ElasticityComponent } from './elasticity/elasticity.component';
import { ElasticityWeekComponent } from './elasticity_week/elasticity-week.component';
import * as moment from 'moment';
import { MCFilterComponent } from '../../views/mcfilter/mcfilter.component';
import { ToppingComponent } from './topping/topping.component';



@Component({
  selector: 'app-dbd',
  templateUrl: './dbd.component.html',
  styleUrls: ['./dbd.component.css']
})


export class DBDComponent extends BaseTableComponent implements OnInit, OnDestroy {
  title = "Order flow";
  btnSave = false;
  public btnPrint = true;

  start: string;   // start date
  stop: string;    // stop date
  public footerData: any;
  radioModel: string = 'Day';
  public pb_current: number = 0;
  public gridApi1: GridApi;

  public reportSubTitle = 'REPORT PERIOD:';

  private orders_all: Order[];
  dbd_stopBtn: boolean;
  public domLayout = 'autoHeight';


  @ViewChild(FlowAreaComponent, { static: false }) flowareaComponent: FlowAreaComponent;
  @ViewChild(RevenueAreaComponent, { static: false }) revenueAreaComponent: RevenueAreaComponent;
  @ViewChild(ProfitAreaComponent, { static: false }) profitAreaComponent: ProfitAreaComponent;
  @ViewChild(DateRangeComponent, { static: false }) daterangeComponent: DateRangeComponent;
  @ViewChild(ElasticityComponent, { static: false }) elasticityComponent: ElasticityComponent;
  @ViewChild(ElasticityWeekComponent, { static: false }) elasticityWeekComponent: ElasticityWeekComponent;
  @ViewChild('mcfilter') mcfilter: MCFilterComponent;
  @ViewChild(ToppingComponent, { static: false }) toppingComponent: ToppingComponent;

  private INIT_COL_NUM: number = 6;
  columnDefs = [
    // { headerName: 'Id', field: 'product_id', width: 110, editable: true, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    {
      headerName: 'Category', field: 'product_category_id', width: 150, resizable: true, sortable: true,
      filter: 'agTextColumnFilter', initialSort: 'asc',
    },
    {
      headerName: 'Product', field: 'product_merged_name', width: 150, resizable: true, sortable: true,
      filter: 'agTextColumnFilter',
    },
    // {
    //   headerName: 'ID', field: 'product_id', width: 100, resizable: true, sortable: true,
    //   filter: 'agTextColumnFilter',
    // },
    // {
    //   headerName: 'Food_cost', field: 'product_food_cost_ext', resizable: true,
    //   sortable: true, filter: 'agTextColumnFilter', width: 110,
    //   valueFormatter: params => TableLib.currencyFormatter(params.value),
    //   cellStyle: { 'text-align': 'center' }
    // },
    {
      headerName: 'Sell_price', field: 'product_sellprice', width: 110,
      resizable: true, sortable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.currencyFormatter(params.value),
      cellStyle: { 'text-align': 'center' }
    },
    {
      headerName: 'Food_cost', field: 'product_foodcost', width: 110,
      resizable: true, sortable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.currencyFormatter(params.value),
      cellStyle: { 'text-align': 'center' }
    },
    {
      headerName: 'Contribution', field: 'product_contribution', width: 110,
      resizable: true, sortable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.currencyFormatter(params.data.product_sellprice - params.data.product_foodcost),
      cellStyle: { 'text-align': 'center' }
    },
    {
      headerName: 'Total Qty', field: 'orders', width: 110,
      resizable: true, sortable: true, filter: 'agTextColumnFilter',
      cellStyle: { 'text-align': 'center' }
    },
    // { headerName: 'Qty', field: "item_quantity", width: 70, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
  ];


  topOptions = {
    alignedGrids: [],
  };
  bottomOptions = {
    alignedGrids: [],
  };


  ngOnDestroy(): void {
    this.gridApi.destroy();
    this.gridApi1.destroy();
  }

  /*************************************************************************
  *  get and modify data to display  
  */
  async ngOnInit() {

    // configure grids as AlignedGrids
    this.topOptions.alignedGrids.push(this.bottomOptions);
    this.bottomOptions.alignedGrids.push(this.topOptions);

    // receive message for loading status
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


    // if session saved, reload last saved data
    if (sessionStorage.getItem('dbd_rowData')) {
      this.rowData = JSON.parse(sessionStorage.getItem('dbd_rowData'));
      this.footerData = JSON.parse(sessionStorage.getItem('dbd_footerData'));
      this.orders_all = JSON.parse(sessionStorage.getItem('dbd_orders_all'));
      this.mcfilter.onMenuSelect(this.mcfilter.menuMenuHeader.findIndex(v => v == sessionStorage.getItem('menuSelected')));

      // setTimeout(() => {
      //   this.gridApi.setRowData(this.rowData);
      //   this.gridApi1.setRowData(this.footerData);
      //   this.gridApi.refreshCells();
      //   this.gridApi1.refreshCells();
      //   // this.onNewColumnsLoaded(null);        
      // },1000);

    }
    else {
      this.rowData = [];
      this.footerData = [];
    }

    // load theme from local storage
    this.theme = localStorage.getItem('ag-grid-theme');

  }

  private DATE_FORMAT = 'yyyy_MM_dd_EEE';
  private FOOTER_FORMAT; //= 'yyyy-MM-dd';
  private HEDAER_FORMAT = 'EEE MMM dd';
  // private DATE_FMT_U = 'yyyy-MM-dd';


  /*******************************************************
 * Radio button choose 
 */
  radioChoose($event) {

    // console.log("Choose", $event);
    switch (this.radioModel) {
      case 'Day': {
        // console.log("Load daily data.");
        this.DATE_FORMAT = 'yyyy_MM_dd_EEE';
        this.FOOTER_FORMAT = "yyyy-MM-dd";
        this.HEDAER_FORMAT = 'EEE MMM dd';
        // this.DATE_FMT_U = "yyyy-MM-dd";
        break;
      }
      case 'Week': {
        // console.log("Load weekly data.");
        this.DATE_FORMAT = 'yyyy_ww';
        this.FOOTER_FORMAT = "yyyy-WW";
        this.HEDAER_FORMAT = 'WW yyyy';
        // this.DATE_FMT_U = "yyyy-WW";
        break;
      }
      case 'Month': {
        // console.log("Load weekly data.");
        this.DATE_FORMAT = 'yyyy_MMM';
        this.FOOTER_FORMAT = "yyyy-MMM";
        this.HEDAER_FORMAT = 'MMM yyyy';
        // this.DATE_FMT_U = "yyyy-MM";
        break;
      }
    }

    // console.log("*** radiochoose call refreshData");
    this.loading = true;
    this.refreshData();
    // this.onFirstDataRendered(null);
    // this.awsService.clearSession('forecast');
  }



  async onNewColumnsLoaded(params) {
    // console.log("Column changed");

    if (this.gridApi && this.gridApi1) {

      // // new routine
      let products: Product[];
      const menuArr = await this.awsService.getMenus();
      let menuFound: Menu;
      if (menuArr)
        menuFound = menuArr.find(menu => menu.menu_name == this.mcfilter.menuSelected);
      if (!menuFound) {
        this.messageService.show("Orders loaded " + this.orders_all.length + ". Please select a menu.");
        return Promise.resolve([]);  // TODO verify
      }
      // cast to MenuProduct class
      const menu_products = menuFound.menu_products;
      let orders = this.orders_all;   // default assignment
      let menu_products_id;
      if (menu_products) {  //TODO - delete
        products = menu_products;
        // return Promise.resolve([]);
        menu_products_id = menu_products.map(mp => mp.product_id);
        // filter orders by product id (contained in menu)
        orders = this.orders_all.filter(order => menu_products_id.includes(Number(order.item_product_id)));   //TODO item_product_id
      } //TODO orders filter empty


      // update all charts components
      this.flowareaComponent.update(this.gridApi, this.footerData, this.INIT_COL_NUM, this.orders_all);
      this.revenueAreaComponent.update(this.gridApi, this.footerData, this.INIT_COL_NUM, this.orders_all);
      this.profitAreaComponent.update(this.gridApi, this.rowData, this.INIT_COL_NUM, orders, menu_products);
      // this.profitAreaComponent.update2(orders, this.DATE_FMT_U, menu_products);
      this.elasticityComponent.update(this.rowData);
      const colDef1 = this.gridApi1.getColumnDefs();
      this.elasticityWeekComponent.update(this.rowData, colDef1, this.INIT_COL_NUM);

      // this.toppingComponent.update(orders);

    }
    this.loading = false;
  }



  /*************************************************************************
   *  get and modify data to display  
   */
  async getData(): Promise<Product[]> {

    // record start time
    var crono_start = new Date();

    this.start = this.ngbDateParserFormatter.format(this.daterangeComponent.date1); // e.g. myDate = 2017-01-01
    this.stop = this.ngbDateParserFormatter.format(this.daterangeComponent.date2); // e.g. myDate = 2017-01-01

    // load orders
    this.dbd_stopBtn = true;

    // get orders data from API
    this.orders_all = await this.awsService.getAllOrdersV2(this.start, this.stop);



    this.dbd_stopBtn = false;

    // get eng data    invoke API Gateway Service , async /await 
    // let products: Product[] = await this.awsService.getProducts();
    let products: Product[];

    // load menu dropdown
    const menuArr = await this.awsService.getMenus();
    let menuFound: Menu;
    if (menuArr)
      menuFound = menuArr.find(menu => menu.menu_name == this.mcfilter.menuSelected);
    if (!menuFound) {
      this.messageService.show("Orders loaded " + this.orders_all.length + ". Please select a menu.");
      return Promise.resolve([]);  // TODO verify
    }

    //compatibility with old call
    this.orders_all.forEach(order => {
      if (order['product_id']) {
        order.item_product_id = order['product_id'];
        order.item_timestamp = order.timestamp;
        order.item_quantity = order.quantity;
        order.item_price = String(order.price);
      }
    });

    //

    // get MenuProduct 
    const menu_products = menuFound.menu_products;
    let orders = this.orders_all;   // default assignment
    let menu_products_merged_names;
    if (menu_products) {  //TODO - delete
      products = menu_products;
      // return Promise.resolve([]);
      menu_products_merged_names = menu_products.map(mp => mp.product_merged_name);
      // filter orders by productMerged (contained in menu)
      // const test_order = this.orders_all.filter(order => order['order_id'] == 135721735);
      // 135721735
      orders = this.orders_all.filter(order => menu_products_merged_names.includes(order.merged_product_name));   //TODO item_product_id
    } //TODO orders filter empty

    // hash map/table
    let ht: Map<string, Product> = new Map();
    let htDates: Map<string, string> = new Map();

    // elaborazione prodotti da mostrare
    orders.forEach(order => {   // for each row in table Engineering
      let prodFound = products.find(x => x.product_merged_name == order.merged_product_name);  // TODO item_product_id
      if (prodFound != undefined) {
        // push unique keys to map
        ht.set(prodFound.product_merged_name, prodFound);
      }

      // create date to be used as index
      const formattedDate = formatDate(order.item_timestamp, this.DATE_FORMAT, 'en-US'); //TODO item_timestamp
      const headerDate = formatDate(order.item_timestamp, this.HEDAER_FORMAT, 'en-US'); //TODO item_timestamp
      // push into hash map 
      htDates.set(String(formattedDate), String(headerDate));
    });

    // fill matrix with value[product,date] = value
    // for each order
    orders.forEach(order => {
      // for each product
      const formattedDate: string = formatDate(order.item_timestamp, this.DATE_FORMAT, 'en-US');//TODO item_timestamp
      ht.forEach((prod, key, map) => {
        // if (order.item_product_id == prod.product_id) {
        if (order.merged_product_name == prod.product_merged_name) {
          // calculate quantities per day (matrix)
          prod[formattedDate] = prod[formattedDate] ? prod[formattedDate] + Number(order.item_quantity) : Number(order.item_quantity);
          // calculate orders per product
          prod['orders'] = prod['orders'] ? ++prod['orders'] : 1;
        }
      });
    });

    // push time columns in ascending orders
    let htiSorted = new Map(Array.from(htDates.entries()).sort((a, b) => a[0] > b[0] ? 1 : -1));

    // reset columns def
    this.columnDefs.length = this.INIT_COL_NUM;

    // push new columns
    htiSorted.forEach((value, key, map) => {
      const newCol = {
        headerName: value,
        field: key,
        width: 130,
        resizable: true,
        sortable: true,
        filter: 'agTextColumnFilter',
        valueFormatter: params => {
          if (params.api == this.gridApi1 && params.data.product_name != 'Orders')
            return TableLib.currencyFormatter(params.data[key]);
          else
            return null;
        },
        cellStyle: { 'text-align': 'center' }
      };
      this.columnDefs = [...this.columnDefs, newCol];

    });

    // update columns definition
    this.gridApi.setColumnDefs(this.columnDefs);

    // record start time
    var crono_stop = new Date();
    // time difference in ms
    var timeDiff = crono_stop.getTime() - crono_start.getTime();
    // strip the ms
    timeDiff /= 1000;

    // get seconds (Original had 'round' which incorrectly counts 0:28, 0:29, 1:30 ... 1:59, 1:0)
    var seconds = Math.round(timeDiff % 60);

    this.messageService.show("Processed " + orders.length + " orders. " + " Query time: " + seconds + "s");

    // return array of rows
    return Promise.resolve(Array.from(ht.values()));
  }

  /********************************************************
   * 
   */
  createFooter(): any[] {
    // create new stat object
    let stat = {
      orders: { "product_merged_name": "Orders" },
      amount: { "product_merged_name": "Amount" },
      avg_ord: { "product_merged_name": "Average order" }
    };

    // const arrQty = Object.values(rowData[0]);

    this.gridApi.forEachNodeAfterFilter(r => {
      const row = <MenuProduct>r.data;
      const columns = Object.keys(row);
      const item_price = Number(row.product_sellprice);
      columns.forEach(col => {
        // col title to date
        const date = col.substring(0, 10).replace(/_/g, '-');
        let item_price = Number(row.product_sellprice);
        if (moment(date, this.FOOTER_FORMAT, true).isValid()) {
          const item_qty = row[col];
          const order_qty = row['orders'];
          const amount = item_price * item_qty;

          // calc orders
          if (item_qty) {
            stat.orders[col] = stat.orders[col] ? stat.orders[col] + item_qty : item_qty;
            // calc tot amount
            stat.amount[col] = stat.amount[col] ? stat.amount[col] + amount : amount;
            stat.amount[col] = +stat.amount[col].toFixed(1);
          }
          // update average per order
          stat.avg_ord[col] = (stat.amount[col] / stat.orders[col]).toFixed(1);
        }
      });
    });

    return [stat.orders, stat.amount, stat.avg_ord];
  }


  /************************************************++
   * Grid Ready event footer
   */
  onGridReady1(params) {

    this.gridApi1 = params.api;   // totals grid api
    this.gridApi1.setRowData(this.footerData);
    this.gridApi1.refreshCells();
    // this.gridColumnApi = params.columnApi;

  }

  /************************************************************
  * Grid Ready event main
  */
  onGridReady2(params) {

    this.gridApi = params.api;
    this.gridApi.setRowData(this.rowData);
    this.gridApi.refreshCells();
    this.onNewColumnsLoaded(null);
  }

  // received event from mvfilter component
  onMenuSelect(menu: Menu) {
    // console.log("Received select: ", menu.menu_name);
    this.daterangeComponent.date1 = TableLib.utcToNgb(menu.menu_from);
    this.daterangeComponent.date2 = TableLib.utcToNgb(menu.menu_to);
    this.daterangeComponent.refresh();
  }

  /*****************************************************
 *    received event from mcfilter component
 */
  onCategorySelect(cat_name) {
    // console.log("Received event category select:" + cat_name);
    let model = {
      product_category_id:
      {
        filter: cat_name,  // filter by category
        filterType: "text",
        type: "contains"
      }
    }
    if (cat_name == 'All')  // reset filters
      model = null;

    // update footer
    this.gridApi.setFilterModel(model);
    this.elasticityComponent.setFilter(model);
    this.elasticityWeekComponent.setFilter(model);

    setTimeout(() => {  // update on next cycle - wait for categorySelected  updated
      this.gridApi1.setRowData(this.createFooter());
    });

  }


  /**************************************************************+
   * extends  baseList refreshData
   */
  refreshData() {
    // check user logged
    if (!this.cognitoService.isUserLogged()) {
      this.messageService.show("Please login first.")
      return;
    }
    // check store selected
    if (!this.awsService.getStrId()) {
      this.messageService.show("Please select Store first.")
      return;
    }

    // this.globalService.order_loading = true;
    this.loading = true;

    // set main data
    this.getData().then(data => {    // call async with Promise
      // console.log("received: ", data);
      if (!data.length || !this.gridApi || !this.gridApi1) {  // if empty
        // this.globalService.order_loading = false;
        this.loading = false;
        return;
      }
      this.rowData = data;              // assign new data table
      this.gridApi.setRowData(this.rowData);
      this.footerData = this.createFooter();
      this.gridApi1.setRowData(this.footerData);
      this.gridApi1.refreshCells();
      this.gridApi.refreshCells();

      this.reportSubTitle = "REPORT PERIOD: " + this.daterangeComponent.date1.year + " " + this.daterangeComponent.date1.month +
        " > " + this.daterangeComponent.date2.year + " " + this.daterangeComponent.date2.month;

      // update analysis status
      this.globalService.changeAnalStatus("Day by Day");

      // save session data
      sessionStorage.setItem('dbd_rowData', JSON.stringify(this.rowData));
      sessionStorage.setItem('dbd_footerData', JSON.stringify(this.footerData));
      sessionStorage.setItem('dbd_orders_all', JSON.stringify(this.orders_all));

    });
    // this.globalService.order_loading = false;             // reset loading spinner 
  }

  refresh = () => {
    // console.log("*** refresh button call refreshData");
    this.pb_current = 0;
    this.refreshData();

  }

  reload = () => {
    this.refresh();
  }


  stopQuery() {
    this.awsService.stopOldQuery = true;
    this.awsService.queryExist = false;
    this.dbd_stopBtn = false;
    this.loading = false;
    // this.pb_current = 100;
  }

  /********************************************************
  *  Save button pressed
  */
  saveTable = () => {
    if (!this.unsaved) {  // nothing to save
      this.messageService.show("Data already up-to-date. Nothing to save.");
      return;
    }
  }



}
