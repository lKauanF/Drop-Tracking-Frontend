import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  // UI
  showPassword = false;

  // Campos
  cpf = '';         // somente dígitos
  cpfMascara = '';  // exibição 000.000.000-00
  senha = '';

  // Estado
  cpfTouched = false;
  senhaTouched = false;
  authError = '';

  // ---- Validações ----
  get cpfCompleto(): boolean {
    return /^\d{11}$/.test(this.cpf);
  }

  get cpfValido(): boolean {
    return this.cpfCompleto && this.validarCpf(this.cpf);
  }

  /** Valida CPF pelo algoritmo dos dígitos verificadores */
  private validarCpf(cpf: string): boolean {
    if (!/^\d{11}$/.test(cpf)) return false;
    // Rejeita CPFs com todos os dígitos iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    const calcDig = (len: number) => {
      let soma = 0;
      for (let i = 0; i < len; i++) {
        soma += Number(cpf[i]) * (len + 1 - i);
      }
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const d1 = calcDig(9);
    const d2 = calcDig(10);
    return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
  }

  // ---- Interações ----
  toggleShowPassword() { this.showPassword = !this.showPassword; }

  filtrarTeclas(ev: KeyboardEvent) {
    const allowed = ['Backspace','Tab','ArrowLeft','ArrowRight','Delete','Home','End'];
    if (allowed.includes(ev.key)) return;
    if (!/^\d$/.test(ev.key)) ev.preventDefault();
  }

  onCpfInput(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const apenasDigitos = (input.value || '').replace(/\D/g, '').slice(0, 11);
    this.cpf = apenasDigitos;
    this.cpfMascara = this.aplicarMascaraCpf(apenasDigitos);
  }

  onCpfPaste(ev: ClipboardEvent) {
    ev.preventDefault();
    const txt = ev.clipboardData?.getData('text') ?? '';
    const apenasDigitos = txt.replace(/\D/g, '').slice(0, 11);
    this.cpf = apenasDigitos;
    this.cpfMascara = this.aplicarMascaraCpf(apenasDigitos);
  }

  private aplicarMascaraCpf(v: string): string {
    const p1 = v.substring(0, 3);
    const p2 = v.substring(3, 6);
    const p3 = v.substring(6, 9);
    const p4 = v.substring(9, 11);
    let out = '';
    if (p1) out += p1;
    if (p2) out += (out ? '.' : '') + p2;
    if (p3) out += (out ? '.' : '') + p3;
    if (p4) out += (out ? '-' : '') + p4;
    return out;
  }

  onSenhaInput(ev: Event) {
    this.senha = (ev.target as HTMLInputElement).value;
  }

  onSubmit() {
    this.authError = '';
    this.cpfTouched = true;
    this.senhaTouched = true;

    if (!this.cpfValido) return; // agora exige CPF válido (não só 11 dígitos)
    if (!this.senha) return;

    // Chamada real ao backend iria aqui com this.cpf e this.senha
    this.authError = 'Senha incorreta.'; // demo
  }
}
