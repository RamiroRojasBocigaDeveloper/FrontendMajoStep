import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Layout } from './layout/layout';
import { Ventas } from './ventas/ventas';
import { Categorias } from './categorias/categorias';
import { Inventarios } from './inventario/inventarios';
import { Gastos } from './gastos/gastos';
import { Reportes } from './reportes/reportes';
import { Usuarios } from './usuarios/usuarios';
import { SesionesTrabajo } from './sesiones-trabajo/sesiones-trabajo';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'ventas', component: Ventas },
      { path: 'categorias', component: Categorias },
      { path: 'inventario', component: Inventarios },
      { path: 'gastos', component: Gastos },
      { path: 'reportes', component: Reportes },
      { path: 'usuarios', component: Usuarios },
      { path: 'sesiones-trabajo', component: SesionesTrabajo },
      { path: '', redirectTo: 'sesiones-trabajo', pathMatch: 'full' }
    ]
  }
];
