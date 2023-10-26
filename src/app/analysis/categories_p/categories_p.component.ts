import { AfterViewInit, ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Printable } from '../../prod-table/printable.component';
import { MessageService } from '../../service/message.service';
import { TableLib } from '../../prod-table/lib/table-lib';
import { DateRangeComponent } from '../../views/daterange/daterange.component';
import { AwsService } from '../../service/aws.service';
import { GlobalService } from '../../service/global.service';
import { TimeRangeComponent } from '../../views/timerange/timerange.component';
import { CognitoServiceProvider } from '../../service/cognito-service';
import { Engineering } from '../engineering/engineering.component';
import { Category } from '../../prod-table/cat-table.component';

export interface Period {
  start: NgbDateStruct,
  stop: NgbDateStruct
}



@Component({
  templateUrl: 'categories_p.component.html',
  styleUrls: ['./categories_p.component.css'],
})

export class categories_pComponent extends Printable {
  public loading: boolean = false;
  public title = "Category Performance"
  public active = 1;
  start: string;   // start date
  stop: string;    // stop dateù
  // hash map/table
  ht: Map<string, Object> = new Map();
  btnRefresh = true;


  // @ViewChildren(DateRangeComponent) daterange;
  @ViewChild(DateRangeComponent, { static: false }) daterangeComponent: DateRangeComponent;
  @ViewChildren(TimeRangeComponent) timerange;



  constructor(private messageService: MessageService,
    protected ngbDateParserFormatter: NgbDateParserFormatter,
    protected awsService: AwsService,
    protected globalService: GlobalService,
    public cognitoService: CognitoServiceProvider,
    protected cdRef: ChangeDetectorRef) {
    super();

  }


  ngAfterViewInit() {
    // set start date
    this.daterangeComponent.date1 = { year: 2010, month: 1, day: 1 };
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

    // this.globalService.order_loading = true;
    this.loading = true;

    this.start = this.ngbDateParserFormatter.format(this.daterangeComponent.date1); // e.g. myDate = 2017-01-01
    this.stop = this.ngbDateParserFormatter.format(this.daterangeComponent.date2); // e.g. myDate = 2017-01-01

    let engArr: Engineering[];
    // get eng data    invoke API Gateway Service , async /await 
    engArr = await this.awsService.getEngineeringV2(this.start, this.stop);
    // get all categories
    let catArr: Category[] = await this.awsService.getCategories();

    // stat for full menu
    const tot_qty_all = TableLib.sum(engArr.map(x => x.quantity));
    const tot_invoice_all = TableLib.sum(engArr.map(x => Number(x.price)*x.quantity));
    const tot_fcs_all = TableLib.sum(engArr.map(x => Number(x.prod_food_cost)*x.quantity));

    engArr.forEach(row => {   // for each row in table Engineering
      let catFound = catArr.find(x => x.categoryid == row.prod_category_id);  // find corresponding category

      //products in the given category
      let filtered_array = engArr.filter(x => x.prod_category_id == row.prod_category_id);
      let prices = filtered_array.map(x => Number(x.price));
      //Pac = media del prezzo di vendita degli items di una categoria
      let avg_price = TableLib.average(prices);

      //Adc = totale fatturato items venduti di una categoria / totale quantità items venduti
      let tot_invoice = 0, tot_qty = 0, tot_fcs = 0;
      filtered_array.forEach(x => {
        tot_invoice+=Number(x.price)*x.quantity;
        tot_qty+=x.quantity;
        tot_fcs+= Number(x.prod_food_cost)*x.quantity; // sum all food cost of a category
      } )

      //Igp = rapporto tra Adc / Pac
      let fcs = filtered_array.map(x => Number(x.prod_food_cost)/Number(x.price));
      //Pac = media del prezzo di vendita degli items di una 
      let avg_fcs = TableLib.average(fcs) * 100;

      //Fcp = media food cost degli items di una categoria

      //Fcc = totale food cost items di una categoria/ totale quantità items venduti
      //Discordanza = rapporto tra fcc e fcp

      // Incid pop categoria = totale quantità items venduti categoria / totale quantità items venduti nell'intero menu

      //Incid contrib categoria = totale quantità contribuzione categoria 
      // (ovvero totale fatturato categoria - totale food cost categoria) / totale contribuzione intero menu

      //Incid produzione categoria = totale fatturato categoria / totale fatturato menu

      //Incid costo categoria = totale food cost categoria/ totale food cost intero menu

      // update stat object
      let stat = {
        pac: avg_price,
        adc: tot_invoice/tot_qty,
        igp: 0,
        fcp: avg_fcs,
        fcc: tot_fcs/tot_invoice * 100,
        discordanza : 0,
        i_pop_cat: tot_qty / tot_qty_all * 100,
        i_contrib_cat : (tot_invoice-tot_fcs) / (tot_invoice_all-tot_fcs_all)*100,
        i_prod_cat : tot_invoice / tot_invoice_all * 100,
        i_cost_cat: tot_fcs / tot_fcs_all * 100
      }
      stat.igp=stat.adc/stat.pac * 100;
      stat.discordanza= stat.fcp / stat.fcc * 100;

      /*
      let stat = {
        pac: avg_price,
        adc: tot_invoice/tot_qty,
        igp: (tot_invoice/tot_qty)/ avg_price * 100,
        fcp: avg_fcs,
        fcc: tot_fcs/tot_qty * 100
      }*/
      //store into hashmap
      this.ht.set(catFound.name, stat);
    });

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

    //console.log(this.ht);

    this.loading = false;
    this.messageService.show("Stat loaded " + engArr.length + "");

  }


  printPrepare(v) {
    // if (this.active == 2)
    //   this.flow.printPrepare(v);
  };


  public ngbToString(date) {
    return TableLib.ngbToString(date);
  }


}

