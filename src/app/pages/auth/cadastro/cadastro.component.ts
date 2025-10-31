import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Marca3dComponent } from '../../../shared/components/marca-3d/marca-3d.component';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, Marca3dComponent],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class CadastroComponent {
  constructor(private router: Router) {}

  // ===== CPF =====
  cpfDigits = '';
  cpfMasked = '';
  get cpfCompleto() { return /^\d{11}$/.test(this.cpfDigits); }
  get cpfValido()   { return this.cpfCompleto && this.validarCpf(this.cpfDigits); }

  onCpfKeydown(e: KeyboardEvent) {
    const allow = ['Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','Home','End'];
    if (allow.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  }
  onCpfInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '').slice(0, 11);
    this.cpfDigits = digits;
    this.cpfMasked = this.maskCpf(digits);
    input.value = this.cpfMasked;
  }
  onCpfPaste(e: ClipboardEvent) {
    e.preventDefault();
    const txt = e.clipboardData?.getData('text') ?? '';
    const digits = txt.replace(/\D/g, '').slice(0, 11);
    this.cpfDigits = digits;
    this.cpfMasked = this.maskCpf(digits);
  }
  private maskCpf(d: string): string {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9,11)}`;
  }
  private validarCpf(cpf: string): boolean {
    if (!/^\d{11}$/.test(cpf)) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    const calc = (len: number) => {
      let soma = 0;
      for (let i = 0; i < len; i++) soma += Number(cpf[i]) * (len + 1 - i);
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };
    return calc(9) === +cpf[9] && calc(10) === +cpf[10];
  }

  // ===== Nome =====
  nome = '';
  onNomeKeydown(e: KeyboardEvent) {
    const allowNav = ['Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','Home','End',' ',"'","-"];
    const isLetter = /^[A-Za-zÀ-ÖØ-öø-ÿ]$/.test(e.key);
    if (!(allowNav.includes(e.key) || e.ctrlKey || e.metaKey || isLetter)) e.preventDefault();
  }
  onNomeInput(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.nome = (input.value || '')
      .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, '')
      .replace(/\s{2,}/g, ' ');
    input.value = this.nome;
  }
  get nomeOk() { return this.nome.trim().length >= 2; }

  // ===== E-mail =====
  email = '';
  emailTouched = false;
  onEmailKeydown(e: KeyboardEvent){ if (e.key === ' ') e.preventDefault(); }
  onEmailInput(e: Event){
    const input = (e.target as HTMLInputElement);
    this.email = (input.value || '').trim().toLowerCase().replace(/\s+/g, '');
    input.value = this.email;
  }
  get emailOk(){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.email); }

  // ===== Senhas =====
  senha = '';
  confirmar = '';
  showPass1 = false;
  showPass2 = false;
  onSenhaInput(e: Event){ this.senha = (e.target as HTMLInputElement).value; }
  onConfirmarInput(e: Event){ this.confirmar = (e.target as HTMLInputElement).value; }
  get lenOk()     { return this.senha.length >= 8 && this.senha.length <= 20; }
  get upperOk()   { return /[A-Z]/.test(this.senha); }
  get numberOk()  { return /\d/.test(this.senha); }
  get specialOk() { return /[^A-Za-z0-9]/.test(this.senha); }
  get matchOk()   { return !!this.senha && this.senha === this.confirmar; }
  get score() { return [this.lenOk, this.upperOk, this.numberOk, this.specialOk].filter(Boolean).length; }
  get strengthPercent() { return this.senha ? (this.score / 4) * 100 : 0; }
  get strengthLabel() {
    if (!this.senha) return '';
    return ['Muito fraca','Fraca','Média','Forte'][Math.max(0, this.score - 1)];
  }
  get strengthColor() {
    if (!this.senha) return '#ef4444';
    return ['#ef4444','#f59e0b','#3b82f6','var(--primary-600)'][Math.max(0, this.score - 1)];
  }
  toggleEye(i: 1|2){ i === 1 ? this.showPass1 = !this.showPass1 : this.showPass2 = !this.showPass2; }

  // ===== Touch =====
  cpfTouched = false;
  nomeTouched = false;
  senhaTouched = false;
  confirmarTouched = false;

  // ===== Regra fixa (não exibida) =====
  private role: 'ROLE_USER' = 'ROLE_USER';

  // ===== Form ok =====
  get formValid() {
    return this.cpfValido && this.nomeOk && this.emailOk &&
           this.lenOk && this.upperOk && this.numberOk && this.specialOk && this.matchOk;
  }

  onSubmit() {
    this.cpfTouched = this.nomeTouched = this.senhaTouched = this.confirmarTouched = true;
    this.emailTouched = true;
    if (!this.formValid) return;

    const payload = {
      cpf: this.cpfDigits,
      nome: this.nome.trim(),
      email: this.email.trim(),
      senha: this.senha,
      role: this.role, // enviado, mas não aparece na UI
    };

    alert('Cadastro válido!\n' + JSON.stringify(payload, null, 2));
  }

  voltar() {
    this.router.navigateByUrl('/entrar').catch(() => window.history.back());
  }
}
