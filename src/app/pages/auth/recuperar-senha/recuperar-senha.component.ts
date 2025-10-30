import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Marca3dComponent } from '../../../shared/components/marca-3d/marca-3d.component';

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  imports: [CommonModule, Marca3dComponent],
  template: `
<main class="recover" role="main">
  <section class="recover__container" aria-labelledby="recoverTitle">
    <!-- Marca -->
    <header class="brand" aria-label="Drop Tracking">
          <app-marca-3d
        [gotaPath]="'/assets/3dModel/LogoGota.glb'"
        [arcoPath]="'/assets/3dModel/LogoArco.glb'"
        [gotaAnguloInicial]="0"
        [arcoAnguloInicial]="90">
      </app-marca-3d>
      <h1 id="recoverTitle" class="brand__name">Redefinir senha</h1>
      <p class="brand__sub">Informe seu CPF e defina uma nova senha.</p>
    </header>

    <!-- CARD -->
    <div class="card">
      <!-- CPF -->
      <div class="field">
        <div class="control">
          <label class="sr-only" for="cpf">CPF</label>
          <input
            id="cpf"
            type="text"
            inputmode="numeric"
            placeholder="CPF:"
            maxlength="14"
            [value]="cpfMasked"
            (keydown)="onCpfKeydown($event)"
            (paste)="onCpfPaste($event)"
            (input)="onCpfInput($event)"
            (blur)="cpfTouched = true"
            [attr.aria-invalid]="cpfTouched && (!cpfCompleto || !cpfValido)"
          />
        </div>
        <small class="error" *ngIf="cpfTouched && !cpfCompleto">CPF deve ter 11 números.</small>
        <small class="error" *ngIf="cpfTouched && cpfCompleto && !cpfValido">CPF inválido.</small>
      </div>

      <!-- Nova Senha -->
      <div class="field">
        <label class="sr-only" for="senha">Nova Senha</label>
        <div class="password-wrapper">
          <input
            id="senha"
            [type]="showPass1 ? 'text' : 'password'"
            placeholder="Nova Senha:"
            [value]="senha"
            (input)="onSenhaInput($event)"
            (blur)="senhaTouched = true"
            [attr.aria-invalid]="senhaTouched && !(lenOk && upperOk && numberOk && specialOk)"
          />
          <button type="button" class="toggle-eye" (click)="toggleEye(1)" [attr.aria-label]="showPass1 ? 'Ocultar senha' : 'Mostrar senha'">
            <ng-container *ngIf="!showPass1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7a80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </ng-container>
            <ng-container *ngIf="showPass1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7a80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.77 21.77 0 0 1 5.06-6.94"/>
                <path d="M10.58 10.58a2 2 0 1 0 2.83 2.83"/><path d="M1 1l22 22"/>
              </svg>
            </ng-container>
          </button>
        </div>
      </div>

      <!-- Confirmar -->
      <div class="field">
        <label class="sr-only" for="confirmar">Confirmar Senha</label>
        <div class="password-wrapper">
          <input
            id="confirmar"
            [type]="showPass2 ? 'text' : 'password'"
            placeholder="Confirmar Senha:"
            [value]="confirmar"
            (input)="onConfirmarInput($event)"
            (blur)="confirmarTouched = true"
            [attr.aria-invalid]="confirmarTouched && !matchOk"
          />
          <button type="button" class="toggle-eye" (click)="toggleEye(2)" [attr.aria-label]="showPass2 ? 'Ocultar senha' : 'Mostrar senha'">
            <ng-container *ngIf="!showPass2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7a80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </ng-container>
            <ng-container *ngIf="showPass2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7a80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.77 21.77 0 0 1 5.06-6.94"/>
                <path d="M10.58 10.58a2 2 0 1 0 2.83 2.83"/><path d="M1 1l22 22"/>
              </svg>
            </ng-container>
          </button>
        </div>
        <small class="error" *ngIf="confirmarTouched && !matchOk">As senhas não coincidem.</small>
      </div>

      <!-- Força + checklist -->
      <div class="strength-wrap" *ngIf="senha.length > 0">
        <div class="strength">
          <div class="strengthbar"><span class="fill" [style.width.%]="strengthPercent" [style.background]="strengthColor"></span></div>
          <span class="label">{{ strengthLabel }}</span>
        </div>
        <ul class="rules">
          <li [class.ok]="lenOk">8–20 caracteres</li>
          <li [class.ok]="upperOk">Pelo menos 1 letra maiúscula</li>
          <li [class.ok]="numberOk">Pelo menos 1 número</li>
          <li [class.ok]="specialOk">Pelo menos 1 caractere especial</li>
        </ul>
      </div>

      <!-- Ações -->
      <div class="actions">
        <button class="btn btn-primary" [disabled]="!formValid" (click)="onSubmit()">Redefinir</button>
        <button class="btn btn-ghost" type="button" (click)="voltar()">Voltar</button>
      </div>
    </div>
  </section>
</main>
  `,
  styles: [`
/* ===== Base / Tokens (alinhados ao cadastro) ===== */
.recover, .recover * , .recover *::before, .recover *::after { box-sizing: border-box; }
.recover{
  --bg: #ffffff;
  --card: #ffffff;
  --text: #0f2a2e;
  --muted: #6b7a80;
  --primary: #46b39c;
  --primary-600: #3aa089;
  --primary-100: #e6f6f2;
  --border: #e3e8ea;
  --danger: #d92d20;
  --danger-100: #fee4e2;
  --shadow: 0 10px 24px rgba(16,24,40,.08);

  position: fixed; inset: 0; overflow: hidden;
  display: grid; place-content: center; place-items: center;
  padding: 24px; gap: 16px; background: var(--bg); color: var(--text);
  min-height: 100svh;
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

/* container central */
.recover .recover__container{
  width: 100%; max-width: 720px; min-height: inherit;
  display: grid; gap: 16px; place-content: center; justify-items: center;
}

/* Marca */
.brand{ display: grid; justify-items: center; gap: 10px; margin-bottom: 4px; }
.brand__logo{ width: 248px; height: 248px; object-fit: contain; }
.brand__name{ margin: 0; font-weight: 700; font-size: 22px; }
.brand__sub{ margin: 0; font-size: 13px; color: var(--muted); }

/* Card */
.card{
  width: 520px; max-width: calc(100vw - 48px);
  background: var(--card); border: 1px solid var(--border);
  border-radius: 14px; box-shadow: var(--shadow);
  padding: 24px 28px 20px; margin: 0 auto;
}

/* Campos */
.field + .field{ margin-top: 12px; }
.sr-only{ position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0; }
.recover input{
  height: 46px; width: 100%; border:1px solid #e7eeec; border-radius: 12px;
  padding: 0 18px; font-size: 14px; background:#f1f6f5; outline:none;
  transition: border-color .2s, box-shadow .2s, background .2s;
}
.recover input::placeholder{ color:#9aa6ab; }
.recover input:focus{ border-color:var(--primary); box-shadow:0 0 0 3px var(--primary-100); background:#fff; }

/* erro visual ao invalidar */
.field:has(.error) input{ border-color:var(--danger); box-shadow:0 0 0 3px var(--danger-100); background:#fff; }

/* Senha + olho */
.password-wrapper{ position:relative; }
.password-wrapper input{ padding-right:48px; }
.toggle-eye{
  position:absolute; right:12px; top:50%; transform:translateY(-50%);
  width:32px; height:32px; display:grid; place-items:center;
  background:transparent; border:0; cursor:pointer; border-radius:6px; color:#6b7a80;
}
.toggle-eye:hover{ background:#eef2f1; }

/* Mensagens de erro */
.error{ margin-top:6px; font-weight:600; font-size:12px; color:var(--danger); }

/* Força de senha */
.strength-wrap{ margin-top: 8px; }
.strength{ display:flex; align-items:center; gap:10px; }
.strengthbar{ position:relative; flex:1; height:8px; border-radius:999px; background:#e8eef0; overflow:hidden; }
.strengthbar .fill{ position:absolute; inset:0 100% 0 0; border-radius:999px; }
.strength .label{ font-size:12px; color:var(--muted); }
.rules{ list-style:none; padding:8px 0 0; margin:0; display:grid; gap:4px; color:var(--muted); font-size:13px; }
.rules li.ok{ color:#15803d; font-weight:600; }

/* Ações */
.actions{ margin-top:16px; display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.btn{ height:44px; border-radius:12px; font-weight:600; font-size:14px; border:1px solid transparent; display:grid; place-items:center; text-decoration:none; cursor:pointer; user-select:none; }
.btn-primary{ background:var(--primary); color:#fff; }
.btn-primary:disabled{ opacity:.6; cursor:not-allowed; }
.btn-primary:hover:not(:disabled){ background:var(--primary-600); }
.btn-ghost{ background:#fff; color:var(--text); border-color:var(--border); }
.btn-ghost:hover{ background:#f3f6f6; }

/* Responsivo */
@media (max-width: 560px){
  .card{ width: 100%; }
}
  `]
})
export class RecuperarSenhaComponent {
  constructor(private router: Router) {}

  // ===== CPF
  private cpfRaw = '';
  cpfMasked = '';
  cpfTouched = false;

  private onlyDigits(v: string) { return v.replace(/\D+/g, ''); }
  private maskCpf(digits: string) {
    const p1 = digits.slice(0,3), p2 = digits.slice(3,6), p3 = digits.slice(6,9), p4 = digits.slice(9,11);
    let out = p1;
    if (p2) out += '.' + p2;
    if (p3) out += '.' + p3;
    if (p4) out += '-' + p4;
    return out;
  }
  get cpfCompleto(){ return this.cpfRaw.length === 11; }
  get cpfValido(){
    // validação simples de CPF (DV)
    const d = this.cpfRaw;
    if (d.length !== 11) return false;
    if (/^(\d)\1+$/.test(d)) return false;
    const dv = (base: string) => {
      let sum = 0;
      for (let i=0; i<base.length; i++) sum += parseInt(base[i],10) * (base.length + 1 - i);
      const mod = (sum * 10) % 11;
      return (mod === 10) ? 0 : mod;
    };
    const d1 = dv(d.slice(0,9));
    const d2 = dv(d.slice(0,9) + d1);
    return d1 === parseInt(d[9],10) && d2 === parseInt(d[10],10);
  }
  onCpfKeydown(ev: KeyboardEvent){
    // permite navegação e delete; bloqueia letras
    const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab'];
    if (allowed.includes(ev.key)) return;
    if (!/^\d$/.test(ev.key)) ev.preventDefault();
  }
  onCpfPaste(ev: ClipboardEvent){
    const text = ev.clipboardData?.getData('text') ?? '';
    const digits = this.onlyDigits(text).slice(0,11);
    this.cpfRaw = digits;
    this.cpfMasked = this.maskCpf(digits);
    ev.preventDefault();
  }
  onCpfInput(ev: Event){
    const el = ev.target as HTMLInputElement;
    const digits = this.onlyDigits(el.value).slice(0,11);
    this.cpfRaw = digits;
    this.cpfMasked = this.maskCpf(digits);
  }

  // ===== Senha
  senha = '';
  confirmar = '';
  senhaTouched = false;
  confirmarTouched = false;
  showPass1 = false;
  showPass2 = false;

  // regras
  get lenOk(){ return this.senha.length >= 8 && this.senha.length <= 20; }
  get upperOk(){ return /[A-Z]/.test(this.senha); }
  get numberOk(){ return /\d/.test(this.senha); }
  get specialOk(){ return /[^A-Za-z0-9]/.test(this.senha); }
  get matchOk(){ return this.confirmar.length > 0 && this.senha === this.confirmar; }

  get strengthPercent(){
    const checks = [this.lenOk, this.upperOk, this.numberOk, this.specialOk].filter(Boolean).length;
    return [0, 25, 50, 75, 100][checks];
  }
  get strengthColor(){
    const p = this.strengthPercent;
    if (p <= 25) return '#ef4444';
    if (p === 50) return '#f59e0b';
    if (p === 75) return '#10b981';
    return '#059669';
  }
  get strengthLabel(){
    const p = this.strengthPercent;
    if (p <= 25) return 'Fraca';
    if (p === 50) return 'Média';
    if (p === 75) return 'Boa';
    return 'Ótima';
  }

  onSenhaInput(ev: Event){ this.senha = (ev.target as HTMLInputElement).value; }
  onConfirmarInput(ev: Event){ this.confirmar = (ev.target as HTMLInputElement).value; }
  toggleEye(which: 1|2){ which === 1 ? this.showPass1 = !this.showPass1 : this.showPass2 = !this.showPass2; }

  // ===== Submit
  get formValid(){
    return this.cpfCompleto && this.cpfValido && this.lenOk && this.upperOk && this.numberOk && this.specialOk && this.matchOk;
  }
  onSubmit(){
    if (!this.formValid) return;
    // Aqui você chamaria seu endpoint: auth/redefinir-senha { cpf, senha }
    // this.auth.resetPassword({ cpf: this.cpfRaw, senha: this.senha }).subscribe(...)
    alert('Senha redefinida com sucesso!');
    this.router.navigate(['/entrar']);
  }

  voltar(){ this.router.navigate(['/entrar']); }
}
