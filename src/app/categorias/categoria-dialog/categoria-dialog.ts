import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CategoriaService, Categoria } from '../categoria';
import { ToastService } from '../../shared/toast.service';

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
    MatIconModule
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
  private snackBar = inject(ToastService);

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
          next: () => this.dialogRef.close({ action: 'updated', nombre: categoriaData.nombre }),
          error: () => {
            this.loading = false;
            this.snackBar.error('No se pudo actualizar la categoría.', 'Error');
          }
        });
      } else {
        this.categoriaService.crear(categoriaData).subscribe({
          next: (res) => this.dialogRef.close({ action: 'created', nombre: res.nombre }),
          error: () => {
            this.loading = false;
            this.snackBar.error('No se pudo crear la categoría.', 'Error');
          }
        });
      }
    }
  }
}
