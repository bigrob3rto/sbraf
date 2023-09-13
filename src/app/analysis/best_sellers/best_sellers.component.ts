import { AfterViewInit, Component, Input, isDevMode, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { BaseTableComponent } from '../../prod-table/base-list.component'
import { Category } from '../../prod-table/cat-table.component';

import { TableLib } from '../../prod-table/lib/table-lib';
import { Product } from '../../prod-table/prod-table.component';
import { EngTotalsComponent } from '../engineering/eng-totals/eng-totals.component';
import { MatrixChartComponent } from '../engineering/matrixchart/matrixchart.component';
import { NewpriceComponent } from '../engineering/newprice/newprice.component';
import { DateRangeComponent } from '../../views/daterange/daterange.component';
import { Menu } from '../menu-editor/menu/menu-table.component';
import { MCFilterComponent } from '../../views/mcfilter/mcfilter.component';

export interface Engineering {
  prod_name: string,
  prod_code: string,
  prod_id: number,
  item_price: number,
  price: number,
  prod_category_id: string,
  timeline_of_purchase: string,
  order_num_per_product: number,
  prod_food_cost: number,
  item_quantity_sum: number,
  quantity: number,
  item_contrib: number,
  item_incidence: number,
  total_contrib: number,
  merged_product_name: string
}


@Component({
  selector: 'app-best_sellers',
  templateUrl: './best_sellers.component.html',
  styleUrls: ['./best_sellers.component.css']
})



export class Best_SellersComponent extends BaseTableComponent implements OnInit {
  title = "Best Sellers";
  btnSave = false;
  public btnPrint = true;

  start: string;   // start date
  stop: string;    // stop date
  public domLayout = 'autoHeight';

  public pb_current: number = 0;

  @Input() messageService;    //refernce to message Service

  // view children components
  @ViewChild(DateRangeComponent, { static: false }) daterangeComponent: DateRangeComponent;
  @ViewChild('mcfilter') mcfilter: MCFilterComponent;

  public columnDefs = [
  // { headerName: 'Category', field: 'prod_category_id', sortable: true, resizable: true, filter: 'agTextColumnFilter' },
  //  { headerName: 'Category ID', field: 'prod_category_number', sortable: true, resizable: true, filter: 'agTextColumnFilter' },
    { headerName: 'Product', field: 'merged_product_name', sortable: true, resizable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Codice', field: 'prod_code', }, 
    // { headerName: 'ID', field: 'prod_id', sortable: true, resizable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Timeline', field: 'timeline_of_purchase', },
    {
      headerName: 'Price', field: 'price', sortable: true, resizable: true, filter: 'agTextColumnFilter', editable: true,
      valueFormatter: params => TableLib.currencyFormatter(params.value),
    },
    // { headerName: 'Order #', field: 'order_num_per_product', sortable: true, resizable: true, filter: 'agTextColumnFilter' },
    {
      headerName: 'Food Cost', field: 'prod_food_cost', sortable: true,
      editable: true, resizable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.currencyFormatter(params.value),
    },
    {
      headerName: 'Incidence', field: 'item_incidence', sortable: true, resizable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.percentageFormatter(params.value),
    },
    {
      headerName: 'Tot Qty', field: 'quantity', sortable: true, resizable: true, filter: 'agTextColumnFilter',
      cellStyle: { backgroundColor: 'lightblue' },
    },
    {
      headerName: 'Qty %', field: 'item_quantity_perc', sortable: true, resizable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.percentageFormatter(params.value),
    },
    // {
    //   headerName: 'Contribution', field: 'item_contrib', sortable: true, resizable: true, filter: 'agTextColumnFilter',
    //   valueFormatter: params => TableLib.currencyFormatter(params.value),
    // },
    {
      headerName: 'Total cost', field: 'total_cost', sortable: true, resizable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.currencyFormatter(params.value),
    }
    // ,
    // {
    //   headerName: 'Total Contribution', field: 'total_contrib', sortable: true, resizable: true, filter: 'agTextColumnFilter',
    //   valueFormatter: params => TableLib.currencyFormatter(params.value),
    // },
    // {
    //   headerName: 'Total Gross', field: 'total_gross', sortable: true, resizable: true, filter: 'agTextColumnFilter',
    //   valueFormatter: params => TableLib.currencyFormatter(params.value),
    // },

  ];



  /*************************************************************************
  *  get and modify data to display  
  */
  ngOnInit() {
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
    // load theme from local storage
    this.theme = localStorage.getItem('ag-grid-theme');
  }




  // intercept tab switch event in order to align columns in ag-grid table
  confirmTabSwitch($event) {
    // console.log("tabClick",$event);
  }

  /*****************************************************
 *    received event from mcfilter component
 */
  onMenuSelect(menu: Menu) {
    // console.log("Received select: ", menu.menu_name);
    this.daterangeComponent.date1 = TableLib.utcToNgb(menu.menu_from);
    this.daterangeComponent.date2 = TableLib.utcToNgb(menu.menu_to);
    this.daterangeComponent.refresh();

    // this.refreshData();
  }

  onGridSizeChanged(params){
    params.api.sizeColumnsToFit();
  }
  


  /*************************************************************************
   *  get and modify data to display  
   */
  async getData(): Promise<Engineering[]> {
    // const newCalls = [52, 45, 46]
    // if (!newCalls.includes(this.awsService.getStrId()))
    //   return this.getData_old();

    let new_start = this.ngbDateParserFormatter.format(this.daterangeComponent.date1); // e.g. myDate = 2017-01-01
    let new_stop = this.ngbDateParserFormatter.format(this.daterangeComponent.date2); // e.g. myDate = 2017-01-01


    if (new_start != this.start || new_stop != this.stop) {
      this.start = new_start;
      this.stop = new_stop;
      this.awsService.clearSession('data');
    }

    let engArr_all: Engineering[];
    // get eng data    invoke API Gateway Service , async /await 
    engArr_all = await this.awsService.getEngineeringV2(this.start, this.stop);
    // trasform category ID into catagory name
    let catArr: Category[] = await this.awsService.getCategories();

    // hash map/table
    // let ht: Map<string, number> = new Map();


    // load menu dropdown
    const menuArr = await this.awsService.getMenus();
    const menuFound: Menu = menuArr.find(menu => menu.menu_name == this.mcfilter.menuSelected);
    if (!menuFound)
      return Promise.reject();

    // cast to MenuProduct class
    const menu_products = menuFound.menu_products;
    if (!menu_products)
      return Promise.reject();
    // products in menu
    const products = menu_products;

    // return Promise.resolve([]);
    // const menu_products_id = menu_products.map(mp => mp.product_id);
    const menu_products_merged_names = menu_products.map(mp => mp.product_merged_name);

    // const engArr = engArr_all.filter(item => menu_products_id.includes(item.prod_id));
    const engArr = engArr_all.filter(item => menu_products_merged_names.includes(item.merged_product_name));

    // hash map/table
    let ht: Map<string, Product> = new Map();

    const sum_qty = engArr.reduce((accumulator, current) =>
      accumulator + Number(current.quantity), 0);

    engArr.forEach(row => {   // for each row in table Engineering
      let prodFound = products.find(x => x.product_merged_name == row.merged_product_name);  // TODO item_product_id
      if (prodFound != undefined) {
        // push unique keys to map
        ht.set(prodFound.product_merged_name, prodFound);
      }

      // update calculation
      row.prod_food_cost = Number(row.prod_food_cost);
      row.item_contrib = row.price - row.prod_food_cost;
      row.item_incidence = +(row.prod_food_cost / row.price * 100).toFixed(1);
      row['item_quantity_perc'] = row.quantity / sum_qty * 100;
      row['total_cost'] = row.quantity * Number(row.prod_food_cost);
      row['total_contrib'] = row.quantity * row.item_contrib;
      row['total_gross'] = row.quantity * row.price;

      let catFound = catArr.find(x => x.categoryid == row.prod_category_id);  // find corresponding category
      if (catFound) {
        row['prod_category_number'] = row.prod_category_id;
        row.prod_category_id = String(catFound.name);   // assign name instead of ID
      }
      else
        row.prod_category_id = String(row.prod_category_id);  //convert to string
      // push unique keys to map
      // ht.set(row.prod_category_id, 0);
    });

    return engArr;
  }

  // extend to avoid inital refresh
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // console.log("*** onGridReady BS call refreshData");
    // this.refreshData();
  }

  onFirstDataRendered(params) {
    // params.api.sizeColumnsToFit();  // resize column width
  }

  /**************************************************************+
   * extends  baseList refreshData
   */
  public refreshData() {
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
    this.loading = true;

    this.getData().then(data => {    // call async with Promise
      // console.log("received: ", data);
      this.rowData = data;              // assign new data table
      // this.gridApi.refreshCells();      // refhresh table
      setTimeout(() => {                           //do on next cycle
        this.updateCharts();
      });
      this.loading = false;             // reset loading spinner 
    });
  }


  refresh = () => {
    if (this.canDeactivate()) {
      this.unsaved = false;
      this.awsService.clearSession('data');
      this.pb_current = 0;
      this.refreshData();
    }
  }

  /**************************************************************+
   * extends  baseList refreshData
   */
  updateCharts() {

    // update children components

  }





  /*****************************************************
   *    received event from mcfilter component
   */
  onCategorySelect(cat_name) {


    let model = {
      prod_category_id:
      {
        filter: cat_name,  // filter by category
        filterType: "text",
        type: "contains"
      }
    }
    if (cat_name == 'All')  // reset filters
      model = null;


    this.gridApi.setFilterModel(model);

    // update charts after set filters
    this.updateCharts();
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
