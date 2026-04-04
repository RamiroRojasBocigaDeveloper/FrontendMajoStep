import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DetalleVentaRequest {
  productoId: number;
  cantidad: number;
}

export interface VentaRequest {
  sesionId: number;
  metodoPagoId: number;
  descuento?: number;
  detalles: DetalleVentaRequest[];
}

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ventas`;

  procesarVenta(request: VentaRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }

  obtenerPorSesion(sesionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sesion/${sesionId}`);
  }
}
