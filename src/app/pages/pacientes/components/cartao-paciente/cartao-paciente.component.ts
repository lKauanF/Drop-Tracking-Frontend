import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Paciente } from '../../../../core/services/pacientes.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cartao-paciente',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './cartao-paciente.component.html',
  styleUrls: ['./cartao-paciente.component.scss'],
})
export class CartaoPacienteComponent {
  @Input({ required: true }) paciente!: Paciente;

  get classeAlerta(): string {
    switch (this.paciente.alerta) {
      case 'alto': return 'tag tag--alto';
      case 'oclusao': return 'tag tag--oclusao';
      default: return 'tag tag--normal';
    }
  }

  get textoAlerta(): string {
    switch (this.paciente.alerta) {
      case 'alto': return 'Infusão Alta';
      case 'oclusao': return 'Oclusão';
      default: return 'Normal';
    }
  }

  get pontoSituacao(): string {
    return this.paciente.situacao === 'em_andamento' ? 'ponto ponto--ok' : 'ponto ponto--pausa';
  }

  get textoSituacao(): string {
    return this.paciente.situacao === 'em_andamento' ? 'Em andamento' : 'Pausada';
  }
}
