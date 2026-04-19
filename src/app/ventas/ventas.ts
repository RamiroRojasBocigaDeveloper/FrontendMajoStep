import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

import { ProductoService, Producto } from '../productos/producto';
import { VentaService } from './venta';
import { MetodoPagoService, MetodoPago } from './metodo-pago';
import { AuthService } from '../auth/auth';
import { SesionTrabajoService, SesionTrabajo } from '../sesiones-trabajo/sesion-trabajo';
import { ImagePreviewDialog } from '../shared/image-preview-dialog';


interface ItemCarrito extends Producto {
  cantidadVenta: number;
  precioUnitario: number;
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
    MatDividerModule,
    MatSelectModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule
  ],
  template: `
    <div class="venta-grid" *ngIf="sesionActiva(); else cajaCerrada">
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
                <mat-label>Buscador de Productos (Nombre o Referencia)</mat-label>
                <input matInput 
                       [formControl]="searchControl"
                       [matAutocomplete]="auto"
                       placeholder="Ej: Sandalia, CHV-001...">
                <mat-icon matSuffix>search</mat-icon>
                
                <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onProductSelected($event)">
                  <mat-option 
                    *ngFor="let producto of productosFiltrados()" 
                    [value]="producto"
                    [disabled]="producto.stockActual <= 0"
                    [class.sin-stock]="producto.stockActual <= 0">
                    <div class="product-option">
                      <span class="prod-name">{{producto.referencia}}</span>
                      <span class="prod-ref">{{producto.nombre}}</span>
                      <span class="prod-price">{{producto.precioVenta | currency:'USD'}}</span>
                      <span class="stock-badge" [class.badge-ok]="producto.stockActual > 5" [class.badge-low]="producto.stockActual > 0 && producto.stockActual <= 5" [class.badge-empty]="producto.stockActual <= 0">
                        {{ producto.stockActual <= 0 ? 'Sin stock' : 'Stock: ' + producto.stockActual }}
                      </span>
                    </div>
                  </mat-option>
                </mat-autocomplete>
              </mat-form-field>
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
                <td mat-cell *matCellDef="let item">
                  <div class="prod-cell">
                    <img *ngIf="item.imagenUrl" [src]="item.imagenUrl" class="cart-thumb" (click)="abrirImagen(item.imagenUrl)" matTooltip="Ver foto ampliada">
                    <mat-icon *ngIf="!item.imagenUrl" class="cart-thumb-placeholder">image</mat-icon>
                    <span>{{item.nombre}}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="precio">
                <th mat-header-cell *matHeaderCellDef> Precio </th>
                <td mat-cell *matCellDef="let item"> 
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" style="width: 130px;">
                    <span matPrefix>$</span>
                    <input matInput type="number" [(ngModel)]="item.precioUnitario" (ngModelChange)="calcularTotal()">
                  </mat-form-field>
                </td>
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
                <td mat-cell *matCellDef="let item"> {{ (item.precioUnitario * item.cantidadVenta) | currency:'USD'}} </td>
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

            <h3 class="payment-title">Seleccionar Método de Pago</h3>
            <mat-form-field appearance="outline" class="payment-select">
              <mat-select [(ngModel)]="metodoPagoSeleccionado">
                <mat-option *ngFor="let mp of metodosPago" [value]="mp.id">
                  <span class="dark-option-text">{{mp.nombre}}</span>
                </mat-option>
              </mat-select>
            </mat-form-field>

            <div *ngIf="isAdmin()" style="margin-top: 15px; margin-bottom: 15px;">
              <h3 class="payment-title" style="color: #333333;">Fecha Histórica</h3>
              <mat-form-field appearance="outline" style="width: 100%;">
                <mat-label>Seleccionar Fecha</mat-label>
                <input matInput [matDatepicker]="pickerVenta" [formControl]="fechaHistorica">
                <mat-datepicker-toggle matIconSuffix [for]="pickerVenta"></mat-datepicker-toggle>
                <mat-datepicker #pickerVenta panelClass="pink-datepicker"></mat-datepicker>
              </mat-form-field>
            </div>

            
            <button mat-raised-button class="checkout-btn" 
                    [disabled]="carrito().length === 0 || loading || !metodoPagoSeleccionado"
                    (click)="finalizarVenta()">
              <mat-icon>check_circle</mat-icon>
              {{ loading ? 'Procesando...' : 'FINALIZAR VENTA' }}
            </button>
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    <!-- PANTALLA DE BLOQUEO: CAJA CERRADA -->
    <ng-template #cajaCerrada>
      <div class="lock-screen" *ngIf="!checkingSession">
        <mat-card class="lock-card">
          <mat-card-content>
            <mat-icon class="lock-icon">lock</mat-icon>
            <h2>Caja Cerrada</h2>
            <p>Por seguridad, no puedes realizar ventas si tu turno no está activo.</p>
            <p>Debes abrir tu caja antes de registrar movimientos de dinero.</p>
            
            <button mat-flat-button color="primary" class="open-box-btn" (click)="irAAbrirCaja()">
              <mat-icon>point_of_sale</mat-icon>
              Ir a Abrir Caja
            </button>
          </mat-card-content>
        </mat-card>
      </div>
      <div class="lock-screen" *ngIf="checkingSession">
        <mat-card class="lock-card">
          <p>Verificando estado de la caja...</p>
        </mat-card>
      </div>
    </ng-template>
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
      background: #ffffff;
      color: #333333;
      border-radius: 36px;
      padding: 24px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      border: 1px solid #e0e0e0;
    }
    .total-row {
      display: flex;
      flex-direction: column;
      padding: 25px 0;
    }
    .total-row .label { font-size: 14px; opacity: 0.9; }
    .total-row .value { font-size: 48px; font-weight: 800; color: var(--primary-pink); }
    
    .checkout-btn {
      width: 100%;
      height: 65px;
      margin-top: 25px;
      background: var(--primary-pink) !important;
      color: white !important;
      font-weight: 800;
      font-size: 20px;
      border-radius: 18px;
      box-shadow: 0 4px 15px rgba(216, 27, 96, 0.3);
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .payment-title {
      font-size: 16px;
      font-weight: 700;
      color: #333333;
      text-align: left;
      margin-top: 25px;
      margin-bottom: 8px;
      padding-left: 10px;
    }
    .payment-select { width: 100%; margin-top: 0; }
    ::ng-deep .dark-option-text { color: #333333 !important; font-weight: 600; }
    ::ng-deep mat-datepicker-toggle,
    ::ng-deep .mat-datepicker-toggle,
    ::ng-deep mat-datepicker-toggle button,
    ::ng-deep mat-datepicker-toggle mat-icon,
    ::ng-deep .mat-datepicker-toggle-default-icon { color: var(--primary-pink) !important; }

    ::ng-deep .pink-datepicker { background: #ffffff !important; border-radius: 12px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.2) !important; }
    ::ng-deep .pink-datepicker .mat-calendar-body-cell-content { color: #333333 !important; font-weight: 500; }
    ::ng-deep .pink-datepicker .mat-calendar-table-header { color: #C2185B !important; font-weight: bold; }
    ::ng-deep .pink-datepicker .mat-calendar-body-selected { background-color: #e91e63 !important; color: white !important; font-weight: bold; }
    ::ng-deep .pink-datepicker .mat-calendar-body-today:not(.mat-calendar-body-selected) { border-color: #e91e63 !important; }
    ::ng-deep .pink-datepicker .mat-calendar-header { color: #C2185B !important; }
    ::ng-deep .pink-datepicker .mat-calendar-period-button span, 
    ::ng-deep .pink-datepicker .mat-calendar-period-button { color: #C2185B !important; font-weight: 800; }
    ::ng-deep .pink-datepicker .mat-calendar-body-label { color: #C2185B !important; font-weight: 700; }
    ::ng-deep .pink-datepicker .mat-calendar-controls { margin-top: 5px; }
    ::ng-deep .pink-datepicker .mat-calendar-arrow { fill: #C2185B !important; }
    ::ng-deep .pink-datepicker .mat-icon-button { color: #C2185B !important; }
    ::ng-deep .pink-datepicker .mat-calendar-previous-button, ::ng-deep .pink-datepicker .mat-calendar-next-button { color: #C2185B !important; }

    
    .search-bar { display: flex; align-items: baseline; }
    .flex-grow { flex-grow: 1; }
    .margin-left { margin-left: 15px; }
    .margin-top { margin-top: 20px; }
    .full-width { width: 100%; }
    .qty-control { display: flex; align-items: center; gap: 5px; }
    .empty-cart { padding: 40px; text-align: center; color: var(--dark-pink); opacity: 0.5; }
    .empty-cart mat-icon { font-size: 64px; width: 64px; height: 64px; }
    
    ::ng-deep table.mat-mdc-table { background: transparent !important; }
    ::ng-deep table.mat-mdc-table thead tr { background-color: #fff5f8 !important; }
    ::ng-deep th.mat-mdc-header-cell {
      color: var(--primary-pink) !important; font-weight: 700 !important;
      text-transform: uppercase; font-size: 12px; letter-spacing: 1px;
    }
    ::ng-deep td.mat-mdc-cell { color: var(--dark-text) !important; font-size: 15px; }
    .qty-control span { font-weight: 700; color: var(--primary-pink); min-width: 25px; text-align: center; }
    .prod-cell { display: flex; align-items: center; gap: 10px; }
    .cart-thumb { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; cursor: pointer; transition: transform 0.2s; border: 1px solid #eee; }
    .cart-thumb:hover { transform: scale(1.1); box-shadow: 0 4px 10px rgba(0,0,0,0.15); }
    .cart-thumb-placeholder { width: 40px; height: 40px; font-size: 40px; color: #ccc; }
    .product-option { display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 10px; }
    .prod-name { font-weight: 600; flex: 1; color: #333333 !important; }
    .prod-ref { font-family: monospace; color: var(--subtle-text); font-size: 12px; }
    .prod-price { color: var(--primary-pink); font-weight: 700; }
    .stock-badge { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; white-space: nowrap; }
    .badge-ok { background: #e8f5e9; color: #2e7d32; }
    .badge-low { background: #fff8e1; color: #f57f17; }
    .badge-empty { background: #ffebee; color: #c62828; }
    ::ng-deep .sin-stock { opacity: 0.5 !important; text-decoration: line-through !important; cursor: not-allowed !important; }

    /* Estilos Pantalla Bloqueo */
    .lock-screen {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 70vh;
    }
    .lock-card {
      text-align: center;
      padding: 40px;
      border-radius: 20px;
      max-width: 450px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      border-top: 8px solid var(--primary-pink);
    }
    .lock-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #f44336;
      margin-bottom: 20px;
    }
    .lock-card h2 {
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 10px;
    }
    .lock-card p {
      color: #666;
      font-size: 16px;
      line-height: 1.5;
    }
    .open-box-btn {
      margin-top: 30px;
      padding: 25px 40px;
      font-size: 18px;
      border-radius: 12px;
      font-weight: bold;
    }
  `]
})
export class Ventas implements OnInit {
  searchControl = new FormControl('');
  fechaHistorica = new FormControl<Date | null>(null);
  loading = false;
  checkingSession = true;
  
  productosFiltrados = signal<Producto[]>([]);
  carrito = signal<ItemCarrito[]>([]);
  sesionActiva = signal<SesionTrabajo | null>(null);
  displayedColumns: string[] = ['producto', 'precio', 'cantidad', 'subtotal', 'acciones'];

  private productoService = inject(ProductoService);
  private ventaService = inject(VentaService);
  private metodoPagoService = inject(MetodoPagoService);
  private authService = inject(AuthService);
  private sesionService = inject(SesionTrabajoService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  metodosPago: MetodoPago[] = [];
  metodoPagoSeleccionado = 1;

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit() {
    this.verificarCajaFuerte();

    // Configurar búsqueda dinámica
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string' && value.length >= 2) {
          return this.productoService.buscar(value);
        }
        return of([]);
      })
    ).subscribe(productos => {
      this.productosFiltrados.set(productos);
    });

    this.metodoPagoService.obtenerTodos().subscribe(res => {
      this.metodosPago = res;
      if (res.length > 0) this.metodoPagoSeleccionado = res[0].id;
    });
  }

  verificarCajaFuerte() {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) {
      this.checkingSession = false;
      return;
    }

    this.sesionService.obtenerSesionActiva(userId).subscribe({
      next: (sesion) => {
        this.sesionActiva.set(sesion);
        this.checkingSession = false;
      },
      error: () => {
        // Caja cerrada, se queda en null
        this.sesionActiva.set(null);
        this.checkingSession = false;
      }
    });
  }

  irAAbrirCaja() {
    this.router.navigate(['/sesiones-trabajo']);
  }

  abrirImagen(url: string) {
    if (!url) return;
    this.dialog.open(ImagePreviewDialog, {
      data: url,
      panelClass: 'image-preview-dialog-panel',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
  }

  onProductSelected(event: any) {
    const producto = event.option.value as Producto;
    this.agregarAlCarrito(producto);
    this.searchControl.setValue('', { emitEvent: false });
    this.productosFiltrados.set([]);
  }

  agregarAlCarrito(producto: Producto) {
    // BLOQUEO: No permitir agregar productos sin stock
    if (producto.stockActual <= 0) {
      this.snackBar.open(`🚫 "${producto.nombre}" no tiene stock disponible.`, 'Entendido', { duration: 4000 });
      return;
    }

    const actual = this.carrito();
    const index = actual.findIndex(p => p.id === producto.id);
    let nuevaCant = 1;
    
    if (index >= 0) {
      // BLOQUEO: No superar el stock disponible
      if (actual[index].cantidadVenta >= producto.stockActual) {
        this.snackBar.open(`⚠️ No puedes agregar más de ${producto.stockActual} unidades de "${producto.nombre}".`, 'OK', { duration: 3500 });
        return;
      }
      actual[index].cantidadVenta += 1;
      nuevaCant = actual[index].cantidadVenta;
      this.carrito.set([...actual]);
    } else {
      this.carrito.set([...actual, { ...producto, cantidadVenta: 1, precioUnitario: producto.precioVenta }]);
    }
    
    if (nuevaCant >= producto.stockActual) {
      this.snackBar.open(`⚠️ Último en stock: ${producto.nombre} (${producto.stockActual} und.)`, 'Aceptar', { duration: 4000 });
    } else {
      this.snackBar.open(`✅ Agregado: ${producto.nombre}`, 'OK', { duration: 2000 });
    }
  }

  modificarCantidad(item: ItemCarrito, cambio: number) {
    const actual = this.carrito();
    const index = actual.findIndex(p => p.id === item.id);
    if (index >= 0) {
      const nuevaCant = actual[index].cantidadVenta + cambio;
      
      // BLOQUEO: No permitir superar el stock disponible
      if (cambio > 0 && actual[index].cantidadVenta >= actual[index].stockActual) {
        this.snackBar.open(`🚫 Stock máximo alcanzado para "${actual[index].nombre}" (${actual[index].stockActual} und.).`, 'OK', { duration: 3000 });
        return;
      }

      if (nuevaCant > 0) {
        actual[index].cantidadVenta = nuevaCant;
        this.carrito.set([...actual]);
        
        if (nuevaCant === actual[index].stockActual && cambio > 0) {
          this.snackBar.open(`⚠️ "${actual[index].nombre}" llegó al límite del stock (${actual[index].stockActual} und.).`, 'OK', { duration: 3000 });
        }
      } else {
        // Si la cantidad llega a 0, remover del carrito
        this.carrito.set(actual.filter(p => p.id !== item.id));
      }
    }
  }

  eliminarItem(item: ItemCarrito) {
    this.carrito.set(this.carrito().filter(p => p.id !== item.id));
  }

  calcularTotal() {
    return this.carrito().reduce((acc, item) => acc + (item.precioUnitario * item.cantidadVenta), 0);
  }

  finalizarVenta() {
    const sesion = this.sesionActiva();
    if (!sesion) {
      this.snackBar.open('Error: Caja cerrada.', 'Cerrar');
      return;
    }

    this.loading = true;
    
    let fhStr = undefined;
    if (this.fechaHistorica.value) {
      const d = new Date(this.fechaHistorica.value);
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      fhStr = `${yr}-${mo}-${da}`;
    }

    const request: any = {
      sesionId: sesion.id,
      metodoPagoId: this.metodoPagoSeleccionado,
      descuento: 0,
      detalles: this.carrito().map(item => ({
        productoId: item.id!,
        cantidad: item.cantidadVenta,
        precioUnitario: item.precioUnitario
      }))
    };

    if (fhStr) {
      request.fechaHistorica = fhStr;
    }

    const agotados = this.carrito().filter(p => p.cantidadVenta >= p.stockActual).map(p => p.nombre);

    this.ventaService.procesarVenta(request).subscribe({
      next: () => {
        if (agotados.length > 0) {
          this.snackBar.open(`¡Venta completada! ⚠️ Poner en reposición: ${agotados.join(', ')}`, 'Cerrar', { duration: 8000 });
        } else {
          this.snackBar.open('¡Venta completada con éxito!', 'OK', { duration: 3000 });
        }
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
