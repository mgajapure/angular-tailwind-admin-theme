import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard',
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent),
        title: 'Analytics',
      },
      // Management
      {
        path: 'users',
        loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent),
        title: 'Users',
      },
      {
        path: 'products',
        loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent),
        title: 'Products',
      },
      {
        path: 'products/new',
        loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent),
        title: 'Add Product',
      },
      {
        path: 'products/categories',
        loadComponent: () => import('./features/products/product-categories.component').then(m => m.ProductCategoriesComponent),
        title: 'Product Categories',
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent),
        title: 'Edit Product',
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent),
        title: 'Orders',
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
        title: 'Reports',
      },
      // Content
      {
        path: 'pages',
        loadComponent: () => import('./features/pages/pages.component').then(m => m.PagesComponent),
        title: 'Pages',
      },
      {
        path: 'media',
        loadComponent: () => import('./features/media/media.component').then(m => m.MediaComponent),
        title: 'Media Library',
      },
      // System
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
        title: 'Settings',
      },
      {
        path: 'help',
        loadComponent: () => import('./features/help/help.component').then(m => m.HelpComponent),
        title: 'Help & Docs',
      },
    ]
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
        title: 'Sign In'
      },
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found'
  }
];
