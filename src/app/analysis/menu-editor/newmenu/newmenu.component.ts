import { formatDate } from '@angular/common';
import { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TableLib } from '../../../prod-table/lib/table-lib';

@Component({
  selector: 'app-newmenu',
  templateUrl: './newmenu.component.html',
  //   styleUrls: ['./newmenu.component.css']
})
export class NewMenuComponent implements OnInit {

  @Input() startDate;
  @Input() endDate;

  menuForm = new FormGroup({
    menu_name: new FormControl(''),
    menu_from: new FormControl(''),
    menu_to: new FormControl(''),
    menu_description: new FormControl('')
  });

  ngOnInit(): void {
    
    setTimeout(() => {                           //<<<---using ()=> syntax
      this.menuForm.setValue({
        menu_name: "",
        // menu_from: this.localNgbToString(this.startDate),
        // menu_to: this.localNgbToString(this.endDate),
        menu_from: "",
        menu_to: "",
        menu_description: ""
      });
      // console.log(this.menuForm);
    });

  }

  localNgbToString(dateNgb: NgbDateStruct): string {
    // return "2020-02-02";
    const date = dateNgb.year + "-" + dateNgb.month + "-" + dateNgb.day;
    return formatDate(date, "yyyy-MM-dd", "en-US");
  }

}