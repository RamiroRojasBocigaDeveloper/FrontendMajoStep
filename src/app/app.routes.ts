import { Routes } from '@angular/router';
import { Login } from './login/login';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { VentaComponent } from './features/ventas/venta.component';
import { Categorias } from './categorias/categorias';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'ventas', component: VentaComponent },
      { path: 'categorias', component: Categorias },
      { path: '', redirectTo: 'ventas', pathMatch: 'full' }
    ]
  }
];
