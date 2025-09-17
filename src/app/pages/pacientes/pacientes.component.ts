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
  
onEditar(p: Paciente) {
  const ref = this.dialog.open(AdicionarPacienteDialog, {
    data: p,
    disableClose: true,
    panelClass: 'dlg--paciente',
    backdropClass: 'backdrop--blur',
    autoFocus: false,
  });

  ref.afterClosed().subscribe((editado: Paciente | null) => {
    if (!editado) return;
    this.pacientes.update(list => list.map(x => x.id === editado.id ? editado : x));
    this.snackbar.open('Paciente atualizado!', undefined, { duration: 2000 });
    this.carregar(); // garante sincronismo com o backend
  });
}

onRemover(p: Paciente) {
  if (!confirm(`Remover paciente “${p.nome}”?`)) return;

  const anterior = this.pacientes();
  this.pacientes.update(list => list.filter(x => x.id !== p.id));
  this.total.update(t => Math.max(0, t - 1));

  this.pacientesService.remover(p.id).subscribe({
    next: () => this.snackbar.open('Paciente removido!', undefined, { duration: 1800 }),
    error: () => {
      this.pacientes.set(anterior);
      this.total.update(t => t + 1);
      this.snackbar.open('Falha ao remover. Tente novamente.', undefined, { duration: 2200 });
    }
  });
}

 ngOnInit() {
  // DEV: preencher cards de exemplo
  (this.pacientesService as any).seed?.(8);

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
      autoFocus: false,
    });

    ref.afterClosed().subscribe((pac: Paciente | null) => {
      if (!pac) return;

      const padrao: Partial<Paciente> = { situacao: 'em_andamento', alerta: 'normal' };
      const novo = { ...padrao, ...pac } as Paciente;

      this.paginaAtual.set(1);                // garante que você verá o novo
      this.pacientes.update(list => [novo, ...list]);
      this.total.update(t => t + 1);
      this.snackbar.open('Paciente adicionado!', undefined, { duration: 2000 });

      this.carregar();                        // sincroniza com o backend
    });
  }

  public irPara = (pagina: number) => {
    const total = this.paginas().length;
    const alvo = Math.max(1, Math.min(total, pagina));
    if (alvo === this.paginaAtual()) return;
    this.paginaAtual.set(alvo);
    this.carregar();
  };
}