// core/services/pacientes.service.ts  (dev/mock)
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Tipos
export type SituacaoInfusao = 'em_andamento' | 'pausada';
export type Alerta           = 'normal' | 'alto' | 'oclusao';

export interface Paciente {
  id: string;
  nome: string;
  prontuario: string;
  leito: string;
  situacao: SituacaoInfusao;
  alerta: Alerta;
  infusao_taxa?: number | null;
  bomba_id?: string;
}

@Injectable({ providedIn: 'root' })
export class PacientesService {
  private store = new BehaviorSubject<Paciente[]>([]);
  private seq = 1;

  /** Lista paginada com filtros simples (mock) */
  listar(params: {
    pagina: number;
    tamanho: number;
    busca?: string;
    situacao?: '' | SituacaoInfusao;
  }): Observable<{ count: number; results: Paciente[] }> {
    const { pagina, tamanho, busca = '', situacao = '' } = params;

    const q = busca.trim().toLowerCase();
    const all = this.store.value
      .filter(p => !situacao || p.situacao === situacao)
      .filter(p =>
        !q ||
        p.nome.toLowerCase().includes(q) ||
        p.prontuario.toLowerCase().includes(q) ||
        p.leito.toLowerCase().includes(q)
      );

    const count  = all.length;
    const start  = (pagina - 1) * tamanho;
    const results = all.slice(start, start + tamanho);

    return of({ count, results }).pipe(delay(120));
  }

  /** Cria e devolve o paciente criado (mock) */
  criar(data: Omit<Paciente, 'id'>): Observable<Paciente> {
    const novo: Paciente = { id: String(this.seq++), ...data };
    this.store.next([novo, ...this.store.value]);
    return of(novo).pipe(delay(120));
  }

  /** Remove por id (mock) */
  remover(id: number | string): Observable<void> {
    const alvo = String(id);
    this.store.next(this.store.value.filter(p => p.id !== alvo));
    return of(void 0).pipe(delay(120));
  }

  // --- Caso queira usar API depois, descomente e ajuste: ---
  // private http = inject(HttpClient);
  // private API  = '/api';
  // remover(id: number | string): Observable<void> {
  //   return this.http.delete<void>(`${this.API}/pacientes/${id}/`);
  // }

  /** Preenche alguns exemplos para visualizar os cards */
  seed(n = 8) {
    if (this.store.value.length) return;

    const nomes   = ['Junior Yushi','Carlos Lima','Ana Costa','Maria Souza','Renan Almeida','Josyane Campos','Natan Lima','Gustavo Monteiro'];
    const alertas: Alerta[] = ['normal','alto','oclusao'];
    const sit: SituacaoInfusao[] = ['em_andamento','pausada'];
    const taxas = [55, 140, 45, 190, 160];

    const lista: Paciente[] = [];
    for (let i = 0; i < n; i++) {
      lista.push({
        id: String(this.seq++),
        nome: nomes[i % nomes.length],
        prontuario: (3000 + i).toString(),
        leito: (i % 20 + 1).toString().padStart(2, '0'),
        alerta: alertas[i % alertas.length],
        situacao: sit[i % sit.length],
        infusao_taxa: taxas[i % taxas.length],
        bomba_id: `Bomba ${i % 6 + 1}`,
      });
    }
    this.store.next(lista);
  }
}
