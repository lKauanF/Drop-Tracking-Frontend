import crypto from 'crypto';

const secret = process.env.REPLYTO_SECRET!;

export function assinar(payload: string){
  const h = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${h}`;
}

export function verificar(assinado: string){
  const [payload, h] = assinado.split('.');
  const hv = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  if (!h || hv !== h) return null;
  return payload;
}
