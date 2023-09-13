import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
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


@Component({
  templateUrl: 'categories_p.component.html',
  styleUrls: ['./categories_p.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})

export class categories_pComponent extends Printable {
  public loading: boolean = false;
  public title = "Category Performance"
  public active = 1;
  start: string;   // start date
  stop: string;    // stop date

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
    //    console.log(engArr);

    /*   {
    merged_product_code:2073
    merged_product_name : "Cheese Pizza 10\""
    order_num_per_product : 156
    price : "7.95"
    prod_category_id : 483
    prod_food_cost : "1"
    product_id : 5015
    quantity : 156
    timestamp : "2020-01-02T12:00:00.000Z"
        } */

    // trasform category ID into catagory name
    let catArr: Category[] = await this.awsService.getCategories();

    // hash map/table
    let ht: Map<string, Object> = new Map();

    let stat = {
      PAC: 0.0,
      ADC: 0.0,
      IGP: 0.0,
      FCP: 0.0,
      FCC: 0.0,
      DISCORDANZA: 0.0,
      INCID_POP: 0.0,
      INCID_CONTRIB: 0.0,
      INCID_PRODUZ: 0.0,
      INCID_COSTO: 0.0
    };

    engArr.forEach(row => {   // for each row in table Engineering
      let catFound = catArr.find(x => x.categoryid == row.prod_category_id);  // find corresponding category
      if (catFound != undefined) {
        // push unique keys to map
        ht.set(catFound.name, stat);
      }
    });

    console.log(ht);

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

