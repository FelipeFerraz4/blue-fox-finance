import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'Dashboard | BlueFox Spend',
  },
  {
    path: 'lancamentos',
    loadComponent: () =>
      import('./pages/expense-list/expense-list.component').then((m) => m.ExpenseListComponent),
    title: 'Lançamentos | BlueFox Spend',
  },
  {
    path: 'lancamentos/novo',
    loadComponent: () =>
      import('./pages/expense-form/expense-form.component').then((m) => m.ExpenseFormComponent),
    title: 'Novo Lançamento | BlueFox Spend',
  },
  {
    path: 'meios-pagamento',
    loadComponent: () =>
      import('./pages/payment-methods/payment-methods.component').then(
        (m) => m.PaymentMethodsComponent,
      ),
    title: 'Meios de Pagamento | BlueFox Spend',
  },
  {
    path: 'lojas',
    loadComponent: () =>
      import('./pages/stores/stores.component').then((m) => m.StoresComponent),
    title: 'Lojas & Estabelecimentos | BlueFox Spend',
  },
  {
    path: 'compradores',
    loadComponent: () =>
      import('./pages/buyers/buyers.component').then((m) => m.BuyersComponent),
    title: 'Compradores | BlueFox Spend',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.component').then((m) => m.AdminComponent),
    title: 'Administração & Hub | BlueFox Spend',
  },
  {
    path: 'admin/categorias-itens',
    loadComponent: () =>
      import('./pages/admin/item-categories/item-categories.component').then(
        (m) => m.ItemCategoriesComponent,
      ),
    title: 'Categorias de Itens | BlueFox Spend',
  },
  {
    path: 'admin/categorias-lojas',
    loadComponent: () =>
      import('./pages/admin/store-categories/store-categories.component').then(
        (m) => m.StoreCategoriesComponent,
      ),
    title: 'Categorias de Lojas | BlueFox Spend',
  },
  {
    path: 'admin/usuario',
    loadComponent: () =>
      import('./pages/admin/user-profile/user-profile.component').then(
        (m) => m.UserProfileComponent,
      ),
    title: 'Perfil do Usuário | BlueFox Spend',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
