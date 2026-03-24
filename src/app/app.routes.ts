import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { VentaComponent } from './features/ventas/venta.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'ventas', component: VentaComponent },
      { 
        path: 'inventario', 
        loadChildren: () => import('./features/inventario/categorias/categorias.module').then(m => m.CategoriasModule) 
      },
      { path: '', redirectTo: 'ventas', pathMatch: 'full' }
    ]
  }
];
