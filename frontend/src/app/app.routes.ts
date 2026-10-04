import { Routes } from '@angular/router';

export const routes: Routes = [
  // 1. Rota Pública Inicial (Home Landing Page)
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'BlueFox Finance | Gestão & Governança Financeira',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Home | BlueFox Finance',
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
    title: 'Sobre o BlueFox Finance | Blue Fox Global Group',
  },
  {
    path: 'updates',
    loadComponent: () =>
      import('./pages/updates/updates.component').then((m) => m.UpdatesComponent),
    title: 'Atualizações & Roadmap | BlueFox Finance',
  },

  // 2. Plataforma Interna (Gestão Financeira & IAM)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'Dashboard | BlueFox Finance',
  },
  {
    path: 'expenses',
    loadComponent: () =>
      import('./pages/expense-list/expense-list.component').then((m) => m.ExpenseListComponent),
    title: 'Expenses | BlueFox Finance',
  },
  {
    path: 'expenses/new',
    loadComponent: () =>
      import('./pages/expense-form/expense-form.component').then((m) => m.ExpenseFormComponent),
    title: 'New Expense | BlueFox Finance',
  },
  {
    path: 'payment-methods',
    loadComponent: () =>
      import('./pages/payment-methods/payment-methods.component').then(
        (m) => m.PaymentMethodsComponent,
      ),
    title: 'Payment Methods | BlueFox Finance',
  },
  {
    path: 'stores',
    loadComponent: () =>
      import('./pages/stores/stores.component').then((m) => m.StoresComponent),
    title: 'Stores & Establishments | BlueFox Finance',
  },
  {
    path: 'buyers',
    loadComponent: () =>
      import('./pages/buyers/buyers.component').then((m) => m.BuyersComponent),
    title: 'Buyers | BlueFox Finance',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.component').then((m) => m.AdminComponent),
    title: 'Administration Hub | BlueFox Finance',
  },
  {
    path: 'admin/item-categories',
    loadComponent: () =>
      import('./pages/admin/item-categories/item-categories.component').then(
        (m) => m.ItemCategoriesComponent,
      ),
    title: 'Item Categories | BlueFox Finance',
  },
  {
    path: 'admin/store-categories',
    loadComponent: () =>
      import('./pages/admin/store-categories/store-categories.component').then(
        (m) => m.StoreCategoriesComponent,
      ),
    title: 'Store Categories | BlueFox Finance',
  },
  {
    path: 'admin/user-profile',
    loadComponent: () =>
      import('./pages/admin/user-profile/user-profile.component').then(
        (m) => m.UserProfileComponent,
      ),
    title: 'User Profile | BlueFox Finance',
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
