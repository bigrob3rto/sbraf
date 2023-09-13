import { AfterViewInit, Component, Input, isDevMode, OnInit, ViewChild } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { GridApi } from 'ag-grid-community';
import { BaseTableComponent } from '../../prod-table/base-list.component'
import { Category } from '../../prod-table/cat-table.component';
import { TableLib } from '../../prod-table/lib/table-lib';
import { MenuTableComponent } from './menu/menu-table.component';
import { Product, ProductMerged } from '../../prod-table/prod-table.component';
import { DateRangeComponent } from '../../views/daterange/daterange.component';
import { NewMenuComponent } from './newmenu/newmenu.component';
import { red } from '@material-ui/core/colors';

var print = console.log.bind(console);
import * as introJs from 'intro.js/intro.js';


export interface MenuProduct {
  product_id: number,
  product_name: string,
  product_note: null,
  product_category_id: number,
  product_sellprice: number,
  product_foodcost: number,
  product_merged_code: number
}

@Component({
  selector: 'app-menu-editor',
  templateUrl: './menu-editor.component.html',
  styleUrls: ['./menu-editor.component.css']
})



export class MenuEditorComponent extends BaseTableComponent implements OnInit, AfterViewInit {
  title = "Menu Editor";
  btnSave = true;
  btnExport = true;
  btnReload = true;
  btnPrint = true;

  @Input() messageService;    //refernce to message Service
  public rowDataProduct;
  public rowSelection = 'multiple';

  public leftGridApi: GridApi;
  public rightGridApi: GridApi;

  public overlayNoRowsTemplate = "Please assign product to active menu.";


  public menuMenuHeader: string[] = [];
  public menuSelected: string = 'Please select a menu';
  public menuDescription: string = "";
  public SAVE_AS = false;   //menu create / Save As flag modal

  public productXmenu: number[] = [];

  public menu_from :NgbDateStruct;
  public menu_to : NgbDateStruct;

  @ViewChild(MenuTableComponent, { static: false }) menutable: MenuTableComponent;
  //@ViewChild(DateRangeComponent, { static: false }) daterangeComponent: DateRangeComponent;
  @ViewChild('daterange1') daterangeComponent: DateRangeComponent;
  @ViewChild(NewMenuComponent, { static: false }) newmenuComponent: NewMenuComponent;

  // right table
  columnDefs = [
    {
      rowDrag: true,
      rowDragText: function (params, dragItemCount) {
        if (dragItemCount > 1) {
          return dragItemCount + ' product_merged_name';
        }
        return params.rowNode.data.product_merged_name;
      },

      headerName: 'Product', field: 'product_merged_name', width: 100, resizable: true, sortable: true, filter: 'agTextColumnFilter'
    },
    { headerName: '', field: "product_merged_code", hide: true },
    {
      headerName: 'Category', field: 'product_category_id', width: 110, resizable: true, editable: true,
      sortable: true, filter: 'agTextColumnFilter'
    },
    {
      headerName: 'Category', field: 'ccc_category_name', resizable: true, editable: true,
      sortable: true, filter: 'agTextColumnFilter',
    },
    { headerName: 'Id', field: 'product_id', width: 110, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Code', field: 'product_code', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Note', field: 'product_note', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    {
      headerName: 'Sell_price', field: 'product_sellprice', width: 150, editable: true,
      resizable: true, sortable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.currencyFormatter(params.value),
    },
    // { headerName: 'Qty', field: 'product_quantity', width: 130, editable: true, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Description', field: 'product_description', resizable: true, editable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Discount', field: 'product_discount', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Enabled', field: 'product_enabled', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Kasavana cat', field: 'product_kasavana_category', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Source', field: 'product_input_source', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    {
      headerName: 'Food_cost', field: 'product_foodcost', resizable: true, editable: true,
      sortable: true, filter: 'agTextColumnFilter', width: 150,
      valueFormatter: params => TableLib.currencyFormatter(params.value),
    },
    {
      headerName: 'Contribution', field: 'ccc_contribution', width: 110, resizable: true,
      sortable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.currencyFormatter(params.value),
    },
    {
      headerName: 'Incidence', field: 'ccc_incidence', width: 110, resizable: true,
      sortable: true, filter: 'agTextColumnFilter',
      valueFormatter: params => TableLib.percentageFormatter(params.value),
    },
  ];

  // left table
  columnDefs2 = [
    {
      rowDrag: true,
      rowDragText: function (params, dragItemCount) {
        if (dragItemCount > 1) {
          return dragItemCount + ' products';
        }
        return params.rowNode.data.name;
      },
      headerName: '', field: "id", dndSource: false, width: 40
    },
    // { headerName: 'Category', field: 'product_category_id', width: 110, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    {
      headerName: 'Product', field: 'name', width: 110, sortable: true, resizable: true, editable: true
    },
    { headerName: '', field: "product_merged_code", hide: true },
    {
      headerName: 'Category', field: 'ccc_category_name', resizable: true,
      sortable: true, filter: 'agTextColumnFilter', width: 110
    },
    { headerName: 'Id', field: 'product_id', width: 110, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Product', field: 'product_name', width: 300, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Code', field: 'product_code', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // {
    //   headerName: 'Sell_price', field: 'product_sell_price', width: 150,
    //   resizable: true, sortable: true, filter: 'agTextColumnFilter',
    //   valueFormatter: params => TableLib.currencyFormatter(params.value),
    // },
    { headerName: 'Note', field: 'product_note', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Qty', field: 'product_quantity', width: 130, editable: true, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Description', field: 'product_description', resizable: true, editable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Discount', field: 'product_discount', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Enabled', field: 'product_enabled', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Kasavana cat', field: 'product_kasavana_category', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // { headerName: 'Source', field: 'product_input_source', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
    // {
    //   headerName: 'Food_cost', field: 'product_food_cost_ext', resizable: true, 
    //   sortable: true, filter: 'agTextColumnFilter', width: 110,
    //   valueFormatter: params => TableLib.currencyFormatter(params.value),
    // },
    // {
    //   headerName: 'Contribution', field: 'ccc_contribution', width: 110, resizable: true,
    //   sortable: true, filter: 'agTextColumnFilter',
    //   valueFormatter: params => TableLib.currencyFormatter(params.value),
    // },
    // {
    //   headerName: 'Incidence', field: 'ccc_incidence', width: 110, resizable: true,
    //   sortable: true, filter: 'agTextColumnFilter',
    //   valueFormatter: params => TableLib.percentageFormatter(params.value),
    // },
  ];
  newMenu_unsaved: boolean;


  ngAfterViewInit() {
    // needed to correctly update daterange in daterangeComponent
    this.cdRef.detectChanges();
    // this.refreshData();
    setTimeout(() => { this.refreshData() });

    //select menu
    setTimeout(() => {
      const menuSelected = sessionStorage.getItem('menuSelected');
      if (menuSelected)
        this.onMenuSelect(this.menuMenuHeader.findIndex(v => v == menuSelected));
      // this.menuSelected = menuSelected;
    });
  }


  ngOnInit() {

    // receive updates about selected structure
    this.globalService.selectedStructure.subscribe(async message => {
      if (message) {
        setTimeout(() => {
          this.refreshData();
          this.menutable.refreshData();
          this.menuSelected = 'Please select a menu';
        });
      }
    });

    // refresh on init
    this.refresh();
  }


  // needed bt drag & drop function
  getRowNodeId(data) {
    if (data == undefined)
      return;
    return data.product_id;
  }

  // set row style by parameter LEFTGRID
  getRowStyle1(params) {
    // console.log("ciao");
    if (params.node.data && params.node.data.changed)
      return { background: '#5bc0de' };

  }

  // cell edited on aggrid
  onCellValueChanged(params) {
    params.node.data['changed'] = true
    this.unsaved = true;

    //recalculate incidence
    params.node.data.ccc_contribution = Number(params.node.data.product_sellprice) - Number(params.node.data.product_foodcost);
    params.node.data.ccc_incidence = Number(params.node.data.product_foodcost) / Number(params.node.data.product_sellprice) * 100;

    params.colDef.cellStyle = function (params2) {
      if (params2.node.data['changed'] || params2.node.data['groupChange'])
        return { color: 'red' };
    }
    this.gridApi.redrawRows();


  }




  /******************************************************** */
  onLeftGridReady(params) {
    this.leftGridApi = params.api;
  }

  /******************************************************** */
  onRightGridReady(params) {
    this.rightGridApi = params.api;
    this.gridApi = params.api;  // needed by export button

    const self = this;

    // DRAG & DROP code
    // set drop zone in right grid
    var dropZoneParams = params.api.getRowDropZoneParams({
      onDragStop: (params) => {
        var nodes = params.nodes;
        nodes.forEach(node => {
          let data = node.data;
          data['changed'] = true; // set changed field
          // calculate incidence & contribution
          data['ccc_contribution'] = +(data.product_sellprice - data.product_foodcost).toFixed(1);
          data['ccc_incidence'] = +(data.product_foodcost / data.product_sellprice * 100).toFixed(1);
          params.api.refreshCells();  //refresh to show new values
        });
        self.unsaved = true;  //set unsaved flag
      }
    });
    // set drag-drop zone in left grid
    this.leftGridApi.addRowDropZone(dropZoneParams);
  }




  /*****************************************************
  *   select category dropdown
  */
  async onMenuSelect(i) {
    this.menuSelected = this.menuMenuHeader[i];  // select item
    sessionStorage.setItem('menuSelected', this.menuSelected);
    this.updateTable();
  }

  /******************************************************
   * Called from children table
   */
  onMenuTableSelectionChanged(params) {
    // console.log("Children table - event received", params);
    this.menuSelected = params;
    sessionStorage.setItem('menuSelected', this.menuSelected);
    this.updateTable();
    this.refreshData(); // refresh headers
    // console.log("Selection changed from menu table")
  }

  /******************************************************
   * Called from File -> New
   * Modal dialog data
   */
  async createSaveMenu() {
    const menuData = this.newmenuComponent.menuForm.value;
    /**
         menu_name : new FormControl(''),
         menu_from : new FormControl(''),
         menu_to : new FormControl(''),
         menu_description : new FormControl('')
     */
    // console.log("New menu", menuData);
    // const oldRowData = this.rowData;        // save rowData
    const oldRowData = this.rowData;

    this.menutable.insertNewRow(menuData);  // attention this will trigger a row select event and update rightGridApi
    this.menuDescription = menuData.menu_description;
    this.unsaved = true;
    this.newMenu_unsaved = true;
    if (!this.SAVE_AS) {
      this.rowData = [];
      this.messageService.show("Created new Menu : " + menuData.menu_name);
    }
    else {
      // set all rows as changed  
      // TODO not working
      // setTimeout(async () => {
      this.rowData = oldRowData;    // restore table data
      this.rightGridApi.setRowData(this.rowData);
      this.rightGridApi.forEachNode(row => { row.data.changed = true; });
      await this.saveTable();
      this.SAVE_AS = false;
      // }, 1000);
    }
    // push to dropdown
    this.menuMenuHeader.push(menuData.menu_name);
  }


  /*****************************************************
  *   Table update - right and left 
  */
  async updateTable() {
    this.loading = true;


    // Update ALL Product table
    const prodArr: Product[] = await this.awsService.getProducts();
    let prodMerged: ProductMerged[] = await this.awsService.getProductMergeds();
    const catArr: Category[] = await this.awsService.getCategories();

    // convert to unique array
    function uniq(a) {
      var seen = {};
      return a.filter(function (item) {
        return seen.hasOwnProperty(item.name) ? false : (seen[item.name] = true);
      });
    }
    prodMerged = uniq(prodMerged);

    prodMerged.forEach(row => {   // for each row in table Product Merged
      const prodFound = prodArr.find(x => x.product_id == row.product_id);  // find corresponding category
      if (prodFound) {
        row['product_merged_name'] = row.name;   // assign name instead of ID
        row['product_merged_code'] = row.code;   // assign name instead of ID
        row['product_note'] = prodFound.product_note;   // assign name instead of ID
        row['product_sellprice'] = prodFound.product_sell_price;   // assign name instead of ID
        row['product_foodcost'] = prodFound.product_food_cost_ext;   // assign name instead of ID

        const catFound = catArr.find(x => x.categoryid == String(prodFound.product_category_id));  // find corresponding category
        if (catFound != undefined) {
          row['ccc_category_name'] = catFound.name;   // assign name instead of ID
          row['product_category_id'] = catFound.categoryid;   // assign name instead of ID
        }
      }
    });

    this.rowDataProduct = prodMerged;


    // Update Selected MENU table
    const menus = await this.awsService.getMenus(true); // get all menus
    const menuFound = menus.find(x => x.menu_name == this.menuSelected);  // find corresponding menu
    if (!menuFound) // can happen when new menu is created and not saved yet
      return;
    this.menuDescription = menuFound.menu_description;  // load description
    if (this.daterangeComponent){ // if already loaded in memory
      this.daterangeComponent.date1 = TableLib.utcToNgb(menuFound.menu_from);
      this.daterangeComponent.date2 = TableLib.utcToNgb(menuFound.menu_to);
      this.daterangeComponent.refresh();
    }

    // list of products
    const data = menuFound.menu_products;

    if (data != undefined) {  // if table has rows
      data.forEach(mp => {   // for each mp in table Product
        // find corresponding category
        const catFound = catArr.find(x => x.categoryid == String(mp.product_category_id));
        if (catFound != undefined)
          mp['ccc_category_name'] = catFound.name;   // assign name instead of ID

        mp['ccc_contribution'] = +(Number(mp['product_sellprice']) - Number(mp['product_foodcost'])).toFixed(1);
        mp['ccc_incidence'] = +(Number(mp['product_foodcost']) / Number(mp['product_sellprice']) * 100).toFixed(1);
      });

      // console.log("received: ", data);
      this.rowData = data;              // assign new data table
    }
    else {
      // this.messageService.show("Menu is empty.");
      this.rowData = [];
    }

    this.rightGridApi.sizeColumnsToFit();  // resize column width
    this.rightGridApi.refreshCells();      // refhresh table
    this.loading = false;
  }


  start_tour() {
    introJs().start();
  }

  /*************************************************************************
   *  get and modify data to display  
   */
  async getData(): Promise<any[]> {
    return await this.awsService.getMenus();
  }

  /**************************************************
  * extends Refresh data
  */
  public async refreshData() {

    // check store selected
    if (!this.awsService.getStrId()) {
      this.messageService.show("Please select a Store.")
      return;
    }

    this.loading = true;

    // if at least one menu
    if (this.menutable) {
      const menuArr = await this.menutable.getData();
      this.menuMenuHeader = menuArr.map(menu => menu.menu_name);

      menuArr.forEach(menu => {
        const count = menu.menu_products ? menu.menu_products.length : 0;
        this.productXmenu.push(count);
      });
    }
    this.loading = false;             // reset loading spinner 
  }


  refresh = () => {
    if (this.canDeactivate()) {
      this.unsaved = false;
      this.refreshData();
      this.updateTable();
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

  deleteSelectedRow(value) {
    const selectedRows = this.gridApi.getSelectedNodes();
    selectedRows.forEach(row => this.disableRow(row.data, value));
    if (selectedRows.length) {
      this.unsaved = true;
      this.gridApi.redrawRows();   // need redraw
    }
  }

  // right button mouse context menu
  getContextMenuItems = (params) => {

    // select left or right
    if (params.api == this.leftGridApi)
      return [
        {
          name: 'Autosize Columns',           // copy field
          action: () => {
            params.api.sizeColumnsToFit();
          }
        },
        {
          name: 'Copy',           // copy field
          action: () => {
            this.onMenuClipboard(params.value);
          }
        },
      ];

    if (params.api == this.rightGridApi)
      return [
        {
          name: 'Delete',     // delete row
          tooltip: 'Delete selected Row',
          action: async () => {
            params.node.setSelected(true);  // if right click then select
            this.deleteSelectedRow(true);
          }
        },
        {
          name: 'Undelete',     // delete row
          tooltip: 'Undelete selected Row',
          action: async () => {
            params.node.setSelected(true);  // if right click then select
            this.deleteSelectedRow(false);
          }
        },
        {
          name: 'Autosize Columns',           // copy field
          action: () => {
            params.api.sizeColumnsToFit();
          }
        },
        {
          name: 'Copy',           // copy field
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

  }

  autoSize() {
    this.gridApi.sizeColumnsToFit();
  }

  /********************************************************
  *  Save button pressed
  */
  saveTable = async () => {
    if (!this.unsaved) {  // nothing to save
      this.messageService.show("Data already up-to-date. Nothing to save.");
      return;
    }

    // if menu is new then first save menu
    if (this.newMenu_unsaved) {
      await this.menutable.saveTable();
      this.newMenu_unsaved = false;
    }

    // Update Selected MENU table
    this.awsService.clearSession('menu');   // clear cache
    const menus = await this.awsService.getMenus(); // reload all menus
    const menuFound = menus.find(x => x.menu_name == this.menuSelected);  // find corresponding menu
    let catArr = await this.awsService.getCategories();
    const prodArr = await this.awsService.getProducts();

    // save menu product
    let menuProductToSave: MenuProduct[] = []; // array of MenuProducts to save
    let menuProductToDelete: number[] = []; // array of products ID to delete
    let categoryToSave: Category[] = [];
    let productToSave: Product[] = [];

    this.rightGridApi.forEachNode(async row => {
      const mp: MenuProduct = row.data;
      if (mp['changed']) {
        if (mp['deleted']) {
          // Update Selected MENU table
          menuProductToDelete.push(mp.product_merged_code);
          // update table
          this.rightGridApi.applyTransaction({ remove: [row.data] });
        }
        else {
          // load all fields before change
          const original_product = prodArr.find(p => p.product_id == mp.product_id);
          const original_category = catArr.find(c => c.categoryid == String(mp.product_category_id));
          let original_mp;
          let changed_SELLPRICE = false;
          let changed_FOODCOST = false;
          if (menuFound.menu_products) {
            // check which field has changed
            original_mp = menuFound.menu_products.find(o => o.product_id == mp.product_id);
            if (original_mp) {  // if new product added, original_mp is undefined
              changed_SELLPRICE = mp['product_sellprice'] != original_mp['product_sellprice'];
              changed_FOODCOST = mp['product_foodcost'] != original_mp['product_foodcost'];
            }
          }
          // check which field has changed
          const changed_CATID = mp.product_category_id != original_product.product_category_id;
          const changed_CATNAME = original_category ? mp["ccc_category_name"] != original_category.name : true;

          // condition to save menuproduct
          if (changed_SELLPRICE || changed_FOODCOST || !original_mp)
            menuProductToSave.push(mp);

          // changed category ID
          if (changed_CATID || changed_CATNAME) {// check for category exist
            const category_EXIST = catArr.find(c => c.categoryid == String(mp.product_category_id));
            if (!category_EXIST) {
              // create new Category
              const category: Category = {
                categoryid: undefined,  // new category
                code: "",
                description: "",
                max_perc_cost: 0,
                max_price_revenue: 0,
                name: row.data["ccc_category_name"],  // put new category name
                visible: true
              }
              categoryToSave.push(category);
              // update category into product
              original_product.product_category_id = mp.product_category_id;
              productToSave.push(original_product);
            }
            else { // id changed but category EXIST
              if (changed_CATNAME && !changed_CATID) {
                // update category name
                original_category.name = mp["ccc_category_name"];
                categoryToSave.push(original_category);
              }
              else if (changed_CATID) {
                // update category into product
                original_product.product_category_id = Number(mp.product_category_id);
                productToSave.push(original_product);
                if (changed_CATNAME) {
                  // update category name
                  original_category.name = mp["ccc_category_name"];
                  categoryToSave.push(original_category);
                }
              }
            }
          }
        }
      }
      delete row.data.changed;
    });

    let messageString = "";
    // save product 
    if (menuProductToSave.length > 0) {
      await this.awsService.saveMenuProducts(menuFound.menu_id, menuProductToSave);
      this.awsService.clearSession('menu'); // clear cache
      messageString += " Menu lines saved:" + menuProductToSave.length;
    }
    // save menu (menuProduct)
    if (menuProductToDelete.length > 0) {
      await this.awsService.deleteMenuProducts(menuFound.menu_id, menuProductToDelete);
      this.awsService.clearSession('menu'); // clear cache
      messageString += " Menu lines deleted:" + menuProductToSave.length;
    }

    // save catagories
    if (categoryToSave.length > 0) {
      const result = await this.awsService.saveCategorys(categoryToSave);
      messageString += " Category saved:" + categoryToSave.length;
      // get new gateogory ID assigned by AWS
      if (result && result['data']) {
        const data = JSON.parse(result['data']);
        data.forEach((v, i) => {
          // update products with new category ID
          productToSave[i].product_category_id = Number(v['category_id']);
          // console.log(" new category id: ", productToSave[i]);
        });
      }
      this.awsService.clearSession('categories'); // clear cache
    }
    // save product
    if (productToSave.length > 0) {
      await this.awsService.saveProducts(productToSave);
      messageString += " Product saved:" + productToSave.length;
      this.awsService.clearSession('product');
    }

    // update view (always disable cache!!)
    this.updateTable();
    this.unsaved = false;

    // Update analysis status
    this.globalService.changeAnalStatus("Menu Manager");


    if (messageString == "")
      messageString = "Saved."
    this.messageService.show(messageString);

  }


  /*************************************************************************+
   * Add product with double click
   */
  onRowDoubleClick(event) {
    const product = <MenuProduct>event.data;

    // do nothing if row is already in the grid, otherwise we would have duplicates
    var rowAlreadyInGrid = !!this.rightGridApi.getRowNode(String(product.product_id)); // !! cast to boolean
    if (rowAlreadyInGrid) {
      this.messageService.show('Item duplicate: please avoid duplicates in the grid');
      return;
    }

    product['changed'] = true; // set changed field
    // calculate incidence & contribution
    product['ccc_contribution'] = +(product.product_sellprice - product.product_foodcost).toFixed(1);
    product['ccc_incidence'] = +(product.product_foodcost / product.product_sellprice * 100).toFixed(1);
    // product.product_sellprice = product.product_sell_price;
    // product.product_foodcost = product.product_food_cost_ext;

    // product.product_sellprice_original = product.product_sell_price;  //need because empty
    this.rightGridApi.applyTransaction({ add: [product] });
    this.unsaved = true;
    // console.log("Double click product");
    this.leftGridApi.redrawRows();
  }

  /*********************************** 
 * Extends parent function
*/
  public printPrepare(value: boolean) {
    if (value) {
      this.rightGridApi.setDomLayout('print');
      this.leftGridApi.setDomLayout('print');
    }
    else {
      this.rightGridApi.setDomLayout('normal');
      this.leftGridApi.setDomLayout('normal');
    }
  }
}
