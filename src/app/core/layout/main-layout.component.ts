import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" fixedInViewport
          [attr.role]="'navigation'"
          [mode]="'side'"
          [opened]="true">
        <mat-toolbar color="primary">Menú</mat-toolbar>
        <mat-nav-list>
          <a mat-list-item routerLink="/ventas" routerLinkActive="active-link">
            <mat-icon matListItemIcon>shopping_cart</mat-icon>
            <span matListItemTitle>Ventas (TPV)</span>
          </a>
          <a mat-list-item routerLink="/inventario" routerLinkActive="active-link">
            <mat-icon matListItemIcon>inventory_2</mat-icon>
            <span matListItemTitle>Inventario</span>
          </a>
          <a mat-list-item routerLink="/gastos" routerLinkActive="active-link" *ngIf="isAdmin()">
            <mat-icon matListItemIcon>payments</mat-icon>
            <span matListItemTitle>Gastos</span>
          </a>
          <a mat-list-item routerLink="/reportes" routerLinkActive="active-link" *ngIf="isAdmin()">
            <mat-icon matListItemIcon>assessment</mat-icon>
            <span matListItemTitle>Reportes</span>
          </a>
          <a mat-list-item routerLink="/usuarios" routerLinkActive="active-link" *ngIf="isAdmin()">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Usuarios</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button type="button" aria-label="Toggle sidenav" mat-icon-button (click)="drawer.toggle()">
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>
          <span class="toolbar-title">Chancla Lite <span class="user-badge">{{ getNombreUsuario() }}</span></span>
          <span class="spacer"></span>
          <button mat-icon-button (click)="logout()" title="Cerrar Sesión">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>
        
        <div class="main-content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
      background-color: var(--bg-main);
    }
    .sidenav {
      width: 280px;
      border-right: 1px solid var(--border-color);
      background-color: var(--bg-card);
      box-shadow: 10px 0 30px rgba(0, 0, 0, 0.02);
    }
    .spacer {
      flex: 1 1 auto;
    }
    .main-content {
      padding: 30px;
      background-color: var(--bg-main);
      min-height: calc(100vh - 64px);
    }
    .toolbar-title {
      font-weight: 800;
      letter-spacing: -0.5px;
      font-size: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-badge {
      font-size: 12px;
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 400;
      letter-spacing: 0;
    }
    .active-link {
      background-color: var(--primary-pink) !important;
      color: white !important;
      font-weight: 700 !important;
      box-shadow: 0 4px 15px rgba(216, 27, 96, 0.2);
    }
    .active-link mat-icon {
      color: white !important;
    }
    mat-toolbar {
      background: var(--vibrant-gradient) !important;
      color: white !important;
      box-shadow: 0 4px 20px rgba(216, 27, 96, 0.15);
    }
    mat-nav-list a {
      margin: 8px 16px;
      border-radius: 12px;
      color: var(--dark-text) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      height: 52px !important;
      font-weight: 500;
    }
    /* Forzar el color del texto interno provisto por Material */
    mat-nav-list a .mdc-list-item__primary-text,
    mat-nav-list a span[matListItemTitle] {
      color: var(--dark-text) !important;
    }
    .active-link .mdc-list-item__primary-text,
    .active-link span[matListItemTitle] {
      color: white !important;
    }
    mat-nav-list a:hover {
      background-color: rgba(216, 27, 96, 0.05);
      color: var(--primary-pink) !important;
      transform: translateX(5px);
    }
    mat-nav-list a:hover .mdc-list-item__primary-text,
    mat-nav-list a:hover span[matListItemTitle] {
      color: var(--primary-pink) !important;
    }
    mat-nav-list a:hover mat-icon {
      color: var(--primary-pink) !important;
    }
    mat-icon[matListItemIcon] {
      color: var(--subtle-text);
      margin-right: 16px !important;
    }
  `]
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getNombreUsuario(): string {
    const user = this.authService.getCurrentUser();
    return user ? user.nombre : 'Usuario';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
