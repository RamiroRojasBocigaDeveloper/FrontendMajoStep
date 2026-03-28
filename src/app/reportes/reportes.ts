import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
    MatProgressBarModule
  ],
  template: `
    <mat-card class="header-card">
      <div class="header-content">
        <div class="title-group">
          <h1>Reportes Dinámicos</h1>
          <p>Visualiza el rendimiento real de tu tienda, ventas, gastos y ganancias</p>
        </div>
        <mat-icon color="primary" style="font-size: 40px; width: 40px; height: 40px;">insights</mat-icon>
      </div>
      <div class="actions">
        <button mat-stroked-button color="primary" (click)="cargarReporte()">
          <mat-icon>refresh</mat-icon> Actualizar
        </button>
      </div>
    </mat-card>

    <div *ngIf="loading">
      <mat-progress-bar mode="indeterminate" color="accent"></mat-progress-bar>
    </div>

    <div class="dashboard-grid" *ngIf="data()">
      <!-- KPI Cards -->
      <mat-card class="kpi-card sales">
        <mat-card-header>
          <mat-icon mat-card-avatar>payments</mat-icon>
          <mat-card-title>Ventas Totales</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <h2 class="kpi-value">{{data()?.totalVentas | currency:'USD'}}</h2>
          <p class="kpi-sub">{{data()?.cantidadVentas}} transacciones</p>
        </mat-card-content>
      </mat-card>

      <mat-card class="kpi-card expenses">
        <mat-card-header>
          <mat-icon mat-card-avatar>shopping_bag</mat-icon>
          <mat-card-title>Gastos y Sueldos</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <h2 class="kpi-value text-warn">{{(data()?.totalGastos || 0) + (data()?.totalSueldos || 0) | currency:'USD'}}</h2>
          <p class="kpi-sub">Gastos operativos</p>
        </mat-card-content>
      </mat-card>

      <mat-card class="kpi-card profit">
        <mat-card-header>
          <mat-icon mat-card-avatar>trending_up</mat-icon>
          <mat-card-title>Ganancia Neta</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <h2 class="kpi-value text-success">{{data()?.gananciaNeta | currency:'USD'}}</h2>
          <p class="kpi-sub">Libre de gastos</p>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="stats-grid" *ngIf="data()">
      <mat-card class="luxury-card full-height">
        <mat-card-header>
          <mat-card-title>Productos más vendidos</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="list-item" *ngFor="let item of productosMasVendidos()">
            <span class="item-name">{{item.nombre}}</span>
            <span class="item-value">{{item.cantidad}} und.</span>
          </div>
          <div *ngIf="productosMasVendidos().length === 0" class="empty-list">
            No hay datos suficientes
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="luxury-card full-height">
        <mat-card-header>
          <mat-card-title>Ventas por Método de Pago</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="list-item" *ngFor="let item of ventasPorMetodo()">
            <span class="item-name">{{item.metodo}}</span>
            <span class="item-value">{{item.monto | currency:'USD'}}</span>
          </div>
          <div *ngIf="ventasPorMetodo().length === 0" class="empty-list">
            Esperando ventas...
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 20px;
    }
    .kpi-card {
      border-radius: 24px;
      padding: 10px;
      border: 1px solid var(--border-color);
      box-shadow: var(--luxury-shadow);
      transition: transform 0.3s ease;
    }
    .kpi-card:hover { transform: translateY(-5px); }
    .kpi-value {
      font-size: 36px;
      font-weight: 800;
      margin: 10px 0 0 0;
      letter-spacing: -1px;
    }
    .kpi-sub { color: var(--subtle-text); font-size: 14px; margin: 0; }
    .text-warn { color: #f44336; }
    .text-success { color: #43a047; }
    
    .list-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .item-name { font-weight: 600; color: #444; }
    .item-value { font-weight: 800; color: var(--primary-pink); }
    
    .full-height { height: 100%; border-radius: 20px; }
    .empty-list { padding: 40px; text-align: center; color: #ccc; }
    
    mat-icon[mat-card-avatar] {
      background: rgba(216, 27, 96, 0.1);
      color: var(--primary-pink);
      padding: 12px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class Reportes implements OnInit {
  private reporteService = inject(ReporteService);
  
  data = signal<DashboardResponse | null>(null);
  loading = false;

  ngOnInit() {
    this.cargarReporte();
  }

  cargarReporte() {
    this.loading = true;
    this.reporteService.obtenerGlobal().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  productosMasVendidos() {
    const list = this.data()?.productosMasVendidos || {};
    return Object.entries(list).map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  ventasPorMetodo() {
    const list = this.data()?.ventasPorMetodoPago || {};
    return Object.entries(list).map(([metodo, monto]) => ({ metodo, monto }))
      .sort((a, b) => b.monto - a.monto);
  }
}
