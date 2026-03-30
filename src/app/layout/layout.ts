import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth/auth';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SesionTrabajoService } from '../sesiones-trabajo/sesion-trabajo';

@Component({
  selector: 'app-confirm-logout-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="dialog-wrapper">
      <div class="dialog-icon">⚠️</div>
      <h2 class="dialog-title">¡Tienes la Caja Abierta!</h2>
      <p class="dialog-subtitle">Tu caja registradora sigue activa. ¿Qué deseas hacer antes de salir?</p>

      <div class="dialog-options">
        <button class="opt-btn opt-danger" (click)="dialogRef.close('CERRAR_CAJA')">
          <mat-icon>lock</mat-icon>
          <span>
            <strong>Cerrar Caja y Salir</strong>
            <small>Cierra la caja y finaliza tu sesión</small>
          </span>
        </button>

        <button class="opt-btn opt-neutral" (click)="dialogRef.close('SOLO_SALIR')">
          <mat-icon>logout</mat-icon>
          <span>
            <strong>Solo Cerrar Sesión</strong>
            <small>La caja queda abierta hasta mañana</small>
          </span>
        </button>

        <button class="opt-btn opt-cancel" (click)="dialogRef.close('CANCELAR')">
          <mat-icon>arrow_back</mat-icon>
          <span>
            <strong>Cancelar</strong>
            <small>Volver a la aplicación</small>
          </span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-wrapper { padding: 24px; text-align: center; }
    .dialog-icon { font-size: 3rem; margin-bottom: 8px; }
    .dialog-title { font-size: 1.5rem; font-weight: 800; color: #c62828; margin: 0 0 8px 0; }
    .dialog-subtitle { color: #555; margin: 0 0 24px 0; font-size: 0.95rem; }
    .dialog-options { display: flex; flex-direction: column; gap: 12px; }
    .opt-btn {
      display: flex; align-items: center; gap: 16px;
      padding: 14px 20px; border-radius: 12px; border: 2px solid transparent;
      cursor: pointer; text-align: left; width: 100%; transition: all 0.2s;
      background: #f5f5f5;
    }
    .opt-btn mat-icon { font-size: 1.8rem; width: 1.8rem; height: 1.8rem; flex-shrink: 0; }
    .opt-btn span { display: flex; flex-direction: column; }
    .opt-btn strong { font-size: 1rem; font-weight: 700; }
    .opt-btn small { font-size: 0.78rem; color: #777; margin-top: 2px; }
    .opt-danger { background: #fff3f3; border-color: #ef9a9a; color: #c62828; }
    .opt-danger:hover { background: #ffebee; border-color: #c62828; transform: translateY(-1px); }
    .opt-danger mat-icon { color: #c62828; }
    .opt-neutral { background: #f3f6ff; border-color: #90a4e8; color: #283593; }
    .opt-neutral:hover { background: #e8eaf6; border-color: #283593; transform: translateY(-1px); }
    .opt-neutral mat-icon { color: #3949ab; }
    .opt-cancel { background: #f9f9f9; border-color: #e0e0e0; color: #555; }
    .opt-cancel:hover { background: #f0f0f0; border-color: #aaa; transform: translateY(-1px); }
    .opt-cancel mat-icon { color: #777; }
  `]
})
export class ConfirmLogoutDialog {
  constructor(public dialogRef: MatDialogRef<ConfirmLogoutDialog>) {}
}

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
    MatButtonModule,
    MatDialogModule
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
          <a mat-list-item routerLink="/sesiones-trabajo" routerLinkActive="active-link">
            <mat-icon matListItemIcon>point_of_sale</mat-icon>
            <span matListItemTitle>Sesión / Caja</span>
          </a>
          <a mat-list-item routerLink="/inventario" routerLinkActive="active-link">
            <mat-icon matListItemIcon>inventory_2</mat-icon>
            <span matListItemTitle>Inventario</span>
          </a>
          <a mat-list-item routerLink="/categorias" routerLinkActive="active-link">
            <mat-icon matListItemIcon>category</mat-icon>
            <span matListItemTitle>Categorías</span>
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
export class Layout {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private sesionService = inject(SesionTrabajoService);

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getNombreUsuario(): string {
    const user = this.authService.getCurrentUser();
    return user ? user.nombre : 'Usuario';
  }

  logout() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.ejecutarLogout();
      return;
    }

    // Verificar si hay sesión activa antes de salir
    this.sesionService.obtenerSesionActiva(user.id).subscribe({
      next: (sesion) => {
        if (sesion && sesion.estado?.toUpperCase() === 'ABIERTA') {
          // Abrir el diálogo espectacular
          const dialogRef = this.dialog.open(ConfirmLogoutDialog, {
            width: '450px',
            disableClose: true
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result === 'CERRAR_CAJA') {
              // Cerramos caja y salimos
              this.sesionService.cerrarSesion(sesion.id).subscribe({
                next: () => this.ejecutarLogout(),
                error: (err) => {
                  console.error('Error cerrando caja:', err);
                  this.ejecutarLogout(); // Salimos igual, aunque haya error, para no dejarlo atrapado
                }
              });
            } else if (result === 'SOLO_SALIR') {
              this.ejecutarLogout();
            }
          });
        } else {
          this.ejecutarLogout();
        }
      },
      error: () => {
        // Si hay error (No tiene caja abierta), simplemente salimos
        this.ejecutarLogout();
      }
    });
  }

  private ejecutarLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
