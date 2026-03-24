import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DetalleVentaRequest {
  productoId: number;
  cantidad: number;
}

export interface VentaRequest {
  usuarioId: number;
  sesionId: number;
  detalles: DetalleVentaRequest[];
}

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  private apiUrl = '/api/ventas';

  procesarVenta(request: VentaRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }

  obtenerPorSesion(sesionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sesion/${sesionId}`);
  }
}
