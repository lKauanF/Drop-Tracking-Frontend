import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, catchError, of } from 'rxjs';

export type SituacaoInfusao = 'em_andamento' | 'pausada';
export type NivelAlerta = 'normal' | 'alto' | 'oclusao';

export interface Paciente {
  id: string;
  nome: string;
  prontuario: string;
  leito: string;
  bomba_id?: string;
  infusao_taxa?: string;
  situacao: SituacaoInfusao;
  alerta: NivelAlerta;
  atualizado_em?: string;
}

export interface Paginacao<T> {
  count: number;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class PacientesService {
  private api = inject(ApiService);

  private ENDPOINT_LISTAR = '/pacientes/';
  private ENDPOINT_CRIAR  = '/pacientes/';

  listar(params: {
    pagina?: number;
    tamanho?: number;
    busca?: string;
    situacao?: SituacaoInfusao | '';
  }): Observable<Paginacao<Paciente>> {
    const query = {
      page: String(params.pagina ?? 1),
      page_size: String(params.tamanho ?? 12),
      q: params.busca ?? '',
      situacao: params.situacao ?? '',
    };
    return this.api.get<Paginacao<Paciente>>(this.ENDPOINT_LISTAR, query)
      .pipe(catchError(() => of({ count: 0, results: [] })));
  }

  criar(dados: { nome: string; prontuario: string; leito: string; bomba_id?: string; }): Observable<Paciente> {
    return this.api.post<Paciente>(this.ENDPOINT_CRIAR, dados);
  }
}
