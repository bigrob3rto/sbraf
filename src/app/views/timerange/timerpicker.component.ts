import {Component} from '@angular/core';

@Component({
  selector: 'ngbd-timepicker',
  templateUrl: './timerpicker.component.html'
})

export class NgbdTimepickerComponent {
  step;
  time = {hour: 13, minute: 30};
}