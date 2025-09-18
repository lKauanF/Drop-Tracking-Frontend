import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export type TicketStatus = 'aberto' | 'em_atendimento' | 'resolvido';

export interface Ticket {
  id: string;
  assunto: string;           // opcionalmente preenche com primeira linha da descrição
  descricao: string;
  anexoUrl?: string;
  criadoEm: string;          // ISO
  status: TicketStatus;
}


@Injectable({ providedIn: 'root' })
export class SuporteService {
  private http = inject(HttpClient);
  private API = '/api/support';

  // mock local (troque por chamadas reais quando quiser)
  private mem = new BehaviorSubject<Ticket[]>([
    { id: '1001', assunto: 'Exemplo: dúvida de uso', descricao: 'Como exporto PDF?', status: 'resolvido', criadoEm: new Date(Date.now()-86400000*4).toISOString() },
    { id: '1002', assunto: 'Erro de acesso', descricao: 'Não consigo entrar', status: 'em_atendimento', criadoEm: new Date(Date.now()-86400000*2).toISOString() },
    { id: '1003', assunto: 'Bug na tela de pacientes', descricao: 'Filtro não aplica', status: 'aberto', criadoEm: new Date().toISOString() },
  ]);

  listarMeus(): Observable<Ticket[]> {
    // return this.http.get<Ticket[]>(`${this.API}/tickets/me`);
    return this.mem.asObservable().pipe(delay(120));
  }

  criar(descricao: string, file?: File): Observable<Ticket> {
    // Exemplo com upload (descomente quando tiver backend):
    // const form = new FormData();
    // form.append('descricao', descricao);
    // if (file) form.append('anexo', file);
    // return this.http.post<Ticket>(`${this.API}/tickets`, form);

    // Mock local
    const novo: Ticket = {
      id: String(Math.floor(1000 + Math.random()*9000)),
      assunto: (descricao.split('\n')[0] || 'Novo pedido').slice(0, 80),
      descricao,
      status: 'aberto',
      criadoEm: new Date().toISOString(),
      anexoUrl: file ? `mock://${file.name}` : undefined,
    };
    this.mem.next([novo, ...this.mem.value]);
    return of(novo).pipe(delay(200));
  }

  
}
