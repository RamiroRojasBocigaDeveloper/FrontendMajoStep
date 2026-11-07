import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth/auth';
import { SuccessDialog } from '../shared/success-dialog';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatDialogModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private static readonly REMEMBER_KEY = 'majostep.login.email';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  @ViewChild('loginCard') private loginCard?: ElementRef<HTMLElement>;

  loginForm: FormGroup;
  rememberControl: FormControl<boolean>;
  loading = signal(false);
  hidePassword = signal(true);
  capsLock = signal(false);
  errorMessage = signal<string | null>(null);
  submitted = signal(false);
  shake = signal(false);
  year = new Date().getFullYear();

  constructor() {
    const savedEmail = this.readRememberedEmail();
    this.loginForm = this.fb.group({
      email: [savedEmail, [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.rememberControl = new FormControl(savedEmail.length > 0, { nonNullable: true });
  }

  onSubmit() {
    if (this.loading()) return;

    this.submitted.set(true);
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.getRawValue();

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.persistRememberedEmail(email);
        this.dialog.open(SuccessDialog, {
          width: '420px',
          data: {
            icon: '👋',
            title: '¡Hola, ' + response.nombre + '!',
            message: 'Has iniciado sesión correctamente. Bienvenido de nuevo.',
          },
        });
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(this.mensajeError(err));
        this.shake.set(true);
        window.setTimeout(() => this.shake.set(false), 550);
      },
    });
  }

  togglePassword() {
    this.hidePassword.update((hidden) => !hidden);
  }

  onPasswordKey(event: KeyboardEvent) {
    this.capsLock.set(event.getModifierState?.('CapsLock') ?? false);
  }

  clearError() {
    if (this.errorMessage()) this.errorMessage.set(null);
  }

  showError(controlName: 'email' | 'password'): boolean {
    const control = this.loginForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted());
  }

  onCardMouseMove(event: MouseEvent) {
    const card = this.loginCard?.nativeElement;
    if (!card || this.prefersReducedMotion()) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 5;
    const rotateX = ((y / rect.height) - 0.5) * -5;

    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);
    card.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`);
    card.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
  }

  onCardMouseLeave() {
    const card = this.loginCard?.nativeElement;
    if (!card) return;

    card.style.setProperty('--mx', '50%');
    card.style.setProperty('--my', '50%');
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

  private readRememberedEmail(): string {
    try {
      return localStorage.getItem(Login.REMEMBER_KEY) ?? '';
    } catch {
      return '';
    }
  }

  private persistRememberedEmail(email: string) {
    try {
      if (this.rememberControl.value) localStorage.setItem(Login.REMEMBER_KEY, email);
      else localStorage.removeItem(Login.REMEMBER_KEY);
    } catch {}
  }

  private mensajeError(err: any): string {
    switch (err?.status) {
      case 0:
        return 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.';
      case 401:
        return 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.';
      case 429:
        return err?.error?.message || 'Demasiados intentos fallidos. Espera unos minutos y vuelve a intentarlo.';
      case 500:
        return 'Error interno del servidor. Inténtalo más tarde.';
      case 502:
      case 503:
      case 504:
        return 'El servidor no está disponible en este momento (puede estar iniciando). Espera unos segundos y vuelve a intentarlo.';
      default:
        return 'No se pudo iniciar sesión. Inténtalo de nuevo en unos minutos.';
    }
  }
}
