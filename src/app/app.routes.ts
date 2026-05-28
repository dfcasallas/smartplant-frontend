import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { adminGuard, authGuard, guestGuard, rootRedirectGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [rootRedirectGuard],
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'home',
        redirectTo: 'inicio',
      },
      {
        path: 'inicio',
        canActivate: [authGuard],
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/register/register.page').then((m) => m.RegisterPage),
      },
      {
        path: 'plantas',
        canActivate: [authGuard],
        loadComponent: () => import('./features/plantas/plantas.page').then((m) => m.PlantasPage),
      },
      {
        path: 'sugerencias',
        canActivate: [authGuard],
        loadComponent: () => import('./features/sugerencias/sugerencias.page').then((m) => m.SugerenciasPage),
      },
      {
        path: 'dudas-ia',
        canActivate: [authGuard],
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
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/admin.page').then((m) => m.AdminPage),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
