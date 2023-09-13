import { BaseTableComponent } from './base-list.component'
import { Component } from '@angular/core';
import { GridApi } from 'ag-grid-community';


export interface Category {
  categoryid: string,
  code: string,
  description: string,
  max_perc_cost: number,
  max_price_revenue: number,
  name: string
  visible: boolean
}

@Component({
  selector: 'app-cat-table',
  templateUrl: './base-list.component.html'
  //   styleUrls: ['./prod-table.component.css']
})

export class CategoryTableComponent extends BaseTableComponent {
  title = "Category";
  btnNew = true;
  btnDelete = true;
  btnUndelete = true;

  columnDefs = [
    { headerName: 'Id', field: 'categoryid', resizable: true, editable: true, sortable: true, filter: 'agTextColumnFilter' },
    { field: 'name', resizable: true, editable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { field: 'code' },
    { field: 'description', resizable: true, editable: true, sortable: true, filter: 'agTextColumnFilter' },
    { field: 'max_perc_cost', resizable: true, editable: true, sortable: true, filter: 'agTextColumnFilter' },
    { field: 'max_price_revenue', resizable: true, editable: true, sortable: true, filter: 'agTextColumnFilter' },
    { field: 'visible' },
  ]


  async getData() {
    const categories = await this.awsService.getCategories();
    return categories;
  }

  /*********************************************** */
  newRow() {
    const newCategory: Category = {
      categoryid: "0",
      code: "",
      description: "",
      max_perc_cost: 0,
      max_price_revenue: 0,
      name: "New Category",
      visible: true,
    }
    newCategory['changed'] = true;

    var newItems = [newCategory];

    this.gridApi.applyTransaction({
      add: newItems,
      addIndex: 0,
    });

    this.gridApi.ensureIndexVisible( this.gridApi.getRowNode("0").rowIndex );
    this.gridApi.getRowNode("0").setSelected(true);

    this.unsaved = true;
    //params.node.setSelected(false);

  }

  getRowNodeId(category){
    return category.categoryid;
  }

  /******************************************************* */
  deleteSelectedRow(value) {
    this.gridApi.getSelectedNodes().forEach(row => {
      row.data.visible = !value;  // disbaale product
      row.data['changed'] = true;
    });
    // params.node.setSelected(false);
    this.unsaved = true;
    this.checkUnsaved();
    this.gridApi.redrawRows();   // need redraw
  }

  /******************************************************* */
  getContextMenuItems = (params) => {
    var result = [
      {
        name: 'New',
        action: () => {
          this.newRow();
        }
      },
      {
        name: 'Delete',
        action: () => {
          params.node.setSelected(true);  // if right click then select
          this.deleteSelectedRow(true);
        }
      },
      {
        name: 'Undelete',
        action: () => {
          params.node.setSelected(true);  // if right click then select
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

  /********************************************************
  *  Refresh button pressed
  */
  refresh = () => {
    if (this.unsaved) {
      // ask confirmation
      var modalInstance = this.myModal.show();
    }
    else {
      this.awsService.clearSession('categories');
      this.refreshData();
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
    let catToSave: Category[] = [];  // array to save

    this.gridApi.forEachNode(async node => {  // for each row
      if (node.data.changed) {        // if exists attribute changed
        delete node.data.changed; // delete unused property
        catToSave.push(node.data);  // save to array
        // find first product_id
      }
    });

    await this.awsService.saveCategorys(catToSave);

    this.unsaved = false;
    this.gridApi.redrawRows();
    this.messageService.show("Row Saved " + catToSave.length);
  }


  // menu delete/undelete clicked
  enableRow(row: Category, value: boolean) {
    // var res = gridApi.applyTransaction({ remove: selectedData });
    row.visible = value;  // disbaale product
    row['changed'] = true;
  }

  getRowStyle(params) {
    // console.log("ciao");
    if (params.node.data.visible == false) {
      return { color: '#ccc' };
    }
  }
}
