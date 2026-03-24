import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CategoriaService, Categoria } from '../categoria.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-categoria-dialog',
  templateUrl: './categoria-dialog.component.html',
  styleUrls: ['./categoria-dialog.component.css'],
  standalone: false
})
export class CategoriaDialogComponent {
  form: FormGroup;
  isEdit: boolean;
  loading = false;

  private fb = inject(FormBuilder);
  private categoriaService = inject(CategoriaService);
  private snackBar = inject(MatSnackBar);

  constructor(
    public dialogRef: MatDialogRef<CategoriaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Categoria
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      nombre: [data?.nombre || '', [Validators.required, Validators.minLength(3)]],
      descripcion: [data?.descripcion || '']
    });
  }

  guardar() {
    if (this.form.valid) {
      this.loading = true;
      const categoriaData = this.form.value;

      if (this.isEdit) {
        this.categoriaService.actualizar(this.data.id!, categoriaData).subscribe({
          next: (res) => {
            this.snackBar.open('Categoría actualizada', 'OK', { duration: 2000 });
            this.dialogRef.close(true);
          },
          error: () => {
            this.loading = false;
            this.snackBar.open('Error al actualizar', 'Cerrar');
          }
        });
      } else {
        this.categoriaService.crear(categoriaData).subscribe({
          next: (res) => {
            this.snackBar.open('Categoría creada con éxito', 'OK', { duration: 2000 });
            this.dialogRef.close(true);
          },
          error: () => {
            this.loading = false;
            this.snackBar.open('Error al crear', 'Cerrar');
          }
        });
      }
    }
  }
}
