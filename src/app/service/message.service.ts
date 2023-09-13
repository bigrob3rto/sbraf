import { Injectable } from '@angular/core';
// import { MatSnackBar } from '@angular/material/snack-bar';

declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    // public snackBar: MatSnackBar,
  ) { }

  public show(message: string, msg_type?: string, msg_timer?: number) {
    // this.snackBar.dismiss();  // close any previous message
    // this.snackBar.open(message, 'Close', {  // open new snackbar
    //   duration: 2000, horizontalPosition: 'right', verticalPosition:
    //     'bottom', panelClass: 'snackbar-style'
    // });

    $.notify({
      icon: "pe-7s-gift",
      message: message
    }, {
      type: msg_type ? msg_type : 'info',
      timer: msg_timer ? msg_timer : 1000,
      placement: {
        from: 'bottom',
        align: 'center',
      },
      // onShow: function () {
      //   this.css({ 'width': 'auto', 'height': 'auto' });
      // },
    });

  }
}
