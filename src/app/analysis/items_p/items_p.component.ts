import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Printable } from '../../prod-table/printable.component';
import { MessageService } from '../../service/message.service';
import { AwsService } from '../../service/aws.service';
import { GlobalService } from '../../service/global.service';
import { CognitoServiceProvider } from '../../service/cognito-service';
import { Engineering } from '../engineering/engineering.component';
import { Category } from '../../prod-table/cat-table.component';
import { MonthPickerComponent } from '../../views/month-picker/month-picker.component';




@Component({
  templateUrl: 'items_p.component.html',
  styleUrls: ['./items_p.component.css'],
})

export class items_pComponent extends Printable implements OnInit, AfterViewInit {
  public loading: boolean = false;
  public cat_loading: boolean = false;
  public title = "Category Performance"
  public active = 1;

  //table of stat
  public statTable = new Map();
  btnRefresh = true;

  public categoryMenuHeader: Category[] = [];
  public categorySelected: string = 'All';
  public categorySelectedID: number;

  // selected months
  public months = null;


  // @ViewChildren(DateRangeComponent) daterange;
  @ViewChild(MonthPickerComponent, { static: false }) monthRange: MonthPickerComponent;


  constructor(private messageService: MessageService,
    protected awsService: AwsService,
    protected globalService: GlobalService,
    public cognitoService: CognitoServiceProvider
    ) {
    super();

  }


  /*************************************************************************
  *  get and modify data to display  
  */
  ngOnInit() {

    // receive updates about selected structure
    this.globalService.selectedStructure.subscribe(message => {
      if (message) {

        // update category dropdown at start
        this.reloadCategoryContent();

        this.categorySelected = 'All';
      }
    });

  }


  ngAfterViewInit() {
    //this.reloadCategoryContent()
  }


  logRange(months) {
    this.months = months;
    //console.log(monthRangeSelected);
    //    this.start =  JSON.parse(JSON.stringify(monthRangeSelected.from));  // e.g. myDate = 2017-01-01
    //    this.stop =  JSON.parse(JSON.stringify(monthRangeSelected.to));   // e.g. myDate = 2017-01-01
  };

  /*****************************************************
   *   select category dropdown
   */
  onCategorySelect(i: number) {
    this.categorySelected = this.categoryMenuHeader[i].name;
    this.categorySelectedID = Number(this.categoryMenuHeader[i].categoryid);
  }


  /*****************************************************
   *   update list of categories with number of products in the dropdown menu
   */
  async reloadCategoryContent() {
    // update caegory menu dropdown
    // cast to MenuProduct class
    this.categoryMenuHeader = [];

    this.cat_loading = true;

    // load all categories
    const catArr: Category[] = await this.awsService.getCategories();
    const products = await this.awsService.getProducts();

    // category dropdown enu update
    this.categoryMenuHeader = catArr; //.map(cat => cat.name);


    // for each category

    catArr.forEach(cat => {
      // count product based who belong to a single category
      cat["productXcategory"] = products.filter(p => cat.categoryid == String(p.product_category_id)).length;
    });

    this.categoryMenuHeader = this.categoryMenuHeader.filter(c => c["productXcategory"] > 0);

    // finally add 'All' category
    this.categoryMenuHeader.push(<Category>{
      name: 'All',
      categoryid: null,
    });

    // badge count all products (related to All category)
    this.categoryMenuHeader[this.categoryMenuHeader.length - 1]["productXcategory"] = products.length;

    //console.log(this.categoryMenuHeader);    
    if (this.categoryMenuHeader.length <= 1)
      this.messageService.show("This structure contains no category", 'warning');

      this.cat_loading = false;
  }


  setLoading(value) {
    this.loading = value;
    // console.log("Received", value)
  }




  refresh = async () => {

    // check user logged
    if (!this.cognitoService.isUserLogged()) {
      this.messageService.show("Please login first.")
      return;
    }
    // check store selected
    if (!this.awsService.getStrId()) {
      this.messageService.show("Please select Store first.")
      return;
    }

    //this.start = this.ngbDateParserFormatter.format(this.daterangeComponent.date1); // e.g. myDate = 2017-01-01
    //this.stop = this.ngbDateParserFormatter.format(this.daterangeComponent.date2); // e.g. myDate = 2017-01-01
    if (!this.months) {  // start stop undefined
      this.messageService.show("Please select Month range first.")
      return;
    }

    if (this.categorySelected == 'All') {  // start stop undefined
      this.messageService.show("Please select a single category first.")
      return;
    }

    // this.globalService.order_loading = true;
    this.loading = true;

    let engArr: Engineering[];

    // month name to number
    const hashTable = {
      "Jan": ["01", "31"],
      "Feb": ["02", "28"],
      "Mar": ["03", "31"],
      "Apr": ["04", "30"],
      "May": ["05", "30"],
      "Jun": ["06", "30"],
      "Jul": ["07", "31"],
      "Ago": ["08", "31"],
      "Sep": ["09", "30"],
      "Oct": ["10", "31"],
      "Nov": ["11", "30"],
      "Dec": ["12", "31"]
    };

    // get total statistics
    const first_m = this.months[0];
    const last_m = this.months[this.months.length - 1];
    const start = first_m.year + "-" + hashTable[first_m.month][0] + "-01 00:00:00";
    const stop = last_m.year + "-" + hashTable[last_m.month][0] + "-" + hashTable[last_m.month][1] + " 23:59:59";

    // get eng data    invoke API Gateway Service , async /await 
    engArr = await this.awsService.getEngineeringV2(start, stop);
    // filter engineering array by category id
    let productsByCategory = engArr.filter(row => Number(row.prod_category_id) == this.categorySelectedID);

    //console.log(productsByCategory);

    this.statTable.clear();   // clear stats
    productsByCategory.forEach(row => {   // for each row in table Engineering

      // update stat object
      if (this.statTable.has(row.merged_product_name)) {
        let line = this.statTable.get(row.merged_product_name);
        line.qty += row.quantity; // increase quantity
      }
      else
        this.statTable.set(row.merged_product_name,
          {
            name: row.merged_product_name,
            price: row.price,
            fcs: row.prod_food_cost,
            contrib: Number(row.price) - Number(row.prod_food_cost),
            qty: row.quantity
          });
    });
    this.messageService.show("Row loaded " + engArr.length + "");


    this.months.forEach(async m => {

      const start = m.year + "-" + hashTable[m.month][0] + "-01 00:00:00";
      const stop = m.year + "-" + hashTable[m.month][0] + "-" + hashTable[m.month][1] + " 23:59:59";

      //console.log(start, stop);

      // get eng data    invoke API Gateway Service , async /await 
      engArr = await this.awsService.getEngineeringV2(start, stop);
      // filter engineering array by category id
      let productsByCategory = engArr.filter(row => Number(row.prod_category_id) == this.categorySelectedID);

      //console.log(productsByCategory);


      productsByCategory.forEach(row => {   // for each row in table Engineering
        let line = this.statTable.get(row.merged_product_name);
        // update stat object
        if (line[m.month])
          line[m.month] += row.quantity;
        else
          line[m.month] = row.quantity;
      });
    });

    //console.log(this.statTable);
    /*   {
        merged_product_code:2073
        merged_product_name:"Cheese Pizza 10\""
        order_num_per_product:156
        price:"7.95"
        prod_category_id:483
        prod_food_cost:"1"
        product_id:5015
        quantity:156
        timestamp:"2020-01-02T12:00:00.000Z"
        } */

    this.loading = false;
    //this.messageService.show("Stat loaded " + engArr.length + "");

  }


  printPrepare(v) {
    // if (this.active == 2)
    //   this.flow.printPrepare(v);
  };


}

