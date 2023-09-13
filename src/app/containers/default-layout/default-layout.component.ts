import { Component, isDevMode, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { navItems } from '../../_nav';
import { CognitoServiceProvider } from '../../service/cognito-service';
import { Router } from '@angular/router';
import { MessageService } from '../../service/message.service';
import { AwsService } from '../../service/aws.service';
import { GlobalService } from '../../service/global.service';
import { OrderCacheService } from '../../service/cache.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.css']

})
export class DefaultLayoutComponent implements OnInit, AfterViewInit {
  public sidebarMinimized = false;
  public navItems = navItems;
  public userName: string = "";
  public authBtnEnable: boolean = false;
  public structureList: string[] = [];
  public selectedStructure: string = "Select your store";
  public storesXmenu;

  cache_start: any;
  cache_stop: any;

  wizard: any = {};
  wizard_step = ['Data Pick Up', 'Menu Manager', 'Dashboard', 'Day by Day', 'Matrix Charts', 'Elasticity Index',
    'Item Performance', 'Compare', 'Report']
  menu_ok_enable = ['Dashboard', 'Day by Day', 'Matrix Charts', 'Elasticity Index', 'Item Performance', 'Report']
  menu_enable_always = ['Data Pick Up', 'Menu Manager'];


  constructor(public cognitoService: CognitoServiceProvider,
    protected awsService: AwsService,
    private messageService: MessageService,
    public router: Router,
    private globalService: GlobalService,
    protected orderCache: OrderCacheService,
  ) {
    this.authBtnEnable = isDevMode();   // disable in prod mode
    this.userName = this.cognitoService.getUserName();  // init username


  }


  // check wheter menu have food_cost
  // argument : all menus of this structure 
  update_navigation(menus) {
    // check each menu in array
    menus.forEach(m => {
      let foodcost_ok = false;
      if (m.menu_products) {
        foodcost_ok = true;
        m.menu_products.forEach(mp => {
          // check all food_cost are > 0
          foodcost_ok = foodcost_ok && (mp['product_foodcost'] > 0);
        })
      }
      // save food_cost result into menu
      m['foodcost_ok'] = foodcost_ok;
    })

    let menu_ok = false;
    menus.forEach(m => {
      // check at least 1 menu is valid
      menu_ok = menu_ok || m['foodcost_ok'];
    })

    // enable sections if menu ok
    // copy array
    let objCopy = JSON.parse(JSON.stringify(this.navItems));
    objCopy.forEach(el => {
      if (this.awsService.getStrId() && (menu_ok || this.menu_enable_always.includes(el.name)))
        // enable
        el.attributes = { disabled: false };
      else
        if (this.menu_ok_enable.includes(el.name))
          el.attributes = { disabled: true };          // disable  
      if (el.name == 'Compare') {
        const num_ok = menus.filter(m => m['foodcost_ok']).length;
        // console.log("num ok", num_ok);
        // enable compare section only when 2 valid menus exist
        el.attributes = { disabled: num_ok < 2 };
      }

    });

    // console.log("menu_ok", menu_ok);
    // copy back array
    this.navItems = objCopy;
  }

  /*************************************************** */
  async ngOnInit() {
    if (!this.cognitoService.isUserLogged())
      return;

    // receive updates about selected structure
    this.globalService.selectedStructure.subscribe(message => {
      if (message) {
        this.selectedStructure = message;

        /*****************************************************
         *  clear cache - when selected store changes
         * */
        sessionStorage.removeItem('categories');
        sessionStorage.removeItem('menu');
        sessionStorage.removeItem('menuSelected');
        sessionStorage.removeItem('product');
        sessionStorage.removeItem('productGroup');
        // remove engineering
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key.substring(0, 4) == 'eng_')
            sessionStorage.removeItem(key);
        }

        setTimeout(async () => {
          const menus = await this.awsService.getMenus(true);
          this.update_navigation(menus);
        }, 0);

      }
    });

    // load structures
    const structures = await this.awsService.getStructures();
    this.storesXmenu = structures.length;

    // push to local array
    this.structureList = [];
    structures.forEach(s => this.structureList.push(s.structure_name));

    // 
    const strName = this.awsService.getStrName();
    if (strName)
      this.selectedStructure = strName;



    // receive updates about analysis status
    this.globalService.analStatus.subscribe(async message => {
      if (message) {

        // // color green whenever a section is completed
        // let objCopy = JSON.parse(JSON.stringify(this.navItems));
        // const el = objCopy.find(el => el.name == message);
        // if (el)
        //   el.variant = 'success';
        // // console.log(el);
        // this.navItems = objCopy;

        // update wizard modal
        this.wizard[message] = 'true';
      }

      if (message == 'Menu Manager') {

        const menus = await this.awsService.getMenus(true);
        this.update_navigation(menus);

      }
    });

  }

  async ngAfterViewInit() {
    const menus = await this.awsService.getMenus(true);
    this.update_navigation(menus);
    // console.log("AfterViewInit");
  }


  async reload(url: string): Promise<boolean> {
    await this.router.navigateByUrl('.', { skipLocationChange: true });
    return this.router.navigateByUrl(url);
  }


  /*****************************************************
*   select structure / store dropdown
*/
  async onStructureSelect(index) {
    // show selected
    this.selectedStructure = this.structureList[index];

    // load structures
    const structures = await this.awsService.getStructures();
    // find corresponding struct from name
    const structFound = structures.find(x => x.structure_name == this.selectedStructure);  // find corresponding category

    // save globally
    this.awsService.setStore(structFound.structure_id, structFound.structure_name);

    // notify all observers
    this.globalService.changeSelectedStructure(this.selectedStructure)

  }




  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }


  isUserLogged(): boolean {
    // this.awsService.getStrId();
    if (this.cognitoService.isUserLogged()) {
      this.userName = this.getUsername();
      // console.log("Username change");
      return true;
    }
    this.router.navigateByUrl('/login');
    return false;
  }

  getUsername(): string {
    // this.userName = this.cognitoService.getUserName();
    // this.messageService.show("User: " +  this.userName);
    return this.cognitoService.getUserName();
  }



  logout() {
    this.messageService.show("Goodbye!");
    sessionStorage.clear();
    this.structureList = [];

    // remove autologin
    localStorage.removeItem("remember_sbraf")

    this.cognitoService.logout();
  }
}
