import { formatDate } from '@angular/common';
import { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
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

  menuForm = new UntypedFormGroup({
    menu_name: new UntypedFormControl(''),
    menu_from: new UntypedFormControl(''),
    menu_to: new UntypedFormControl(''),
    menu_description: new UntypedFormControl('')
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