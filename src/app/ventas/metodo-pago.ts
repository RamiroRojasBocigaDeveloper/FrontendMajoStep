import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MetodoPago {
  id: number;
  nombre: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoService {
  private http = inject(HttpClient);
  private apiUrl = '/api/metodos-pago';

  obtenerTodos(): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(this.apiUrl);
  }
}
