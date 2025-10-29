import { gerarId } from '../lib/id';

export type Status = 'aberto' | 'em_atendimento' | 'resolvido';

export interface TicketMensagem {
  id: string;
  ticketId: string;
  autor: 'usuario' | 'suporte' | 'sistema';
  texto: string;
  criadoEm: string;
  anexos?: { nome: string; url: string }[];
}

export interface Ticket {
  id: string;
  userId: string;         // quem abriu
  assunto: string;
  descricao: string;
  status: Status;
  criadoEm: string;
  atualizadoEm: string;
  mensagens: TicketMensagem[];
  threadMessageId?: string;  // para References
  replyToken?: string;       // token assinado para reply-to
}

const tickets = new Map<string, Ticket>();

export function criarTicket(userId: string, descricao: string, anexos?: {nome:string; url:string}[]): Ticket {
  const id = gerarId();
  const t: Ticket = {
    id, userId,
    assunto: `[#${id}] Suporte - Novo pedido`,
    descricao,
    status: 'aberto',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    mensagens: [{
      id: gerarId(),
      ticketId: id,
      autor: 'usuario',
      texto: descricao,
      criadoEm: new Date().toISOString(),
      anexos
    }],
  };
  tickets.set(id, t);
  return t;
}

export function byUser(userId: string): Ticket[] {
  return Array.from(tickets.values())
    .filter(t => t.userId === userId)
    .sort((a,b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
}

export function obterTicket(id: string) {
  return tickets.get(id) || null;
}

export function adicionarMensagem(ticketId: string, autor: TicketMensagem['autor'], texto: string, anexos?: TicketMensagem['anexos']) {
  const t = tickets.get(ticketId);
  if (!t) return null;
  t.mensagens.push({
    id: gerarId(),
    ticketId,
    autor,
    texto,
    criadoEm: new Date().toISOString(),
    anexos
  });
  t.atualizadoEm = new Date().toISOString();
  if (autor === 'suporte' && t.status === 'aberto') t.status = 'em_atendimento';
  tickets.set(ticketId, t);
  return t;
}

export function resolver(ticketId: string){
  const t = tickets.get(ticketId);
  if (!t) return null;
  t.status = 'resolvido';
  t.atualizadoEm = new Date().toISOString();
  tickets.set(ticketId, t);
  return t;
}
