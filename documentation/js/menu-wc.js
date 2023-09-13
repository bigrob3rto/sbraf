'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">@coreui/coreui-free-angular-admin-template documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="changelog.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>CHANGELOG
                            </a>
                        </li>
                        <li class="link">
                            <a href="contributing.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>CONTRIBUTING
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AnalysisModule.html" data-type="entity-link">AnalysisModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AnalysisModule-bd8ca5e9265ee2f61d09edbc336f159a"' : 'data-target="#xs-components-links-module-AnalysisModule-bd8ca5e9265ee2f61d09edbc336f159a"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AnalysisModule-bd8ca5e9265ee2f61d09edbc336f159a"' :
                                            'id="xs-components-links-module-AnalysisModule-bd8ca5e9265ee2f61d09edbc336f159a"' }>
                                            <li class="link">
                                                <a href="components/CompareChartComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">CompareChartComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CompareComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">CompareComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DBDComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DBDComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DashboardComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DashboardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EconomicComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EconomicComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ElasticityComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ElasticityComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ElasticityWeekComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ElasticityWeekComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EngTotalsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EngTotalsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EngineeringComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EngineeringComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FlowAreaComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FlowAreaComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IaModalComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">IaModalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MatrixChartComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">MatrixChartComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MatrixResultComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">MatrixResultComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuEditorComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">MenuEditorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuTableComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">MenuTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NewMenuComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">NewMenuComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NewpriceComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">NewpriceComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NgbdModalContent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">NgbdModalContent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PerformanceComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PerformanceComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfitAreaComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ProfitAreaComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RevenueAreaComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">RevenueAreaComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ToppingComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ToppingComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AnalysisRoutingModule.html" data-type="entity-link">AnalysisRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-97e8db6a15466ffcd18d732df0251140"' : 'data-target="#xs-components-links-module-AppModule-97e8db6a15466ffcd18d732df0251140"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-97e8db6a15466ffcd18d732df0251140"' :
                                            'id="xs-components-links-module-AppModule-97e8db6a15466ffcd18d732df0251140"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DefaultLayoutComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DefaultLayoutComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoginComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">LoginComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/P404Component.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">P404Component</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/P500Component.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">P500Component</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link">AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/BaseModule.html" data-type="entity-link">BaseModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-BaseModule-ab1a38cdbe9bc80d9db37a8a22ae5f96"' : 'data-target="#xs-components-links-module-BaseModule-ab1a38cdbe9bc80d9db37a8a22ae5f96"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-BaseModule-ab1a38cdbe9bc80d9db37a8a22ae5f96"' :
                                            'id="xs-components-links-module-BaseModule-ab1a38cdbe9bc80d9db37a8a22ae5f96"' }>
                                            <li class="link">
                                                <a href="components/CardsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">CardsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CarouselsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">CarouselsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CollapsesComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">CollapsesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FormsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FormsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NavbarsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">NavbarsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PaginationsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PaginationsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PopoversComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PopoversComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProgressComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ProgressComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SwitchesComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SwitchesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TablesComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TablesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TabsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TabsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TooltipsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TooltipsComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/BaseRoutingModule.html" data-type="entity-link">BaseRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/BaseRoutingModule.html" data-type="entity-link">BaseRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/BaseTableModule.html" data-type="entity-link">BaseTableModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-BaseTableModule-90afcf4ee8c9524c97ebcf7b6fa881fc"' : 'data-target="#xs-components-links-module-BaseTableModule-90afcf4ee8c9524c97ebcf7b6fa881fc"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-BaseTableModule-90afcf4ee8c9524c97ebcf7b6fa881fc"' :
                                            'id="xs-components-links-module-BaseTableModule-90afcf4ee8c9524c97ebcf7b6fa881fc"' }>
                                            <li class="link">
                                                <a href="components/CategoryTableComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">CategoryTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LogoutComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">LogoutComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderTableComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">OrderTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProdTableComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ProdTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ProfileComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RegisterComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">RegisterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ReportComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RevpashTableComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">RevpashTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StatComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">StatComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StructuresComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">StructuresComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ButtonGroupModule.html" data-type="entity-link">ButtonGroupModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ButtonGroupModule-9c2d9aa61541e853110f5a6eac3fc22b"' : 'data-target="#xs-components-links-module-ButtonGroupModule-9c2d9aa61541e853110f5a6eac3fc22b"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ButtonGroupModule-9c2d9aa61541e853110f5a6eac3fc22b"' :
                                            'id="xs-components-links-module-ButtonGroupModule-9c2d9aa61541e853110f5a6eac3fc22b"' }>
                                            <li class="link">
                                                <a href="components/ButtonComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ButtonComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DateRangeModule.html" data-type="entity-link">DateRangeModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-DateRangeModule-85eb170bfefcc34321161ab84fe8a251"' : 'data-target="#xs-components-links-module-DateRangeModule-85eb170bfefcc34321161ab84fe8a251"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DateRangeModule-85eb170bfefcc34321161ab84fe8a251"' :
                                            'id="xs-components-links-module-DateRangeModule-85eb170bfefcc34321161ab84fe8a251"' }>
                                            <li class="link">
                                                <a href="components/AgGridDatePickerComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AgGridDatePickerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DateRangeComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DateRangeComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/IconsModule.html" data-type="entity-link">IconsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-IconsModule-45603fe89bbf5e01bef23fc10601921a"' : 'data-target="#xs-components-links-module-IconsModule-45603fe89bbf5e01bef23fc10601921a"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-IconsModule-45603fe89bbf5e01bef23fc10601921a"' :
                                            'id="xs-components-links-module-IconsModule-45603fe89bbf5e01bef23fc10601921a"' }>
                                            <li class="link">
                                                <a href="components/CoreUIIconsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">CoreUIIconsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FlagsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FlagsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FontAwesomeComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FontAwesomeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SimpleLineIconsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SimpleLineIconsComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/IconsRoutingModule.html" data-type="entity-link">IconsRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/MCFilterModule.html" data-type="entity-link">MCFilterModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-MCFilterModule-317f015ffd4adbbf3c3d96278e0aee9d"' : 'data-target="#xs-components-links-module-MCFilterModule-317f015ffd4adbbf3c3d96278e0aee9d"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-MCFilterModule-317f015ffd4adbbf3c3d96278e0aee9d"' :
                                            'id="xs-components-links-module-MCFilterModule-317f015ffd4adbbf3c3d96278e0aee9d"' }>
                                            <li class="link">
                                                <a href="components/MCFilterComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">MCFilterComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/NotificationsModule.html" data-type="entity-link">NotificationsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-NotificationsModule-e79c43561821281a87980c109764bcc5"' : 'data-target="#xs-components-links-module-NotificationsModule-e79c43561821281a87980c109764bcc5"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-NotificationsModule-e79c43561821281a87980c109764bcc5"' :
                                            'id="xs-components-links-module-NotificationsModule-e79c43561821281a87980c109764bcc5"' }>
                                            <li class="link">
                                                <a href="components/AlertsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AlertsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BadgesComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">BadgesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ModalsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ModalsComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/NotificationsRoutingModule.html" data-type="entity-link">NotificationsRoutingModule</a>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AppDashboard.html" data-type="entity-link">AppDashboard</a>
                            </li>
                            <li class="link">
                                <a href="classes/Printable.html" data-type="entity-link">Printable</a>
                            </li>
                            <li class="link">
                                <a href="classes/TableLib.html" data-type="entity-link">TableLib</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AwsService.html" data-type="entity-link">AwsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BaseTableComponent.html" data-type="entity-link">BaseTableComponent</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CognitoServiceProvider.html" data-type="entity-link">CognitoServiceProvider</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EncrDecrService.html" data-type="entity-link">EncrDecrService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GlobalService.html" data-type="entity-link">GlobalService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MessageService.html" data-type="entity-link">MessageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NeuralService.html" data-type="entity-link">NeuralService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OrderCacheService.html" data-type="entity-link">OrderCacheService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#guards-links"' :
                            'data-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/CanDeactivateGuard.html" data-type="entity-link">CanDeactivateGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/CanComponentDeactivate.html" data-type="entity-link">CanComponentDeactivate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Category.html" data-type="entity-link">Category</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Engineering.html" data-type="entity-link">Engineering</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Menu.html" data-type="entity-link">Menu</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuProduct.html" data-type="entity-link">MenuProduct</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Order.html" data-type="entity-link">Order</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/order_content.html" data-type="entity-link">order_content</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Product.html" data-type="entity-link">Product</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductMerged.html" data-type="entity-link">ProductMerged</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Revpash.html" data-type="entity-link">Revpash</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Structure.html" data-type="entity-link">Structure</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Topping.html" data-type="entity-link">Topping</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});