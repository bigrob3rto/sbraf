import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule} from '@angular/material/snack-bar';
import { RegisterComponent } from './register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProdTableComponent } from './prod-table.component';
import { CategoryTableComponent } from './cat-table.component';
import { RevpashTableComponent } from './revpash/revpash-table.component';
import { ModalModule } from "ngx-bootstrap/modal";
import { AgGridModule } from 'ag-grid-angular';
import'ag-grid-enterprise'; 
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BaseRoutingModule } from './base-routing.module';
import { ButtonGroupModule } from '../views/button-group/button-group.module';
import { OrderTableComponent } from './order/order-table.component';
import { StructuresComponent } from './structures/structures.component';
import { DateRangeModule } from '../views/daterange/daterange.module';
import { StatComponent } from './stats/stat.component';
import { LogoutComponent } from './logout.component';
import { ReportComponent } from './report/report.component';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  declarations: [
    ProdTableComponent,
    RegisterComponent,
    CategoryTableComponent,
    RevpashTableComponent,
    OrderTableComponent,
    StructuresComponent,
    StatComponent,
    LogoutComponent,
    ReportComponent,
    ProfileComponent
  ],
  imports: [
    CommonModule,
    MatSnackBarModule,
    AgGridModule.withComponents([]),
    ModalModule.forRoot(),
    TabsModule.forRoot(),    
    ChartsModule,
    NgbModule,
    CommonModule,
    TabsModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    BaseRoutingModule,
    ButtonGroupModule,
    DateRangeModule
  ],
  exports: [
    ProdTableComponent,
    CategoryTableComponent,
    RegisterComponent,
    OrderTableComponent,
    StructuresComponent,
    StatComponent,
    LogoutComponent,
    ReportComponent,
    ProfileComponent
  ]
})
export class BaseTableModule { }
