import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule} from '@angular/material/table';
import { MatButtonModule} from '@angular/material/button';
import { MatSnackBarModule} from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EngineeringComponent } from './engineering/engineering.component';
import { ModalModule } from "ngx-bootstrap/modal";
import { AgGridModule } from 'ag-grid-angular';
import'ag-grid-enterprise'; 
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AnalysisRoutingModule } from '../analysis/analysis-routing.module';
import { ButtonGroupModule } from '../views/button-group/button-group.module';
import { MenuEditorComponent } from './menu-editor/menu-editor.component';
import { DBDComponent } from './dbd/dbd.component';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { EngTotalsComponent } from './engineering/eng-totals/eng-totals.component';
import { ElasticityComponent } from './dbd/elasticity/elasticity.component';
import { FlowAreaComponent } from './dbd/flowArea/flowarea.component';
import { MatrixChartComponent } from './engineering/matrixchart/matrixchart.component';
import { RevenueAreaComponent } from './dbd/revenueArea/revenuearea.component';
import { ProfitAreaComponent } from './dbd/profitArea/profitarea.component';
import { NewpriceComponent } from './engineering/newprice/newprice.component';
import { MenuTableComponent } from './menu-editor/menu/menu-table.component';
import { DateRangeModule } from '../views/daterange/daterange.module';
import { NewMenuComponent } from './menu-editor/newmenu/newmenu.component';
import { ElasticityWeekComponent } from './dbd/elasticity_week/elasticity-week.component';
import { MatrixResultComponent } from './matrixresult/matrixresult.component';
import { CompareComponent } from './compare/compare.component';
import { MCFilterModule } from '../views/mcfilter/mcfilter.module';
import { CompareChartComponent } from './compare/comp-chart/comp-chart.component';
import { ToppingComponent } from './dbd/topping/topping.component';
import { IaModalComponent, NgbdModalContent } from './dbd/elasticity_week/iaModal.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ImportComponent } from './import/import.component';
import { ElasticityIndexComponent } from './elast_index/elasticity_index.component';
import { ItemPerformanceComponent } from './item_perf/item_performance.component';
import { FeatureSelectionComponent } from './item_perf/feature_selection/feature_selection.component';
import { ForecastComponent } from './forecast/forecast.component';
import { categories_pComponent } from './categories_p/categories_p.component';
import { TimeRangeModule } from '../views/timerange/timerange.module';
import { items_pComponent } from './items_p/items_p.component';
import { MonthPickerComponent } from '../views/month-picker/month-picker.component';
import { AggregatiComponent } from './aggregati_p/aggregati.component';

@NgModule({
  declarations: [
    EngineeringComponent,  
    MenuEditorComponent,
    DBDComponent,
    EngTotalsComponent,
    ElasticityComponent,
    ElasticityWeekComponent,
    FlowAreaComponent,
    MatrixChartComponent,
    RevenueAreaComponent,
    ProfitAreaComponent,
    NewpriceComponent,
    MenuTableComponent,
    NewMenuComponent,
    MatrixResultComponent,
    CompareComponent,
    CompareChartComponent,
    ToppingComponent,
    IaModalComponent,
    NgbdModalContent,
    DashboardComponent,
    ImportComponent,
    ElasticityIndexComponent,
    ItemPerformanceComponent,
    FeatureSelectionComponent,
    ForecastComponent,
    categories_pComponent,
    items_pComponent,
    MonthPickerComponent,
    AggregatiComponent
  ],
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatSnackBarModule,
    FormsModule,
    AgGridModule.withComponents([]),
    ModalModule.forRoot(),
    TabsModule.forRoot(),    
    ChartsModule,
    NgbModule,
    CommonModule,
    TabsModule.forRoot(),
    ButtonsModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    AnalysisRoutingModule,
    ButtonGroupModule,
    DateRangeModule,
    MCFilterModule,
    NgbModalModule,
    TimeRangeModule
  ],
  exports: [
    EngineeringComponent,
    MenuEditorComponent,
    DBDComponent,
    EngTotalsComponent,
    ElasticityComponent,
    ElasticityWeekComponent,
    FlowAreaComponent,
    MatrixChartComponent,
    RevenueAreaComponent,
    ProfitAreaComponent,
    NewpriceComponent,
    MenuTableComponent,
    NewMenuComponent,
    MatrixResultComponent,
    CompareComponent,
    CompareChartComponent,
    ToppingComponent,
    IaModalComponent,
    DashboardComponent,
    ImportComponent,
    ElasticityIndexComponent,
    ItemPerformanceComponent,
    FeatureSelectionComponent,
    ForecastComponent,
    categories_pComponent,
    items_pComponent,
    AggregatiComponent
  ],
  entryComponents: [    IaModalComponent,NgbdModalContent  ],
})
export class AnalysisModule { }
