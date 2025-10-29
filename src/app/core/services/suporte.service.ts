import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type TicketStatus = 'aberto' | 'em_atendimento' | 'resolvido';

export interface Ticket {
  id: string;
  assunto: string;
  descricao: string;
  status: TicketStatus;
  criadoEm: string;          // ISO
  atualizadoEm: string;      // ISO
  mensagens?: TicketMensagem[];
}

export interface TicketMensagem {
  id: string;
  ticketId: string;
  autor: 'usuario' | 'suporte' | 'sistema';
  texto: string;
  criadoEm: string;          // ISO
  anexos?: { nome: string; url: string }[];
}

@Injectable({ providedIn: 'root' })
export class SuporteService {
  private http = inject(HttpClient);
  private api = '/api/suporte'; // ajuste conforme seu proxy/host

  listarMeus(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.api}/meus`);
  }

  detalhes(ticketId: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.api}/tickets/${ticketId}`);
  }

  criar(descricao: string, arquivo?: File): Observable<Ticket> {
    const form = new FormData();
    form.append('descricao', descricao);
    if (arquivo) form.append('anexo', arquivo, arquivo.name);
    return this.http.post<Ticket>(`${this.api}/tickets`, form);
  }

  // Stream de atualizações do usuário (todos os tickets dele)
  conectarStream(): EventSource {
    // Endpoint SSE protegido por sessão/cookie/JWT no seu backend
    const es = new EventSource(`${this.api}/stream`);
    return es;
  }
}
