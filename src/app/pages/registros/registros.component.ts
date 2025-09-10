import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RegistrosService, Registro } from '../../core/services/registros.service';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { RouterLink } from '@angular/router';

function dataISO(d?: Date | null): string {
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

@Component({
  selector: 'app-registros',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    LogoComponent,
  ],
  templateUrl: './registros.component.html',
  styleUrls: ['./registros.component.scss'],
})
export class RegistrosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(RegistrosService);

  carregando = signal(false);
  registros = signal<Registro[]>([]);
  total = signal(0);
  paginaAtual = signal(1);
  tamanhoPagina = 10;

  filtros = this.fb.group({
    nome: [''],
    prontuario: [''],
    data_de: [null as Date | null],
    data_ate: [null as Date | null],
    id_bomba: [''],
  });

  paginas = computed(() => {
    const pages = Math.max(1, Math.ceil(this.total() / this.tamanhoPagina));
    return Array.from({ length: pages }, (_, i) => i + 1);
  });

  ngOnInit(): void {
    this.carregar();
    this.filtros.valueChanges.subscribe(() => {
      this.paginaAtual.set(1);
      this.carregar();
    });
  }

  carregar() {
    this.carregando.set(true);
    const v = this.filtros.getRawValue();
    this.service.listar({
      pagina: this.paginaAtual(),
      tamanho: this.tamanhoPagina,
      nome: v.nome ?? '',
      prontuario: v.prontuario ?? '',
      id_bomba: v.id_bomba ?? '',
      data_de: dataISO(v.data_de),
      data_ate: dataISO(v.data_ate),
    }).subscribe({
      next: (p) => { this.total.set(p.count); this.registros.set(p.results); this.carregando.set(false); },
      error: () => { this.total.set(0); this.registros.set([]); this.carregando.set(false); }
    });
  }

  irPara(pagina: number) {
    const alvo = Math.max(1, Math.min(this.paginas().length, pagina));
    if (alvo === this.paginaAtual()) return;
    this.paginaAtual.set(alvo);
    this.carregar();
  }

  limparFiltros() {
    this.filtros.reset({
      nome: '',
      prontuario: '',
      data_de: null,
      data_ate: null,
      id_bomba: '',
    });
  }

  exportarCsv() {
    const linhas = [
      ['Prontuário', 'Nome', 'Infusão', 'Leito', 'Alarme', 'Hora de Alarme', 'ID', 'Data e Hora'],
      ...this.registros().map(r => [
        r.prontuario,
        r.nome,
        r.infusao_taxa ?? '',
        r.leito,
        r.alarme === 'alto' ? 'Alto' : 'Baixo',
        r.hora_alarme ?? '',
        r.bomba_id,
        new Date(r.data_hora).toLocaleString('pt-BR'),
      ])
    ];
    const conteudo = linhas.map(l => l.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `registros_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  imprimir() {
    // Abre uma janela mínima com o HTML da tabela para impressão
    const estilo = `
      <style>
        body { font-family: Arial, sans-serif; padding: 16px; }
        h3 { margin: 0 0 12px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; }
        th { background: #f3f4f6; text-align: left; }
      </style>
    `;
    const cab = ['Prontuário','Nome','Infusão','Leito','Alarme','Hora de Alarme','ID','Data e Hora'];
    const linhas = this.registros().map(r => `
      <tr>
        <td>${r.prontuario}</td>
        <td>${r.nome}</td>
        <td>${r.infusao_taxa ?? ''}</td>
        <td>${r.leito}</td>
        <td>${r.alarme === 'alto' ? 'Alto' : 'Baixo'}</td>
        <td>${r.hora_alarme ?? ''}</td>
        <td>${r.bomba_id}</td>
        <td>${new Date(r.data_hora).toLocaleString('pt-BR')}</td>
      </tr>
    `).join('');

    const win = window.open('', '_blank', 'width=1024,height=768');
    if (!win) return;
    win.document.write(`
      <html><head><title>Registros</title>${estilo}</head>
      <body>
        <h3>Registros</h3>
        <table>
          <thead><tr>${cab.map(c => `<th>${c}</th>`).join('')}</tr></thead>
          <tbody>${linhas}</tbody>
        </table>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  }
}
