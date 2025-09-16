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
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './registros.component.html',
  styleUrls: ['./registros.component.scss'],
})
export class RegistrosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(RegistrosService);

  // Estado
  carregando = signal(false);
  registros = signal<Registro[]>([]);
  total = signal(0);
  paginaAtual = signal(1);
  tamanhoPagina = 10;

  // Filtros
  filtros = this.fb.group({
    nome: [''],
    prontuario: [''],
    data_de: [null as Date | null],
    data_ate: [null as Date | null],
    id_bomba: [''],
  });

  // Paginação
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

  carregar(): void {
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
      next: (p) => {
        this.total.set(p.count);
        this.registros.set(p.results);
        this.carregando.set(false);
      },
      error: () => {
        this.total.set(0);
        this.registros.set([]);
        this.carregando.set(false);
      }
    });
  }

  /** Botão de atualizar (com animação no ícone) */
  refresh(): void {
    if (this.carregando()) return;
    this.carregar();
  }

  irPara(pagina: number): void {
    const alvo = Math.max(1, Math.min(this.paginas().length, pagina));
    if (alvo === this.paginaAtual()) return;
    this.paginaAtual.set(alvo);
    this.carregar();
  }

  limparFiltros(): void {
    this.filtros.reset({
      nome: '',
      prontuario: '',
      data_de: null,
      data_ate: null,
      id_bomba: '',
    });
  }

  exportarCsv(): void {
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
    const conteudo = linhas
      .map(l => l.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registros_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  imprimir(): void {
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

  /** Resumo textual dos filtros (usado no PDF) */
  private descricaoFiltros(): string {
    const v = this.filtros.getRawValue();
    const d = (x?: Date | null) => x ? x.toLocaleDateString('pt-BR') : '—';
    const partes = [
      v.nome ? `Nome: ${v.nome}` : null,
      v.prontuario ? `Prontuário: ${v.prontuario}` : null,
      (v.data_de || v.data_ate) ? `Período: ${d(v.data_de)} a ${d(v.data_ate)}` : null,
      v.id_bomba ? `ID: ${v.id_bomba}` : null,
    ].filter(Boolean);
    return partes.length ? partes.join(' · ') : 'Sem filtros aplicados';
  }

  /** Gera PDF com logo, descrição e rodapé (print-to-PDF) */
  gerarPdf(): void {
    const now = new Date();
    const titulo = 'Registros';
    const descricao = this.descricaoFiltros();
    const logo = `${location.origin}/assets/Logo.svg`;

    const cab = ['Prontuário','Nome','Infusão','Leito','Alarme','Hora do Alarme','ID','Data e Hora'];
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

    const styles = `
      <style>
        * { box-sizing: border-box; }
        body { font-family: Inter, Arial, sans-serif; color:#0f2a2e; }
        header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:12px; }
        header .left { display:flex; align-items:center; gap:16px; }
        header img { height:40px; }
        h1 { margin:0; font-size:18px; }
        .desc { color:#6b7a80; font-size:12px; margin-top:2px; }
        .meta { font-size:12px; color:#6b7a80; text-align:right; }
        table { width:100%; border-collapse: collapse; }
        thead th {
          background:#f3f6f6; text-align:left; font-weight:600; font-size:12px;
          border-bottom:1px solid #e3e8ea; padding:8px;
        }
        tbody td { font-size:12px; padding:8px; border-bottom:1px solid #eef2f4; }
        tbody tr:nth-child(odd) td { background:#fbfdfc; }
        footer { margin-top:12px; font-size:11px; color:#6b7a80; display:flex; justify-content:space-between; }
        @page { margin:20mm; }
        @media print { .no-print { display:none !important; } }
      </style>
    `;

    const html = `
      <html>
        <head><meta charset="utf-8">${styles}<title>${titulo}</title></head>
        <body>
          <header>
            <div class="left">
              <img src="${logo}" alt="Logo">
              <div>
                <h1>${titulo}</h1>
                <div class="desc">${descricao}</div>
              </div>
            </div>
            <div class="meta">
              <div>Gerado em: ${now.toLocaleString('pt-BR')}</div>
              <div>Total: ${this.total()}</div>
            </div>
          </header>

          <table>
            <thead><tr>${cab.map(c => `<th>${c}</th>`).join('')}</tr></thead>
            <tbody>${linhas || `<tr><td colspan="8">Nenhum resultado.</td></tr>`}</tbody>
          </table>

          <footer>
            <span>Drop Tracking</span>
            <span class="no-print">Use “Salvar como PDF” na caixa de impressão</span>
            <span>${now.getFullYear()}</span>
          </footer>
        </body>
      </html>
    `;

    const w = window.open('', '_blank', 'width=1200,height=800');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
    // w.close(); // deixe o usuário decidir fechar
  }
}
