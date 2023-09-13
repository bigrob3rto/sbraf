import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AwsService } from './service/aws.service';
import { GlobalService } from './service/global.service';


@Component({
  // tslint:disable-next-line
  selector: 'body',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
  private currentTheme: string = 'cosmo-blue';

  constructor(private router: Router,
    private awsService: AwsService,
    private renderer: Renderer2, @Inject(DOCUMENT) private document,
    private globalService: GlobalService,
  ) { }


  /******************************************************
   *  Theme change function
   */
  theme(theme_name): void {
    // change body style class
    this.renderer.removeClass(document.body, 'theme-' + this.currentTheme);
    this.currentTheme = theme_name;
    this.renderer.addClass(document.body, 'theme-' + this.currentTheme);
    // load bootstrap theme css
    document.getElementById('theme').setAttribute('href', 'assets/styles/' + theme_name + '/bootstrap.min.css');
  }

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });

    // receive message for loading status
    this.globalService.selectedTheme.subscribe(async message => {
      if (message) {
        // console.log("Received theme change: " + message);
        this.theme(message);
      }
    });

    // check for session aws token
    if (!this.awsService.checkAwsToken()) {
      this.awsService.sessionTimeout();
      this.router.navigateByUrl('/login');
    }

    // set default session variables
    if (!localStorage.getItem('ag-grid-theme'))
      localStorage.setItem('ag-grid-theme', 'ag-theme-balham');
    if (!localStorage.getItem('theme'))
      localStorage.setItem('theme', 'cosmo-dark');
  }


}
