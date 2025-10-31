import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
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
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { PacientesService, Paciente, SituacaoInfusao } from '../../core/services/pacientes.service';
import { CartaoPacienteComponent } from './components/cartao-paciente/cartao-paciente.component';
import { AdicionarPacienteDialog } from './components/dialogs/adicionar-paciente.dialog';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
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
export class PacientesComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private pacientesService = inject(PacientesService);
  private dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);

  // Estado
  carregando = signal(false);
  paginaAtual = signal(1);
  tamanhoPagina = 12; // será ajustado dinamicamente no ngOnInit()
  total = signal(0);
  pacientes = signal<Paciente[]>([]);

  // Sub para resize/orientation (para atualizar o tamanho de página quando mudar a largura)
  private subResize?: Subscription;

  // Filtros
  filtros = this.fb.group({
    busca: [''],
    situacao: ['' as '' | SituacaoInfusao],
  });

  // Paginação
  paginas = computed(() => {
    const pages = Math.max(1, Math.ceil(this.total() / this.tamanhoPagina));
    return Array.from({ length: pages }, (_, i) => i + 1);
  });

  // ========= Helpers =========

  /** Considera mobile quando largura ≤ 680px */
  private ehMobile(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(max-width: 680px)').matches;
  }

  /** Ajusta o tamanho da página (2 no mobile, 12 no desktop) e recarrega se tiver mudado */
  private ajustarTamanhoPaginaConformeTela(): void {
    const novoTam = this.ehMobile() ? 2 : 12; // ← aqui está a regra pedida
    if (novoTam !== this.tamanhoPagina) {
      this.tamanhoPagina = novoTam;
      // ao mudar o tamanho da página, volte para a 1ª página e recarregue
      this.paginaAtual.set(1);
      this.carregar();
    }
  }

  // ========= Ciclo de vida =========

  ngOnInit() {
    // Define tamanho de página inicial conforme a largura atual
    this.tamanhoPagina = this.ehMobile() ? 2 : 12;

    // Opcional: seed de desenvolvimento
    (this.pacientesService as any).seed?.(8);

    // Carrega inicial
    this.carregar();

    // Reage a filtros
    this.filtros.valueChanges.subscribe(() => {
      this.paginaAtual.set(1);
      this.carregar();
    });

    // Ouve resize/orientation para reavaliar o tamanho da página (debounce p/ não dar rajada de requisições)
    if (typeof window !== 'undefined') {
      this.subResize = fromEvent(window, 'resize')
        .pipe(debounceTime(200))
        .subscribe(() => this.ajustarTamanhoPaginaConformeTela());

      // alguns navegadores não disparam 'resize' no rotate — mas a maioria sim; manter apenas resize é suficiente
    }
  }

  ngOnDestroy(): void {
    this.subResize?.unsubscribe();
  }

  // ========= Ações =========

  carregar() {
    this.carregando.set(true);
    const { busca, situacao } = this.filtros.getRawValue();
    this.pacientesService
      .listar({
        pagina: this.paginaAtual(),
        tamanho: this.tamanhoPagina,
        busca: busca ?? '',
        situacao: (situacao ?? '') as any,
      })
      .subscribe({
        next: (p) => {
          this.total.set(p.count);
          this.pacientes.set(p.results);
          this.carregando.set(false);
        },
        error: () => {
          this.total.set(0);
          this.pacientes.set([]);
          this.carregando.set(false);
        },
      });
  }

  irPara = (pagina: number) => {
    const total = this.paginas().length;
    const alvo = Math.max(1, Math.min(total, pagina));
    if (alvo === this.paginaAtual()) return;
    this.paginaAtual.set(alvo);
    this.carregar();
  };

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

      this.paginaAtual.set(1);
      this.pacientes.update((list) => [novo, ...list]);
      this.total.update((t) => t + 1);
      this.snackbar.open('Paciente adicionado!', undefined, { duration: 2000 });

      this.carregar();
    });
  }

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
      this.pacientes.update((list) => list.map((x) => (x.id === editado.id ? editado : x)));
      this.snackbar.open('Paciente atualizado!', undefined, { duration: 2000 });
      this.carregar();
    });
  }

  onRemover(p: Paciente) {
    if (!confirm(`Remover paciente “${p.nome}”?`)) return;

    const anterior = this.pacientes();
    this.pacientes.update((list) => list.filter((x) => x.id !== p.id));
    this.total.update((t) => Math.max(0, t - 1));

    this.pacientesService.remover(p.id).subscribe({
      next: () => this.snackbar.open('Paciente removido!', undefined, { duration: 1800 }),
      error: () => {
        this.pacientes.set(anterior);
        this.total.update((t) => t + 1);
        this.snackbar.open('Falha ao remover. Tente novamente.', undefined, { duration: 2200 });
      },
    });
  }
}
