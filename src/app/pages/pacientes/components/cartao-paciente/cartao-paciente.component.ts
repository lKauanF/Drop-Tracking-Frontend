// cartao-paciente.component.ts
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Paciente } from '../../../../core/services/pacientes.service';
import { Router } from '@angular/router';

type Alerta = 'normal' | 'alto' | 'oclusao' | string;
type Situacao = 'em_andamento' | 'pausada' | string;

const ALERTAS: Record<string, { cls: string; txt: string }> = {
  normal:  { cls: 'tag tag--normal',  txt: 'Normal' },
  alto:    { cls: 'tag tag--alto',    txt: 'Infusão Alta' },
  oclusao: { cls: 'tag tag--oclusao', txt: 'Oclusão' },
};

const SITUACOES: Record<string, { ponto: string; txt: string }> = {
  em_andamento: { ponto: 'ponto ponto--ok',    txt: 'Em andamento' },
  pausada:      { ponto: 'ponto ponto--pausa', txt: 'Pausada' },
};

@Component({
  selector: 'app-cartao-paciente',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatIconModule, MatButtonModule],
  templateUrl: './cartao-paciente.component.html',
  styleUrls: ['./cartao-paciente.component.scss'],
})
export class CartaoPacienteComponent {
  @Input({ required: true }) paciente!: Paciente;

  private router = inject(Router);

  @Output() editar  = new EventEmitter<Paciente>();
  @Output() remover = new EventEmitter<Paciente>();

  get classeAlerta(): string {
    const a = (this.paciente.alerta as Alerta) ?? 'normal';
    return ALERTAS[a]?.cls ?? ALERTAS['normal'].cls;
  }
  get textoAlerta(): string {
    const a = (this.paciente.alerta as Alerta) ?? 'normal';
    return ALERTAS[a]?.txt ?? ALERTAS['normal'].txt;
  }
  get pontoSituacao(): string {
    const s = (this.paciente.situacao as Situacao) ?? 'em_andamento';
    return SITUACOES[s]?.ponto ?? SITUACOES['em_andamento'].ponto;
  }
  get textoSituacao(): string {
    const s = (this.paciente.situacao as Situacao) ?? 'em_andamento';
    return SITUACOES[s]?.txt ?? SITUACOES['em_andamento'].txt;
  }
  get infusaoFormatada(): string {
    const v = (this.paciente as any)?.infusao_taxa;
    return (v ?? v === 0) ? `${v} mL/h` : '—';
  }

  verRegistros(evt?: Event) {
    evt?.stopPropagation();
    this.router.navigate(['/registros'], {
      queryParams: {
        nome: this.paciente.nome || null,
        prontuario: this.paciente.prontuario || null,
        id_bomba: this.paciente.bomba_id || null,
      },
    });
  }

  onEditar(evt?: Event)  { evt?.stopPropagation(); this.editar.emit(this.paciente); }
  onRemover(evt?: Event) { evt?.stopPropagation(); this.remover.emit(this.paciente); }
}
