import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder } from '@angular/forms';
import { IaEstatisticasService, PacoteEstatisticasIA } from '../../core/services/ia-estatisticas.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-estatisticas-ia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './estatisticas-ia.component.html',
  styleUrls: ['./estatisticas-ia.component.scss'],
})
export class EstatisticasIaComponent implements OnInit, OnDestroy {
  // Form com valores non-nullable para o getRawValue tipado
  private fb = inject(NonNullableFormBuilder);
  // Service correto (antes estava injetando NonNullableFormBuilder aqui por engano)
  private svc = inject(IaEstatisticasService);

  // Estado
  carregando = signal(false);
  pacote = signal<PacoteEstatisticasIA | null>(null);

  // Filtros (tudo string não-nulo)
  filtros = this.fb.group({
    data_de:   [''],
    data_ate:  [''],
    prontuario:[''],
    id_bomba:  [''],
  });

  // Instâncias dos gráficos para destruir ao atualizar
  charts: Chart[] = [];

  ngOnInit(): void {
    this.gerar();
  }

  ngOnDestroy(): void {
    // limpeza dos charts ao destruir o componente
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  /** Chama o backend/IA para gerar o pacote e depois renderiza os gráficos */
  gerar(): void {
    this.carregando.set(true);
    const filtros = this.filtros.getRawValue(); // já vem tipado certinho

    this.svc.gerar(filtros).subscribe({
      next: (p) => {
        this.pacote.set(p);
        this.carregando.set(false);
        // aguarda o DOM pintar os canvases do template
        setTimeout(() => this.renderizarGraficos(), 0);
      },
      error: () => this.carregando.set(false),
    });
  }

  /** Renderiza os gráficos do pacote atual */
  private renderizarGraficos(): void {
    // destrói instâncias antigas
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    const ia = this.pacote()?.ia;
    if (!ia) return;

    ia.graficos.forEach((g, idx) => {
      const canvas = document.getElementById(`graf-${idx}`) as HTMLCanvasElement | null;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const chart = new Chart(ctx, {
        type: g.type as any,
        data: g.data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          ...g.options,
        },
      });

      this.charts.push(chart);
    });
  }
}
