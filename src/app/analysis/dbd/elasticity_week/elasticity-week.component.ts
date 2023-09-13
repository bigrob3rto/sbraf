import { AfterViewInit, Component, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';


import { TableLib } from '../../../prod-table/lib/table-lib';
import { GridApi } from 'ag-grid-community';
import { AwsService } from '../../../service/aws.service';
// import { NeuralComponent } from '../neural/neural.component';
import { IaModalComponent } from './iaModal.component';
import { NeuralService } from '../../../service/neural.service';


@Component({
  selector: 'app-elasticity-week',
  templateUrl: './elasticity-week.component.html',
  styleUrls: ['./elasticity-week.component.css']
})



export class ElasticityWeekComponent {
  title = "Elasticity";
  @Input() messageService;    //refernce to message Service
  public gridApi: GridApi;
  public rowData;
  public domLayout = 'autoHeight';
  private matrixColDefs;

  public theme;
  public showCompleted = false;

  // @ViewChild(NeuralComponent, { static: false }) neuralComponent: NeuralComponent;
  @ViewChild(IaModalComponent, { static: false }) iaModal: IaModalComponent;


  public columnDefs = [
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
      // cellStyle: { 'text-align': 'center' }
      // cellStyle: {textAlign: "right"}
    },
    {
      headerName: 'PAC', field: 'item_pac', width: 110, resizable: true,
      valueFormatter: params => TableLib.currencyFormatter(params.value),
      // cellStyle: { 'text-align': 'center' }
      // cellStyle: {textAlign: "right"}
    },

    // {
    //   headerName: '# Orders', field: 'orders', width: 110,
    //   resizable: true, sortable: true, filter: 'agTextColumnFilter',
    //   cellStyle: { 'text-align': 'center' }
    // },

    // {
    //   headerName: 'Tot Qty', field: 'item_quantity_sum', sortable: true, resizable: true, filter: 'agTextColumnFilter',
    //   cellStyle: { 'text-align': 'center' }
    // },
    // {
    //   headerName: 'Tot_Gross', field: 'item_total_gross', width: 180,
    //   resizable: true, sortable: true, filter: 'agTextColumnFilter',
    //   valueFormatter: params => TableLib.currencyFormatter(params.data.item_total_gross),
    //   cellStyle: { 'text-align': 'center' }
    // },
    // { headerName: 'ADC (RICAVO MEDIO EFFETTIVO)', field: 'item_adc', resizable: true },
    // {
    //   headerName: 'IGP (INDICE GRADIMENTO PREZZO)', field: 'item_igp', resizable: true,
    //   valueFormatter: params => TableLib.percentageFormatter(params.data.item_igp),
    //   cellStyle: function (params) {
    //     if (Number(params.value) <= 85) return { backgroundColor: 'red' };
    //     if (Number(params.value) < 95) return { backgroundColor: 'orange' };
    //     if (Number(params.value) < 104) return { backgroundColor: '#8BC34A' };
    //     if (Number(params.value) < 109) return { backgroundColor: '#689F38' };
    //     return { backgroundColor: '#69F0AE' };
    //   }
    // },

  ];

  constructor(
    public neural: NeuralService,
    private awsService: AwsService) {
    // load theme from local storage
    this.theme = localStorage.getItem('ag-grid-theme');

  }


  /**************************************************************+
   * update table
   */
  async update(rowData, columnsDefs, INIT_COL_NUM) {
    //clone array (passed byRef)
    const _rowData = JSON.parse(JSON.stringify(rowData));
    this.gridApi.setRowData(_rowData);

    const catArr = await this.awsService.getCategories();

    // parent columns defs - delete first 4
    this.matrixColDefs = columnsDefs.slice(INIT_COL_NUM, columnsDefs.length);

    // set format as currency and align center
    this.matrixColDefs.forEach(col => {
      col.valueFormatter = (params) => {
        if (params.data.product_name == 'Total_Qty')
          return;
        if (params.data.product_name == 'Index_IGP')
          return TableLib.percentageFormatter(params.value);
        return TableLib.currencyFormatter(params.value);
      };
      // align cells on pinned top table
      col.cellStyle = () => { return { textAlign: 'left' } };
    });
    this.gridApi.setColumnDefs(this.columnDefs.concat(this.matrixColDefs));  // concat to existing coldefs

    // array of all sell prices
    const priceArr = _rowData.map(x => x = x.product_sellprice);
    // harmonic mean of prices
    const hmean = TableLib.harmonicMean(priceArr);

    let gross_row = { product_name: 'Total_Gross' }
    let qty_row = { product_name: 'Total_Qty' }
    let adc_row = { product_name: 'Index_ADC' }
    let igp_row = { product_name: 'Index_IGP' }

    // replace qty with revenue
    _rowData.forEach(row => {
      // this.gridApi.forEachNodeAfterFilter(node => {
      // const row = node.data;
      // cat ID => cat Name
      const catFound = catArr.find(c => c.categoryid == row.product_category_id);
      if (catFound)
        row.product_category_id = catFound.name;
      // set PAC
      row.item_pac = +hmean.toFixed(2);
      // iterate through columns
      this.matrixColDefs.forEach(col => {
        // qty => sell revenue
        if (row[col.field]) {
          // sum quantity
          qty_row[col.field] = qty_row[col.field] ? qty_row[col.field] + row[col.field] : row[col.field];
          // transform qty to gross
          row[col.field] = row[col.field] * row.product_sellprice;
          // sum gross
          gross_row[col.field] = gross_row[col.field] ? gross_row[col.field] + row[col.field] : row[col.field];
          adc_row[col.field] = gross_row[col.field] / qty_row[col.field];
          igp_row[col.field] = adc_row[col.field] / row.item_pac * 100;

        }
      });
    });
    this.rowData = _rowData; // set table inner data

    this.gridApi.setPinnedTopRowData([gross_row, qty_row, adc_row, igp_row]);
  }

  onGridReady(params) {
    this.gridApi = params.api;
  }

  onGridSizeChanged(params) {
    //params.api.sizeColumnsToFit();    // do not autofit
  }

  getRowStyle(params) {
    if (params.node.rowPinned && params.node.data.product_name == 'Index_IGP') {
      return { 'font-weight': 'bold' };
    }
  };


  async setFilter(filterModel) {
    this.gridApi.setFilterModel(filterModel);
    // recalculate percentage
    let priceArr: number[] = [];
    // convert to array of prices
    this.gridApi.forEachNodeAfterFilter(row => {
      priceArr.push(Number(row.data.product_sellprice));
    });
    const hmean = TableLib.harmonicMean(priceArr);
    this.gridApi.forEachNodeAfterFilter(row => {
      row.data.item_pac = hmean.toFixed(2);
    });

    const catArr = await this.awsService.getCategories();
    let gross_row = { product_name: 'Total_Gross' }
    let qty_row = { product_name: 'Total_Qty' }
    let adc_row = { product_name: 'Index_ADC' }
    let igp_row = { product_name: 'Index_IGP' }
    // replace qty with revenue
    // _rowData.forEach(row => {
    this.gridApi.forEachNodeAfterFilter(node => {
      const row = node.data;

      // iterate through columns
      this.matrixColDefs.forEach(col => {
        // qty => sell revenue
        if (row[col.field]) {
          // sum quantity
          qty_row[col.field] = qty_row[col.field] ? qty_row[col.field] + row[col.field] : row[col.field];

          // transform qty to gross
          row[col.field] = row[col.field] * row.product_sellprice;
          // sum gross
          gross_row[col.field] = gross_row[col.field] ? gross_row[col.field] + row[col.field] : row[col.field];
          adc_row[col.field] = gross_row[col.field] / qty_row[col.field];
          igp_row[col.field] = adc_row[col.field] / row.item_pac * 100;

          qty_row[col.field] = Number(qty_row[col.field].toFixed(1));
        }
      });
    });
    // this.rowData = _rowData; // set table inner data

    this.gridApi.setPinnedTopRowData([gross_row, qty_row, adc_row, igp_row]);


    // console.log(priceArr);
    this.gridApi.refreshCells();
  }


  getContextMenuItems = (params) => {
    const self = this;
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
      },
      {
        name: 'IA analysis',           // copy field
        action: () => {
          this.iaModal.open(params.node.data, self.neural);
        }
      },
    ];
    return result;
  }


  private weekday(date) {
    const str = date.substring(date.length - 3);

    const map = {
      'Mon': 1,
      'Tue': 2,
      'Wed': 3,
      'Thu': 4,
      'Fri': 5,
      'Sat': 6,
      'Sun': 7
    }

    return map[str];
  }


  async analyse() {
    this.showCompleted = false;
    let trainData = [];
    // get data from table
    this.gridApi.forEachNodeAfterFilter(node => {
      const row = node.data;

      // iterate through columns
      this.matrixColDefs.forEach(col => {
        if (row[col.field]) {
          const data = {
            price: Number(row.product_sellprice) - Number(row.product_foodcost),
            weekday: this.weekday(col.field),
            revenue: Number(row[col.field]),
            // incidence : (Number(row.product_sellprice)-Number(row.product_foodcost)) / Number(row.product_sellprice)
            foodcost: Number(row.product_foodcost)
          }
          trainData.push(data);
          // console.log(row[col.field]);
        }
      });
    });

    const food_costs = trainData.map(r => r.foodcost);
    const max_price = Math.max(...trainData.map(r => r.price));

    for (let day = 1; day <= 7; day++) {
      food_costs.forEach(fc => {
        // add init zeroes
        const data_0 = {
          price: 0,
          weekday: day,
          foodcost: fc,
          revenue: 0,
        }
        trainData.push(data_0);

        // add trailing zeroes
        const data_1 = {
          price: 2 * max_price,
          weekday: day,
          foodcost: fc,
          revenue: 0,
        }
        trainData.push(data_1);
      })
    }


    // console.log("traindata",trainData );
    this.neural.trainData = trainData;
    await this.neural.run();
    this.showCompleted = true;
  }

  hide() {
    this.neural.hide();
  }

  onCellDoubleClicked(params) {
    // console.log(params.node.data);
    this.iaModal.open(params.node.data, this.neural);
  }
}
