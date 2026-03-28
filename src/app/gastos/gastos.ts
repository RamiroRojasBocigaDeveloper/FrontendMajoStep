import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GastoService, Gasto } from './gasto';
import { GastoDialog } from './gasto-dialog/gasto-dialog';

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <mat-card class="header-card">
      <div class="header-content">
        <div class="title-group">
          <h1>Gestión de Gastos</h1>
          <p>Registra salidas de dinero como nómina, servicios y compras locales</p>
        </div>
        <button mat-fab color="warn" (click)="abrirDialogoGasto()" title="Registrar Gasto">
          <mat-icon>add_circle</mat-icon>
        </button>
      </div>
    </mat-card>

    <mat-card class="luxury-card">
      <mat-card-content>
        <table mat-table [dataSource]="gastos()" class="full-width">
          <ng-container matColumnDef="fecha">
            <th mat-header-cell *matHeaderCellDef> Fecha </th>
            <td mat-cell *matCellDef="let g"> {{g.fecha | date:'short'}} </td>
          </ng-container>

          <ng-container matColumnDef="descripcion">
            <th mat-header-cell *matHeaderCellDef> Descripción </th>
            <td mat-cell *matCellDef="let g"> {{g.descripcion}} </td>
          </ng-container>

          <ng-container matColumnDef="categoria">
            <th mat-header-cell *matHeaderCellDef> Categoría </th>
            <td mat-cell *matCellDef="let g"> {{g.categoriaNombre || 'General'}} </td>
          </ng-container>

          <ng-container matColumnDef="monto">
            <th mat-header-cell *matHeaderCellDef> Monto </th>
            <td mat-cell *matCellDef="let g" class="monto-cell"> 
              {{g.monto | currency:'USD'}} 
            </td>
          </ng-container>

          <ng-container matColumnDef="usuario">
            <th mat-header-cell *matHeaderCellDef> Autor </th>
            <td mat-cell *matCellDef="let g"> {{g.nombreUsuario}} </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef> - </th>
            <td mat-cell *matCellDef="let g">
              <button mat-icon-button color="warn" (click)="eliminar(g.id)">
                <mat-icon>delete_outline</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="loading" class="loading-state">
          Cargando gastos...
        </div>

        <div *ngIf="!loading && gastos().length === 0" class="empty-state">
          <mat-icon>payments</mat-icon>
          <p>No hay gastos registrados.</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .header-container h1 {
      margin: 0;
      font-weight: 800;
      color: var(--dark-text);
    }
    .luxury-card {
      border-radius: 20px;
      box-shadow: var(--luxury-shadow);
      border: 1px solid var(--border-color);
    }
    .full-width { width: 100%; }
    .monto-cell {
      font-weight: 700;
      color: #d32f2f;
    }
    .loading-state, .empty-state {
      padding: 60px;
      text-align: center;
      color: var(--subtle-text);
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      opacity: 0.3;
    }
    ::ng-deep th.mat-mdc-header-cell {
      color: var(--primary-pink) !important;
      font-weight: 700 !important;
    }
  `]
})
export class Gastos implements OnInit {
  private gastoService = inject(GastoService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  gastos = signal<Gasto[]>([]);
  loading = false;
  displayedColumns = ['fecha', 'descripcion', 'categoria', 'monto', 'usuario', 'acciones'];

  ngOnInit() {
    this.cargarGastos();
  }

  cargarGastos() {
    this.loading = true;
    this.gastoService.obtenerTodos().subscribe({
      next: (data) => {
        this.gastos.set(data);
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar la lista de gastos', 'Cerrar');
        this.loading = false;
      }
    });
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este gasto?')) {
      this.gastoService.eliminar(id).subscribe({
        next: () => {
          this.snackBar.open('Gasto eliminado correctamente', 'OK');
          this.cargarGastos();
        }
      });
    }
  }

  abrirDialogoGasto() {
    const dialogRef = this.dialog.open(GastoDialog, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.gastoService.crear(result).subscribe({
          next: () => {
            this.snackBar.open('Gasto registrado con éxito', 'OK');
            this.cargarGastos();
          }
        });
      }
    });
  }
}
