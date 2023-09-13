import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AwsService } from '../../../service/aws.service';
import { GlobalService } from '../../../service/global.service';
import { MessageService } from '../../../service/message.service';
import { Menu } from '../../menu-editor/menu/menu-table.component';

export interface Feature {
  menu: string,
  start: NgbDateStruct,
  stop: NgbDateStruct,
  ckbox_mon : boolean,
  ckbox_tue : boolean,
  ckbox_wed : boolean,
  ckbox_thu : boolean,
  ckbox_fri : boolean,
  ckbox_sat : boolean,
  ckbox_sun : boolean,
  ckbox_all : boolean,
  t00_04 : boolean,
  t04_08 : boolean,
  t08_12 :  boolean,
  t12_16 : boolean,
  t16_20 : boolean,
  t20_00 : boolean,
}

@Component({
  selector: 'app-feature_selection',
  templateUrl: './feature_selection.component.html',
  styleUrls: ['./feature_selection.component.css']
})



export class FeatureSelectionComponent implements OnInit {
  public menuMenuHeader: Menu[];

  // data structure values
  public feature : Feature = {
    menu: 'Please select a Menu',
    start: { day: 1, month: 5, year: 2020 }, 
    stop: { day: 20, month: 5, year: 2021 },
    ckbox_mon : false,
    ckbox_tue : false,
    ckbox_wed : false,
    ckbox_thu : false,
    ckbox_fri : false,
    ckbox_sat : false,
    ckbox_sun : false,
    ckbox_all : true,
    t00_04 : true,
    t04_08 : true,
    t08_12 :  true,
    t12_16 : true,
    t16_20 : true,
    t20_00 : true,
  }


  constructor(protected awsService: AwsService,
    protected messageService: MessageService,
    public globalService: GlobalService,
  ) {
  }

  /*************************************************************************
  *  get and modify data to display  
  */
  async ngOnInit() {
    this.menuMenuHeader = await this.awsService.getMenus();
  }

  /*****************************************************
  *   select category dropdown
  */
  async onMenuSelect(i) {
    this.feature.menu = this.menuMenuHeader[i].menu_name;  // select item
  }

}
