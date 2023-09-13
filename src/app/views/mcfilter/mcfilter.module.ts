// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MCFilterComponent } from './mcfilter.component';


@NgModule({
  imports: [
    CommonModule,
    NgbModule ,
    FormsModule
  ],
  declarations: [
    MCFilterComponent,
  ],
  exports: [
    MCFilterComponent,
  ],
})
export class MCFilterModule { }
