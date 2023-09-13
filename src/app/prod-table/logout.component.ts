import { Component } from '@angular/core';
import { CognitoServiceProvider } from '../service/cognito-service';


@Component({
  template: ``
})

export class LogoutComponent {

  constructor(cognitoService: CognitoServiceProvider) {
    // console.log("bye bye");

    // remove autologin
    localStorage.removeItem("remember_sbraf")

    cognitoService.logout();

  }

}
