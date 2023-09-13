import { AfterViewInit, Component, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';


import { TableLib } from '../../../prod-table/lib/table-lib';
import { GridApi } from 'ag-grid-community';
import { formatDate } from '@angular/common';
import { AwsService } from '../../../service/aws.service';


@Component({
  selector: 'app-elasticity',
  templateUrl: './elasticity.component.html',
  styleUrls: ['./elasticity.component.css']
})



export class ElasticityComponent {
  title = "Elasticity";
  @Input() messageService;    //refernce to message Service
  public gridApi: GridApi;
  public rowData;
  public domLayout = 'autoHeight';

  public theme;

  public columnDefs = [
    {
      headerName: 'Category', field: 'product_category_id', width: 300, resizable: true, sortable: true,
      filter: 'agTextColumnFilter', initialSort: 'asc',
    },
    {
      headerName: 'Product', field: 'product_merged_name', width: 300, resizable: true, sortable: true,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'ID', field: 'product_id', width: 100, resizable: true, sortable: true,
      filter: 'agTextColumnFilter',
    },
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
      headerName: '# Orders', field: 'orders', width: 110,
      resizable: true, sortable: true, filter: 'agTextColumnFilter',
      cellStyle: { 'text-align': 'center' }
    },

    {
      headerName: 'Tot Qty', field: 'item_quantity_sum', sortable: true, resizable: true, filter: 'agTextColumnFilter',
      cellStyle: { 'text-align': 'center' }
    },
    {
      headerName: 'Tot_Gross', field: 'item_total_gross', width: 180,
      resizable: true, sortable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.currencyFormatter(params.value),
      cellStyle: { 'text-align': 'center' }
    },
    { headerName: 'PAC', field: 'item_pac', resizable: true },
    { headerName: 'ADC (RICAVO MEDIO EFFETTIVO)', field: 'item_adc', resizable: true },
    {
      headerName: 'IGP (INDICE GRADIMENTO PREZZO)', field: 'item_igp', resizable: true,
      valueFormatter: params => TableLib.percentageFormatter(params.value),
      cellStyle: function (params) {
        if (Number(params.value) <= 85) return { backgroundColor: 'red' };
        if (Number(params.value) < 95) return { backgroundColor: 'orange' };
        if (Number(params.value) < 104) return { backgroundColor: '#8BC34A' };
        if (Number(params.value) < 109) return { backgroundColor: '#689F38' };
        return { backgroundColor: '#69F0AE' };
      }
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
  async update(rowData) {
    this.rowData = rowData;
    this.gridApi.setRowData(rowData);

    const catArr = await this.awsService.getCategories();

    // calculate PAC
    let priceArr: number[] = [];
    let total_gross_sum = 0;
    let total_qty_sum = 0;


    this.gridApi.forEachNodeAfterFilter(row => {
      // trasform cat ID into names
      const catFound = catArr.find(c => c.categoryid == row.data.product_category_id);
      if (catFound)
        row.data.product_category_id = catFound.name;

      priceArr.push(Number(row.data.product_sellprice));

      const arrQty = Object.values(row.data);
      const dateArr = Object.keys(row.data);
      let qty_sum = 0;
      for (let i = 19; i < arrQty.length; i++) {
        qty_sum += Number(arrQty[i]);
      }
      // total_gross_sum += Number(row.data.total_gross);
      // qty_sum += Number(row.data.item_quantity_sum);
      row.data.item_quantity_sum = qty_sum;
      row.data.item_total_gross = qty_sum * row.data.product_sellprice;
      total_gross_sum += row.data.item_total_gross;
      total_qty_sum += row.data.item_quantity_sum;
    });
    const hmean = TableLib.harmonicMean(priceArr);

    this.gridApi.forEachNodeAfterFilter(row => {
      row.data.item_pac = hmean.toFixed(2);
      row.data.item_adc = (total_gross_sum / total_qty_sum).toFixed(2);
      row.data.item_igp = +(row.data.item_adc / row.data.item_pac * 100).toFixed(2);
    });
    this.gridApi.refreshCells();
  }

  onGridReady(params) {
    this.gridApi = params.api;
  }

  onGridSizeChanged(params) {
    params.api.sizeColumnsToFit();
  }

  setFilter(filterModel) {
    this.gridApi.setFilterModel(filterModel);
    // recalculate percentage
    let priceArr: number[] = [];
    let total_gross_sum = 0;
    let qty_sum = 0;
    // convert to array of prices
    this.gridApi.forEachNodeAfterFilter(row => {
      priceArr.push(Number(row.data.product_sellprice));
      total_gross_sum += Number(row.data.item_total_gross);
      qty_sum += Number(row.data.item_quantity_sum);
    });
    const hmean = TableLib.harmonicMean(priceArr);
    this.gridApi.forEachNodeAfterFilter(row => {
      row.data.item_pac = hmean.toFixed(2);
      row.data.item_adc = (total_gross_sum / qty_sum).toFixed(2);
      row.data.item_igp = +(row.data.item_adc / row.data.item_pac * 100).toFixed(2);
    });

    // console.log(priceArr);
    this.gridApi.refreshCells();
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
