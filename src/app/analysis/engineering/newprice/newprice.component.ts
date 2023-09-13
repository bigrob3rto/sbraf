import { AfterViewInit, Component, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { BaseTableComponent } from '../../../prod-table/base-list.component'
import { Category } from '../../../prod-table/cat-table.component';
import { BaseChartDirective, Color, Label } from 'ng2-charts';
import { ChartDataSets, ChartOptions, ChartPoint, ChartType } from 'chart.js';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';


import { TableLib } from '../../../prod-table/lib/table-lib';
import { Product } from '../../../prod-table/prod-table.component';
import { Engineering } from '../engineering.component';
import { GridApi } from 'ag-grid-community';


@Component({
  selector: 'app-newprice',
  templateUrl: './newprice.component.html',
  styleUrls: ['./newprice.component.css']
})



export class NewpriceComponent implements OnInit, AfterViewInit {
  title = "New Pricing";
  @Input() messageService;    //refernce to message Service
  public gridApi: GridApi;
  public rowData;
  public pinnedBottomRowData;
  public domLayout = 'autoHeight';

  public columnDefs = [
    {
      headerName: 'Category', field: 'prod_category_id', sortable: true, resizable: true, filter: 'agTextColumnFilter'
    },
    { headerName: 'Product', field: 'prod_name', width: 300, sortable: true, resizable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Codice', field: 'prod_code', }, 
    // { headerName: 'ID', field: 'prod_id', sortable: true, resizable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Timeline', field: 'timeline_of_purchase', },
    {
      headerName: 'Price', field: 'item_price', sortable: true, resizable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.currencyFormatter(params.value),
    },
    {
      headerName: 'New Price', field: 'new_price', sortable: true, resizable: true, editable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.currencyFormatter(params.value),
    },
    // { headerName: 'Order #', field: 'order_num_per_product', sortable: true, resizable: true, filter: 'agTextColumnFilter' },
    {
      headerName: 'Food Cost', field: 'prod_food_cost', sortable: true,
      editable: true, resizable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.currencyFormatter(params.value),
    },

    // {
    //   headerName: 'Contribution', field: 'item_contrib', sortable: true, resizable: true, filter: 'agTextColumnFilter',
    //   valueFormatter: params => TableLib.currencyFormatter(params.value),
    // },
    {
      headerName: 'Incidence', field: 'item_incidence', sortable: true, resizable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.percentageFormatter(params.value),
    },


  ];



  /*************************************************************************
 *  A lifecycle hook that is called after Angular has fully initialized 
 * a component's view.  
 */
  ngAfterViewInit() {

  }

  /*************************************************************************
  *  get and modify data to display  
  */
  ngOnInit() {
  }


  
  // make bottom row bold
  getRowStyle = function (params) {
    if (params.node.rowPinned) {
      return { 'font-weight': 'bold' };
    }
  };

  // cell edited on aggrid
  onCellValueChanged(params) {
    params.node.data['changed'] = true

    //recalculate incidence
    const item_price = params.node.data.new_price > 0 ? params.node.data.new_price : params.node.data.item_price;
    params.node.data.item_incidence = params.node.data.prod_food_cost / item_price * 100;

    params.colDef.cellStyle = function (params2) {
      if (params2.node.data['changed'])
        return { color: 'red' };
    }

    let incidenceArr = [];
    this.gridApi.forEachNodeAfterFilter(row => {
      incidenceArr.push(row.data.item_incidence);
    });
    // bottom pinned row update
    this.pinnedBottomRowData = [
      {
        prod_category_id: "Category",
        prod_name: "Average food cost",
        item_price: null,
        new_price: null,
        prod_food_cost: null,
        item_incidence: TableLib.average(incidenceArr)
      }
    ];

    this.gridApi.redrawRows();
  }

  /**************************************************************+
   * update table
   */
  update(gridApi) {
    // this.rowData = gridApi.getModel().gridOptionsWrapper.gridOptions.rowData;
    this.gridApi.setRowData(gridApi.getModel().gridOptionsWrapper.gridOptions.rowData);
    // this.gridApi.sizeColumnsToFit();

  }

  onGridSizeChanged(params){
    params.api.sizeColumnsToFit();
  }
  
  // callend when grid ready
  onGridReady(params) {
    this.gridApi = params.api;
  }

  // prante call filter table
  setFilter(filterModel) {
    this.gridApi.setFilterModel(filterModel);
    // recalculate percentage
    let priceArr: number[] = [];
    let incidenceArr: number[] = [];
    let total_gross_sum = 0;
    let qty_sum = 0;
    // convert to array of prices
    this.gridApi.forEachNodeAfterFilter(row => {
      priceArr.push(Number(row.data.item_price));
      total_gross_sum += Number(row.data.total_gross);
      qty_sum += Number(row.data.item_quantity_sum);

      // save food cost to array
      incidenceArr.push(Number(row.data.item_incidence));
    });

    // calculate totals
    const hmean = TableLib.harmonicMean(priceArr);
    this.gridApi.forEachNodeAfterFilter(row => {
      row.data.item_pac = hmean.toFixed(2);
      row.data.item_adc = (total_gross_sum / qty_sum).toFixed(2);
      row.data.item_igp = +(row.data.item_adc / row.data.item_pac * 100).toFixed(2);
    });

    // bottom pinned row update
    this.pinnedBottomRowData = [
      {
        prod_category_id: "Category",
        prod_name: "Average food cost",
        item_price: null,
        new_price: null,
        prod_food_cost: null,
        item_incidence: TableLib.average(incidenceArr)
      }
    ];

    // console.log(priceArr);
    this.gridApi.refreshCells();

  }


  // right mouse menu options
  getContextMenuItems = (params) => {
    var result = [
      {
        name: 'Autosize Columns',           // copy field
        action: () => {
          params.api.sizeColumnsToFit();
        }
      },
      // {
      //   name: 'Copy',
      //   action: () => {
      //     this.onMenuClipboard(params.value);
      //   }
      // },
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
