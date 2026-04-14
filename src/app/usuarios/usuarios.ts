import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsuarioService, Usuario } from './usuario';
import { UsuarioDialog } from './usuario-dialog/usuario-dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-reset-password-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule, FormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="dialog-wrapper">
      <div class="dialog-icon">🔐</div>
      <h2 class="dialog-title">Resetear Contraseña</h2>
      <p class="dialog-subtitle">Ingresa la nueva contraseña para <strong>{{ data.nombre }}</strong></p>

      <mat-form-field appearance="outline" style="width: 100%;">
        <mat-label>Nueva Contraseña</mat-label>
        <input matInput [type]="mostrarPassword ? 'text' : 'password'" [(ngModel)]="nuevaPassword" placeholder="Mínimo 4 caracteres">
        <button mat-icon-button matSuffix (click)="mostrarPassword = !mostrarPassword" type="button">
          <mat-icon>{{ mostrarPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
      </mat-form-field>

      <div class="dialog-actions">
        <button mat-stroked-button (click)="dialogRef.close()">Cancelar</button>
        <button mat-flat-button color="primary" [disabled]="nuevaPassword.length < 4" (click)="dialogRef.close(nuevaPassword)">
          <mat-icon>lock_reset</mat-icon> Guardar Nueva Contraseña
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-wrapper { padding: 24px; text-align: center; }
    .dialog-icon { font-size: 3rem; margin-bottom: 8px; }
    .dialog-title { font-size: 1.4rem; font-weight: 800; color: var(--primary-pink); margin: 0 0 8px 0; }
    .dialog-subtitle { color: #555; margin: 0 0 20px 0; font-size: 0.95rem; }
    .dialog-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
  `]
})
export class ResetPasswordDialog {
  dialogRef = inject(MatDialogRef<ResetPasswordDialog>);
  data = inject(MAT_DIALOG_DATA);
  nuevaPassword = '';
  mostrarPassword = false;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule
  ],
  template: `
    <mat-card class="header-card">
      <div class="header-content">
        <div class="title-group">
          <h1>Gestión de Usuarios</h1>
          <p>Administra los accesos, roles y sueldos de tu equipo de trabajo</p>
        </div>
        <button mat-fab color="primary" (click)="abrirDialogo()" title="Nuevo Usuario">
          <mat-icon>person_add</mat-icon>
        </button>
      </div>
    </mat-card>

    <mat-card class="luxury-card">
      <mat-card-content>
        <table mat-table [dataSource]="usuarios()" class="full-width">
          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef> Nombre </th>
            <td mat-cell *matCellDef="let u"> {{u.nombre}} </td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef> Email </th>
            <td mat-cell *matCellDef="let u"> {{u.email}} </td>
          </ng-container>

          <ng-container matColumnDef="rol">
            <th mat-header-cell *matHeaderCellDef> Rol </th>
            <td mat-cell *matCellDef="let u">
              <mat-chip-set>
                <mat-chip [color]="u.rolNombre === 'ADMINISTRADOR' ? 'warn' : 'primary'">
                  {{ u.rolNombre || 'S/R' }}
                </mat-chip>
              </mat-chip-set>
            </td>
          </ng-container>

          <ng-container matColumnDef="estado">
            <th mat-header-cell *matHeaderCellDef> Estado </th>
            <td mat-cell *matCellDef="let u">
              <span [class.status-active]="u.activo" [class.status-inactive]="!u.activo">
                {{ u.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="sueldo">
            <th mat-header-cell *matHeaderCellDef> Sueldo Diario </th>
            <td mat-cell *matCellDef="let u"> {{u.sueldoDiario | currency:'USD'}} </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef> Acciones </th>
            <td mat-cell *matCellDef="let u">
              <button mat-icon-button color="accent" (click)="abrirDialogo(u)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button [color]="u.activo ? 'warn' : 'primary'" (click)="toggleEstado(u)">
                <mat-icon>{{ u.activo ? 'person_off' : 'person' }}</mat-icon>
              </button>
              <button mat-icon-button color="primary" (click)="resetearPassword(u)" title="Resetear Contraseña">
                <mat-icon>lock_reset</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        
        <div *ngIf="loading" class="loading-state">
          Cargando usuarios...
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .header-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .full-width { width: 100%; }
    .status-active { color: #43a047; font-weight: bold; }
    .status-inactive { color: #f44336; font-weight: bold; }
    .loading-state { padding: 40px; text-align: center; color: var(--subtle-text); }
  `]
})
export class Usuarios implements OnInit {
  private usuarioService = inject(UsuarioService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  usuarios = signal<Usuario[]>([]);
  loading = false;
  displayedColumns = ['nombre', 'email', 'rol', 'estado', 'sueldo', 'acciones'];

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loading = true;
    this.usuarioService.obtenerTodos().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  abrirDialogo(usuario?: Usuario) {
    const dialogRef = this.dialog.open(UsuarioDialog, {
      width: '450px',
      data: usuario || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (usuario?.id) {
          this.usuarioService.actualizar(usuario.id, result).subscribe({
            next: () => {
              this.snackBar.open('Usuario actualizado', 'OK');
              this.cargarUsuarios();
            }
          });
        } else {
          this.usuarioService.crear(result).subscribe({
            next: () => {
              this.snackBar.open('Usuario creado', 'OK');
              this.cargarUsuarios();
            }
          });
        }
      }
    });
  }

  toggleEstado(usuario: Usuario) {
    if (usuario.id) {
      this.usuarioService.cambiarEstado(usuario.id, !usuario.activo).subscribe({
        next: () => {
          this.snackBar.open('Estado actualizado', 'OK');
          this.cargarUsuarios();
        }
      });
    }
  }

  resetearPassword(usuario: Usuario) {
    const dialogRef = this.dialog.open(ResetPasswordDialog, {
      width: '420px',
      data: { nombre: usuario.nombre }
    });

    dialogRef.afterClosed().subscribe(nuevaPassword => {
      if (nuevaPassword && usuario.id) {
        this.usuarioService.resetearPassword(usuario.id, nuevaPassword).subscribe({
          next: () => {
            this.snackBar.open(`Contraseña de ${usuario.nombre} actualizada con éxito`, 'OK', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Error al resetear la contraseña', 'Cerrar', { duration: 4000 });
          }
        });
      }
    });
  }
}
