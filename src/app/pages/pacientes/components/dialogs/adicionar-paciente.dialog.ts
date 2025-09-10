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
    <h2 mat-dialog-title>Adicionar Paciente</h2>
    <form [formGroup]="form" (ngSubmit)="salvar()" class="dialog-form" mat-dialog-content>
      <mat-form-field appearance="fill">
        <mat-label>Nome do Paciente</mat-label>
        <input matInput formControlName="nome" />
      </mat-form-field>

      <div class="linha">
        <mat-form-field appearance="fill">
          <mat-label>Prontuário</mat-label>
          <input matInput formControlName="prontuario" />
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Leito</mat-label>
          <input matInput formControlName="leito" />
        </mat-form-field>
      </div>

      <mat-form-field appearance="fill">
        <mat-label>ID da Bomba (opcional)</mat-label>
        <input matInput formControlName="bomba_id" />
      </mat-form-field>

      <div class="acoes" mat-dialog-actions>
        <button mat-stroked-button type="button" (click)="fechar()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || carregando">Adicionar</button>
      </div>
    </form>
  `,
  styles: [`
    .dialog-form { display: grid; gap: 12px; width: min(560px, 92vw); }
    .linha { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .acoes { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
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
      next: (pac: Paciente) => this.ref.close(pac),   // ✅ tipagem do parâmetro
      error: () => { this.carregando = false; },
    });
  }
}
