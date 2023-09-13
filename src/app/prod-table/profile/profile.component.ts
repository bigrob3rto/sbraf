import { Component, OnInit } from '@angular/core';
import { CognitoServiceProvider } from '../../service/cognito-service';
import { AwsService } from '../../service/aws.service';
import { GlobalService } from '../../service/global.service';
import { MessageService } from '../../service/message.service';


@Component({
  selector: 'app-profile',
  templateUrl: 'profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public username = '';
  public password = '';
  public user_phone_number: string;
  public user_email: string;
  public user_currency: string;

  constructor(public cognitoService: CognitoServiceProvider,
    protected awsService: AwsService,
    private globalService: GlobalService,
    private messageService: MessageService,
  ) { }

  ngOnInit() {
    this.username = this.cognitoService.getUserName();
    this.user_phone_number = sessionStorage.getItem('user_phone_number');
    this.user_email = sessionStorage.getItem('user_email');
    // get currency from localStorage
    this.user_currency = localStorage.getItem('user_currency');
    if (!this.user_currency)
      this.user_currency = '$';
  }

  selectChange($event) {
    localStorage.setItem("user_currency", $event);
    this.user_currency = $event;
    this.messageService.show("Changed currency to " + this.user_currency);
  }


}
