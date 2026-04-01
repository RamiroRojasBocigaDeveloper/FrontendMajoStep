import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ReporteService, DashboardResponse } from './reporte';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  template: `
    <mat-card class="header-card">
      <div class="header-content">
        <div class="title-group">
          <h1>Análisis Financiero Premium</h1>
          <p>Visualización avanzada de rentabilidad y rendimiento</p>
        </div>
        <div class="date-filter-group">
          <mat-form-field appearance="outline" class="date-picker-single">
            <mat-label>Fecha Inicio</mat-label>
            <input matInput [matDatepicker]="startPicker" [formControl]="range.controls.start" [max]="range.controls.end.value || today" (dateChange)="cargarReporte()">
            <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="date-picker-single">
            <mat-label>Fecha Fin</mat-label>
            <input matInput [matDatepicker]="endPicker" [formControl]="range.controls.end" [min]="range.controls.start.value!" [max]="today" (dateChange)="cargarReporte()">
            <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>
          
          <div class="quick-filters">
            <button mat-stroked-button (click)="setRange('week')">Semana</button>
            <button mat-stroked-button (click)="setRange('month')">Mes</button>
            <button mat-flat-button class="btn-filter" (click)="cargarReporte()">
              <mat-icon>analytics</mat-icon> Actualizar
            </button>
          </div>
        </div>
      </div>
    </mat-card>

    <div *ngIf="loading" class="progress-container">
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    </div>

    <!-- PREMIUM KPI CARDS -->
    <div class="kpi-container" *ngIf="data()">
      <div class="kpi-card-luxury sales-card">
        <div class="kpi-icon">📈</div>
        <div class="kpi-info">
          <span class="kpi-label">VENTAS TOTALES</span>
          <h2 class="kpi-value">{{data()?.totalVentas | currency:'USD':'symbol':'1.0-0'}}</h2>
        </div>
      </div>

      <div class="kpi-card-luxury expenses-card">
        <div class="kpi-icon">💸</div>
        <div class="kpi-info">
          <span class="kpi-label">TOTAL GASTOS</span>
          <h2 class="kpi-value">{{(data()?.totalGastos || 0) + (data()?.totalSueldos || 0) | currency:'USD':'symbol':'1.0-0'}}</h2>
        </div>
      </div>

      <div class="kpi-card-luxury profit-card">
        <div class="kpi-icon">💰</div>
        <div class="kpi-info">
          <span class="kpi-label">GANANCIA TOTAL</span>
          <h2 class="kpi-value">{{data()?.gananciaProductos | currency:'USD':'symbol':'1.0-0'}}</h2>
        </div>
      </div>

      <div class="kpi-card-luxury cashflow-card">
        <div class="kpi-icon">📊</div>
        <div class="kpi-info">
          <span class="kpi-label">FLUJO DE CAJA (NETO)</span>
          <h2 class="kpi-value" [class.negative]="(data()?.gananciaNeta || 0) < 0">
            {{data()?.gananciaNeta | currency:'USD':'symbol':'1.0-0'}}
          </h2>
        </div>
      </div>
    </div>

    <!-- TABLES SECTION (REPLACING CHARTS) -->
    <div class="charts-grid" *ngIf="data()">
      <mat-card class="chart-card table-summary-card">
        <mat-card-header>
          <div class="chart-title-group">
            <span class="chart-emoji">📊</span>
            <mat-card-title>Ventas por Categoría</mat-card-title>
          </div>
        </mat-card-header>
        <mat-card-content>
          <div class="mini-table-container">
            <table class="premium-table mini">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of ventasPorCategoria()">
                  <td class="category-name">{{item.nombre}}</td>
                  <td class="text-right">{{item.monto | currency:'USD':'symbol':'1.0-0'}}</td>
                </tr>
              </tbody>
            </table>
            <div *ngIf="ventasPorCategoria().length === 0" class="empty-state-mini">Sin datos</div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="chart-card table-summary-card">
        <mat-card-header>
          <div class="chart-title-group">
            <span class="chart-emoji">💰</span>
            <mat-card-title>Ganancias por Categoría</mat-card-title>
          </div>
        </mat-card-header>
        <mat-card-content>
          <div class="mini-table-container">
            <table class="premium-table mini">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th class="text-right">Ganancia</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of gananciasPorCategoria()">
                  <td class="category-name green">{{item.nombre}}</td>
                  <td class="text-right green">{{item.monto | currency:'USD':'symbol':'1.0-0'}}</td>
                </tr>
              </tbody>
            </table>
            <div *ngIf="gananciasPorCategoria().length === 0" class="empty-state-mini">Sin datos</div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="chart-card table-summary-card">
        <mat-card-header>
          <div class="chart-title-group">
            <span class="chart-emoji">💸</span>
            <mat-card-title>Gastos por Categoría</mat-card-title>
          </div>
        </mat-card-header>
        <mat-card-content>
          <div class="mini-table-container">
            <table class="premium-table mini">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th class="text-right">Gasto</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of gastosPorCategoria()">
                  <td class="category-name red">{{item.nombre}}</td>
                  <td class="text-right red">{{item.monto | currency:'USD':'symbol':'1.0-0'}}</td>
                </tr>
              </tbody>
            </table>
            <div *ngIf="gastosPorCategoria().length === 0" class="empty-state-mini">Sin datos</div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- TOP PRODUCTS AND EXPENSE DETAILS -->
    <div class="bottom-grid" *ngIf="data()">
       <mat-card class="luxury-table-card top-products">
          <mat-card-header>
            <mat-card-title>Top Productos Vendidos</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="table-container">
              <table class="premium-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th class="text-right">Unidades</th>
                    <th>Popularidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of productosMasVendidos(); let i = index">
                    <td><span class="rank-badge">{{i + 1}}</span></td>
                    <td>{{item.nombre}}</td>
                    <td class="text-right">{{item.cantidad}}</td>
                    <td class="progress-col">
                       <div class="progress-bar-small">
                          <div class="progress-fill" [style.width.%]="(item.cantidad / (productosMasVendidos()[0].cantidad || 1)) * 100"></div>
                       </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div *ngIf="productosMasVendidos().length === 0" class="empty-state">
               No hay ventas registradas en este período.
            </div>
          </mat-card-content>
       </mat-card>

       <mat-card class="luxury-table-card expense-details">
          <mat-card-header>
            <mat-card-title>Detalle Consolidado de Gastos</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="table-container">
              <table class="premium-table">
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th class="text-right">Inversión</th>
                    <th>Distribución</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of gastosPorCategoria()">
                    <td class="category-name">{{item.nombre}}</td>
                    <td class="text-right monto-negativo">{{item.monto | currency:'USD':'symbol':'1.0-0'}}</td>
                    <td>
                       <div class="progress-bar-small">
                          <div class="progress-fill expense" [style.width.%]="(item.monto / ((data()?.totalGastos || 0) + (data()?.totalSueldos || 1))) * 100"></div>
                       </div>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                   <tr class="total-row">
                      <td>TOTAL EGRESOS</td>
                      <td class="text-right">{{(data()?.totalGastos || 0) + (data()?.totalSueldos || 0) | currency:'USD':'symbol':'1.0-0'}}</td>
                      <td></td>
                   </tr>
                </tfoot>
              </table>
            </div>
          </mat-card-content>
       </mat-card>
    </div>
  `,
  styles: [`
    .header-card {
      background: white;
      border-radius: 24px;
      padding: 20px;
      margin-bottom: 24px;
      border: 1px solid #eee;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    .title-group h1 {
      margin: 0;
      font-weight: 800;
      background: linear-gradient(45deg, #C2185B, #E91E63);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .title-group p { margin: 0; color: #666; font-size: 14px; }
    
    .date-filter-group { display: flex; align-items: center; gap: 15px; flex-wrap: wrap; }
    .date-picker-single { width: 170px; }
    .date-picker-single ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    /* Fix datepicker visibility against white background */
    .date-picker-single ::ng-deep .mdc-text-field--outlined { background-color: #f8f9fa; border-radius: 8px; }
    .date-picker-single ::ng-deep .mdc-floating-label { color: #C2185B !important; font-weight: 600; }
    .date-picker-single ::ng-deep .mat-mdc-input-element { color: #333 !important; font-weight: 500; }
    .date-picker-single ::ng-deep .mat-datepicker-toggle { color: #C2185B !important; }
    .quick-filters { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn-filter { background: #C2185B; color: white; border-radius: 12px; height: 50px; padding: 0 24px; }
    .kpi-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .kpi-card-luxury {
      padding: 24px;
      border-radius: 24px;
      color: white;
      display: flex;
      align-items: center;
      gap: 15px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    }
    .sales-card { background: linear-gradient(135deg, #AD1457, #E91E63); }
    .expenses-card { background: linear-gradient(135deg, #D32F2F, #FF5252); }
    .profit-card { background: linear-gradient(135deg, #2E7D32, #4CAF50); }
    .cashflow-card { background: linear-gradient(135deg, #0288D1, #03A9F4); }
    .kpi-icon { font-size: 32px; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 15px; }
    .kpi-label { font-size: 11px; font-weight: 700; opacity: 0.9; letter-spacing: 1px; }
    .kpi-value { font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
    .kpi-value.negative { color: #ffdada; }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 25px;
      margin-bottom: 30px;
    }
    .chart-card { border-radius: 24px; background: #fff; border: 1px solid #f0f0f0; box-shadow: 0 5px 15px rgba(0,0,0,0.02); min-height: 250px; }
    .chart-title-group { display: flex; align-items: center; gap: 10px; }
    .chart-emoji { font-size: 20px; }
    
    .mini-table-container { padding: 10px 15px; }
    .empty-state-mini { padding: 20px; text-align: center; color: #ccc; font-size: 12px; }

    .bottom-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 25px;
    }
    .luxury-table-card { border-radius: 24px; border: 1px solid #f0f0f0; }
    .table-container { padding: 0 15px 15px; overflow-x: auto; }
    .premium-table { width: 100%; border-collapse: collapse; }
    .premium-table th { text-align: left; padding: 15px 10px; border-bottom: 2px solid #f8f9fa; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
    .premium-table td { padding: 14px 10px; border-bottom: 1px solid #fcfcfc; font-weight: 600; color: #333; font-size: 13px; }
    .premium-table.mini td { padding: 10px; font-size: 12px; }
    
    .text-right { text-align: right; }
    .monto-negativo { color: #d32f2f; }
    .category-name { color: #C2185B; font-weight: 700; }
    .category-name.green { color: #2E7D32; }
    .category-name.red { color: #D32F2F; }
    .green { color: #2E7D32 !important; }
    .red { color: #D32F2F !important; }

    .rank-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: #f0f0f0;
      color: #777;
      border-radius: 50%;
      font-size: 11px;
      font-weight: 800;
    }
    tr:nth-child(1) .rank-badge { background: #FFD700; color: #856404; }
    tr:nth-child(2) .rank-badge { background: #C0C0C0; color: #383d41; }
    tr:nth-child(3) .rank-badge { background: #CD7F32; color: #721c24; }

    .progress-bar-small { width: 80px; height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; margin-left: auto; }
    .progress-fill { height: 100%; background: #E91E63; border-radius: 3px; }
    .progress-fill.expense { background: #FF5252; }

    .total-row td { background: #fffafb; font-weight: 800; color: #C2185B; border-top: 2px solid #C2185B; }
    .empty-state { padding: 40px; text-align: center; color: #999; font-style: italic; }
  `]
})
export class Reportes implements OnInit {
  private reporteService = inject(ReporteService);
  private cdr = inject(ChangeDetectorRef);
  
  data = signal<DashboardResponse | null>(null);
  loading = false;
  today = new Date();

  range = new FormGroup({
    start: new FormControl<Date | null>(new Date(new Date().setDate(1))),
    end: new FormControl<Date | null>(new Date())
  });

  ngOnInit() {
    this.cargarReporte();
  }

  cargarReporte() {
    const { start, end } = this.range.value;
    if (!start || !end) return;

    this.loading = true;
    const inicio = start.toISOString().split('T')[0];
    const fin = end.toISOString().split('T')[0];

    this.reporteService.obtenerPorRango(inicio, fin).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => this.loading = false
    });
  }

  setRange(type: 'week' | 'month') {
    const end = new Date();
    let start = new Date();
    if (type === 'week') {
      const day = start.getDay();
      start.setDate(start.getDate() - day + (day === 0 ? -6 : 1));
    } else {
      start = new Date(start.getFullYear(), start.getMonth(), 1);
    }
    this.range.patchValue({ start, end });
    this.cargarReporte();
  }

  productosMasVendidos() {
    const list = this.data()?.productosMasVendidos || {};
    return Object.entries(list).map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  ventasPorCategoria() {
    const list = this.data()?.ventasPorCategoria || {};
    return Object.entries(list).map(([nombre, monto]) => ({ nombre, monto }))
      .sort((a, b) => b.monto - a.monto);
  }

  gananciasPorCategoria() {
    const list = this.data()?.gananciasPorCategoria || {};
    return Object.entries(list).map(([nombre, monto]) => ({ nombre, monto }))
      .sort((a, b) => b.monto - a.monto);
  }

  gastosPorCategoria() {
    const list = this.data()?.gastosPorCategoria || {};
    return Object.entries(list).map(([nombre, monto]) => ({ nombre, monto }))
      .sort((a, b) => b.monto - a.monto);
  }
}
