import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { SesionTrabajoService, SesionTrabajo } from './sesion-trabajo';
import { AuthService } from '../auth/auth';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-sesiones-trabajo',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <mat-card class="header-card">
      <div class="header-content">
        <div class="title-group">
          <h1>Control de Caja / Sesiones</h1>
          <p>Gestiona la apertura y cierre de caja de tu turno actual.</p>
        </div>
      </div>
    </mat-card>

    <div class="sesion-container">
      <mat-card class="status-card luxury-card">
        <mat-card-header>
          <mat-card-title>Estado Actual</mat-card-title>
        </mat-card-header>
        <mat-card-content class="status-content">
          <div *ngIf="loading()" class="loading">Cargando información...</div>
          
          <div *ngIf="!loading()">
            <div *ngIf="sesionActiva(); else sinSesion">
              <div class="status-indicator active">
                <mat-icon>check_circle</mat-icon>
                <span>Caja Abierta</span>
              </div>
              <p><strong>Operador:</strong> {{ sesionActiva()?.nombreUsuario }}</p>
              <p><strong>Apertura:</strong> {{ sesionActiva()?.horaInicio | date:'medium' }}</p>
              <p><strong>Estado:</strong> {{ sesionActiva()?.estado }}</p>
              
              <button mat-flat-button color="warn" class="action-btn" (click)="cerrarCaja()">
                <mat-icon>lock</mat-icon>
                Cerrar Caja
              </button>
            </div>

            <ng-template #sinSesion>
              <div class="status-indicator inactive">
                <mat-icon>lock</mat-icon>
                <span>Caja Cerrada</span>
              </div>
              <p>Para empezar a realizar ventas, debes abrir caja (iniciar sesión de trabajo).</p>
              
              <button mat-flat-button color="primary" class="action-btn popup-btn" (click)="abrirCaja()">
                <mat-icon>lock_open</mat-icon>
                Abrir Caja
              </button>
            </ng-template>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="history-card luxury-card">
        <mat-card-header>
          <mat-card-title>Mi Historial de Turnos</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="historial()" class="full-width">
            
            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef> Estado </th>
              <td mat-cell *matCellDef="let s"> 
                <span class="badge" [class.badge-active]="s.estado === 'ABIERTA'">{{ s.estado }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="inicio">
              <th mat-header-cell *matHeaderCellDef> Inicio </th>
              <td mat-cell *matCellDef="let s"> {{ s.horaInicio | date:'short' }} </td>
            </ng-container>

            <ng-container matColumnDef="fin">
              <th mat-header-cell *matHeaderCellDef> Fin </th>
              <td mat-cell *matCellDef="let s"> {{ s.horaFin ? (s.horaFin | date:'short') : '-' }} </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="['estado', 'inicio', 'fin']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['estado', 'inicio', 'fin'];"></tr>
          </table>
          <p *ngIf="historial().length === 0 && !loading()" class="empty-state">No tienes historial de sesiones.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .header-card { margin-bottom: 24px; padding: 24px; border-radius: 12px; border-left: 6px solid var(--primary-pink); }
    .header-content h1 { margin: 0 0 8px 0; font-weight: 800; color: var(--dark-text); font-size: 2rem; }
    .header-content p { margin: 0; color: #666; font-size: 1.1rem; }
    .sesion-container { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; }
    .luxury-card { border-radius: 20px; box-shadow: var(--luxury-shadow); border: 1px solid var(--border-color); padding: 16px; }
    .status-content { padding: 24px; text-align: center; }
    .status-indicator { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 20px; font-size: 1.5rem; font-weight: 700; }
    .status-indicator mat-icon { font-size: 4rem; width: 4rem; height: 4rem; }
    .active { color: #4caf50; }
    .inactive { color: #f44336; }
    .action-btn { width: 100%; margin-top: 20px; padding: 24px 0; border-radius: 12px; font-size: 1.1rem; font-weight: bold; }
    .popup-btn { background: linear-gradient(135deg, var(--primary-pink), #e91e63); border: none; transition: transform 0.2s; }
    .popup-btn:hover { transform: scale(1.02); }
    .full-width { width: 100%; }
    .badge { padding: 4px 8px; border-radius: 8px; background: #e0e0e0; font-weight: 600; font-size: 0.8rem; }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .empty-state { text-align: center; padding: 20px; color: #757575; }
    .loading { padding: 40px; color: #999; }
    ::ng-deep th.mat-mdc-header-cell { background: #fafafa !important; font-weight: 700 !important; }
    @media (max-width: 768px) { .sesion-container { grid-template-columns: 1fr; } }
  `]
})
export class SesionesTrabajo implements OnInit {
  private sesionService = inject(SesionTrabajoService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  sesionActiva = signal<SesionTrabajo | null>(null);
  historial = signal<SesionTrabajo[]>([]);
  loading = signal<boolean>(true);

  private get userId(): number {
    return this.authService.getCurrentUser()?.id || 0;
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    const id = this.userId;
    if (!id) {
      this.snackBar.open('Usuario no autenticado (falta ID)', 'Cerrar');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    
    this.sesionService.obtenerSesionActiva(id).pipe(
      finalize(() => this.cargarHistorial())
    ).subscribe({
      next: (sesion) => {
        this.sesionActiva.set(sesion);
      },
      error: (err) => {
        console.error('Error obtenerSesionActiva:', err);
        // this.snackBar.open('Debug GET Activa: ' + err.status + ' ' + (err.error?.message || err.message), 'Cerrar', {duration: 8000});
        this.sesionActiva.set(null);
      }
    });
  }

  cargarHistorial() {
    this.sesionService.obtenerHistorial(this.userId).subscribe({
      next: (historico) => {
        const sorted = historico.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.historial.set(sorted);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error obtenerHistorial:', err);
        this.snackBar.open('Error cargando historial: ' + err.status + ' ' + (err.error?.message || err.message), 'Cerrar', {duration: 8000});
        this.loading.set(false);
      }
    });
  }

  abrirCaja() {
    this.loading.set(true);
    this.sesionService.abrirSesion(this.userId).subscribe({
      next: (sesion) => {
        this.snackBar.open('Caja Abierta Exitosamente', 'OK', { duration: 3000 });
        this.sesionActiva.set(sesion);
        this.cargarHistorial();
      },
      error: (err) => {
        const errorMsg = typeof err.error === 'string' ? err.error : (err.error?.message || err.message);
        this.snackBar.open('Error al abrir caja: ' + errorMsg, 'Cerrar', { duration: 5000 });
        this.loading.set(false);
      }
    });
  }

  cerrarCaja() {
    const sesion = this.sesionActiva();
    if (!sesion) return;

    this.loading.set(true);
    this.sesionService.cerrarSesion(sesion.id).subscribe({
      next: () => {
        this.snackBar.open('Caja Cerrada Exitosamente', 'OK', { duration: 3000 });
        this.sesionActiva.set(null);
        this.cargarDatos();
      },
      error: (err) => {
        const errorMsg = typeof err.error === 'string' ? err.error : (err.error?.message || err.message);
        this.snackBar.open('Error al cerrar caja: ' + errorMsg, 'Cerrar', { duration: 5000 });
        this.loading.set(false);
      }
    });
  }
}
