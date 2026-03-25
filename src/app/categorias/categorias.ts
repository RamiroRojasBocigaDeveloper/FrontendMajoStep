import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoriaService, Categoria } from './categoria';
import { CategoriaDialog } from './categoria-dialog/categoria-dialog';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './categorias.html',
  styleUrls: ['./categorias.css']
})
export class Categorias implements OnInit {
  categorias: Categoria[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'acciones'];
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
    const dialogRef = this.dialog.open(CategoriaDialog, {
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
