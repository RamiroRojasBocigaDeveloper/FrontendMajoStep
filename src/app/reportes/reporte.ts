import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardResponse {
  totalVentas: number;
  totalGastos: number;
  totalSueldos: number;
  gananciaNeta: number;
  cantidadVentas: number;
  ventasPorMetodoPago: { [key: string]: number };
  productosMasVendidos: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private http = inject(HttpClient);
  private apiUrl = '/api/reportes';

  obtenerGlobal(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard/global`);
  }

  obtenerPorSesion(sesionId: number): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard/sesion/${sesionId}`);
  }

  obtenerPorRango(inicio: string, fin: string): Observable<DashboardResponse> {
    const params = new HttpParams()
      .set('inicio', inicio)
      .set('fin', fin);
    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard/rango`, { params });
  }
}
