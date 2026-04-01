import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CategoriaGastoService, CategoriaGasto } from '../categoria-gasto';
import { SubcategoriaGastoService, SubcategoriaGasto } from '../subcategoria-gasto';

@Component({
  selector: 'app-gasto-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Registrar Nuevo Gasto</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Categoría de Gasto</mat-label>
            <mat-select formControlName="categoriaGastoId">
              <mat-option *ngFor="let cat of categorias" [value]="cat.id">
                {{cat.nombre}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="subcategorias.length > 0">
            <mat-label>Subcategoría de Gasto</mat-label>
            <mat-select formControlName="subcategoriaGastoId">
              <mat-option *ngFor="let subcat of subcategorias" [value]="subcat.id">
                {{subcat.nombre}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Monto</mat-label>
            <input matInput type="number" formControlName="monto">
            <span matPrefix>$&nbsp;</span>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Descripción / Detalle</mat-label>
            <textarea matInput formControlName="descripcion" rows="3"></textarea>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-flat-button color="warn" [disabled]="form.invalid" (click)="onSave()">Confirmar Gasto</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid { display: flex; flex-direction: column; gap: 8px; padding-top: 10px; }
  `]
})
export class GastoDialog implements OnInit {
  private fb = inject(FormBuilder);
  private categoriaGastoService = inject(CategoriaGastoService);
  private subcategoriaGastoService = inject(SubcategoriaGastoService);
  dialogRef = inject(MatDialogRef<GastoDialog>);
  data = inject(MAT_DIALOG_DATA);


  categorias: CategoriaGasto[] = [];
  subcategorias: SubcategoriaGasto[] = [];

  form: FormGroup = this.fb.group({
    sesionId: [this.data?.sesionId || 1, Validators.required],
    categoriaGastoId: ['', Validators.required],
    subcategoriaGastoId: [null],
    monto: ['', [Validators.required, Validators.min(1)]],
    descripcion: ['', [Validators.required, Validators.maxLength(200)]]
  });

  ngOnInit() {
    this.categoriaGastoService.obtenerTodas().subscribe(res => this.categorias = res);

    this.form.get('categoriaGastoId')?.valueChanges.subscribe(catId => {
      // Limpiar subcategoría al cambiar categoría
      this.form.get('subcategoriaGastoId')?.setValue(null);
      this.form.get('subcategoriaGastoId')?.clearValidators();
      
      if (catId) {
        this.subcategoriaGastoService.obtenerPorCategoria(catId).subscribe(res => {
          this.subcategorias = res;
          // Si hay subcategorías, la hacemos obligatoria, si no, la limpiamos.
          if (this.subcategorias.length > 0) {
            this.form.get('subcategoriaGastoId')?.setValidators(Validators.required);
          } else {
            this.form.get('subcategoriaGastoId')?.clearValidators();
          }
          this.form.get('subcategoriaGastoId')?.updateValueAndValidity();
        });
      } else {
        this.subcategorias = [];
      }
    });
  }

  onCancel() { this.dialogRef.close(); }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
