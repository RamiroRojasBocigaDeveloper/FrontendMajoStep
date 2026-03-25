import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoriaService, Categoria } from '../categoria';

@Component({
  selector: 'app-categoria-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './categoria-dialog.html',
  styleUrls: ['./categoria-dialog.css']
})
export class CategoriaDialog {
  form: FormGroup;
  isEdit: boolean;
  loading = false;

  private fb = inject(FormBuilder);
  private categoriaService = inject(CategoriaService);
  private snackBar = inject(MatSnackBar);

  constructor(
    public dialogRef: MatDialogRef<CategoriaDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Categoria
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      nombre: [data?.nombre || '', [Validators.required, Validators.minLength(3)]]
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
