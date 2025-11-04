import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type GraficoChartJS = {
  type: 'bar'|'line'|'doughnut';
  data: any;
  options?: any;
};

export type PacoteEstatisticasIA = {
  filtros: { data_de: string; data_ate: string; prontuario: string; id_bomba: string; };
  estatisticas: {
    total: number;
    alarme_por_tipo: Record<string, number>;
    media_infusao: number | null;
    por_dia: { data: string; quantidade: number }[];
  };
  ia: { resumo: string; insights: string[]; graficos: GraficoChartJS[]; };
};

@Injectable({ providedIn: 'root' })
export class IaEstatisticasService {
  private http = inject(HttpClient);
  private base = '/api/ia/estatisticas/'; // ajuste se seu prefixo for diferente

  gerar(filtros: Partial<{data_de:string;data_ate:string;prontuario:string;id_bomba:string;}>) {
    return this.http.post<PacoteEstatisticasIA>(this.base, filtros || {});
  }
}
