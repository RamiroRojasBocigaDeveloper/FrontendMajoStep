import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inventario-container">
      <h2>Gestión de Inventario 👟</h2>
      <p>Próximamente: Control de stock, tallas y referencias.</p>
    </div>
  `,
  styles: [`
    .inventario-container { padding: 20px; }
    h2 { color: var(--primary-pink); }
  `]
})
export class InventarioComponent {}
