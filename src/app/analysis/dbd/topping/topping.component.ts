import { AfterViewInit, Component, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';


import { TableLib } from '../../../prod-table/lib/table-lib';
import { GridApi } from 'ag-grid-community';
import { AwsService } from '../../../service/aws.service';
import { Order } from '../../../prod-table/order/order-table.component';

export interface Topping {
  optionItem: string,
  quantity: number,
  priceEach: number
  itemId: string,
  product_id: number,
  product_name: string
}

@Component({
  selector: 'app-topping',
  templateUrl: './topping.component.html',
  styleUrls: ['./topping.component.css']
})



export class ToppingComponent {
  title = "Topping";
  @Input() messageService;    //refernce to message Service
  public gridApi: GridApi;
  public rowData;
  public domLayout = 'autoHeight';

  public theme;

  public columnDefs = [
    {
      headerName: 'Option', field: 'optionItem', width: 150, resizable: true, sortable: true,
      filter: 'agTextColumnFilter', 
    },
    {
      headerName: 'Product ID', field: 'product_id', width: 100, resizable: true, sortable: true,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Product', field: 'product_name', width: 150, resizable: true, sortable: true,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Quantity', field: 'quantity', width: 100, resizable: true, sortable: true,
      filter: 'agTextColumnFilter',initialSort: 'desc',
    },
    {
      headerName: 'Price', field: 'priceEach', width: 100, resizable: true, sortable: true,
      filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.currencyFormatter(params.value),
    },
    {
      headerName: 'Cost', field: 'cost', width: 100, resizable: true, sortable: true,
      filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.currencyFormatter(params.value),
    },
    {
      headerName: '% Cost', field: 'costPercent', width: 100, resizable: true, sortable: true,
      filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.percentageFormatter(params.value),
    },
    {
      headerName: 'Total Cost', field: 'total_cost', width: 100, resizable: true, sortable: true,
      filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.currencyFormatter(params.value),
    },
    {
      headerName: 'profit margin single', field: 'profit', width: 100, resizable: true, sortable: true,
      filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.currencyFormatter(params.value),
    },
    {
      headerName: 'profit margin Total', field: 'profit_total', width: 100, resizable: true, sortable: true,
      filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.currencyFormatter(params.value),
    },

  ];

  constructor(
    private awsService: AwsService) {

    // load theme from local storage
    this.theme = localStorage.getItem('ag-grid-theme');

  }



  /**************************************************************+
   * update table
   */
  async update(orders: Order[]) {
    // create hash table for unique values
    let ht: Map<string, Topping> = new Map();

    // loop through orders
    orders.forEach(order => {
      // if options exist
      if (order.optionItems)
        // loop through toppings
        order.optionItems.forEach(tp => {
          // assign product ID from order
          tp.product_id = order.product_id;
          // assign product name from order
          tp.product_name = order.merged_product_name;
          // if alredy exist
          if (ht.has(tp.optionItem)) {
            let tp1 = ht.get(tp.optionItem);
            // increment quantity
            tp1.quantity += tp.quantity;
          }
          else
            ht.set(tp.optionItem, tp);
        });
    })
    this.rowData = Array.from(ht.values());
    this.gridApi.setRowData(this.rowData);
    this.gridApi.refreshCells();
  }

  onGridReady(params) {
    this.gridApi = params.api;
  }

  onGridSizeChanged(params) {
    params.api.sizeColumnsToFit();
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(document.getElementById('filter-text-box')['value']);
  }


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
