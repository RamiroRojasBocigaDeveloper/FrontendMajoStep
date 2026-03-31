import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { ProductoService, Producto } from '../productos/producto';
import { MovimientoInventarioService } from './inventario';
import { InventarioDialog } from './inventario-dialog/inventario-dialog';
import { ProductoDialog } from '../productos/producto-dialog/producto-dialog';

@Component({
  selector: 'app-inventarios',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSelectModule
  ],
  template: `
    <mat-card class="header-card">
      <div class="header-content">
        <div class="title-group">
          <h1>Inventario de Productos</h1>
          <p>Control de stock, precios y referencias de tu calzado</p>
        </div>
        <button mat-fab color="primary" (click)="abrirDialogoProducto()" title="Nuevo Producto">
          <mat-icon>add</mat-icon>
        </button>
      </div>
    </mat-card>

    <mat-card class="luxury-card">
      <mat-card-content>
        <table mat-table [dataSource]="productos()" class="full-width">
          <ng-container matColumnDef="referencia">
            <th mat-header-cell *matHeaderCellDef> Referencia </th>
            <td mat-cell *matCellDef="let p"> <code>{{p.referencia}}</code> </td>
          </ng-container>

          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef> Nombre </th>
            <td mat-cell *matCellDef="let p"> {{p.nombre}} </td>
          </ng-container>

          <ng-container matColumnDef="categoria">
            <th mat-header-cell *matHeaderCellDef> Categoría </th>
            <td mat-cell *matCellDef="let p"> 
              <mat-chip-set>
                <mat-chip>{{p.categoriaNombre || 'Sin Categoría'}}</mat-chip>
              </mat-chip-set>
            </td>
          </ng-container>

          <ng-container matColumnDef="precio">
            <th mat-header-cell *matHeaderCellDef> Precio </th>
            <td mat-cell *matCellDef="let p"> {{p.precioVenta | currency:'USD'}} </td>
          </ng-container>

          <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef> Stock </th>
            <td mat-cell *matCellDef="let p">
              <span [class.stock-low]="p.stockActual <= 5">
                {{p.stockActual}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="estado">
            <th mat-header-cell *matHeaderCellDef> Estado </th>
            <td mat-cell *matCellDef="let p">
              <span [class.status-active]="p.activo" [class.status-inactive]="!p.activo">
                {{ p.activo ? 'Disponible' : 'Inactivo' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef> Acciones </th>
            <td mat-cell *matCellDef="let p">
              <button mat-icon-button color="primary" title="Movimiento de Stock" (click)="abrirDialogoMovimiento(p)">
                <mat-icon>swap_vert</mat-icon>
              </button>
              <button mat-icon-button color="accent" title="Editar">
                <mat-icon>edit</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="loading" class="loading-state">
          Cargando inventario...
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
      overflow: hidden;
    }
    .full-width {
      width: 100%;
    }
    .stock-low {
      color: #f44336;
      font-weight: 700;
      background: #ffebee;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .loading-state {
      padding: 40px;
      text-align: center;
      color: var(--subtle-text);
    }
    ::ng-deep th.mat-mdc-header-cell {
      background: var(--bg-main) !important;
      color: var(--primary-pink) !important;
      font-weight: 700 !important;
    }
    code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
  `]
})
export class Inventarios implements OnInit {
  private productoService = inject(ProductoService);
  private inventarioService = inject(MovimientoInventarioService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  productos = signal<Producto[]>([]);
  loading = false;
  displayedColumns = ['referencia', 'nombre', 'categoria', 'precio', 'stock', 'estado', 'acciones'];


  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.loading = true;
    this.productoService.obtenerTodos().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar el inventario', 'Cerrar');
        this.loading = false;
      }
    });
  }

  abrirDialogoMovimiento(producto: Producto) {
    const dialogRef = this.dialog.open(InventarioDialog, {
      width: '400px',
      data: { producto }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.inventarioService.registrarMovimiento(result).subscribe({
          next: () => {
            this.snackBar.open('Movimiento registrado con éxito', 'OK', { duration: 3000 });
            this.cargarProductos();
          },
          error: (err) => {
            this.snackBar.open('Error: ' + (err.error?.message || 'No se pudo registrar'), 'Cerrar');
          }
        });
      }
    });
  }

  abrirDialogoProducto(producto?: Producto) {
    const dialogRef = this.dialog.open(ProductoDialog, {
      width: '500px',
      data: producto || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (producto?.id) {
          this.productoService.actualizar(producto.id, result).subscribe({
            next: () => {
              this.snackBar.open('Producto actualizado', 'OK');
              this.cargarProductos();
            }
          });
        } else {
          this.productoService.crear(result).subscribe({
            next: () => {
              this.snackBar.open('Producto creado exitosamente', 'OK');
              this.cargarProductos();
            }
          });
        }
      }
    });
  }
}
