import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PacientesService, Paciente } from '../../../../core/services/pacientes.service';

@Component({
  selector: 'app-adicionar-paciente-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title class="dlg-title">Adicionar Paciente</h2>

    <mat-dialog-content class="dlg-content">
      <form [formGroup]="form" (ngSubmit)="salvar()" class="dialog-form">

        <mat-form-field appearance="outline" class="campo slim">
          <mat-label>Nome do Paciente*</mat-label>
          <input matInput formControlName="nome" />
        </mat-form-field>

        <div class="linha">
          <mat-form-field appearance="outline" class="campo slim">
            <mat-label>Prontuário*</mat-label>
            <input matInput formControlName="prontuario" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="campo slim">
            <mat-label>Leito*</mat-label>
            <input matInput formControlName="leito" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="campo slim">
          <mat-label>ID da Bomba (opcional)</mat-label>
          <input matInput formControlName="bomba_id" />
        </mat-form-field>

        <div class="dlg-actions">
          <button mat-stroked-button type="button" class="btn-ghost" (click)="fechar()">Cancelar</button>
          <button mat-raised-button color="primary" class="btn-primary" type="submit" [disabled]="form.invalid || carregando">
            Adicionar
          </button>
        </div>
      </form>
    </mat-dialog-content>
  `,
  styles: [`
    /* dimensões gerais */
    .dlg-title{ margin: 0; padding: 18px 22px 6px; font-weight: 700; font-size: 18px; color: #0f2a2e; }
    .dlg-content{ padding: 8px 22px 16px; }
    .dialog-form{ display: grid; gap: 12px; width: min(560px, 92vw); }

    /* grid 2 colunas para prontuário/leito */
    .linha{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    /* ações */
    .dlg-actions{ display: flex; justify-content: flex-end; gap: 12px; margin-top: 6px; }
    .btn-ghost{ height: 40px; border-radius: 12px; }
    .btn-primary{ height: 40px; border-radius: 12px; }

    /* ===== Material “pill” 44px (outline suave) ===== */
    .campo.mat-mdc-form-field { width: 100%; }
    .campo.slim .mat-mdc-text-field-wrapper{
      height: 44px;
      border-radius: 12px !important;
      background: #eef4f6;
      padding-right: 8px;
    }
    .campo.slim .mdc-notched-outline__leading,
    .campo.slim .mdc-notched-outline__trailing,
    .campo.slim .mdc-notched-outline__notch{
      border-color: #e7eeec !important;
      border-radius: 12px;
    }
    .campo.slim .mdc-text-field__input{
      height: 44px; line-height: 44px; padding: 0 12px;
    }
    .campo.slim .mdc-floating-label{ color: #8aa2a8; }
    .campo.slim .mat-mdc-form-field-icon-prefix,
    .campo.slim .mat-mdc-form-field-icon-suffix{ color: #8aa2a8; }
    .campo.slim .mat-mdc-form-field-focus-overlay{ background: transparent; }
    .campo.slim .mdc-text-field--focused .mdc-notched-outline__leading,
    .campo.slim .mdc-text-field--focused .mdc-notched-outline__trailing,
    .campo.slim .mdc-text-field--focused .mdc-notched-outline__notch{
      border-color: #46b39c !important;
      box-shadow: 0 0 0 3px #e6f6f2 inset; /* glow verdinho */
    }

    /* responsivo */
    @media (max-width: 560px){
      .linha{ grid-template-columns: 1fr; }
    }
  `]
})
export class AdicionarPacienteDialog {
  private fb = inject(FormBuilder);
  private ref = inject(MatDialogRef<AdicionarPacienteDialog>);
  private pacientesService = inject(PacientesService);
  carregando = false;

  form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    prontuario: ['', [Validators.required]],
    leito: ['', [Validators.required]],
    bomba_id: [''],
  });

  fechar() { this.ref.close(null); }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.carregando = true;
    const v = this.form.getRawValue();
    this.pacientesService.criar(v as any).subscribe({
      next: (pac: Paciente) => this.ref.close(pac),
      error: () => { this.carregando = false; },
    });
  }
  
}
