import { formatDate } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AwsService } from '../../service/aws.service';
import { CognitoServiceProvider } from '../../service/cognito-service';
import { GlobalService } from '../../service/global.service';
import { MessageService } from '../../service/message.service';

import * as introJs from 'intro.js/intro.js';


export interface Structure {
  role_name: string,
  role_description: string,
  structure_name: string,
  structure_owner: string,
  structure_incharge: string,
  structure_id: number,
  structure_email: string,
  structure_contract: string,
  structure_activation: string,
  structure_expiration: string,
  structure_channel: string,
  // structure_priceidentity: "40",
  // structure_covers: 100,
  currency: string,
  structure_street: string,
  structure_zipcode: string,
  structure_city: string,
  structure_region: string,
  structure_country: string,
  structure_phone: string,
  username: string,
  // "password": "oven360prod",
  // "account_activation": "2020-02-12T00:00:00.000Z",
  // "account_expire": "2031-07-12T00:00:00.000Z",
  // "account_status": "active",
  // "account_email": "faricci@gmail.com",
  // "account_street": "1349 Grand Marais West",
  // "account_zipcode": "N9E 1E3",
  // "account_city": "Windsor",
  // "account_region": "Canada",
  // "account_country": "Canada",
  // "account_phone": "+395552584369",
}

declare var $: any;

@Component({
  selector: 'app-structures',
  templateUrl: 'structures.component.html',
  styleUrls: ['./structures.component.css']
})

export class StructuresComponent implements AfterViewInit {
  public structureList: Structure[] = [];
  public title = 'Structures';
  public btnRefresh = true;
  public btnNew = true;
  public selectedStructure: string = "";
  public newS: Structure = {
    role_name: "",
    role_description: "",
    structure_name: "",
    structure_owner: "",
    structure_channel: "",
    structure_incharge: "active",
    structure_id: 0,
    structure_email: "",
    structure_contract: "1",
    structure_activation: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
    structure_expiration: "2099-01-01",
    currency: "€",
    structure_street: "xxxx",
    structure_zipcode: "xxxx",
    structure_city: "xxxx",
    structure_region: "xxxx",
    structure_country: "xxxx",
    structure_phone: "",
    username: "",
  }

  constructor(
    private cognitoService: CognitoServiceProvider,
    protected awsService: AwsService,
    protected messageService: MessageService,
    private globalService: GlobalService
  ) {

  }

  start_tour(){
    introJs().start();
  }

  isUserLogged() {
    return this.cognitoService.isUserLogged();
  }

  /***************************************************************************
   * Init function 
   */
  async ngAfterViewInit() {
    // check user logged
    if (!this.cognitoService.isUserLogged()) {
      // this.messageService.show("Please login first.");
      return;
    }

    // if (!this.awsService.getStrId()) 
    //   this.selectedStructure = this.awsService.getStrName();

    // SEND message when selected structure change - to all interested
    this.globalService.selectedStructure.subscribe(message => {
      this.selectedStructure = message;
      // console.log("Structures",message);
    });

    // receive message when login complete - from LOGIN component
    // this.globalService.loginStatus.subscribe(async message => {
    //   if (message == 'LOGIN_COMPLETE') {
    //     this.refreshData();
    //     // console.log("After login",this.structureList);
    //   }
    // });

    this.refreshData();

  }


  /********************************************************
*  Refresh function
*/
  async refreshData() {
    // check user logged
    if (!this.cognitoService.isUserLogged()) {
      this.messageService.show("Please login first.")
      return;
    }

    // load all structures
    this.structureList = await this.awsService.getStructures();

    // if onely store, then select it
    if (this.structureList.length == 1)
      this.setActive(0);

  }

  /********************************************************
 *  Refresh button pressed
 */
  refresh = () => {
    // console.log("Refresh");
    this.refreshData();
  }

  /********************************************************
*  New button pressed
*/
  new = () => {
    // console.log("New");
    // open Modal through jQuery
    $("#newStructModal").modal('show');
    // this.refreshData();
  }


  /********************************************************
*  Sace Changes button pressed
*/  save_changes() {
    // console.log("Save");
    this.awsService.saveStructure([this.newS]).then(result => {
      this.messageService.show("" + result);
      // reload structures
      this.refreshData();
    })

  }

  /********************************************************
*  Active button pressed
*/
  setActive(index) {
    this.awsService.setStore(this.structureList[index].structure_id, this.structureList[index].structure_name);

    this.selectedStructure = this.structureList[index].structure_name;
    this.globalService.changeSelectedStructure(this.selectedStructure)
    // console.log("Active");
  }


  export() { }
  savetable() { }
}

