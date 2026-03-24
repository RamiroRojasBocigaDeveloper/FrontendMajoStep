import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoriaService, Categoria } from './categoria.service';
import { CategoriaDialogComponent } from './categoria-dialog/categoria-dialog.component';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css'],
  standalone: false // No es standalone porque pertenece a CategoriasModule
})
export class CategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'descripcion', 'acciones'];
  loading = false;

  private categoriaService = inject(CategoriaService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.loading = true;
    this.categoriaService.obtenerTodas().subscribe({
      next: (data) => {
        this.categorias = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error al cargar categorías', 'Cerrar');
      }
    });
  }

  abrirDialogo(categoria?: Categoria) {
    const dialogRef = this.dialog.open(CategoriaDialogComponent, {
      width: '400px',
      data: categoria ? { ...categoria } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarCategorias();
      }
    });
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      this.categoriaService.eliminar(id).subscribe({
        next: () => {
          this.snackBar.open('Categoría eliminada', 'OK');
          this.cargarCategorias();
        },
        error: (err) => {
          this.snackBar.open('No se pudo eliminar: ' + (err.error?.message || 'Error'), 'Cerrar');
        }
      });
    }
  }
}
