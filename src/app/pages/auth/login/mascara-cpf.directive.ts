import { Directive, ElementRef, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Diretiva de máscara para CPF.
 * - Exibe "000.000.000-00" no input.
 * - Mantém apenas os 11 dígitos no FormControl (valor do formulário).
 * - Bloqueia teclas não numéricas e trata colagem.
 */
@Directive({
  selector: 'input[appMascaraCpf]',
  standalone: true,
})
export class MascaraCpfDirective {
  constructor(
    private elemento: ElementRef<HTMLInputElement>,
    @Optional() private ngControl?: NgControl
  ) {}

  // Permite navegação/edição; bloqueia letras/símbolos
  @HostListener('keydown', ['$event'])
  aoPressionarTecla(evento: KeyboardEvent) {
    const teclasPermitidas = [
      'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End',
    ];
    if (teclasPermitidas.includes(evento.key)) return;
    if (!/^\d$/.test(evento.key)) {
      evento.preventDefault();
    }
  }

  // Formata a cada digitação/colagem
  @HostListener('input')
  aoDigitar() {
    const input = this.elemento.nativeElement;

    // Extrai só números e limita a 11 dígitos (CPF)
    let digitos = input.value.replace(/\D/g, '').slice(0, 11);

    // Monta a máscara visual
    const mascarado = this.aplicarMascaraCpf(digitos);

    // Mostra no input a versão com pontos e hífen
    input.value = mascarado;

    // Atualiza o FormControl com APENAS os dígitos (sem pontuação)
    if (this.ngControl?.control) {
      this.ngControl.control.setValue(digitos, {
        emitEvent: true,
        // Evita que o Angular sobrescreva o valor do input com os dígitos puros
        emitModelToViewChange: false,
      });
    }
  }

  // Ao perder o foco, garante máscara correta
  @HostListener('blur')
  aoPerderFoco() {
    const input = this.elemento.nativeElement;
    const digitos = input.value.replace(/\D/g, '');
    input.value = this.aplicarMascaraCpf(digitos);
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
}
