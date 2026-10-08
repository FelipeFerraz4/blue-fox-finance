import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // 1. Rota Pública Inicial (Home Landing Page)
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'updates',
    loadComponent: () =>
      import('./pages/updates/updates.component').then((m) => m.UpdatesComponent),
  },

  // 2. Plataforma Interna (Gestão Financeira & IAM Protegidos)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'expenses',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/expense-list/expense-list.component').then((m) => m.ExpenseListComponent),
  },
  {
    path: 'expenses/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/expense-form/expense-form.component').then((m) => m.ExpenseFormComponent),
  },
  {
    path: 'payment-methods',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/payment-methods/payment-methods.component').then(
        (m) => m.PaymentMethodsComponent,
      ),
  },
  {
    path: 'stores',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/stores/stores.component').then((m) => m.StoresComponent),
  },
  {
    path: 'buyers',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/buyers/buyers.component').then((m) => m.BuyersComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin/admin.component').then((m) => m.AdminComponent),
  },
  {
    path: 'admin/item-categories',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin/item-categories/item-categories.component').then(
        (m) => m.ItemCategoriesComponent,
      ),
  },
  {
    path: 'admin/store-categories',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin/store-categories/store-categories.component').then(
        (m) => m.StoreCategoriesComponent,
      ),
  },
  {
    path: 'admin/user-profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin/user-profile/user-profile.component').then(
        (m) => m.UserProfileComponent,
      ),
  },

  // 3. Redirecionamentos de Compatibilidade (Rotas legadas em Português)
  { path: 'lancamentos', redirectTo: 'expenses', pathMatch: 'full' },
  { path: 'lancamentos/novo', redirectTo: 'expenses/new', pathMatch: 'full' },
  { path: 'meios-pagamento', redirectTo: 'payment-methods', pathMatch: 'full' },
  { path: 'lojas', redirectTo: 'stores', pathMatch: 'full' },
  { path: 'compradores', redirectTo: 'buyers', pathMatch: 'full' },
  { path: 'admin/categorias-itens', redirectTo: 'admin/item-categories', pathMatch: 'full' },
  { path: 'admin/categorias-lojas', redirectTo: 'admin/store-categories', pathMatch: 'full' },
  { path: 'admin/usuario', redirectTo: 'admin/user-profile', pathMatch: 'full' },

  // 4. Wildcard Catch-all
  {
    path: '**',
    redirectTo: '',
  },
];
