export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
  badge?: { text: string; variant: 'primary' | 'success' | 'danger' | 'warning' };
  roles?: string[];
  feature?: string;
  separator?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
  collapsible?: boolean;
}

export const navigation: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'layout-dashboard',
        route: '/dashboard'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: 'bar-chart-3',
        route: '/analytics',
        badge: { text: 'New', variant: 'primary' }
      },
    ]
  },
  {
    label: 'Management',
    items: [
      {
        id: 'users',
        label: 'Users',
        icon: 'users',
        route: '/users',
        badge: { text: '24', variant: 'danger' }
      },
      {
        id: 'products',
        label: 'Products',
        icon: 'package',
        children: [
          { id: 'products-list', label: 'All Products', icon: 'list', route: '/products' },
          { id: 'products-add', label: 'Add Product', icon: 'plus', route: '/products/new' },
          { id: 'categories', label: 'Categories', icon: 'tag', route: '/products/categories' },
        ]
      },
      {
        id: 'orders',
        label: 'Orders',
        icon: 'shopping-cart',
        route: '/orders',
        badge: { text: '5', variant: 'warning' }
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: 'file-text',
        route: '/reports'
      },
    ]
  },
  {
    label: 'Content',
    items: [
      {
        id: 'pages',
        label: 'Pages',
        icon: 'file',
        route: '/pages'
      },
      {
        id: 'media',
        label: 'Media',
        icon: 'image',
        route: '/media'
      },
    ]
  },
  {
    label: 'System',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        route: '/settings'
      },
      {
        id: 'help',
        label: 'Help & Docs',
        icon: 'help-circle',
        route: '/help'
      },
    ]
  }
];
