import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanDeactivateGuard } from '../service/can-deactivate-guard.service';
import { CategoryTableComponent } from './cat-table.component';
import { ProdTableComponent } from './prod-table.component';
import { RegisterComponent } from './register/register.component';
import { RevpashTableComponent } from './revpash/revpash-table.component';
import { OrderTableComponent } from './order/order-table.component';
import { StructuresComponent } from './structures/structures.component';
import { StatComponent } from './stats/stat.component';
import { LogoutComponent } from './logout.component';
import { ReportComponent } from './report/report.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
    {
        path: '',
        data: {
            title: 'Table'
        },
        children: [
            {
                path: '',
                redirectTo: '/table/structures',
                pathMatch: 'full'
            },
            {
                path: 'register',
                component: RegisterComponent,
                data: {
                    title: 'Register'
                }
            },
            {
                path: 'product',
                component: ProdTableComponent,
                canDeactivate: [CanDeactivateGuard],
                data: {
                    title: 'Product'
                }
            },
            {
                path: 'stat',
                component: StatComponent,
                data: {
                    title: 'Utilities'
                }
            },
            // {
            //     path: 'menu',
            //     component: MenuTableComponent,
            //     canDeactivate: [CanDeactivateGuard],
            //     data: {
            //         title: 'Menu'
            //     }
            // },
            {
                path: 'category',
                component: CategoryTableComponent,
                canDeactivate: [CanDeactivateGuard],
                data: {
                    title: 'Category'
                }
            },
            {
                path: 'order',
                component: OrderTableComponent,
                data: {
                    title: 'Order'
                }
            }, 
            {
                path: 'revpash',
                component: RevpashTableComponent,
                data: {
                    title: 'Revpash'
                }
            },
            {
                path: 'report',
                component: ReportComponent,
                data: {
                    title: 'Report'
                }
            },
            {
                path: 'structures',
                component: StructuresComponent,
                data: {
                    title: 'Structures'
                }
            },
            {
                path: 'profile',
                component: ProfileComponent,
                data: {
                    title: 'Profile'
                }
            },
            {
                path: 'logout',
                component: LogoutComponent,
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BaseRoutingModule { }
