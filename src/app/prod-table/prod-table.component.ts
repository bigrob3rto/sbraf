import { BaseTableComponent } from './base-list.component'
import { Component, HostListener } from '@angular/core';
import { TableLib } from './lib/table-lib';
import { Category } from './cat-table.component';

export interface Product {
  product_id: number,
  product_name: string,
  product_code: string,
  product_sell_price: number,
  product_quantity: number,
  product_note: string,
  product_category_id: number,
  product_description: string,
  product_discount: number,
  product_enabled: boolean,
  product_kasavana_category: string,
  product_input_source: string,
  product_food_cost_ext: number,
  product_structure_id: number
  product_merged_name: string,
  product_merged_code: number
}

export interface ProductMerged {
  code: number
  name: string,
  product_id: number,
}

@Component({
  selector: 'app-prod-table',
  templateUrl: './base-list.component.html',
  // styleUrls: ['./prod-table.component.css']
})



export class ProdTableComponent extends BaseTableComponent {
  title = "Product";
  btnNew = true;
  btnDelete = true;
  btnUndelete = true;
  ptnPrint = true;

  // save category names for dropdown select in table
  private categories: String[] = [];
  public domLayout = 'normal';

  columnDefs = [
    {
      headerName: 'Product Merged', field: 'product_merged_name', rowGroup: true, width: 150, editable: true, hide: false,
      // cellRenderer: function (params) {
      //   if (params.node.group)
      //     return params.node.key;
      //   if (params.node.data && params.node.data.changed)
      //     return '<span><i style="color: Orange;" class="fa fa-warning"></i>' + params.value + '</span>';
      //   else
      //     return '<span>' + params.value + '</span>';
      // }
    },
    {
      headerName: 'Product', field: 'product_name', width: 300, editable: true, sortable: true,
    },
    {
      headerName: 'Id', field: 'product_id', width: 110, editable: true,
    },
    { headerName: 'Category ID', field: 'product_category_id', width: 110, editable: false },
    {
      headerName: 'Category', field: 'ccc_category_name', editable: true, width: 150,
      cellEditor: 'agRichSelectCellEditor', // only exisiting categories can be selected
      cellEditorParams: values => {
        return {
          values: this.categories
        }
      }
    },

    // { headerName: 'Code', field: 'product_code'   },
    { headerName: 'Note', field: 'product_note', editable: true },
    // {
    //   headerName: 'Sell_price', field: 'product_sell_price', editable: true, width: 110,
    //   valueFormatter: params => TableLib.currencyFormatter(params.value),
    // },
    // { headerName: 'Qty', field: 'product_quantity', width: 130, editable: true   },
    // { headerName: 'Description', field: 'product_description',  editable: true },
    // { headerName: 'Discount', field: 'product_discount'   },
    // { headerName: 'Enabled', field: 'product_enabled'   },
    // { headerName: 'Kasavana cat', field: 'product_kasavana_category'   },
    // { headerName: 'Source', field: 'product_input_source'   },
    // {
    //   headerName: 'Food_cost', field: 'product_food_cost_ext', editable: true,
    //   width: 110,
    //   valueFormatter: params => TableLib.currencyFormatter(params.value),
    // },
    // {
    //   headerName: 'Contribution', field: 'ccc_contribution', width: 110,
    //   valueFormatter: params => TableLib.currencyFormatter(params.value),
    // },
    // {
    //   headerName: 'Incidence', field: 'ccc_incidence', width: 110,
    //   valueFormatter: params => TableLib.percentageFormatter(params.value),
    // },
  ];


  /********************************************************
  *  get Data
  */
  async getData() {
    // invoke API Gateway Service , async /await 
    let prodArr: Product[] = await this.awsService.getProducts();

    // trasform category ID into catagory name
    let catArr: Category[] = await this.awsService.getCategories();

    // load product Groups
    // let productGroups: ProductMerged[] = await this.awsService.getProductMergeds();

    prodArr.forEach(row => {   // for each row in table Product
      let catFound = catArr.find(x => x.categoryid == String(row.product_category_id));  // find corresponding category
      if (catFound != undefined)
        row['ccc_category_name'] = catFound.name;   // assign name instead of ID
      row['ccc_contribution'] = +(row.product_sell_price - row.product_food_cost_ext).toFixed(1);
      row['ccc_incidence'] = +(row.product_food_cost_ext / row.product_sell_price * 100).toFixed(1);

    });

    // update gridApi category menu
    if (catArr) {
      const unique = new Set(catArr.map(cat => cat.name)); // load category names into array
      this.categories = Array.from(unique.values()).sort();
    }
    return prodArr;
  }


  /********************************************************
  *  Refresh button pressed
  */
  refresh = () => {
    if (this.unsaved) {
      // ask confirmation
      var modalInstance = this.myModal.show();
    }
    else {
      // this.awsService.clearSession('product');
      this.refreshData();
      this.unsaved = false;
    }
  }


  /********************************************************
  *  Reload button pressed
  */
  reload = () => {
    this.awsService.clearSession('product');
    this.awsService.clearSession('productGroup');
    this.refresh();
  }


  // cell value changed
  async onCellValueChanged(params) {

    // if category description changed
    if (params.column.getId() == "ccc_category_name") {
      const newCategory = params.node.data['ccc_category_name'];
      // trasform category ID into catagory name
      let catArr: Category[] = await this.awsService.getCategories();
      // find CAT ID
      let catFound = catArr.find(x => x.name == newCategory);  // find corresponding category
      // assign new ID
      // if Category exist, assign new ID, else assign null
      params.node.data.product_category_id = catFound ? catFound.categoryid : null;

      // paint red also ID column
      this.gridApi.getColumnDef("product_category_id").cellStyle = function (params2) {
        if (params2.node.data['changed'])
          return { background: 'gold' };
      }
    }

    // call parent function
    super.onCellValueChanged(params);


    // change flag if Group changed
    if (params.column.getId() == "product_merged_name") {
      let product = params.node.data;
      const prodArr = this.rowData;
      const merged_products = prodArr.filter(x => x.product_merged_name == product.product_merged_name);
      if (merged_products) // if exist
      {
        const all_equal = merged_products.every(x => x.product_category_id == merged_products[0].product_category_id);
        // if category not equal
        if (!all_equal) {
          product.product_merged_name = product.product_name;
          delete params.node.data.changed;
          params.api.redrawRows();
          this.messageService.show("Merge not allowed: product category do not match.");
          return;
        }
      }
      delete params.node.data.changed;
      params.node.data['groupChange'] = true;

      // refresh group aggregation
      params.api.refreshClientSideRowModel('group');

      // expand all groups
      // params.api.expandAll();
    }


  }

  /********************************************************
  *  Save button pressed
  */
  saveTable = async () => {
    if (!this.unsaved) {  // nothing to save
      this.messageService.show("Data already up-to-date. Nothing to save.");
      return;
    }

    // load product Groups
    let productGroups: ProductMerged[] = await this.awsService.getProductMergeds();

    let prodArr: Product[] = [];
    let groupArr: ProductMerged[] = [];
    let groupDelete: ProductMerged[] = [];
    this.rowData.forEach(row => {  // for each row
      if (row && row['changed']) {        // if exists attribute changed
        // row['changed'] = false;
        delete row.changed; // delete unused property
        // push to array to save 
        prodArr.push(row);
        if (row.product_enabled == false) {
          // find productGroup
          const groupfound = productGroups.find(p => p.product_id == row.product_id);
          
          let pg: ProductMerged = {
            code: groupfound ? groupfound.code : 0,         // 0 = new group, groupfound.code = old code
            name: row.product_merged_name ? row.product_merged_name : groupfound.name,
            product_id: row.product_id
          }
          groupDelete.push(pg);
        }
      }
      if (row && row['groupChange']) {        // if exists attribute changed
        delete row.groupChange; // delete unused property

        // find productGroup
        const groupfound = productGroups.find(p => p.product_id == row.product_id);

        let pg: ProductMerged = {
          code: groupfound ? groupfound.code : 0,         // 0 = new group, groupfound.code = old code
          name: row.product_merged_name ? row.product_merged_name : groupfound.name,
          product_id: row.product_id
        }

        // push to array to save 
        if (row.product_merged_name == '') {
          // delete row.product_group_name;
          row.product_merged_name = row.product_name;   // assign default value
          pg.name = row.product_name;
          groupArr.push(pg);
          // refresh group aggregation
          this.gridApi.refreshClientSideRowModel('group');
        }
        else
          groupArr.push(pg);
      }
    });

    // save all changed products (single transaction)
    if (prodArr.length) {
      await this.awsService.saveProducts(prodArr);
      this.awsService.clearSession('product');
    }

    // save all  products group (single transaction)  productGroup
    if (groupArr.length) {
      await this.awsService.saveProductMergeds(groupArr);
      this.awsService.clearSession('productGroup');
    }

    // delete changed product group (single transaction)
    if (groupDelete.length) {
      await this.awsService.deleteProductMergeds(groupDelete);
      this.awsService.clearSession('productGroup');
    }

    // reset unsaved
    this.unsaved = false;
    this.gridApi.redrawRows();
    this.messageService.show("Saved successfully.");
  }



  // menu delete/undelete clicked
  enableRow(row: Product, value: boolean) {
    // var res = gridApi.applyTransaction({ remove: selectedData });
    row.product_enabled = value;  // disbaale product
    row['changed'] = true;
  }

  getRowStyle(params) {
    // console.log("ciao");
    if (params.node.data && params.node.data.product_enabled == false) {
      return { color: '#ccc' };
    }
  }

  getRowNodeId(product) {
    return product.product_id;
  }

  /*********************************************** */
  newRow() {
    TableLib.addItems(this.gridApi);
    this.gridApi.ensureIndexVisible(this.gridApi.getRowNode("1").rowIndex);
    this.gridApi.getRowNode("1").setSelected(true);
    this.unsaved = true;
  }

  deleteSelectedRow(value) {
    this.gridApi.getSelectedNodes().forEach(row => {
      if (row.data) {
        row.data.product_enabled = !value;  // disable product
        row.data['changed'] = true;
      }
    });
    // params.node.setSelected(false);
    this.unsaved = true;
    this.gridApi.redrawRows();   // need redraw
  }

  /*********************************************** */
  // right button mouse context menu
  getContextMenuItems = (params) => {

    //params.node.setSelected(true);
    var result = [
      {
        name: 'Refresh',
        action: () => {
          params.api.refreshClientSideRowModel('group');
          params.api.refreshCells();
        }
      },
      {
        name: 'New',
        action: () => {
          this.newRow();
        }
      },
      {
        name: 'Delete',
        action: () => {
          this.deleteSelectedRow(true);
        }
      },
      {
        name: 'Undelete',
        action: () => {
          this.deleteSelectedRow(false);
        }
      },
      'separator',
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
