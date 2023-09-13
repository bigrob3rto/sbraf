import { BaseTableComponent } from '../base-list.component'
import { Component } from '@angular/core';
import { Menu } from '../../analysis/menu-editor/menu/menu-table.component';


export interface Revpash {
  revpash_id: 1,
  revpash_timestamp: string,
  revpash_time_unit: string,
  revpash_time_value: number,
  revpash_tot_revenue: number,
  revpash_avg_revenue_per_product: number,
  revpash_cover_available: number,
  revpash_cover_sold: number,
  revpash_coverage_perc: number,
  revpash_value: number
}


@Component({
  selector: 'app-prod-table',
  templateUrl: './revpash-table.component.html',
  styleUrls: ['./revpash-table.component.css']
})

export class RevpashTableComponent extends BaseTableComponent {
  title = "Revpash";
  public MenuHeader = [{ id: '1' }, { id: '2' }];
  public idSelected: string = this.MenuHeader[0].id;

  columnDefs = [{ headerName: 'Id', field: 'revpash_id', width: 110, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
  { headerName: 'Time', field: 'revpash_timestamp', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
  { headerName: 'Unit', field: 'revpash_time_unit', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
  { headerName: 'Revenue', field: 'revpash_tot_revenue', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
  { headerName: 'Rev per prod', field: 'revpash_avg_revenue_per_product', width: 130, resizable: true, sortable: true, filter: 'agTextColumnFilter' },
  { headerName: 'Cover', field: 'revpash_cover_available', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
  { headerName: 'Sold', field: 'revpash_cover_sold', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
  { headerName: 'Perc', field: 'revpash_coverage_perc', resizable: true, sortable: true, filter: 'agTextColumnFilter' },
  { headerName: 'Value', field: 'revpash_value', resizable: true, sortable: true, filter: 'agTextColumnFilter' }
  ];

  ngOnInit(): void {
    // avoid local storage, force invoke remote api gateway
    this.awsService.clearSession('revpash');
  }

  async getData() {
    // get menus
    let menus : Menu[] = await this.awsService.getMenus();

    // console.log(menus);
    this.MenuHeader = [];
    for (var m of menus) 
        this.MenuHeader.push({ 'id': String(m.menu_id) });

    // get revpash table
    return await this.awsService.getRevpash(this.idSelected);
  }

  onIDSelect(i) {
    this.idSelected = this.MenuHeader[i].id;
    // console.log("Menu.id: " + this.idSelected);

    // avoid local storage, force invoke remote api gateway
    this.awsService.clearSession('revpash');

    this.refreshData();

  }
}
