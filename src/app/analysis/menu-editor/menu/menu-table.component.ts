import { formatDate } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { BaseTableComponent } from '../../../prod-table/base-list.component';
import { Category } from '../../../prod-table/cat-table.component';
import { Product, ProductMerged } from '../../../prod-table/prod-table.component';
import { MenuProduct } from '../menu-editor.component';

export interface Menu {
  menu_id: number,
  menu_name: string,
  menu_code: string,
  menu_from: string,
  menu_to: string,
  menu_day_0: boolean,
  menu_day_1: boolean,
  menu_day_2: boolean,
  menu_day_3: boolean,
  menu_day_4: boolean,
  menu_day_5: boolean,
  menu_day_6: boolean,
  menu_description: string,
  menu_products: Product[]
}

@Component({
  selector: 'app-menutable',
  templateUrl: './menu-table.component.html',
  styleUrls: ['./menu-table.component.css']
})

export class MenuTableComponent extends BaseTableComponent {
  title = "Menu";
  public domLayout = 'autoHeight';
  public rowSelection = 'single';
  public menuSelected = 'Please select a menu';
  @Output() selectionChanged = new EventEmitter<string>();
  start: string;   // start date
  stop: string;    // stop date


  columnDefs = [
    { headerName: 'Name', field: "menu_name", resizable: true, sortable: true, editable: true, filter: 'agTextColumnFilter' },
    { headerName: 'Menu ID', field: "menu_id", width: 110, editable: true, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Code', field: "menu_code", resizable: true, width: 120, sortable: true, editable: true, filter: 'agTextColumnFilter' },
    {
      headerName: 'From', field: "menu_from", resizable: true, width: 120, sortable: true, editable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => formatDate(params.data.menu_from, "yyyy-MM-dd", 'en-US'),
    },
    {
      headerName: 'To', field: "menu_to", resizable: true, width: 120, sortable: true, editable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => formatDate(params.data.menu_to, "yyyy-MM-dd", 'en-US'),
    },
    // { headerName: 'Day 0', field: "menu_day_0", resizable: true, width: 110, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Day 1', field: "menu_day_1", resizable: true, width: 110, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Day 2', field: "menu_day_2", resizable: true, width: 110, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Day 3', field: "menu_day_3", resizable: true, width: 110, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Day 4', field: "menu_day_4", resizable: true, width: 110, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Day 5', field: "menu_day_5", resizable: true, width: 110, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Day 6', field: "menu_day_6", resizable: true, width: 110, sortable: true, filter: 'agTextColumnFilter' },
    { headerName: 'Description', field: "menu_description", resizable: true, sortable: true, editable: true, filter: 'agTextColumnFilter' }
  ];

  // attach menu to document body
  public popupParent : HTMLElement = document.querySelector('body');

  /*******************************************************
 * 
 */
  async getData() {
    return await this.awsService.getMenus();
  }


  /*******************************************************
 * 
 */
  refresh = () => {
    if (this.unsaved) {
      // ask confirmation
      var modalInstance = this.myModal.show();
    }
    else {
      this.awsService.clearSession('menu');
      this.refreshData();
    }

  }

  /*******************************************************
   * 
   */
  onSelectionChange(params?) {
    const selRow: Menu = this.gridApi.getSelectedRows()[0];
    // call parent method -> set category selected
    this.menuSelected = selRow.menu_name;
    this.selectionChanged.next(this.menuSelected);  // send to parent
    // console.log("Row selected",this.menuSelected);

  }

  /*******************************************************
   * 
   */
  insertNewRow(mn?: Menu) {
    const newItem: Menu = {
      menu_id: 0,
      menu_name: mn ? mn.menu_name : "",
      menu_code: mn ? mn.menu_code : "",
      menu_from: mn ? mn.menu_from : new Date().toISOString(),
      menu_to: mn ? mn.menu_to : new Date().toISOString(),
      menu_day_0: false,
      menu_day_1: false,
      menu_day_2: false,
      menu_day_3: false,
      menu_day_4: false,
      menu_day_5: false,
      menu_day_6: false,
      menu_description: mn ? mn.menu_description : "",
      menu_products: mn ? mn.menu_products : [],
    }
    newItem['changed'] = true;

    var newItems = [newItem];

    this.gridApi.applyTransaction({
      add: newItems,
      addIndex: 0,
    });

    this.gridApi.forEachNode(node => node.rowIndex ? 0 : node.setSelected(true))
    this.unsaved = true;
    //params.node.setSelected(false);
  }

  // contect menu
  getContextMenuItems = (params) => {
    var result = [
      {
        name: 'New',
        action: () => {
          this.insertNewRow();
        }
      },
      {
        name: 'Duplicate',
        action: async () => {
          //console.log("" + params.node.data);
          var menu: Menu = JSON.parse(JSON.stringify(params.node.data));   // copy object
          menu.menu_name = menu.menu_name + "_" + Math.floor(Math.random() * 999);
          menu.menu_code = JSON.stringify(menu.menu_id); // save ID to duplicate

          this.insertNewRow(menu);
        }
      },
      {
        name: 'Delete',
        action: () => {
          params.node.setSelected(true);  // if right click then select
          this.gridApi.getSelectedNodes().forEach(row => {
            row.data.deleted = true;  // disable product
            row.data['changed'] = true;
          });
          // params.node.setSelected(false);
          this.unsaved = true;
          this.gridApi.redrawRows();   // need redraw
        }
      },
      {
        name: 'Undelete',
        action: () => {
          // params.node.setSelected(true);
          this.gridApi.getSelectedNodes().forEach(row => {
            row.data.deleted = false;  // re enable product
            row.data['changed'] = true;
          });
          // params.node.setSelected(false);
          this.unsaved = true;
          this.gridApi.redrawRows();   // need redraw
        }
      },
      'separator',
      {
        name: 'Autosize Columns',           // copy field
        action: async () => {
          params.api.sizeColumnsToFit();
          await this.saveTable();
          console.log("saved");
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

  /********************************************************
*  Save button pressed
*/
  saveTable = async () => {
    if (!this.unsaved) {  // nothing to save
      this.messageService.show("Menu header already up-to-date.");
      return;
    }
    // array to save
    let menuToSave: Menu[] = [];
    let menuToDelete: Menu[] = [];
    const catArr: Category[] = await this.awsService.getCategories();

    var promise = new Promise(async (resolve, reject) => {

      this.gridApi.forEachNode(async node => {  // for each row
        if (node.data['changed']) {        // if exists attribute changed
          // delete unused property
          delete node.data.changed;
          // array to save
          if (node.data['deleted'])
            menuToDelete.push(node.data);
          else
            menuToSave.push(node.data);
        }
      });
      if (menuToSave.length > 0) {
        await this.awsService.saveMenus(menuToSave);
        this.awsService.clearSession("menu"); // clear cache

        menuToSave.forEach(async menu => {
          if (menu.menu_code) { // IF DUPLICATE ID present
            // save menu products
            let mp_list: MenuProduct[] = [];
            // list of products
            const data = menu.menu_products;
            if (data != undefined) {  // if table has rows
              data.forEach(mp => {   // for each mp in table Product
                // find corresponding category
                const catFound = catArr.find(x => x.categoryid == String(mp.product_category_id));
                let menuProduct: MenuProduct = {
                  product_id: mp.product_id,
                  product_name: mp.product_name,
                  product_note: null,
                  product_category_id: mp.product_category_id,
                  product_sellprice: mp['product_sellprice'],
                  product_foodcost: mp['product_foodcost'],
                  product_merged_code: mp.product_merged_code
                }
                mp_list.push(menuProduct);
              });
              // need to get updated menu_id
              const menus = await this.awsService.getMenus(); // reload all menus
              const menuFound = menus.find(x => x.menu_name == this.menuSelected);  // find corresponding menu

              // save all menu products children
              await this.awsService.saveMenuProducts(menuFound.menu_id, mp_list);

              // update refresh view
              this.selectionChanged.next(this.menuSelected);  // send to parent

              // console.log("Save menu: " + menu.menu_code);
            }
          }
        })
      }
      if (menuToDelete.length > 0) {
        menuToDelete.forEach(menu => {
          if (menu.menu_products && menu.menu_products.length > 0)
            this.messageService.show("Cannot delete menu " + menu.menu_name + ": please delete all subelements first. (" +
              menu.menu_products.length + ")");
        });
        await this.awsService.deleteMenus(menuToDelete);
        this.awsService.clearSession("menu"); // clear cache
      }

      // emit change event to parent
      this.onSelectionChange();

      this.refreshData();
      this.unsaved = false;
      resolve(null);


      return promise;
    });
  }
}

