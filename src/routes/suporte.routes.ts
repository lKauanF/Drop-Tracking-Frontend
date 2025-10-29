import { Router } from 'express';
import multer from 'multer';
import { criarTicket, byUser, obterTicket } from '../services/ticket_service';
import { enviarEmail } from '../services/email_service';
import { assinar } from '../lib/segurança';
import { publicar, registrarSSE } from '../services/sse_hub';

const upload = multer({ storage: multer.memoryStorage() });
export const suporteRouter = Router();

// Middleware fake de auth (troque por JWT/sessão real)
function getUserId(req:any){ return req.headers['x-user-id'] as string || 'user_demo_1'; }

// SSE: atualizações do usuário
suporteRouter.get('/stream', (req, res) => {
  const userId = getUserId(req);
  registrarSSE(userId, res);
});

// Listar tickets do usuário
suporteRouter.get('/meus', (req, res) => {
  const userId = getUserId(req);
  return res.json(byUser(userId));
});

// Detalhes
suporteRouter.get('/tickets/:id', (req, res) => {
  const t = obterTicket(req.params.id);
  if (!t) return res.status(404).json({erro:'não encontrado'});
  const userId = getUserId(req);
  if (t.userId !== userId) return res.status(403).json({erro:'forbidden'});
  res.json(t);
});

// Criar ticket + enviar e-mail para equipe
suporteRouter.post('/tickets', upload.single('anexo'), async (req, res) => {
  const userId = getUserId(req);
  const descricao = (req.body.descricao || '').toString();
  if (descricao.trim().length < 10) return res.status(400).json({erro:'descrição muito curta'});

  // (Opcional) upload do anexo para storage público e salve a URL
  const anexosUrl = req.file ? [{ nome: req.file.originalname, url: `${process.env.FILES_BASE_URL}/${Date.now()}_${req.file.originalname}` }] : undefined;

  const ticket = criarTicket(userId, descricao, anexosUrl);

  // Gera token assinado que identifica o ticket com segurança
  const token = assinar(`t:${ticket.id}:u:${userId}`);
  ticket.replyToken = token;

  // Monta endereço reply-to com plus addressing: suporte+tck_<token>@dominio
  const replyTo = `suporte+tck_${token}@${process.env.SUPORTE_INBOUND_DOMAIN}`;

  // Envia e-mail para a fila de atendimento (múltiplos destinatários OK)
  const subject = ticket.assunto;
  const toEquipe = ['atendimento@seu-dominio.com']; // troque pela sua lista/alias

  const resp = await enviarEmail({
    to: toEquipe,
    subject,
    text: `Novo ticket do usuário ${userId}\n\nDescrição:\n${descricao}\n\nID: ${ticket.id}`,
    html: `<p><b>Novo ticket</b> do usuário ${userId}</p><p>${descricao.replace(/\n/g,'<br>')}</p><p><small>ID: ${ticket.id}</small></p>`,
    replyTo,
    attachments: req.file ? [{ filename: req.file.originalname, content: req.file.buffer }] : undefined,
  });

  // Guarda Message-Id do provedor para threading (se quiser)
  // ticket.threadMessageId = resp.messageId; // se suportado pelo transporte

  // Notifica o próprio usuário (SSE) que o ticket foi criado/atualizado
  publicar(userId, 'ticket_atualizado', ticket);

  res.status(201).json(ticket);
});
