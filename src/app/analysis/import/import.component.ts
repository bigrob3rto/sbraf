import { AfterViewInit, Component, ElementRef, Input, isDevMode, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MessageService } from '../../service/message.service';
import { GlobalService } from '../../service/global.service';
import { AwsService } from '../../service/aws.service';
import { Printable } from '../../prod-table/printable.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Papa } from 'ngx-papaparse';
import { GridApi } from 'ag-grid-community';
import { cloneDeep } from 'lodash';


import { saveAs } from 'file-saver';
import { SocketService } from '../../service/socket.service';
import { CognitoServiceProvider } from '../../service/cognito-service';

import * as introJs from 'intro.js/intro.js';

import { catchError, takeUntil, takeWhile, timeout } from 'rxjs/operators';
import { interval, of } from 'rxjs';

// needed for modal
declare var $: any;

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css']
})




export class ImportComponent extends Printable implements OnInit, OnDestroy {
  title = "Import";
  public fileCsv;
  public fileSchema;
  public showEditor: boolean = false;
  public showPreview: boolean = false;
  public upload_struct: any; // save uplload reqeust value (CSV filename & schema)

  // schema fields fixed
  public schema = {
    csv_file_name: "csv_example.csv",
    locale: "Int",
    currency: "EUR",
    establishment: "1",
    establishment_name: "Hotel Europa",
    owner: this.cognitoService.getUserName(),
    date_from: "2021-01-01",
    date_to: "2021-06-01",
    header: "infer",
    separator: ",",
    schema: {
      // schema fields user
      order_id: 1,
      category: 2,
      price: 5,
      quantity: 4,
      product_name: 3,
      timestamp: 6,
      date: 7,
      time: 8,
      optionname: 9,
      optionquantity: 10,
      optionprice: 11,
    }
  }

  // array of { name : 'order_id', position : 1, disable : false}
  public schemaTable = [];
  public schema_edit_switch: boolean = false;

  @ViewChild('fileInput', { static: false }) schemaFileInput: ElementRef;

  // modal result - message list
  public resultLog = [];
  public resultTimer = 0;
  public closeDisabled = true;
  public pb_current = 0;

  public rowData: any = [];
  public domLayout = 'autoHeight';
  public gridApi: GridApi;
  public gridColumnApi;
  defaultColDef = {
    minWidth: 80,
    width: 110,
    flex: 1,
    filter: false,        // disable filter
    resizable: true,
    suppressMenu: true,   // disable column menu
    // sortable: true,
    // filter: 'agTextColumnFilter',
    // filterParams: { newRowsAction: 'keep' },
  };

  // theme
  public theme = 'ag-theme-blue';

  public columnDefs_init = [
    {
      field: 'order_id', valueGetter: params => params.data[this.schema.schema.order_id - 1],
      cellStyle: params => this.colorDisable(0)
    },
    {
      field: 'category', valueGetter: params => params.data[this.schema.schema.category - 1],
      cellStyle: params => this.colorDisable(1)
    },
    {
      field: 'product_name', valueGetter: params => params.data[this.schema.schema.product_name - 1],
      cellStyle: params => this.colorDisable(2)
    },
    {
      field: 'quantity', valueGetter: params => params.data[this.schema.schema.quantity - 1],
      cellStyle: params => this.colorDisable(3)
    },
    {
      field: 'price', valueGetter: params => params.data[this.schema.schema.price - 1],
      cellStyle: params => this.colorDisable(4)
    },
    {
      field: 'timestamp', valueGetter: params => params.data[this.schema.schema.timestamp - 1],
      cellStyle: params => this.colorDisable(5)
    },
    {
      field: 'date', valueGetter: params => params.data[this.schema.schema.date - 1],
      cellStyle: params => this.colorDisable(6)
    },
    {
      field: 'time', valueGetter: params => params.data[this.schema.schema.time - 1],
      cellStyle: params => this.colorDisable(7)
    },
    {
      field: 'optionname', valueGetter: params => params.data[this.schema.schema.optionname - 1],
      cellStyle: params => this.colorDisable(8)
    },
    {
      field: 'optionquantity', valueGetter: params => params.data[this.schema.schema.optionquantity - 1],
      cellStyle: params => this.colorDisable(9)
    },
    {
      field: 'optionprice', valueGetter: params => params.data[this.schema.schema.optionprice - 1],
      cellStyle: params => this.colorDisable(10)
    },
  ]

  private colorDisable(position) {
    if (this.schemaTable && this.schemaTable[position].disable)            //mark disabled cells as gray
      return { color: 'gray', backgroundColor: 'lightgray' };
    return null;
  }

  public columnDefs;// = this.columnDefs_init;


  constructor(
    protected messageService: MessageService,
    private cognitoService: CognitoServiceProvider,
    public globalService: GlobalService,
    protected awsService: AwsService,
    protected sanitizer: DomSanitizer,
    private papa: Papa,
    private socketService: SocketService,
  ) {
    super();
  }

  start_tour() {
    this.showPreview = true;
    setTimeout(() => {
      introJs().start();
    }, 0);
  }

  private socketSubscription;

  /*************************************************************************
  *  get and modify data to display  
  */
  ngOnInit() {
    // load theme from local storage
    this.theme = localStorage.getItem('ag-grid-theme');

    // fill up schema fields
    this.schema.establishment_name = this.awsService.getStrName();

    // subscribe to socket messages
    this.socketSubscription = this.socketService.channel
      .subscribe(message => {
        if (message) {
          // console.log("Received theme change: " + message);
          this.sktLog(message, message.includes('confirm') ? 'success' : 'info');

          // finished - enable dialog close
          if (message == "WebSocket closed.") {
            this.pb_current = 100;  // progress bar completed
            this.closeDisabled = false;
          }

        }
      });

    // receive updates about selected structure
    this.globalService.selectedStructure.subscribe(message => {
      if (message) {

        /*****************************************************
         *  clear all fields - when selected store changes
         * */
        this.fileCsv = null;
        this.rowData = [];
        this.showPreview = false;
      }
    });

  }

  ngOnDestroy() {
    // remove subscription
    this.socketSubscription.unsubscribe();
  }

  /**************************************************************+
   * Grid Ready Event
   */
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // console.log("*** onGridReady BS call refreshData");
    // this.refreshData();
  }


  private toIndex;
  private fromIndex;
  private toName;
  private fromName;
  /**************************************************************+
   * Drag finished event
   */
  onDragStopped(params) {
    // exchange column position
    this.schema.schema[this.fromName] = this.toIndex + 1;
    this.schema.schema[this.toName] = this.fromIndex + 1;
    params.columnApi.moveColumn(this.fromName, this.toIndex);
    params.columnApi.moveColumn(this.toName, this.fromIndex);

    // console.log(this.schema.schema)
    this.gridApi.redrawRows();
    // console.log(this.fromName + "(" + this.fromIndex + ") -> (" + this.toName + "(" + this.toIndex + ")")
  }

  /**************************************************************+
 * Column Moved event
 */
  onColumnMoved(params) {
    // calculate index and column titles to exchange
    this.toIndex = params.toIndex;   // dragTo index
    const schema_titles = Object.keys(this.schema.schema);    // array of schema titles
    const schema_values = Object.values(this.schema.schema);  // array of schema positions
    const findIndex = schema_values.indexOf(this.toIndex + 1);  // find toIndex position
    this.toName = schema_titles[findIndex];                  // get dragTo title

    if (params.column.colId) {
      this.fromName = params.column.colId;
      this.fromIndex = this.schema.schema[this.fromName] - 1;
    }
  }


  /**************************************************************+
   * extends  baseList refreshData
   */
  public refreshData() {
    // check store selected
    if (!this.awsService.getStrId()) {
      this.messageService.show("Please select Store first.")
      return;
    }
    this.loading = true;
    this.loading = false;             // reset loading spinner 


  }


  refresh = () => {
    this.refreshData();
  }


  // stopQuery() {}
  saveTable() { }
  export() { }
  printPrepare(v) { };


  canvasReport(params) {
    this.globalService.canvasReport(params);
  }

  async onFileCsvSelect(params) {
    this.fileCsv = params.target.files[0];

    // if no file selected then exit
    if (!this.fileCsv) {
      this.gridApi.setRowData(null);
      this.showPreview = false;
      return;
    }

    this.messageService.show("Selected CSV: " + this.fileCsv.name);
    this.showPreview = true;
    // show 'loading' overlay
    this.rowData = null;


    // console.log(this.fileCsv);

    let csvData = '"Hello","World!"';

    let fileReader = new FileReader();
    const self = this;

    // csv file loaded event
    fileReader.onload = (e) => {
      // console.log(fileReader.result);
      csvData = fileReader.result.toString();

      let options = {
        // Add your options here
        header: false,
        preview: 5,
        dynamicTyping: true,
        // escapeChar: '"',
        // delimiter: ","
      };

      // cvs parse to json
      const parse_result = this.papa.parse(csvData, options);
      const orders = parse_result.data;

      // reset columnDefs
      self.columnDefs = cloneDeep(self.columnDefs_init);
      self.gridApi.setColumnDefs(self.columnDefs);

      // clean schema from unknown columns
      Object.keys(self.schema.schema).forEach(title => {
        if (title.includes('unknown'))
          delete self.schema.schema[title];
      });

      // check columnDefs (number of columns)
      if (orders[0] && orders[0].length > self.columnDefs.length) {
        for (let i = self.columnDefs.length; i < orders[0].length; i++) {
          // console.log("Add col");
          self.columnDefs.push(
            { field: 'unknown' + i, valueGetter: params => params.data[this.schema.schema['unknown' + i] - 1] },
          )
          self.schema.schema['unknown' + i] = i + 1;
        }
        self.gridApi.setColumnDefs(self.columnDefs);
      }

      // clear all overlays
      self.rowData = orders;
      self.gridApi.redrawRows();

      // update enable/disable flags
      self.schemaTable = [];  // reinit
      const positions = Object.values(self.schema.schema);
      const values = Object.keys(self.schema.schema);
      for (let i = 0; i < values.length; i++) {
        self.schemaTable.push(
          {
            name: values[i],
            position: positions[i],
            disable: values[i].includes('unknown') ? true : false    // disable unknown
          }
        );
      }
      // default disable
      self.schemaTable.find(o => o.name == 'optionname').disable = true;
      self.schemaTable.find(o => o.name == 'optionquantity').disable = true;
      self.schemaTable.find(o => o.name == 'optionprice').disable = true;

      // IA suggest fields based on values
      const fields = orders[1];
      // console.log(order);
      // search for timestamp
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];  // current field
        const type = getDateType(field);
        if (type) {
          const old_name = self.schemaTable.find(o => o.position == (i + 1)).name;
          // exchange values
          self.schema.schema[old_name] = self.schema.schema[type];
          // assign new position
          self.schema.schema[type] = i + 1;  // auto determine position
          self.messageService.show("IA examined column " + (i + 1) + " as a " + type);

          if (type == 'timestamp')    // disable date && time
          {
            self.schemaTable.find(o => o.name == 'date').disable = true;
            self.schemaTable.find(o => o.name == 'time').disable = true;
          }

          if (type == 'date' || type == 'time')    // disable timestamp
          {
            self.schemaTable.find(o => o.name == 'timestamp').disable = true;
          }

        }
      };

      // refresh view
      self.messageService.show("CSV parse complete.");
    }

    if (this.fileCsv) {
      // create import request, get presigned values
      this.upload_struct = await this.awsService.preUpload();
      this.schema.csv_file_name = this.upload_struct['DataKey'];

      // save to schema json
      // this.schema.csv_file_name = this.fileCsv.name;
      fileReader.readAsText(this.fileCsv);
    }

  };




  onFileSchemaSelect(params) {
    this.fileSchema = params.target.files[0];
    this.messageService.show("Selected Schema: " + this.fileSchema.name);
    this.showEditor = true;
    // console.log(this.fileSchema);

    const self = this;
    // read json from file
    if (this.fileSchema) {
      var reader = new FileReader();
      reader.readAsText(this.fileSchema, "UTF-8");
      reader.onload = function (evt) {
        self.schema = JSON.parse(String(evt.target.result));
        self.gridApi.redrawRows();
      }
      reader.onerror = function (evt) {
        console.log('error reading file');
      }
    }
  };


  schema_clean(schema: any) {

    // delete flags marked by user and unknown titles
    for (let line of this.schemaTable)
      if (line.disable || line.name.includes('unknown'))
        delete schema.schema[line.name];

  }




  /*****************************************************/
  async importFile() {
    if (!this.fileCsv) {
      this.messageService.show("Please select a Csv file first.");
      return;
    }
    const timestamp = this.schemaTable.find(o => o.name == 'timestamp');
    const date = this.schemaTable.find(o => o.name == 'date');
    const time = this.schemaTable.find(o => o.name == 'time');

    if (timestamp.disable && (date.disable || time.disable)) {
      this.messageService.show("Mandatory fields disabled: please enable timestamp or time & date", 'danger');
      return;
    }


    // create import request, get presigned values
    // const upload_struct = await this.awsService.upload();

    if (this.upload_struct) {

      this.closeDisabled = true;
      this.pb_current = 0;

      // show result dialog modal
      this.resultLog = [];    // reinit
      $('#uploadModal').modal({
        backdrop: 'static',
        keyboard: false
      });
      $("#uploadModal").modal('show');

      // timer
      const numbers = interval(1000);
      numbers
        .pipe(takeWhile(() => this.closeDisabled))
        .subscribe(x => {
          this.resultTimer = Number(x);
          this.pb_current = this.resultTimer / 20 * 100;
          if (this.resultTimer >= 20) {
            this.closeDisabled = false;
            this.sktLog("Error - Timeout", 'danger');
          }
        });

      // init WebSocket
      await this.socketService.init();

      // subscribe to OK/Error notification
      this.socketService.subscribeLambda();

      let blob = this.fileCsv.slice(0, this.fileCsv.size, this.fileCsv.type);
      // get new file name for upload request
      const newFileCsv = new File([blob], this.upload_struct['DataKey'], { type: this.fileCsv.type });

      let uploadURL = this.upload_struct['uploadURL_data'];
      // console.log('Uploading to: ', uploadURL)
      let result = await fetch(uploadURL, {
        method: 'PUT',
        body: newFileCsv
      })
      // console.log('CSV upload Result: ', result)
      this.sktLog("CSV upload" + newFileCsv.name + ": " + (result.ok ? "uploaded" : "error"));

      // this.messageService.show("CSV upload" + newFileCsv.name + ": " + (result.ok ? "uploaded" : "error"), (result.ok ? "success" : "danger"));

      let schema = cloneDeep(this.schema) // deep clone structure

      // convert date to timestamp
      schema.date_from = new Date(schema.date_from).getTime() / 1e3;
      schema.date_to = new Date(schema.date_to).getTime() / 1e3;

      // clean schema from unknown columns
      this.schema_clean(schema);
      // console.log(schema);

      uploadURL = this.upload_struct['uploadURL_schema'];
      // create json string
      const jsonData = JSON.stringify(schema);
      // create blob
      blob = new Blob([jsonData], {
        type: "application/json"
      });

      // blob = this.fileSchema.slice(0, this.fileSchema.size, this.fileSchema.type);
      // get new file name for upload request
      const newFileSchema = new File([blob], this.upload_struct['SchemaKey'], { type: blob.type });
      result = await fetch(uploadURL, {
        method: 'PUT',
        body: newFileSchema
      })

      // clear product local cache
      sessionStorage.removeItem('product');
      sessionStorage.removeItem('productGroup');



      // console.log('Schema upload Result: ', result)
      // this.messageService.show("Schema upload " + newFileSchema.name + ": " + (result.ok ? "uploaded" : "error"), (result.ok ? "success" : "danger"));
      this.sktLog("Schema upload " + newFileSchema.name + ": " + (result.ok ? "uploaded" : "error"));

    }

    // update analysis status
    this.globalService.changeAnalStatus("Data Pick Up");
  }

  // get dataUri(): SafeUrl {
  //   const jsonData = JSON.stringify(this.schema);
  //   const uri = 'data:application/json;charset=UTF-8,' + encodeURIComponent(jsonData);
  //   return this.sanitizer.bypassSecurityTrustUrl(uri);
  // }

  async save_schema() {

    // clean schema from unknown columns
    let schema = cloneDeep(this.schema) // deep clone structure

    // json to string
    const jsonData = JSON.stringify(schema);
    // string to blob
    var blob = new Blob([jsonData], {
      type: "application/json"
    });
    const fileName = this.upload_struct['SchemaKey'];
    // filesaver
    saveAs(blob, fileName);
  }

  fileSchemaChanged() {
    // console.log("Schema changed")
    this.schemaFileInput.nativeElement.value = '';
    this.fileSchema = null;
    this.messageService.show("Please reload Schema File");
  }


  // disable checkbox 
  onDisableEvent(event: any) {
    this.gridApi.redrawRows();
    // console.log("Disable")
  }

  /********************************************************+
   * Form input change value
   */
  onChangeEvent(event: any) {
    // check for duplicates
    // console.log("New value: " + event.target.value)
    const schema_values = Object.values(this.schema.schema);
    // console.log("Array: ", schema_values)
    if (hasDuplicates(schema_values)) {
      const prev_color = event.target.style.backgroundColor;
      event.target.style.backgroundColor = 'orange';
      setTimeout(() => {
        event.target.style.backgroundColor = prev_color;
      }, 1000);
      this.messageService.show("Warning: detected duplicated value: " + event.target.value);
    }
    else
      this.gridApi.redrawRows();
  }

  sktLog(msg: string, type?: string) {
    this.resultLog.push({ msg: msg, type: type ? type : 'info' });
  }
}

/**
 * 
 * @param arr The Set object, introduced in the ES6, can remove duplicate values from an array. 
 * The idea is to convert the array to a Set. 
 * You can then conclude that the array is not unique if the set’s size is found to be less than the array’s size.
 * @returns boolean
 */
function hasDuplicates(arr) {
  return new Set(arr).size !== arr.length;
}


/**
 * Determine whether string is timestamp, date or time
 * @returns {string}
 */
function getDateType(field) {
  const minDate = new Date("2010-01-01");
  const toDateUNIX = new Date(field * 1000);
  if (toDateUNIX.toString() !== 'Invalid Date' && toDateUNIX.getTime() > minDate.getTime())
    return "timestamp";

  const toDate = new Date(field);
  if (toDate.toString() !== 'Invalid Date' && toDate.getTime() > minDate.getTime())
    return "date";

  var isTime = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(field);
  if (isTime)
    return "time";

  return null;
}

