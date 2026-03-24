import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductoService, Producto } from '../../core/services/producto.service';
import { VentaService } from '../../core/services/venta.service';
import { AuthService } from '../../core/services/auth.service';

interface ItemCarrito extends Producto {
  cantidadVenta: number;
}

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule
  ],
  template: `
    <div class="venta-grid">
      <!-- Sección Izquierda: Buscador y Carrito -->
      <div class="pos-section">
        <mat-card class="pink-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">search</mat-icon>
            <mat-card-title>Buscador de Calzado</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="search-bar">
              <mat-form-field appearance="outline" class="flex-grow">
                <mat-label>Referencia del Producto</mat-label>
                <input matInput [(ngModel)]="searchQuery" (keyup.enter)="buscarProducto()" placeholder="Referencia: CHV-001">
                <mat-icon matSuffix>qr_code</mat-icon>
              </mat-form-field>
              <button mat-fab color="accent" (click)="buscarProducto()" class="margin-left">
                <mat-icon>add_shopping_cart</mat-icon>
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="pink-card margin-top">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">shopping_bag</mat-icon>
            <mat-card-title>Carrito de Ventas</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <table mat-table [dataSource]="carrito()" class="full-width">
              <ng-container matColumnDef="producto">
                <th mat-header-cell *matHeaderCellDef> Producto </th>
                <td mat-cell *matCellDef="let item"> {{item.nombre}} </td>
              </ng-container>

              <ng-container matColumnDef="precio">
                <th mat-header-cell *matHeaderCellDef> Precio </th>
                <td mat-cell *matCellDef="let item"> {{item.precioVenta | currency:'USD'}} </td>
              </ng-container>

              <ng-container matColumnDef="cantidad">
                <th mat-header-cell *matHeaderCellDef> Cant. </th>
                <td mat-cell *matCellDef="let item"> 
                   <div class="qty-control">
                     <button mat-icon-button (click)="modificarCantidad(item, -1)"><mat-icon>remove_circle_outline</mat-icon></button>
                     <span>{{item.cantidadVenta}}</span>
                     <button mat-icon-button (click)="modificarCantidad(item, 1)"><mat-icon>add_circle_outline</mat-icon></button>
                   </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="subtotal">
                <th mat-header-cell *matHeaderCellDef> Subtotal </th>
                <td mat-cell *matCellDef="let item"> {{ (item.precioVenta * item.cantidadVenta) | currency:'USD'}} </td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef> - </th>
                <td mat-cell *matCellDef="let item">
                  <button mat-icon-button color="warn" (click)="eliminarItem(item)">
                    <mat-icon>delete_forever</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <div *ngIf="carrito().length === 0" class="empty-cart">
              <mat-icon>shopping_cart_checkout</mat-icon>
              <p>El carrito está vacío</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Sección Derecha: Resumen de Pago -->
      <div class="summary-section">
        <mat-card class="total-card">
          <mat-card-content>
            <div class="total-row">
              <span class="label">Total a Pagar</span>
              <span class="value">{{ calcularTotal() | currency:'USD' }}</span>
            </div>
            <mat-divider></mat-divider>
            <div class="items-count">
              <span>{{ carrito().length }} productos en el carrito</span>
            </div>
            
            <button mat-raised-button class="checkout-btn" 
                    [disabled]="carrito().length === 0 || loading"
                    (click)="finalizarVenta()">
              <mat-icon>check_circle</mat-icon>
              {{ loading ? 'Procesando...' : 'FINALIZAR VENTA' }}
            </button>
          </mat-card-content>
        </mat-card>

        <mat-card class="pink-card margin-top">
          <mat-card-header>
            <mat-card-title>Atajos del Cajero</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>F2: Buscar Producto</p>
            <p>F8: Finalizar Venta</p>
            <p>ESC: Limpiar Carrito</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .venta-grid {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 20px;
    }
    .pink-card {
      border-radius: 20px;
      border: 1px solid var(--border-color);
      background: var(--bg-card);
      box-shadow: var(--luxury-shadow);
    }
    .total-card {
      background: var(--vibrant-gradient);
      color: white;
      border-radius: 24px;
      padding: 15px;
      text-align: center;
      box-shadow: 0 15px 40px rgba(216, 27, 96, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .total-row {
      display: flex;
      flex-direction: column;
      padding: 25px 0;
    }
    .total-row .label { font-size: 14px; opacity: 0.9; }
    .total-row .value { font-size: 48px; font-weight: 800; }
    
    .checkout-btn {
      width: 100%;
      height: 65px;
      margin-top: 25px;
      background-color: white !important;
      color: var(--primary-pink) !important;
      font-weight: 800;
      font-size: 20px;
      border-radius: 18px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .search-bar { display: flex; align-items: baseline; }
    .flex-grow { flex-grow: 1; }
    .margin-left { margin-left: 15px; }
    .margin-top { margin-top: 20px; }
    .full-width { width: 100%; }
    .qty-control { display: flex; align-items: center; gap: 5px; }
    .empty-cart {
      padding: 40px;
      text-align: center;
      color: var(--dark-pink);
      opacity: 0.5;
    }
    .empty-cart mat-icon { font-size: 64px; width: 64px; height: 64px; }
    
    ::ng-deep table.mat-mdc-table {
      background: transparent !important;
    }
    ::ng-deep table.mat-mdc-table thead tr {
      background-color: #fff5f8 !important;
    }
    ::ng-deep th.mat-mdc-header-cell {
      color: var(--primary-pink) !important;
      font-weight: 700 !important;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 1px;
    }
    ::ng-deep td.mat-mdc-cell {
      color: var(--dark-text) !important;
      font-size: 15px;
    }
    .qty-control span {
      font-weight: 700;
      color: var(--primary-pink);
      min-width: 25px;
      text-align: center;
    }
  `]
})
export class VentaComponent {
  searchQuery = '';
  loading = false;
  carrito = signal<ItemCarrito[]>([]);
  displayedColumns: string[] = ['producto', 'precio', 'cantidad', 'subtotal', 'acciones'];

  private productoService = inject(ProductoService);
  private ventaService = inject(VentaService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  buscarProducto() {
    if (!this.searchQuery) return;
    
    this.productoService.obtenerPorReferencia(this.searchQuery).subscribe({
      next: (producto) => {
        this.agregarAlCarrito(producto);
        this.searchQuery = '';
      },
      error: () => {
        this.snackBar.open('Producto no encontrado', 'Cerrar', { duration: 2000 });
      }
    });
  }

  agregarAlCarrito(producto: Producto) {
    const actual = this.carrito();
    const index = actual.findIndex(p => p.id === producto.id);
    
    if (index >= 0) {
      actual[index].cantidadVenta += 1;
      this.carrito.set([...actual]);
    } else {
      this.carrito.set([...actual, { ...producto, cantidadVenta: 1 }]);
    }
  }

  modificarCantidad(item: ItemCarrito, cambio: number) {
    const actual = this.carrito();
    const index = actual.findIndex(p => p.id === item.id);
    if (index >= 0) {
      const nuevaCant = actual[index].cantidadVenta + cambio;
      if (nuevaCant > 0) {
        actual[index].cantidadVenta = nuevaCant;
        this.carrito.set([...actual]);
      }
    }
  }

  eliminarItem(item: ItemCarrito) {
    this.carrito.set(this.carrito().filter(p => p.id !== item.id));
  }

  calcularTotal() {
    return this.carrito().reduce((acc, item) => acc + (item.precioVenta * item.cantidadVenta), 0);
  }

  finalizarVenta() {
    this.loading = true;
    const user = this.authService.getCurrentUser();
    
    // NOTA: Para este ejemplo, asumimos que ya tenemos una sesión de trabajo activa con ID 1
    // En una implementación real, esto vendría del servicio de sesión
    const request = {
      usuarioId: user.id || 1,
      sesionId: 1, 
      detalles: this.carrito().map(item => ({
        productoId: item.id!,
        cantidad: item.cantidadVenta
      }))
    };

    this.ventaService.procesarVenta(request).subscribe({
      next: () => {
        this.snackBar.open('¡Venta completada con éxito!', 'OK', { duration: 3000 });
        this.carrito.set([]);
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.snackBar.open('Error al procesar la venta: ' + (err.error?.message || 'Error del servidor'), 'Cerrar');
      }
    });
  }
}
