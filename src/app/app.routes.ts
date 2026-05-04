import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './core/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'inicio',
      },
      {
        path: 'inicio',
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'login',
        loadComponent: () => import('./features/login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/register/register.page').then((m) => m.RegisterPage),
      },
      {
        path: 'plantas',
        loadComponent: () => import('./features/plantas/plantas.page').then((m) => m.PlantasPage),
      },
      {
        path: 'sugerencias',
        loadComponent: () => import('./features/sugerencias/sugerencias.page').then((m) => m.SugerenciasPage),
      },
      {
        path: 'dudas-ia',
        loadComponent: () => import('./pages/dudas-ia/dudas-ia.page').then((m) => m.DudasIaPage),
      },
      {
        path: 'inventario',
        canActivate: [authGuard],
        loadComponent: () => import('./features/inventario/inventario.page').then((m) => m.InventarioPage),
      },
      {
        path: 'cuidados',
        canActivate: [authGuard],
        loadComponent: () => import('./features/cuidados/cuidados.page').then((m) => m.CuidadosPage),
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin.page').then((m) => m.AdminPage),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
