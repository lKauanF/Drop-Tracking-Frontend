import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PacientesService, Paciente, SituacaoInfusao } from '../../core/services/pacientes.service';
import { CartaoPacienteComponent } from './components/cartao-paciente/cartao-paciente.component';
import { AdicionarPacienteDialog } from './components/dialogs/adicionar-paciente.dialog';


@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    CartaoPacienteComponent,
    
  ],
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.scss'],
})
export class PacientesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pacientesService = inject(PacientesService);
  private dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);

  // Estado
  carregando = signal(false);
  paginaAtual = signal(1);
  tamanhoPagina = 12;
  total = signal(0);
  pacientes = signal<Paciente[]>([]);

  filtros = this.fb.group({
    busca: [''],
    situacao: ['' as '' | SituacaoInfusao],
  });

  paginas = computed(() => {
    const count = this.total();
    const pages = Math.max(1, Math.ceil(count / this.tamanhoPagina));
    return Array.from({ length: pages }, (_, i) => i + 1);
  });

  ngOnInit() {
    this.carregar();
    this.filtros.valueChanges.subscribe(() => {
      this.paginaAtual.set(1);
      this.carregar();
    });
  }

  carregar() {
    this.carregando.set(true);
    const { busca, situacao } = this.filtros.getRawValue();
    this.pacientesService.listar({
      pagina: this.paginaAtual(),
      tamanho: this.tamanhoPagina,
      busca: busca ?? '',
      situacao: (situacao ?? '') as any,
    }).subscribe({
      next: (p) => {
        this.total.set(p.count);
        this.pacientes.set(p.results);
        this.carregando.set(false);
      },
      error: () => {
        this.total.set(0);
        this.pacientes.set([]);
        this.carregando.set(false);
      }
    });
  }

  abrirDialogAdicionar() {
  const ref = this.dialog.open(AdicionarPacienteDialog, {
    disableClose: true,
    panelClass: 'dlg--paciente',
    backdropClass: 'backdrop--blur',
  });

  ref.afterClosed().subscribe((pac: Paciente | null) => {
    if (pac) {
      // UPDATE OTIMISTA: mostra o card na hora
      this.pacientes.update(list => [pac, ...list]);
      this.total.update(t => t + 1);
      this.snackbar.open('Paciente adicionado!', undefined, { duration: 2000 });

      // Se preferir garantir que veio do backend com todos os campos:
      this.carregar(); // pode manter ou remover (otimista puro)
    }
  });
  }

  irPara(pagina: number) {
  const total = this.paginas().length;
  const alvo = Math.max(1, Math.min(total, pagina)); // evita sair do range
  if (alvo === this.paginaAtual()) return;
  this.paginaAtual.set(alvo);
  this.carregar();
}



}
