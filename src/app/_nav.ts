import { INavData } from '@coreui/angular';


export const navItems: INavData[] = [
  {
    title: true,
    name: 'Data manage'
  },
  {
    name: 'Data Pick Up',
    url: '/data/import',
    icon: 'icon-notebook',
    attributes: {
      disabled: true,
      target: "ciao" },

    // variant: 'info',
    // badge: {
    //   variant: 'info',
    //   text: 'NEW'
    // },
  },
{
  name: 'Menu Manager',
    url: '/data/menueditor',
      icon: 'icon-book-open',
        attributes: { disabled: true },
},
{
  divider: true
},
{
  title: true,
    name: 'Economics Trend'
},
{
  name: 'Dashboard',
    url: '/data/dashboard',
      icon: 'icon-speedometer',
        attributes: { disabled: true },
  // badge: {
  //   variant: 'info',
  //     text: 'NEW'
  // },
},
{
  name: 'Day by Day',
    url: '/data/dbd',
      icon: 'icon-list',
        attributes: { disabled: true },
  // badge: {
  //   variant: 'secondary',
  //   text: 'NEW'
  // },
},
{
  divider: true
},
{
  title: true,
    name: 'Pienissimo'
},
{
  name: 'Categories',
    url: '/data/categories_p',
    icon: 'icon-doc',
    attributes: { disabled: false },
},
{
  name: 'Items',
    url: '/data/items_p',
    icon: 'icon-note',
    attributes: { disabled: false },
},
{
  name: 'Aggregati',
    url: '/data/aggregati',
    icon: 'icon-bag',
    attributes: { disabled: false },
},
{
  divider: true
},
{
  title: true,
    name: 'Analysis'
},
{
  name: 'Matrix Charts',
    url: '/data/engineering',
      icon: 'icon-chart',
        attributes: { disabled: true },
},
{
  name: 'Elasticity Index',
    url: '/data/elasticity_index',
      icon: 'icon-chart',
        attributes: { disabled: true },
},
{
  name: 'Item Performance',
    url: '/data/item_performance',
      icon: 'icon-chart',
        attributes: { disabled: true },
},
{
  name: 'Forecast',
    url: '/data/forecast',
      icon: 'icon-chart',
        attributes: { disabled: true },
},
{
  title: true,
    name: 'Advanced'
},
{
  name: 'Compare',
    url: '/data/compare',
      icon: 'icon-wallet',
        attributes: { disabled: true },
  // attributes: { disabled: !isDevMode() },
},
{
  divider: true
},
{
  title: true,
    name: 'Reporting'
},
{
  name: 'Report',
    url: '/table/report',
      icon: 'icon-doc',
        attributes: { disabled: true },
},
{
  divider: true
},
{
  title: true,
    name: 'Tables'
},
{
  name: 'Admin',
    url: '/pages',
      icon: 'icon-star',
        children: [
          // {
          //   name: 'Login',
          //   url: '/table/login',
          //   icon: 'icon-star',
          // },
          {
            name: 'Products',
            url: '/table/product',
            icon: 'icon-cup',
          },
          {
            name: 'Categories',
            url: '/table/category',
            icon: 'icon-briefcase',
          },
          {
            name: 'Structures',
            url: '/table/structures',
            icon: 'icon-home',
          },
          {
            name: 'Settings',
            url: '/table/stat',
            icon: 'icon-settings',
          },
          {
            name: 'Orders',
            url: '/table/order',
            icon: 'icon-pencil',
          },
          {
            name: 'Revpash',
            url: '/table/revpash',
            icon: 'icon-pencil',
            attributes: { disabled: true },
          },
          {
            name: 'Profile',
            url: '/table/profile',
            icon: 'icon-user',
            // attributes: { disabled: true },
          },
          {
            name: 'Register',
            url: '/table/register',
            icon: 'icon-star',
            attributes: { disabled: true },
          }
        ]
},
{
  name: 'Logout',
    url: '/table/logout',
      icon: 'icon-logout',
  },

  // {
  //   name: 'Widgets',
  //   url: '/widgets',
  //   icon: 'icon-calculator',
  //   badge: {
  //     variant: 'info',
  //     text: 'NEW'
  //   }
  // },
  // {
  //   divider: true
  // },
  // {
  //   title: true,
  //   name: 'Extras',
  // },

  //     {
  //       name: 'Error 404',
  //       url: '/404',
  //       icon: 'icon-star'
  //     },
  //     {
  //       name: 'Error 500',
  //       url: '/500',
  //       icon: 'icon-star'
  //     }
  //   ]
  // },
  // {
  //   name: 'Disabled',
  //   url: '/dashboard',
  //   icon: 'icon-ban',
  //   badge: {
  //     variant: 'secondary',
  //     text: 'NEW'
  //   },
  //   attributes: { disabled: true },
  // },
  // {
  //   name: 'Download CoreUI',
  //   url: 'http://coreui.io/angular/',
  //   icon: 'icon-cloud-download',
  //   class: 'mt-auto',
  //   variant: 'success',
  //   attributes: { target: '_blank', rel: 'noopener' }
  // },
  // {
  //   name: 'Try CoreUI PRO',
  //   url: 'http://coreui.io/pro/angular/',
  //   icon: 'icon-layers',
  //   variant: 'danger',
  //   attributes: { target: '_blank', rel: 'noopener' }
  // }
];
