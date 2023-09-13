import { Injectable, isDevMode } from '@angular/core';
import { Product, ProductMerged } from '../prod-table/prod-table.component';
import { Category } from '../prod-table/cat-table.component';
import { MessageService } from './message.service';
import { CognitoServiceProvider } from '../service/cognito-service'
import { Engineering } from '../analysis/engineering/engineering.component';
import { Order } from '../prod-table/order/order-table.component';
import * as moment from 'moment';
import { Revpash } from '../prod-table/revpash/revpash-table.component';
import { v4 as uuidv4 } from 'uuid';
import { Structure } from '../prod-table/structures/structures.component';
import { GlobalService } from './global.service';
import { Menu } from '../analysis/menu-editor/menu/menu-table.component';
import { MenuProduct } from '../analysis/menu-editor/menu-editor.component';
import { OrderCacheService } from './cache.service';
import { LZStringService } from 'ng-lz-string';
import { TableLib } from '../prod-table/lib/table-lib';
import { String } from 'aws-sdk/clients/appstream';

const pako = require('pako');

declare var apigClientFactory;

var print = console.log.bind(console);



@Injectable({
  providedIn: 'root'
})

export class AwsService {
  public apigClient;
  private total_records: number = 0;


  /**********************************************************************************************
   *             Constructore
   */
  constructor(
    public messageService: MessageService,
    public cognitoService: CognitoServiceProvider,
    private globalService: GlobalService,
    private orderCache: OrderCacheService,
    private lz: LZStringService,
  ) {
    this.apigClient = apigClientFactory.newClient({
      accessKey: '',
      secretKey: '',
      sessionToken: sessionStorage.getItem('awstkn'),
      region: '',
      apiKey: undefined,
      defaultContentType: 'application/json',
      defaultAcceptType: 'application/json'
    });
  }



  /**********************************************************************************************
  *              handle session timeout
  */
  sessionTimeout() {
    this.messageService.show("User session timeout. Please re-login");
    this.cognitoService.logout();   // if session not found, then logout
    sessionStorage.clear();
  }



  setStore(structureId: number, structureName: string) {
    const store = {
      id: structureId,
      name: structureName
    }
    sessionStorage.setItem('store', JSON.stringify(store));
  }

  getStrId(): number {
    if (sessionStorage.length == 0 || sessionStorage.getItem('store') == undefined)  // array empty
      return undefined;
    return JSON.parse(sessionStorage.getItem('store')).id;
  }
  getStrName(): string {
    const store = sessionStorage.getItem('store');
    if (store)
      return JSON.parse(sessionStorage.getItem('store')).name;
    return null;
  }


  /**********************************************************************************************
 *              get ID unique by logged user
 */
  async getStructures(): Promise<Structure[]> {
    return await this.getContent('structures', {}, this.apigClient.structuresAdmin, true);
  }



  /**********************************************************************************************
   *             clear structure in local sessionStorage
   */
  clearSession(data: string) {   // remove local stored information
    sessionStorage.removeItem(data);
  }

  clearAll() {
    sessionStorage.clear();
  }

  checkAwsToken() {
    return sessionStorage.getItem('awstkn') != null;
  }

  /**********************************************************************************************
   *              Invoke API gateway or loa form local sessionStorage
   */
  async getContent(dataName: string, params, apiGw_fun, nocache?: boolean, cacheKey?: string): Promise<any> {
    let retData: any; // any  array

    var promise = new Promise((resolve, reject) => {

      // print("getContent", dataName);
      cacheKey = cacheKey ? cacheKey : dataName;

      // data is present inside sessionStorage the return immediately
      if (!nocache && sessionStorage.getItem(cacheKey) && sessionStorage.getItem(cacheKey) != ''
        && sessionStorage.getItem(cacheKey) != 'undefined') {
        retData = JSON.parse(sessionStorage.getItem(cacheKey));
        // save stats
        const cacheHits = this.globalService.has('cacheHits') ? this.globalService.getItem('cacheHits') + 1 : 1;
        this.globalService.setItem('cacheHits', cacheHits);
        // console.log("GetContent from CACHE", cacheKey, cacheHits);
        return resolve(retData);
      }

      // console.log("Token: ", sessionStorage.getItem('awstkn').substring(0, 20));
      // invoke api gateway to receive data remotely
      apiGw_fun(params).then((result) => {
        // print("apiGw_fun " + dataName, result);
        if (result != undefined) {
          if (!result.data[dataName]) // no roders found
            resolve([]);
          if (result.data.meta)   // pagination totals
            this.total_records = result.data.meta.total_records;
          if (!nocache) // save only if cache enable
            sessionStorage.setItem(cacheKey, JSON.stringify(result.data[dataName]));  // save to sessionStorage
          if (result.data.meta)   // pagination totals
            this.total_records = result.data.meta.total_records;
          retData = result.data[dataName];                  //indentify data by name;
          // save stats
          const dbGET = this.globalService.has('dbGET') ? this.globalService.getItem('dbGET') + 1 : 1;
          this.globalService.setItem('dbGET', dbGET);
          // console.log("GetContent from DB", dataName,dbGET );      //debug

          resolve(retData);
        }
      }, (error) => {  // error
        print('getContent1 ERROR ' + dataName, error);
        this.messageService.show("HTTP request failed." + error.data);
        // this.sessionTimeout();
      });
    });

    return promise;
  }


  /**************************************************************** */
  async getEngineeringV2(start: string, stop: string): Promise<Engineering[]> {     // get revpash table
    const f = moment(start).format('YYYY-MM-DD');    // reformat date
    const t = moment(stop).format('YYYY-MM-DD');     // reformat date

    const params = {
      'structureid': this.getStrId(),
      'start': f + ' 00:00:00',
      'stop': t + ' 23:59:59',
    }

    let retData: any; // any  array

    return new Promise((resolve, reject) => {
      const dataName = 'data';


      // console.log("Token: ", sessionStorage.getItem('awstkn').substring(0, 20));
      // invoke api gateway to receive data remotely
      this.apigClient.engineeringGet(params).then((result) => {
        // print("apiGw_fun " + dataName, result);
        if (result != undefined) {
          // no items found
          // if (!result.data[dataName]) // no items found
          if (!result.data) // no items found
            resolve([]);
          // base64 -> binary
          const from64b = atob(result.data);

          // const strData = result.data;
          const data = JSON.parse(from64b);

          // pagination totals
          // if (result.data.meta)
          //   this.total_records = result.data.meta.total_records;

          // if (result.data.meta)   // pagination totals
          //   this.total_records = result.data.meta.total_records;

          //indentify data by name;
          retData = data.body;
          // save stats
          const dbGET = this.globalService.has('dbGET') ? this.globalService.getItem('dbGET') + 1 : 1;
          this.globalService.setItem('dbGET', dbGET);
          // console.log("GetContent from DB", dataName,dbGET );      //debug

          resolve(retData);
        }
      }, (error) => {  // error
        print('getEngineeringV2 ERROR ' + dataName, error);
        this.messageService.show("HTTP request failed." + error.data);
        // this.sessionTimeout();
      });
    });


  }



  /**************************************************************** */
  async getEngineering(start, stop): Promise<Engineering[]> {     // get revpash table

    const cache_name = 'eng_' + start + '_' + stop;

    // data is present inside sessionStorage the return immediately
    if (sessionStorage.getItem(cache_name)) {
      const cacheData = JSON.parse(sessionStorage.getItem(cache_name))
      // save stats
      const cacheHits = this.globalService.has('cacheHits') ? this.globalService.getItem('cacheHits') + 1 : 1;
      this.globalService.setItem('cacheHits', cacheHits);
      console.log("Served Engineering from CACHE", cacheHits);
      return Promise.resolve(cacheData);
    }

    // load all orders in period
    let i = 0;
    const limit = 100;
    let engArr: Engineering[] = [];
    let load: Engineering[] = []; //
    do {
      load = await this.getEngineeringByPage(start, stop, i, limit);
      engArr = [...engArr, ...load];

      // send status to progress bar DBD component
      this.globalService.loadingStatus([engArr.length, this.total_records]);
      if (i == 0)
        this.messageService.show("Loading " + this.total_records + " records ..");
      i += limit;
      // print("exist = " + this.queryExist + ", Stop = " + this.stopOldQuery);
      print("getEngineering: " + load.length);
    }
    while (load.length == limit);

    // update further fields
    engArr.forEach(row => {
      // calculate contribution
      row.item_contrib = row.item_price - row.prod_food_cost;
      row.total_contrib = row.item_contrib * Number(row.order_num_per_product);

      // calculate incidence
      row.item_incidence = row.prod_food_cost / row.item_price * 100;
    });


    // save cache / sessionStorage
    sessionStorage.setItem(cache_name, JSON.stringify(engArr));

    return engArr;
  }

  /**************************************************************** */
  async getEngineeringByPage(start: string, stop: string, offset?: number, limit?: number): Promise<Engineering[]> {     // get revpash table
    const f = moment(start).format('YYYY-MM-DD');    // reformat date
    const t = moment(stop).format('YYYY-MM-DD');     // reformat date

    const params = {
      'structureid': this.getStrId(),
      'start': f + ' 00:00:00',
      'stop': t + ' 23:59:59',
      'offset': offset,
      'limit': limit
    }

    let retData: any; // any  array

    return new Promise((resolve, reject) => {
      const dataName = 'data';


      // console.log("Token: ", sessionStorage.getItem('awstkn').substring(0, 20));
      // invoke api gateway to receive data remotely
      this.apigClient.structuresEngineeringInfoGet(params).then((result) => {
        // print("apiGw_fun " + dataName, result);
        if (result != undefined) {
          // no items found
          if (!result.data[dataName]) // no items found
            resolve([]);

          // pagination totals
          if (result.data.meta)
            this.total_records = result.data.meta.total_records;

          if (result.data.meta)   // pagination totals
            this.total_records = result.data.meta.total_records;

          //indentify data by name;
          retData = result.data[dataName];
          // save stats
          const dbGET = this.globalService.has('dbGET') ? this.globalService.getItem('dbGET') + 1 : 1;
          this.globalService.setItem('dbGET', dbGET);
          // console.log("GetContent from DB", dataName,dbGET );      //debug

          resolve(retData);
        }
      }, (error) => {  // error
        print('getEngineeringByPage ERROR ' + dataName, error);
        this.messageService.show("HTTP request failed." + error.data);
        // this.sessionTimeout();
      });
    });


  }

  /**************************************************************** */
  async getRevpash(menuId): Promise<Revpash[]> {     // get revpash table
    return await this.getContent('revpash', { 'menuid': menuId }, this.apigClient.structuresMenuRevpashGet);
  }

  /**************************************************************** */
  async getMenus(nocache?): Promise<Menu[]> {
    const strID = this.getStrId();
    if (strID) {
      const params = { 'structureid': this.getStrId() }
      return await this.getContent('menu', params, this.apigClient.structuresMenu, nocache);
    }
    return Promise.resolve([]); // return empty
  }


  /**************************************************************** */
  async getProducts(): Promise<Product[]> {
    // structure ID parameter
    const params = { 'structureid': this.getStrId() }   // build params 
    // get products from DB
    const products = await this.getContent('product', params, this.apigClient.structureProductsGet);
    // get product Groups
    const pg = await this.getProductMergeds();
    products.forEach(p => {
      const pg_found = pg.find(x => x.product_id == p.product_id);
      if (pg_found) {
        p.product_merged_name = pg_found.name;
        p.product_merged_code = pg_found.code;
      }
    });
    return products;
  }

  /**************************************************************** */
  async getProductMergeds(): Promise<ProductMerged[]> {
    const params = { 'structureid': this.getStrId() }   // build params 
    return await this.getContent('product', params, this.apigClient.structureProductMergeGet, false, 'productGroup');
  }


  public queryExist: boolean = false;
  public stopOldQuery: boolean = false;
  /**************************************************************** 
   *  GET ALL ORDERS
  */
  async getAllOrders(start: string, stop: string): Promise<Order[]> {
    let orders: Order[] = [];
    let load: Order[] = [];

    // check wheter request can be answered in cache
    const check = this.orderCache.match(start, stop);
    if (check.value) {
      orders = this.orderCache.get(start, stop);
      // save stats
      const cacheHits = this.globalService.has('cacheHits') ? this.globalService.getItem('cacheHits') + 1 : 1;
      this.globalService.setItem('cacheHits', cacheHits);
      return orders;
    }

    if (!check.start) {
      check.start = start;
      check.stop = stop;
    }


    if (this.queryExist) this.stopOldQuery = true;
    // load all orders in period
    let i = 0;
    const limit = 100;
    // let pageArray: string[] = [];
    this.queryExist = true;
    do {
      load = await this.getOrdersByPage(check.start, check.stop, i, limit);
      orders = [...orders, ...load];

      // send status to progress bar DBD component
      this.globalService.loadingStatus([orders.length, this.total_records]);
      if (i == 0)
        this.messageService.show("Loading " + this.total_records + " orders ..");
      i += limit;
      // print("exist = " + this.queryExist + ", Stop = " + this.stopOldQuery);
      print("getAllOrders: " + load.length);
    }
    while (load.length == limit && !this.stopOldQuery);

    if (!this.stopOldQuery) {
      // remove options
      orders.forEach(o => delete o.forecast_item_options);    // delete unused
      // add results to local cache .
      orders = this.orderCache.add(orders, check.start, check.stop);
    }
    this.queryExist = false;
    this.stopOldQuery = false;
    // print("getAllOrders : " + orders.length);

    // save stats
    const dbGET = this.globalService.has('dbGET') ? this.globalService.getItem('dbGET') + 1 : 1;
    this.globalService.setItem('dbGET', dbGET);



    //******
    // if (isDevMode() && false)
    //   localStorage.setItem('order_cache', JSON.stringify(orders));

    return orders;
  }



  /**********************************************************************************************
     *              Invoke API gateway or loa form local sessionStorage
     */
  private async getOrdersByPage(start: string, stop: string, offset?: number, limit?: number): Promise<any> {
    let retData: any; // any  array

    // get orders History
    const f = moment(start).format('YYYY-MM-DD');    // reformat date
    const t = moment(stop).format('YYYY-MM-DD');     // reformat date
    const dataName = 'forecast';

    const params = {
      'structureid': this.getStrId(),
      'start': f + ' 00:00:00',
      'stop': t + ' 23:59:59',
      'offset': offset,
      'limit': limit
    }

    var promise = new Promise((resolve, reject) => {

      // invoke api gateway to receive data remotely
      this.apigClient.structuresForecastInfoGet(params).then((result) => {

        if (result != undefined) {
          if (!result.data[dataName]) // no orders found
            resolve([]);

          if (result.data.meta)   // pagination totals
            this.total_records = result.data.meta.total_records;
          retData = result.data[dataName];                  //indentify data by name;
          // save stats
          const dbGET = this.globalService.has('dbGET') ? this.globalService.getItem('dbGET') + 1 : 1;
          this.globalService.setItem('dbGET', dbGET);
          // console.log("GetContent from DB", dataName,dbGET );      //debug

          resolve(retData);
        }
      }, (error) => {  // error
        print('getOrdersByPage ERROR', error);
        this.messageService.show("HTTP request failed - session timeout " + error.data);
        // this.sessionTimeout();
      });
    });

    return promise;
  }

  /****************************************************************++
   * 
   */
  async getAllOrdersV2(start: string, stop: string): Promise<Order[]> {
    let orders: Order[] = [];
    let retData: any;

    // call new
    // get orders History
    const f = moment(start).format('YYYY-MM-DD');    // reformat date
    const t = moment(stop).format('YYYY-MM-DD');     // reformat date

    const params = {
      'structureid': this.getStrId(),
      'start': f,//+ ' 00:00:00',
      'stop': t,//+ ' 23:59:59',
    }

    var promise: Promise<Order[]> = new Promise((resolve, reject) => {

      // invoke api gateway to receive data remotely
      // this.apigClient.structuresForecastInfoGet(params).then((result) => {
      this.apigClient.ordersGet(params).then((result) => {

        if (result != undefined) {
          if (!result.data) // no orders found
            resolve([]);

          // base64 -> binary
          const compressed = atob(result.data);

          // Convert binary string to character-number array
          var charData = compressed.split('').map(function (x) { return x.charCodeAt(0); });

          // Turn number array into byte-array
          var binData = new Uint8Array(charData);
          let strData = '';
          try {
            let uncompressed = pako.inflate(binData);
            // Convert gunzipped byteArray back to ascii string:
            let strData1 = TableLib.arrayBufferToBase64(uncompressed);
            // base64 -> string
            strData = atob(strData1);
          } catch (err) {
            console.log(err);
            resolve([]);
          }

          // const strData = result.data;
          const data = JSON.parse(strData);

          if (data.total_records)   // pagination totals
            this.total_records = data.total_records;
          retData = data.body;                  //indentify data by name;

          // save stats
          const dbGET = this.globalService.has('dbGET') ? this.globalService.getItem('dbGET') + 1 : 1;
          this.globalService.setItem('dbGET', dbGET);

          resolve(retData);
        }
      }, (error) => {  // error
        print('getAllOrdersV2 ERROR', error);
        this.messageService.show("HTTP request failed" + error.data);
        // this.sessionTimeout();
        resolve([]);
      });
    });


    return promise;
  }

  /****************************************************************
   * 
   */
  async getCategories(): Promise<Category[]> {
    let retData: Category[];

    // data is present inside sessionStorage the return immediately
    if (sessionStorage.getItem('categories')) {
      retData = JSON.parse(sessionStorage.getItem('categories'));
      // save stats
      const cacheHits = this.globalService.has('cacheHits') ? this.globalService.getItem('cacheHits') + 1 : 1;
      this.globalService.setItem('cacheHits', cacheHits);

      // console.log("sessionStorage", retData);
      return Promise.resolve(retData);
    }


    return new Promise(async (resolve, reject) => {

      // print("getContent", dataName);
      const params = {
        'structureid': this.getStrId(),
      }
      // invoke api gateway to receive data remotely
      this.apigClient.structuresAdminGet(params).then((result) => {
        if (result != undefined && result.data['structures'] != undefined) {
          const categories = result.data.structures.find(s => s.structure_id == params.structureid).category;
          sessionStorage.setItem('categories', JSON.stringify(categories));  // save to sessionStorage
          retData = categories;                  //indentify data by name;
          // save stats
          const dbGET = this.globalService.has('dbGET') ? this.globalService.getItem('dbGET') + 1 : 1;
          this.globalService.setItem('dbGET', dbGET);

          // resolve(retData);
          if (!categories)
            reject();
          resolve(retData);
        }
        else
          retData = [];
        // console.log("getGenericContent finally return", retData);
        // resolve(retData);
      }, (error) => {  // error
        print('getCategories ERROR', error);
        this.messageService.show("HTTP request failed " + error.data);
        reject([]);
        //this.sessionTimeout();
      });
    });


  }


  /***************************************************************
 * Save products all together
 */
  async deleteProductMergeds(groupArray: ProductMerged[]) {
    let obj = { data: [] }

    groupArray.forEach(group => {
      const row =
      {
        tablename: 'sbraf_product_merged',
        tablebody: {      // convert each field to string
          // product_id: group.product_id,
          // name: String(group.name),
          code: group.code,
          // structure_id: this.getStrId()
        }
      }
      // if new product then delete ID
      if (group.code == 0) {  // if code 0, then is new item
        delete row.tablebody.code;
      }
      obj.data.push(row);
    });

    var apigClient = apigClientFactory.newClient({
      accessKey: '',
      secretKey: '',
      sessionToken: sessionStorage.getItem('awstkn'),
      region: '',
      apiKey: undefined,
      defaultContentType: 'application/json',
      defaultAcceptType: 'application/json'
    });

    var promise = new Promise<void>(async (resolve, reject) => {

      apigClient.structuresAdminDelete({}, obj).then((result) => {
        console.log("RESULT", result.data);
        resolve();

        // save stats
        const dbPOST = this.globalService.has('dbPOST') ? this.globalService.getItem('dbPOST') + 1 : 1;
        this.globalService.setItem('dbPOST', dbPOST);

      }, (result) => {
        print("ERROR", result);
      });
    }); // end promise
    return promise;
  }

  /***************************************************************
   * Save products all together
   */
  async saveProductMergeds(groupArray: ProductMerged[]) {
    let obj = { data: [] }

    groupArray.forEach(group => {
      const row =
      {
        tablename: 'sbraf_product_merged',
        tablebody: {      // convert each field to string
          product_id: group.product_id,
          name: String(group.name),
          code: group.code,
          structure_id: this.getStrId()
        }
      }
      // if new product then delete ID
      if (group.code == 0) {  // if code 0, then is new item
        delete row.tablebody.code;
      }
      obj.data.push(row);
    });

    var apigClient = apigClientFactory.newClient({
      accessKey: '',
      secretKey: '',
      sessionToken: sessionStorage.getItem('awstkn'),
      region: '',
      apiKey: undefined,
      defaultContentType: 'application/json',
      defaultAcceptType: 'application/json'
    });

    var promise = new Promise<void>(async (resolve, reject) => {

      apigClient.structuresAdminPost({}, obj).then((result) => {
        console.log("RESULT", result.data);
        resolve();

        // save stats
        const dbPOST = this.globalService.has('dbPOST') ? this.globalService.getItem('dbPOST') + 1 : 1;
        this.globalService.setItem('dbPOST', dbPOST);

      }, (result) => {
        print("ERROR", result);
      });
    }); // end promise
    return promise;
  }


  /***************************************************************
   * Save products all together
   */
  async saveProducts(prodArray: Product[]) {
    let obj = { data: [] }

    prodArray.forEach(product => {
      const row =
      {
        tablename: 'sbraf_product',
        tablebody: {      // convert each field to string
          product_id: product.product_id,
          product_name: String(product.product_name),
          product_code: product.product_code,
          product_sell_price: String(product.product_sell_price),
          product_quantity: product.product_quantity,
          product_note: String(product.product_note),
          product_category_id: product.product_category_id,
          product_description: String(product.product_description),
          product_discount: product.product_discount,
          product_enabled: String(product.product_enabled),
          product_kasavana_category: String(product.product_kasavana_category),
          product_input_source: String(product.product_input_source),
          product_food_cost_ext: product.product_food_cost_ext,
          product_structure_id: this.getStrId()
        }
      }
      // if new product then delete ID
      if (product.product_id == 1) {  // if product_id 1, then is new product
        delete row.tablebody.product_id;
        row.tablebody.product_code = product.product_structure_id + "_" + uuidv4();
      }
      obj.data.push(row);
    });

    var apigClient = apigClientFactory.newClient({
      accessKey: '',
      secretKey: '',
      sessionToken: sessionStorage.getItem('awstkn'),
      region: '',
      apiKey: undefined,
      defaultContentType: 'application/json',
      defaultAcceptType: 'application/json'
    });

    var promise = new Promise<void>(async (resolve, reject) => {

      apigClient.structuresAdminPost({}, obj).then((result) => {
        console.log("RESULT", result.data);
        resolve();

        // save stats
        const dbPOST = this.globalService.has('dbPOST') ? this.globalService.getItem('dbPOST') + 1 : 1;
        this.globalService.setItem('dbPOST', dbPOST);

      }, (result) => {
        print("ERROR", result);
      });
    }); // end promise
    return promise;
  }

  /*****************************************************
   * 
   */
  async saveMenus(menuArray: Menu[]) {
    let obj = { data: [] }

    menuArray.forEach(menu => {
      const row =
      {
        tablename: 'sbraf_menu',
        tablebody: {      // convert each field to string
          "menu_id": menu.menu_id,
          "menu_name": menu.menu_name,
          "menu_code": menu.menu_code,
          "menu_from": menu.menu_from,
          "menu_to": menu.menu_to,
          "menu_day_0": false,
          "menu_day_1": false,
          "menu_day_2": false,
          "menu_day_3": false,
          "menu_day_4": false,
          "menu_day_5": false,
          "menu_day_6": false,
          "menu_description": menu.menu_description,
          "menu_products": menu.menu_products,
          "menu_structure_id": this.getStrId()
        }
      }

      // if new menu then delete ID
      if (!menu.menu_id) { // if menu_id "", then is new menu
        delete row.tablebody.menu_id;
      }
      obj.data.push(row);
    });


    var apigClient = apigClientFactory.newClient({
      accessKey: '',
      secretKey: '',
      sessionToken: sessionStorage.getItem('awstkn'),
      region: '',
      apiKey: undefined,
      defaultContentType: 'application/json',
      defaultAcceptType: 'application/json'
    });

    var promise = new Promise<void>(async (resolve, reject) => {

      apigClient.structuresAdminPost({}, obj).then(async (result) => {
        console.log("RESULT", result.data);
        resolve();

        // save stats
        const dbPOST = this.globalService.has('dbPOST') ? this.globalService.getItem('dbPOST') + 1 : 1;
        this.globalService.setItem('dbPOST', dbPOST);

      }, (result) => {
        print("ERROR", result);
      });
    }); // end promise
    return promise;
  }



  /**************************************************************** 
  *  SAVE category POST to api GW
  */
  async saveCategorys(catArray: Category[]) {
    let obj = { data: [] }

    if (!catArray.length)
      return;

    catArray.forEach(category => {
      const row =
      {
        tablename: 'sbraf_category',
        tablebody: {      // convert each field to string
          "category_name": category.name ? category.name : "",
          "category_code": category.code,
          "category_description": category.description,
          "category_max_perc_cost": category.max_perc_cost,
          "category_max_price_revenue": category.max_price_revenue,
          "category_visible": category.visible,
          "category_structure_id": this.getStrId(),  // add structure ID
          "category_id": category.categoryid    // convert format
        }
      }

      // if new category then delete ID
      if (!category.categoryid || category.categoryid == '0') {
        delete row.tablebody.category_id;
      }
      obj.data.push(row);
    });


    var apigClient = apigClientFactory.newClient({
      accessKey: '',
      secretKey: '',
      sessionToken: sessionStorage.getItem('awstkn'),
      region: '',
      apiKey: undefined,
      defaultContentType: 'application/json',
      defaultAcceptType: 'application/json'
    });

    var promise = new Promise(async (resolve, reject) => {

      // this.AWS.saveObj(obj);
      apigClient.structuresAdminPost({}, obj).then(async (result) => {
        console.log("RESULT", result.data);
        resolve(result.data);

        // save stats
        const dbPOST = this.globalService.has('dbPOST') ? this.globalService.getItem('dbPOST') + 1 : 1;
        this.globalService.setItem('dbPOST', dbPOST);

      }, (result) => {
        print("ERROR", result);
      });
    }); // end promise
    return promise;
  }


  /*************************************************************
   * 
   */
  async saveMenuProducts(menuID: number, menuProducts: MenuProduct[]) {
    let obj = { data: [] }

    menuProducts.forEach(mp => {
      const row =
      {
        tablename: 'sbraf_menu_productmerged',
        tablebody: {
          menu_id: menuID,
          product_merged_code: mp.product_merged_code,
          product_sellprice: mp.product_sellprice,
          product_foodcost: mp.product_foodcost
        }
      }
      obj.data.push(row);
    });

    var apigClient = apigClientFactory.newClient({
      accessKey: '',
      secretKey: '',
      sessionToken: sessionStorage.getItem('awstkn'),
      region: '',
      apiKey: undefined,
      defaultContentType: 'application/json',
      defaultAcceptType: 'application/json'
    });

    var promise = new Promise<void>(async (resolve, reject) => {

      // this.AWS.saveObj(obj);
      apigClient.structuresAdminPost({}, obj).then((result) => {
        console.log("RESULT", result.data);
        resolve();

        // save stats
        const dbPOST = this.globalService.has('dbPOST') ? this.globalService.getItem('dbPOST') + 1 : 1;
        this.globalService.setItem('dbPOST', dbPOST);

      }, (result) => {
        print('ERROR', result);
      });
    }); // end promise
    return promise;
  }



  /********************************************************
   * 
   */
  deleteMenuProducts(menuID: number, productCodes: number[]) {
    let obj = { data: [] }

    productCodes.forEach(productCode => {
      const row =
      {
        tablename: 'sbraf_menu_productmerged',
        tablebody: {
          menu_id: menuID,
          product_merged_code: productCode,
        }
      }
      obj.data.push(row);
    });

    var apigClient = apigClientFactory.newClient({
      accessKey: '',
      secretKey: '',
      sessionToken: sessionStorage.getItem('awstkn'),
      region: '',
      apiKey: undefined,
      defaultContentType: 'application/json',
      defaultAcceptType: 'application/json'
    });

    var promise = new Promise<void>(async (resolve, reject) => {

      apigClient.structuresAdminDelete({}, obj).then(async (result) => {
        console.log("RESULT", result.data);
        resolve();

        // save stats
        const dbDELETE = this.globalService.has('dbDELETE') ? this.globalService.getItem('dbPOST') + 1 : 1;
        this.globalService.setItem('dbDELETE', dbDELETE);

      }, (result) => {
        console.error("ERROR", result);
      });
    }); // end promise
    return promise;
  }



  /********************************************************
   * 
   */
  deleteMenus(menus: Menu[]) {
    let obj = { data: [] }

    menus.forEach(menu => {
      const row =
      {
        tablename: 'sbraf_menu',
        tablebody: {
          'menu_id': menu.menu_id,
        }
      }
      obj.data.push(row);
    });

    var apigClient = apigClientFactory.newClient({
      accessKey: '',
      secretKey: '',
      sessionToken: sessionStorage.getItem('awstkn'),
      region: '',
      apiKey: undefined,
      defaultContentType: 'application/json',
      defaultAcceptType: 'application/json'
    });

    var promise = new Promise<void>(async (resolve, reject) => {

      apigClient.structuresAdminDelete({}, obj).then(async (result) => {
        console.log("RESULT", result.data);
        resolve();

        // save stats
        const dbDELETE = this.globalService.has('dbDELETE') ? this.globalService.getItem('dbPOST') + 1 : 1;
        this.globalService.setItem('dbDELETE', dbDELETE);

      }, (result) => {
        console.error("ERROR", result);
      });
    }); // end promise
    return promise;
  }

  /**************************************************************** 
   * Create upload request
  */
  async preUpload(): Promise<string> {     // get revpash table

    const params = {
      'structureid': this.getStrId(),
    }

    return new Promise((resolve, reject) => {
      const dataName = 'data';

      // invoke api gateway to receive data remotely
      this.apigClient.preUpload(params).then((result) => {
        // print("apiGw_fun " + dataName, result);
        if (result != undefined) {
          // no items found
          // if (!result.data[dataName]) // no items found
          if (!result.data) // no items found
            resolve(null);
          // base64 -> binary
          const from64b = atob(result.data);

          // const strData = result.data;
          const upload_struct = JSON.parse(from64b);

          // upload_struct:
          // uploadURL_schema:'https://s3-bucket-sbraf-tier1-upload.s3.eu-central-1.amazonaws.com/Oven360%20LaSalle/schema_1107898_1621464948.json?Content-Type=application%2Fjson&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA2JPUZJZ6MWB5WEQR%2F20210519%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20210519T225548Z&X-Amz-Expires=360&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDGV1LWNlbnRyYWwtMSJHMEUCIFqj3i%2BOSZ9FB9u%2BxeGq6QBwW4ec3mtkqIolKzlYGUUcAiEA64LPEHTTkv2zOS%2BtqagrdtkIdj4IcSC%2FoiM…Y1phK8a%2BTMQLk6LT9soVteJAzF0DdSKLySb5bZr%2FFVo%2FIGVcMwv66WhQY64AE7hVlJGrOvdVCYiVbpptRW8Dax1hSx5QZgfLIiKrSs9qg7s6%2FDgjWPwcNrt3alVM%2BqruQA6yv8xi9tVdd%2BCaEzOVxXGUlS52zIl1n%2Fgfe3ld7j5QLizlthJ7un%2B0RbI%2FKY8YsjE35PtrGUtDmUatCTC5EP7nCeoRn%2BQoc0BcClsy49WbGPRwRcTChEP7KsoTlR%2BVHxxzj6DJXbF8Z3aU3SqUIdbbSixJoHidUsNsW75pb%2BVjuLTUitEqDesQ%2BS1O1j7080g0JNZQOnHK6gtpFMjxhviOImFlF0SUajWOdQrg%3D%3D&X-Amz-Signature=a1670995e34f22aa29b5679cb4d00c3d8ca76d734a05ad18ad9b0ee53a311169&X-Amz-SignedHeaders=host'
          // uploadURL_data:'https://s3-bucket-sbraf-tier1-upload.s3.eu-central-1.amazonaws.com/Oven360%20LaSalle/data_1107898_1621464948.csv?Content-Type=text%2Fcsv&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA2JPUZJZ6MWB5WEQR%2F20210519%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20210519T225548Z&X-Amz-Expires=360&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDGV1LWNlbnRyYWwtMSJHMEUCIFqj3i%2BOSZ9FB9u%2BxeGq6QBwW4ec3mtkqIolKzlYGUUcAiEA64LPEHTTkv2zOS%2BtqagrdtkIdj4IcSC%2FoiMGzzLPCHkq2A…Y1phK8a%2BTMQLk6LT9soVteJAzF0DdSKLySb5bZr%2FFVo%2FIGVcMwv66WhQY64AE7hVlJGrOvdVCYiVbpptRW8Dax1hSx5QZgfLIiKrSs9qg7s6%2FDgjWPwcNrt3alVM%2BqruQA6yv8xi9tVdd%2BCaEzOVxXGUlS52zIl1n%2Fgfe3ld7j5QLizlthJ7un%2B0RbI%2FKY8YsjE35PtrGUtDmUatCTC5EP7nCeoRn%2BQoc0BcClsy49WbGPRwRcTChEP7KsoTlR%2BVHxxzj6DJXbF8Z3aU3SqUIdbbSixJoHidUsNsW75pb%2BVjuLTUitEqDesQ%2BS1O1j7080g0JNZQOnHK6gtpFMjxhviOImFlF0SUajWOdQrg%3D%3D&X-Amz-Signature=3c08bd7a62f6289192e25efe9e56b7be7754f94ef5453b79a2be50298e349927&X-Amz-SignedHeaders=host'
          // SchemaKey:'Oven360 LaSalle/schema_1107898_1621464948.json'
          // DataKey:'Oven360 LaSalle/data_1107898_1621464948.csv'


          // console.log("Upload structure", upload_struct );      //debug

          resolve(upload_struct);
        }
      }, (error) => {  // error
        print('Upload request ERROR ' + dataName, error);
        this.messageService.show("HTTP request failed." + error.data);
        // this.sessionTimeout();
      });
    });
  }

  changeFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  /***************************************************************
   * Save structure
   */
  async saveStructure(structArray: Structure[]) {
    let obj = { data: [] }

    structArray.forEach(s => {
      const row =
      {
        tablename: 'sbraf_structure',
        tablebody: {      // convert each field to string
          structure_name: s.structure_name,
          structure_channel: s.structure_channel,
          structure_owner: s.structure_owner,
          structure_id: s.structure_id,
          structure_incharge: "active",
          structure_email: s.structure_email,
          structure_contract: s.structure_contract,
          structure_activation: s.structure_activation,
          structure_expiration: s.structure_expiration,
          structure_priceidentity: "40",
          structure_covers: "100",
          structure_currency: s.currency,
          location_street: s.structure_street,
          location_zipcode: s.structure_zipcode,
          location_city: s.structure_city,
          location_region: s.structure_region,
          location_country: s.structure_country,
          location_phone: s.structure_phone
        }
      }
      print("Tablebody:", row.tablebody);
      // if new product then delete ID
      if (s.structure_id == 0) {  // if product_id 0, then is new product
        delete row.tablebody.structure_id;
      }
      obj.data.push(row);
    });

    var apigClient = apigClientFactory.newClient({
      invokeUrl: 'https://gxolof8v73.execute-api.eu-central-1.amazonaws.com',
      region: 'eu-central-1',
      // accessKey:  sessionStorage.getItem('accessKeyId'),
      // secretKey:  sessionStorage.getItem('secretAccessKey'),
      // sessionToken: sessionStorage.getItem('sessionToken'),
      sessionToken: sessionStorage.getItem('awstkn'),

      // apiKey: undefined,
      // defaultContentType: 'application/json',
      // defaultAcceptType: 'application/json'
    });

    var promise = new Promise<String>(async (resolve, reject) => {

      apigClient.structuresAdminPost({}, obj).then((result) => {
        console.log("RESULT", result.data);
        resolve("SUCCESS");

        // save stats
        const dbPOST = this.globalService.has('dbPOST') ? this.globalService.getItem('dbPOST') + 1 : 1;
        this.globalService.setItem('dbPOST', dbPOST);

      }, (result) => {
        print("ERROR", result);
        resolve("ERROR " + result.status)
        // alert("POST ERROR");
      });
    }); // end promise
    return promise;
  }

}
