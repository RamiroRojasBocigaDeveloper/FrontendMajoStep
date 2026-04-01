import { Component, signal, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  loginForm: FormGroup;
  loading = false;
  hide = true;
  errorMessage = signal<string | null>(null);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage.set(null);
      this.cdr.detectChanges();

      console.log('Intentando iniciar sesión para:', this.loginForm.value.email);
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Inicio de sesión exitoso para:', response.email);
          this.loading = false;
          this.snackBar.open('¡Bienvenido! ' + response.nombre, 'Cerrar', { 
            duration: 3000,
            panelClass: ['success-snackbar'] 
          });
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Error de autenticación observado:', err);
          this.loading = false;
          
          let message = 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.';
          if (err.status === 0) message = 'No se pudo conectar con el servidor. Verifica tu conexión.';
          if (err.status === 500) message = 'Error interno del servidor. Inténtalo más tarde.';
          
          this.errorMessage.set(message);
          this.snackBar.open('Error: ' + message, 'Cerrar', { 
            duration: 6000,
            panelClass: ['error-snackbar']
          });
          this.cdr.detectChanges(); // Asegurar que el Signal actualice la vista
        }
      });
    }
  }
}
