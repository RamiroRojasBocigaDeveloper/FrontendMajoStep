import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-success-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="welcome-wrapper">
      <div class="welcome-icon">{{ data.icon || '✨' }}</div>
      <h2 class="welcome-title" [style.color]="data.titleColor || 'var(--primary-pink)'">{{ data.title || '¡Operación Exitosa!' }}</h2>
      <p class="welcome-message">{{ data.message }}</p>
      
      <div class="welcome-actions">
        <button mat-flat-button class="start-selling-btn" [color]="data.btnColor || 'primary'" (click)="dialogRef.close(true)">
          <mat-icon>{{ data.btnIcon || 'check_circle' }}</mat-icon> {{ data.btnText || 'Continuar' }}
        </button>
        <button mat-button class="cancel-btn" *ngIf="data.showCancel" (click)="dialogRef.close(false)">
          Cancelar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .welcome-wrapper { 
      padding: 32px; 
      text-align: center; 
      background: linear-gradient(135deg, #ffffff, #fff5f8); 
      border-radius: 20px;
    }
    .welcome-icon { 
      font-size: 4rem; 
      margin-bottom: 16px; 
      animation: bounce 2s infinite; 
    }
    .welcome-title { 
      font-size: 1.8rem; 
      font-weight: 800; 
      color: var(--primary-pink); 
      margin-bottom: 12px; 
    }
    .welcome-message { 
      font-size: 1.2rem; 
      color: #444; 
      line-height: 1.5; 
      margin-bottom: 32px; 
    }
    .start-selling-btn { 
      padding: 24px 32px; 
      font-size: 1.1rem; 
      border-radius: 12px; 
      font-weight: bold; 
      box-shadow: 0 4px 15px rgba(233, 30, 99, 0.3); 
    }
    .cancel-btn {
      margin-top: 10px;
      width: 100%;
      color: #777;
    }
    @keyframes bounce { 
      0%, 100% { transform: translateY(0); } 
      50% { transform: translateY(-10px); } 
    }
  `]
})
export class SuccessDialog {
  dialogRef = inject(MatDialogRef<SuccessDialog>);
  data = inject(MAT_DIALOG_DATA);
}
