import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CategoriaGasto {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaGastoService {
  private http = inject(HttpClient);
  private apiUrl = '/api/categorias-gastos';

  obtenerTodas(): Observable<CategoriaGasto[]> {
    return this.http.get<CategoriaGasto[]>(this.apiUrl);
  }
}
