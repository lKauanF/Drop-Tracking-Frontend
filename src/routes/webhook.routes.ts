import { Router } from 'express';
import multer from 'multer';
import { adicionarMensagem, obterTicket } from '../services/ticket_service';
import { verificar } from '../lib/segurança';
import { publicar } from '../services/sse_hub';

export const webhookRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

// SendGrid Inbound Parse envia multipart com campos padrão
// Docs: to, from, subject, text, html, attachments (files), headers, etc.
webhookRouter.post('/email-inbound', upload.any(), async (req, res) => {
  try {
    const to = (req.body.to || '').toString();          // ex.: "suporte+tck_<TOKEN>@dominio.com"
    const from = (req.body.from || '').toString();
    const subject = (req.body.subject || '').toString();
    const text = (req.body.text || '').toString();      // corpo em texto
    const html = (req.body.html || '').toString();

    // 1) Tente extrair token do +address
    //    suporta diversas variações de formatação do provedor
    const match = to.match(/suporte\+tck_([^@\s>]+)/i);
    let token = match?.[1];

    // 2) Alternativamente, tente extrair ID do assunto [#tck_xxx] ou [#<id>]
    let ticketId: string | null = null;
    const mAssunto = subject.match(/\[#(tck_[a-z0-9]+)\]/i) || subject.match(/\[#([a-z0-9_]+)\]/i);
    if (mAssunto) ticketId = mAssunto[1];

    // 3) Se veio token assinado, valide e extraia o ticketId e userId
    let userIdFromToken: string | null = null;
    if (token) {
      const payload = verificar(token);
      if (payload) {
        const parts = payload.split(':'); // t:<id>:u:<user>
        const iT = parts.indexOf('t');
        const iU = parts.indexOf('u');
        if (iT >= 0 && parts[iT+1]) ticketId = parts[iT+1];
        if (iU >= 0 && parts[iU+1]) userIdFromToken = parts[iU+1];
      } else {
        // token inválido: ignore (evita spoof)
        token = undefined;
      }
    }

    if (!ticketId) {
      // Sem forma de correlação, descarta com 202 (aceito mas ignorado)
      return res.status(202).json({ ok: true, ignore: 'sem-correlacao' });
    }

    const ticket = obterTicket(ticketId);
    if (!ticket) return res.status(202).json({ ok: true, ignore: 'ticket-inexistente' });

    // Monte anexos (se quiser, faça upload e gere URLs)
    const anexos = (req.files as Express.Multer.File[] || []).map(f => ({
      nome: f.originalname,
      url: `${process.env.FILES_BASE_URL}/${Date.now()}_${f.originalname}`
    }));

    // Preferir texto limpo
    const corpo = text?.trim() || html?.replace(/<[^>]+>/g,' ').trim() || '(sem conteúdo)';

    const atualizado = adicionarMensagem(ticketId, 'suporte', corpo, anexos);

    // (Opcional) regras: se corpo começar com "RESOLVER", feche o ticket
    // if (/^RESOLVER\b/i.test(corpo)) resolver(ticketId);

    // Notifique o usuário dono desse ticket via SSE:
    if (atualizado) publicar(ticket.userId, 'ticket_atualizado', atualizado);

    res.json({ ok: true });
  } catch (e) {
    console.error('Erro webhook inbound:', e);
    res.status(500).json({ ok: false });
  }
});
