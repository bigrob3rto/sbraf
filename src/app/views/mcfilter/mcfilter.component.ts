import { AfterContentInit, AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AwsService } from '../../service/aws.service';
import { TableLib } from '../../prod-table/lib/table-lib';
import { OrderCacheService } from '../../service/cache.service';
import { GlobalService } from '../../service/global.service';
import { Category } from '../../prod-table/cat-table.component';
import { Menu } from '../../analysis/menu-editor/menu/menu-table.component';
import { MenuProduct } from '../../analysis/menu-editor/menu-editor.component';


@Component({
  selector: 'app-mcfilter',
  templateUrl: './mcfilter.component.html',
  // styleUrls: ['./daterange.component.css']
})



export class MCFilterComponent implements OnInit, AfterViewInit {
  public categoryMenuHeader: Category[] = [];
  public productXcategory: number[] = [];
  public categorySelected: string = 'All';
  public categorySelectedID: number;

  public menuMenuHeader: string[] = [];
  public productXmenu: number[] = [];
  public menuSelected: string = 'Please select a menu';

  @Output() menuSelect = new EventEmitter<Menu>();
  @Output() categorySelect = new EventEmitter<string>();

  constructor(private awsService: AwsService,
    protected orderCache: OrderCacheService,
    private globalService: GlobalService
  ) {
  }


  ngOnInit() {

    // receive updates about selected structure
    this.globalService.selectedStructure.subscribe(async message => {
      if (message) {
        setTimeout(async () => {
          // load menu dropdown
          const menuArr = await this.awsService.getMenus(true);
          this.menuMenuHeader = menuArr.map(menu => menu.menu_name);

          menuArr.forEach(menu => {
            const count = menu.menu_products ? menu.menu_products.length : 0;
            this.productXmenu.push(count);
          });

          this.menuSelected = 'Please select a menu';

          //select menu
          setTimeout(() => {
            const menuSelected = sessionStorage.getItem('menuSelected');
            if (menuSelected)
              this.onMenuSelect(this.menuMenuHeader.findIndex(v => v == menuSelected));
            // this.menuSelected = menuSelected;
          });

        });

      }
    });
  }

  ngAfterViewInit() {
    setTimeout(async () => {
      // load menu dropdown
      const menuArr = await this.awsService.getMenus(true);
      this.menuMenuHeader = menuArr.map(menu => menu.menu_name);

      menuArr.forEach(menu => {
        const count = menu.menu_products ? menu.menu_products.length : 0;
        this.productXmenu.push(count);
      });

      this.menuSelected = 'Please select a menu';

      //select menu
      setTimeout(() => {
        const menuSelected = sessionStorage.getItem('menuSelected');
        if (menuSelected)
          this.onMenuSelect(this.menuMenuHeader.findIndex(v => v == menuSelected));
      });

    })

  }

  /*****************************************************
  *   select MENU dropdown
  */
  async onMenuSelect(i) {
    this.menuSelected = this.menuMenuHeader[i];  // select item
    sessionStorage.setItem('menuSelected', this.menuSelected);

    // load menu dropdown
    const menuArr = await this.awsService.getMenus();
    const menuFound: Menu = menuArr.find(menu => menu.menu_name == this.menuSelected);

    if (!menuFound)
      return;

    // Create @Output event => set dates in date range parente component
    this.menuSelect.emit(menuFound);

    // update caegory menu dropdown
    // cast to MenuProduct class
    const menu_products = menuFound.menu_products;
    this.categoryMenuHeader = [];
    let catByMenu_IDs: number[];
    if (menu_products) {  // products exist

      // load all categories
      const catArr: Category[] = await this.awsService.getCategories();
      // map to category ID array
      catByMenu_IDs = menu_products.map(mp => mp.product_category_id);

      // map to category names array
      let categories_of_menu: Category[] = catArr.filter(cat => {
        if (catByMenu_IDs.includes(Number(cat.categoryid)))
          return cat.name;
      });

      // category dropdown enu update
      this.categoryMenuHeader = categories_of_menu; //.map(cat => cat.name);
      // badge count (products per category)
      this.productXcategory.length = categories_of_menu.length;

      // for each category in MenuProduct
      i = 0;
      categories_of_menu.forEach(cat => {
        // count products per category
        this.productXcategory[i++] = catByMenu_IDs.filter(x => x == Number(cat.categoryid)).length;
      });
      // console.log("catByMenu_IDs", catByMenu_IDs);
    }
    // finally add 'All' category
    this.categoryMenuHeader.push(<Category>{
      name: 'All',
      categoryid: null
    });
    // badge count all products in category
    if (menu_products)
      this.productXcategory.push(menu_products.length);

    // this.refreshData();
    // console.log("Loaded categories", this.categoryMenuHeader);

    // select always ALL
    this.onCategorySelect(this.categoryMenuHeader.length - 1);

  }

  /*****************************************************
     *   select category dropdown
     */
  onCategorySelect(i: number) {
    this.categorySelected = this.categoryMenuHeader[i].name;
    this.categorySelectedID = Number(this.categoryMenuHeader[i].categoryid);

    // Create @Output event => set dates in date range parente component
    this.categorySelect.emit(this.categorySelected);
  }


  // reload menu strucutre when menu clicked
  async reloadMenuContent() {
    // console.log("Reload menu content");
    // load menu dropdown
    const menuArr = await this.awsService.getMenus(true);
    this.menuMenuHeader = menuArr.map(menu => menu.menu_name);

    menuArr.forEach(menu => {
      const count = menu.menu_products ? menu.menu_products.length : 0;
      this.productXmenu.push(count);
    });
  }

  async reloadCategoryContent() {
    // load menu dropdown
    const menuArr = await this.awsService.getMenus();
    const menuFound: Menu = menuArr.find(menu => menu.menu_name == this.menuSelected);

    if (!menuFound)
      return;
    // update caegory menu dropdown
    // cast to MenuProduct class
    const menu_products = menuFound.menu_products;
    this.categoryMenuHeader = [];
    let catByMenu_IDs: number[];
    if (menu_products) {  // products exist

      // load all categories
      const catArr: Category[] = await this.awsService.getCategories();
      
      // map to category ID array
      catByMenu_IDs = menu_products.map(mp => mp.product_category_id);

      // map to category names array
      let categories_of_menu: Category[] = catArr.filter(cat => {
        if (catByMenu_IDs.includes(Number(cat.categoryid)))
          return cat.name;
      });

      // category dropdown enu update
      this.categoryMenuHeader = categories_of_menu; //.map(cat => cat.name);
      // badge count (products per category)
      this.productXcategory.length = categories_of_menu.length;

      // for each category in MenuProduct
      let i = 0;
      categories_of_menu.forEach(cat => {
        // count products per category
        this.productXcategory[i++] = catByMenu_IDs.filter(x => x == Number(cat.categoryid)).length;
      });
      // console.log("catByMenu_IDs", catByMenu_IDs);
    }
    // finally add 'All' category
    this.categoryMenuHeader.push(<Category>{
      name: 'All',
      categoryid: null
    });
    // badge count all products in category
    this.productXcategory.push(menu_products.length);


  }

}


