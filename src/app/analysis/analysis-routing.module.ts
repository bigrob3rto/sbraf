import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanDeactivateGuard } from '../service/can-deactivate-guard.service';
import { CompareComponent } from './compare/compare.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DBDComponent } from './dbd/dbd.component';
import { ElasticityIndexComponent } from './elast_index/elasticity_index.component';
import { EngineeringComponent } from './engineering/engineering.component';
import { ForecastComponent } from './forecast/forecast.component';
import { ImportComponent } from './import/import.component';
import { ItemPerformanceComponent } from './item_perf/item_performance.component';
import { MenuEditorComponent } from './menu-editor/menu-editor.component';
import { categories_pComponent } from './categories_p/categories_p.component';


const routes: Routes = [
    {
        path: 'dbd',
        component: DBDComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
            title: 'Day by Day'
        }
    },
    {
        path: 'menueditor',
        component: MenuEditorComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
            title: 'Menu Explore'
        }
    },
    {
        path: 'engineering',
        component: EngineeringComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
            title: 'Engineering'
        }
    },
    {
        path: 'elasticity_index',
        component: ElasticityIndexComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
            title: 'elasticity_index'
        }
    },
    {
        path: 'item_performance',
        component: ItemPerformanceComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
            title: 'item_performance'
        }
    },
    {
        path: 'forecast',
        component: ForecastComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
            title: 'forecast'
        }
    },
    {
        path: 'compare',
        component: CompareComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
            title: 'Compare'
        }
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        data: {
            title: 'Dashboard 2'
        }
    },
    {
        path: 'import',
        component: ImportComponent,
        data: {
            title: 'Data Pick Up'
        }
    },
    {
        path: 'categories_p',
        component: categories_pComponent,
        data: {
            title: 'Categories Performance'
        }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AnalysisRoutingModule { }
