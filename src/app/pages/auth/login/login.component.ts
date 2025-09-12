import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { MascaraCpfDirective } from '../login/mascara-cpf.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
    MascaraCpfDirective, // <- diretiva de máscara
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackbar = inject(MatSnackBar);

  exibirSenha = signal(false);
  carregando = signal(false);

  formulario = this.fb.group({
    // pattern garante exatamente 11 dígitos (o FormControl guarda só números)
    cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    senha: ['', [Validators.required, Validators.minLength(4)]],
  });

  alternarVisibilidadeSenha() {
    this.exibirSenha.update(v => !v);
  }

  aoEnviar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const { cpf, senha } = this.formulario.getRawValue() as { cpf: string; senha: string };

    this.carregando.set(true);
    this.auth.entrar(cpf, senha).subscribe({
      next: () => {
        this.carregando.set(false);
        this.snackbar.open('Bem-vindo(a)!', undefined, { duration: 2000 });
        this.router.navigateByUrl('/pacientes');
      },
      error: (e) => {
        this.carregando.set(false);
        const msg = e?.error?.detail || 'Falha ao entrar. Verifique suas credenciais.';
        this.snackbar.open(msg, 'Fechar', { duration: 3500 });
      },
    });
  }
}
