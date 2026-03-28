import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CategoriaService, Categoria } from '../../categorias/categoria';
import { Producto } from '../producto';

@Component({
  selector: 'app-producto-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Nombre del Producto</mat-label>
            <input matInput formControlName="nombre" placeholder="Ej: Sandalia Pink">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Referencia (SKU)</mat-label>
            <input matInput formControlName="referencia" placeholder="Ej: SAN-001">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Categoría</mat-label>
            <mat-select formControlName="categoriaId">
              <mat-option *ngFor="let cat of categorias" [value]="cat.id">
                {{cat.nombre}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Precio Compra</mat-label>
              <input matInput type="number" formControlName="precioCompra">
              <span matPrefix>$&nbsp;</span>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Precio Venta</mat-label>
              <input matInput type="number" formControlName="precioVenta">
              <span matPrefix>$&nbsp;</span>
            </mat-form-field>
          </div>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Stock Inicial</mat-label>
              <input matInput type="number" formControlName="stockActual">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Stock Mínimo</mat-label>
              <input matInput type="number" formControlName="stockMinimo">
            </mat-form-field>
          </div>

          <mat-slide-toggle formControlName="activo">Producto Activo</mat-slide-toggle>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="onSave()">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid { display: flex; flex-direction: column; gap: 4px; padding-top: 10px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  `]
})
export class ProductoDialog implements OnInit {
  private fb = inject(FormBuilder);
  private categoriaService = inject(CategoriaService);
  dialogRef = inject(MatDialogRef<ProductoDialog>);
  data = inject(MAT_DIALOG_DATA);

  categorias: Categoria[] = [];

  form: FormGroup = this.fb.group({
    nombre: [this.data?.nombre || '', Validators.required],
    referencia: [this.data?.referencia || '', Validators.required],
    categoriaId: [this.data?.categoria?.id || '', Validators.required],
    precioCompra: [this.data?.precioCompra || 0, [Validators.required, Validators.min(0)]],
    precioVenta: [this.data?.precioVenta || 0, [Validators.required, Validators.min(0)]],
    stockActual: [this.data?.stockActual || 0, [Validators.required, Validators.min(0)]],
    stockMinimo: [this.data?.stockMinimo || 1, [Validators.required, Validators.min(0)]],
    activo: [this.data?.activo ?? true]
  });

  ngOnInit() {
    this.categoriaService.obtenerTodas().subscribe((res: Categoria[]) => this.categorias = res);
  }

  onCancel() { this.dialogRef.close(); }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
