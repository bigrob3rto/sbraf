import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CognitoServiceProvider } from '../service/cognito-service';
import { AwsService } from '../service/aws.service';
import { GlobalService } from '../service/global.service';
import { MessageService } from '../service/message.service';
import { EncrDecrService } from '../service/encrypt.service';

declare var apigClientFactory;

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public username = '';
  public password = '';

  public remember = false;


  constructor(public cognitoSerive: CognitoServiceProvider,
    protected awsService: AwsService,
    private globalService: GlobalService,
    private messageService: MessageService,
    private crypto: EncrDecrService,
    public router: Router,
  ) { }

  ngOnInit(): void {
    // check for remember
    const remember = localStorage.getItem("remember_sbraf");
    if (remember) {
      this.remember = true;
      const _rm = JSON.parse(remember);
      this.username = _rm.email;
      this.password = this.crypto.get(_rm.password);
      this.login();
    }
  }

  login() {
    this.cognitoSerive.authenticate(this.username, this.password)
      .then(res => {

        // if remember
        if (this.remember) {
          const remember = {
            email: this.username,
            password: this.crypto.set(this.password)
          };
          localStorage.setItem("remember_sbraf", JSON.stringify(remember));
        }
        else {
          localStorage.removeItem("remember_sbraf")
        }


        var apigClient = apigClientFactory.newClient({
          accessKey: '',
          secretKey: '',
          sessionToken: sessionStorage.getItem('awstkn'),
          region: '',
          apiKey: undefined,
          defaultContentType: 'application/json',
          defaultAcceptType: 'application/json'
        });

        apigClient.structuresAdmin().then(async (result) => {
          // console.log('RESULT', result.data);

          const structures = await this.awsService.getStructures();   // TODO delete 

          this.globalService.changeSelectedStructure(null);
          // navigate to default page
          this.router.navigateByUrl('/table/structures');



        }, (result) => {
          console.error('ERROR', result);
          this.messageService.show("Connection error.");
        });



      }, err => {
        alert('errore: ' + err);
        console.log('Error', err);
      }).catch(function (result) {
        console.error('ERROR', result);
      });
  }

}
