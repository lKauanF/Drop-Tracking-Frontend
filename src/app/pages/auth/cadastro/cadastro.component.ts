import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

/* -------- Validadores customizados (CPF e confirmação de senha) -------- */
function limparNaoDigitos(v: string) { return (v ?? '').replace(/\D+/g, ''); }

function validarCpfAlgoritmo(cpf: string): boolean {
  const s = limparNaoDigitos(cpf);
  if (s.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(s)) return false; // todos iguais

  const calcDV = (base: string, fatorIni: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) soma += parseInt(base[i], 10) * (fatorIni - i);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const dv1 = calcDV(s.slice(0, 9), 10);
  const dv2 = calcDV(s.slice(0, 9) + dv1, 11);
  return s.endsWith(`${dv1}${dv2}`);
}

function validadorCpf(ctrl: AbstractControl): ValidationErrors | null {
  const ok = validarCpfAlgoritmo(ctrl.value ?? '');
  return ok ? null : { cpfInvalido: true };
}

function validadorConfirmarSenha(grupo: AbstractControl): ValidationErrors | null {
  const senha = grupo.get('senha')?.value ?? '';
  const confirmar = grupo.get('confirmarSenha')?.value ?? '';
  return senha && confirmar && senha !== confirmar ? { senhasDiferentes: true } : null;
}

@Component({
  selector: 'app-cadastro',
  standalone: true,
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    LogoComponent,
  ],
})
export class CadastroComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackbar = inject(MatSnackBar);

  exibirSenha = signal(false);
  exibirConfirmar = signal(false);
  carregando = signal(false);

  formulario = this.fb.group({
    cpf: ['', [Validators.required, validadorCpf]],
    nome: ['', [Validators.required, Validators.minLength(3)]],
    senha: ['', [Validators.required, Validators.minLength(4)]],
    confirmarSenha: ['', [Validators.required]],
  }, { validators: validadorConfirmarSenha });

  alternarSenha() { this.exibirSenha.update(v => !v); }
  alternarConfirmar() { this.exibirConfirmar.update(v => !v); }

  aoCadastrar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    // Sanitiza CPF antes de enviar
    const { cpf, nome, senha } = this.formulario.getRawValue() as { cpf: string; nome: string; senha: string; confirmarSenha: string };
    const payload = { cpf: limparNaoDigitos(cpf), nome, senha };

    this.carregando.set(true);
    this.auth.cadastrar(payload.cpf, payload.nome, payload.senha).subscribe({
      next: () => {
        this.carregando.set(false);
        this.snackbar.open('Cadastro realizado! Faça login para continuar.', undefined, { duration: 2500 });
        this.router.navigateByUrl('/entrar');
      },
      error: (e) => {
        this.carregando.set(false);
        const msg = e?.error?.detail || e?.error?.message || 'Não foi possível cadastrar.';
        this.snackbar.open(msg, 'Fechar', { duration: 3500 });
      }
    });
  }
}

