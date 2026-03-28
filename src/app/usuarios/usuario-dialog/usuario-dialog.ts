import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Usuario } from '../usuario';

@Component({
  selector: 'app-usuario-dialog',
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
    <h2 mat-dialog-title>{{ data ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Nombre Completo</mat-label>
            <input matInput formControlName="nombre">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email">
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="!data">
            <mat-label>Contraseña</mat-label>
            <input matInput type="password" formControlName="password">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Rol</mat-label>
            <mat-select formControlName="rolId">
              <mat-option [value]="1">Administrador</mat-option>
              <mat-option [value]="2">Vendedor</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Sueldo Diario</mat-label>
            <input matInput type="number" formControlName="sueldoDiario">
          </mat-form-field>

          <mat-slide-toggle formControlName="activo">Usuario Activo</mat-slide-toggle>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="onSave()">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid { display: flex; flex-direction: column; gap: 12px; padding-top: 10px; }
  `]
})
export class UsuarioDialog {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<UsuarioDialog>);
  data = inject(MAT_DIALOG_DATA);

  form: FormGroup = this.fb.group({
    nombre: [this.data?.nombre || '', Validators.required],
    email: [this.data?.email || '', [Validators.required, Validators.email]],
    password: ['', this.data ? [] : [Validators.required]],
    rolId: [this.data?.rolNombre === 'ADMINISTRADOR' ? 1 : 2, Validators.required],
    sueldoDiario: [this.data?.sueldoDiario || 0, [Validators.required, Validators.min(0)]],
    activo: [this.data?.activo ?? true]
  });

  onCancel() { this.dialogRef.close(); }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
