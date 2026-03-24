import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id?: number;
  nombre: string;
  referencia: string;
  precioVenta: number;
  stockActual: number;
  categoriaNombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  private apiUrl = '/api/productos';

  obtenerTodos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  obtenerPorReferencia(ref: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/referencia/${ref}`);
  }

  obtenerStockBajo(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/stock-bajo`);
  }
}
