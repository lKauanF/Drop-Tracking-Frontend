// Serviços de Registros (histórico dos pacientes)
// - Paginação padrão (page / page_size)
// - Filtros: nome, prontuario, id_bomba, data_de, data_ate (ISO)
// - Ajuste os endpoints para o seu backend

import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, catchError, of } from 'rxjs';

export type NivelAlarme = 'baixo' | 'alto';

export interface Registro {
  id: string;                // id do registro (ou ID da linha)
  nome: string;              // nome do paciente
  prontuario: string;
  leito: string;
  alarme: NivelAlarme;       // 'baixo' | 'alto'
  hora_alarme?: string;      // ex.: '14:05'
  bomba_id: string;          // ex.: 'Bomba 1'
  infusao_taxa?: string;     // ex.: '150 g/min' ou '55 mL/h'
  data_hora: string;         // ISO: '2025-03-20T14:05:00Z'
}

export interface Paginacao<T> {
  count: number;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class RegistrosService {
  private api = inject(ApiService);

  // 👉 troque pelos seus endpoints reais
  private ENDPOINT_LISTAR = '/registros/';

  listar(params: {
    pagina?: number;
    tamanho?: number;
    nome?: string;
    prontuario?: string;
    id_bomba?: string;
    data_de?: string;   // ISO (yyyy-mm-dd)
    data_ate?: string;  // ISO (yyyy-mm-dd)
  }): Observable<Paginacao<Registro>> {
    const query = {
      page: String(params.pagina ?? 1),
      page_size: String(params.tamanho ?? 10),
      nome: params.nome ?? '',
      prontuario: params.prontuario ?? '',
      id_bomba: params.id_bomba ?? '',
      data_de: params.data_de ?? '',
      data_ate: params.data_ate ?? '',
    };
    return this.api.get<Paginacao<Registro>>(this.ENDPOINT_LISTAR, query)
      .pipe(catchError(() => of({ count: 0, results: [] })));
  }
}
