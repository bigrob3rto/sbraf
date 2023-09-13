import { formatDate } from '@angular/common';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { GridApi } from 'ag-grid-community';
import { Product } from '../prod-table.component';


export class TableLib {

  static ngbToString(dateNgb: NgbDateStruct): string {
    return dateNgb.year + "-" + dateNgb.month + "-" + dateNgb.day;
  }

  static utcToNgb(dateUTC: string): NgbDateStruct {
    const date = new Date(dateUTC);
    return date ? {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    } : null;
  }

  static isNumber(value: string | number): boolean {
    return ((value != null) &&
      (value !== '') &&
      !isNaN(Number(value.toString())));
  }


  static addItems(gridApi: GridApi) {
    const newData: Product = {
      "product_id": 1,  // new item always assign 1
      "product_name": "New Product",
      "product_code": "",
      "product_sell_price": 0,
      "product_quantity": 0,
      "product_note": "xxx",
      "product_category_id": 76,
      "product_description": "",
      "product_discount": 0,
      "product_enabled": true,
      "product_kasavana_category": "",
      "product_input_source": "manually",
      "product_structure_id": 0,
      "product_food_cost_ext": 0.0,
      "product_merged_name": "New Product",
      "product_merged_code": 0,
    }
    var newItems = [newData];
    newItems[0]['changed'] = true;
    var res = gridApi.applyTransaction({
      add: newItems,
      addIndex: 0,
    });

    // this.printResult(res);
  }



  static printResult(res) {
    console.log('---------------------------------------');
    if (res.add) {
      res.add.forEach(function (rowNode) {
        console.log('Added Row Node', rowNode);
      });
    }
    if (res.remove) {
      res.remove.forEach(function (rowNode) {
        console.log('Removed Row Node', rowNode);
      });
    }
    if (res.update) {
      res.update.forEach(function (rowNode) {
        console.log('Updated Row Node', rowNode);
      });
    }
  }

  /* To copy any Text */
  static copytoClipboard(val: string) {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  static currencyFormatter(value: number) {
    if (!this.isNumber(value))
      return '';
    // console.log( currency);
    var sansDec = Number(value).toFixed(2);
    var formatted = sansDec.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // get currency from local storage
    let user_currency = localStorage.getItem('user_currency');
    if (!user_currency)
      user_currency = '$';
    return user_currency + `${formatted}`;
  }

  static numberFormatter(value: number) {
    if (!this.isNumber(value))
      return '';
    // console.log( currency);
    var sansDec = Number(value).toFixed(0);
    var formatted = sansDec.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${formatted}`;
  }

  static percentageFormatter(value) {
    if (!this.isNumber(value))
      return '';
    var sansDec = value.toFixed(1);
    var formatted = sansDec.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${formatted}` + '%';
  }

  // date compare day - week - month
  static dateInclude(date_daily: string, date: string): boolean {
    const date_u = formatDate(date, "yyyy-MM-dd", 'en-US');
    return date_daily.includes(date_u);
  }

  // date compare day - week - month
  static dateInRange(date: Date, start: Date, stop: Date): boolean {
    const date_ms = date.getTime();
    const start_ms = start.getTime();
    const stop_ms = stop.getTime();
    const withinRange = date_ms >= start_ms && date_ms <= stop_ms;
    return withinRange;
  }

  // calculate average
  static average(values: number[]): number {
    var sum = values.reduce(function (sum, value) {
      return sum + (value == null ? 0 : value);
      // return sum + value;
    }, 0);

    return sum / values.length;
  }

  // calculate sum
  static sum(values: number[]): number {
    var sum = values.reduce(function (sum, value) {
      return sum + value;
    }, 0);

    return sum;
  }

  // calculate standard deviation
  static standardDeviation(values) {
    var avg = this.average(values);

    var squareDiffs = values.map(function (value) {
      var diff = value - avg;
      var sqrDiff = diff * diff;
      return sqrDiff;
    });

    var avgSquareDiff = this.average(squareDiffs);

    var stdDev = Math.sqrt(avgSquareDiff);
    return stdDev;
  }

  // get median of array
  static median(values: number[]): number {
    const arrSort = values.sort(function (a, b) {
      return a - b;
    });
    const len = values.length;
    const mid = Math.ceil(len / 2);

    const median =
      len % 2 == 0 ? (arrSort[mid] + arrSort[mid - 1]) / 2 : arrSort[mid - 1];

    // console.log("median: ", median);
    return median;
  }

  // harmonic mean
  static harmonicMean(values: number[]): number {
    // Declare sum variables and  initialize with zero 
    let sum = 0;
    const n = values.length;
    for (let i = 0; i < n; i++)
      sum = sum + 1 / values[i];

    const h_mean = n / sum;
    // console.log("h_mean: ", h_mean);
    return h_mean;
  }

  // Convert gunzipped byteArray back to ascii string:
  static arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  static exportToCsv(filename: string, rows: object[]) {
    if (!rows || !rows.length) {
      return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          cell = cell instanceof Date
            ? cell.toLocaleString()
            : cell.toString().replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(separator);
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }
}
