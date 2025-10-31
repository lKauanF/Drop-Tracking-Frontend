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
    <!-- Cabeçalho “grudado” -->
    <h2 mat-dialog-title class="dlg-title">Adicionar Paciente</h2>

    <!-- Área rolável -->
    <mat-dialog-content class="dlg-content">
      <form [formGroup]="form" (ngSubmit)="salvar()" class="dialog-form" novalidate>

        <mat-form-field appearance="outline" class="campo slim">
          <mat-label>Nome do Paciente*</mat-label>
          <input matInput formControlName="nome" autocomplete="name" />
        </mat-form-field>

        <div class="linha">
          <mat-form-field appearance="outline" class="campo slim">
            <mat-label>Prontuário*</mat-label>
            <input
              matInput
              formControlName="prontuario"
              inputmode="numeric"
              autocomplete="off"
            />
          </mat-form-field>

          <mat-form-field appearance="outline" class="campo slim">
            <mat-label>Leito*</mat-label>
            <input
              matInput
              formControlName="leito"
              inputmode="numeric"
              autocomplete="off"
            />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="campo slim">
          <mat-label>ID da Bomba (opcional)</mat-label>
          <input matInput formControlName="bomba_id" autocomplete="off" />
        </mat-form-field>

        <!-- Rodapé “grudado” -->
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
    :host{ display:block; }

    /* ---------- layout base (desktop) ---------- */
    .dlg-title{
      margin: 0;
      padding: 18px 22px 6px;
      font-weight: 700;
      font-size: 18px;
      color: #0f2a2e;
      position: sticky; top: 0; z-index: 2;
      background: #fff; /* evita texto sobreposto quando rola */
      border-bottom: 1px solid #eef2f4;
    }
    .dlg-content{ padding: 8px 22px 16px; }
    .dialog-form{ display: grid; gap: 12px; width: min(560px, 92vw); }

    .linha{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .dlg-actions{
      position: sticky; bottom: 0; z-index: 2;
      display: flex; justify-content: flex-end; gap: 12px;
      padding: 12px 0 4px;
      background: linear-gradient(180deg, rgba(255,255,255,.0), rgba(255,255,255,1) 40%);
      border-top: 1px solid #eef2f4;
      margin-top: 4px;
    }
    .btn-ghost{ height: 40px; border-radius: 12px; }
    .btn-primary{ height: 40px; border-radius: 12px; }

    /* ---------- material “pill” (44px) ---------- */
    .campo.mat-mdc-form-field{ width: 100%; }
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
      box-shadow: 0 0 0 3px #e6f6f2 inset;
    }

    /* ---------- MOBILE SHEET (≤ 480px) ---------- */
    /* pega a classe do painel passada em panelClass: 'dlg--paciente' */
    :host-context(.dlg--paciente) ::ng-deep .mat-mdc-dialog-surface{
      /* desktop normal; substituído no mobile abaixo */
      border-radius: 16px;
    }

    @media (max-width: 480px){
      /* o painel do diálogo vira tela cheia */
      :host-context(.dlg--paciente) ::ng-deep .mat-mdc-dialog-surface{
        width: 100vw !important;
        max-width: 100vw !important;
        height: 100dvh !important;
        max-height: 100dvh !important;
        margin: 0 !important;
        border-radius: 0 !important;
      }

      .dlg-title{
        padding: 16px 16px 8px;
        font-size: 16px;
      }
      .dlg-content{
        padding: 8px 16px 12px;
        /* garante que só o conteúdo role */
        max-height: calc(100dvh - 56px); /* título ~56px */
        overflow: auto;
        -webkit-overflow-scrolling: touch;
      }
      .dialog-form{ width: 100%; gap: 12px; }
      .linha{ grid-template-columns: 1fr; gap: 10px; }

      .dlg-actions{
        padding: 10px 0 6px;
        gap: 10px;
      }
      .btn-ghost, .btn-primary{ height: 42px; }
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

  fechar(){ this.ref.close(null); }

  salvar(){
    if (this.form.invalid){ this.form.markAllAsTouched(); return; }
    this.carregando = true;

    const v = this.form.getRawValue();
    const payload = {
      nome: (v.nome || '').trim(),
      prontuario: v.prontuario!,
      leito: v.leito!,
      bomba_id: v.bomba_id || '',
      situacao: 'em_andamento',   // valores padrão esperados no card
      alerta: 'normal',
      infusao_taxa: null,
    };

    this.pacientesService.criar(payload as any).subscribe({
      next: (pac: Paciente) => this.ref.close(pac),
      error: () => (this.carregando = false),
    });
  }
}
