import { Component, EventEmitter, Output } from '@angular/core';

// needed for modal
declare var $: any;

@Component({
  selector: 'month-picker',
  templateUrl: 'month-picker.component.html',
  styleUrls: ['month-picker.component.scss'],
})
export class MonthPickerComponent {

  @Output() monthRangeSelected = new EventEmitter();

  currentYearIndex: number;
  years: Array<number>;
  months: Array<string>;
  monthsData: Array<{
    monthName: string,
    monthYear: number,
    isInRange: boolean,
    isLowerEdge: boolean,
    isUpperEdge: boolean
  }>;
  rangeIndexes: Array<number>;
  monthViewSlicesIndexes: Array<number>;
  monthDataSlice: Array<{
    monthName: string,
    monthYear: number,
    isInRange: boolean,
    isLowerEdge: boolean,
    isUpperEdge: boolean
  }>;
  globalIndexOffset: number;

  onClick(indexClicked) {
    if (this.rangeIndexes[0] === null) {
      this.rangeIndexes[0] = this.globalIndexOffset + indexClicked;
    } else
      if (this.rangeIndexes[1] === null) {
        this.rangeIndexes[1] = this.globalIndexOffset + indexClicked;
        this.rangeIndexes.sort((a, b) => a - b);
        let months = [];

        this.monthsData.forEach((month, index) => {
          if ((this.rangeIndexes[0] <= index) && (index <= this.rangeIndexes[1])) {
            month.isInRange = true;
            months.push(
              {
                month: this.monthsData[index].monthName,
                year: this.monthsData[index].monthYear
              });
          };
          if (this.rangeIndexes[0] === index) {
            month.isLowerEdge = true;
          };
          if (this.rangeIndexes[1] === index) {
            month.isUpperEdge = true;
          };
        })

        //console.log(months);
        /*
        const fromMonthYear = this.monthsData[this.rangeIndexes[0]];
        const toMonthYear = this.monthsData[this.rangeIndexes[1]];
        ///this.emitData(`Range is: ${fromMonthYear.monthName} ${fromMonthYear.monthYear} to ${toMonthYear.monthName} ${toMonthYear.monthYear}`)
        const hashTable = {
          "Jan": ["01","31"],
          "Feb": ["02","28"],
          "Mar": ["03","31"],
          "Apr": ["04","30"],
          "May": ["05","30"],
          "Jun": ["06","30"],
          "Jul": ["07","31"],
          "Ago": ["08","31"],
          "Sep": ["09","30"],
          "Oct": ["10","31"],
          "Nov": ["11","30"],
          "Dec": ["12","31"]
        }
       const returnObj = {
          from: fromMonthYear.monthYear + "-" + hashTable[fromMonthYear.monthName][0] + "-01"  + " 00:00:00",
          to: toMonthYear.monthYear + "-" + hashTable[toMonthYear.monthName][0]+ "-" + hashTable[toMonthYear.monthName][1] + " 23:59:59"
        }
        */
        this.emitData(months);
      } else {
        this.initRangeIndexes();
        this.initMonthsData();
        this.onClick(indexClicked);
        this.sliceDataIntoView();
      };
  };

  emitData(obj) {
    this.monthRangeSelected.emit(obj)
  };

  sliceDataIntoView() {
    this.globalIndexOffset = this.monthViewSlicesIndexes[this.currentYearIndex];
    this.monthDataSlice = this.monthsData.slice(this.globalIndexOffset, this.globalIndexOffset + 24);
  };

  incrementYear() {
    if (this.currentYearIndex !== this.years.length - 1) {
      this.currentYearIndex++
      this.sliceDataIntoView()
    };
  };

  decrementYear() {
    if (this.currentYearIndex !== 0) {
      this.currentYearIndex--;
      this.sliceDataIntoView()
    };
  };

  initRangeIndexes() {
    this.rangeIndexes = [null, null];
  };

  initMonthsData() {
    this.monthsData = new Array();
    this.years.forEach(year => {
      this.months.forEach(month => {
        this.monthsData.push({
          monthName: month,
          monthYear: year,
          isInRange: false,
          isLowerEdge: false,
          isUpperEdge: false
        })
      })
    })
  };

  initYearLabels() {
    const currentYear = (new Date()).getFullYear();
    const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step));
    this.years = range(currentYear - 20, currentYear, 1)
  };

  initMonthLabels() {
    this.months = new Array(12).fill(0).map((_, i) => {
      return new Date(`${i + 1}/1`).toLocaleDateString(undefined, { month: 'short' })
    });
  };

  initViewSlices() {
    this.monthViewSlicesIndexes = [];
    this.years.forEach((year, index) => {
      if (index === 0) { this.monthViewSlicesIndexes.push(0) } else
        if (index === 1) { this.monthViewSlicesIndexes.push(6) } else
          this.monthViewSlicesIndexes.push(this.monthViewSlicesIndexes[index - 1] + 12);
    })
  };

  ngOnInit() {
    this.initYearLabels();
    this.initMonthLabels();
    this.initViewSlices();
    this.initMonthsData();
    this.initRangeIndexes();
    this.currentYearIndex = this.years.findIndex(year => year === (new Date()).getFullYear());
    this.sliceDataIntoView();
  };


  showCalendar() {
    // show  dialog modal
    $('#calendarModal').modal({
      backdrop: 'static',
      keyboard: true,
      disableClose: false,
    });
    $("#calendarModal").modal('show');
  }

}
