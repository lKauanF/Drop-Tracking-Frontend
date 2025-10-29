import { Response } from 'express';

type Cliente = { userId: string; res: Response };

const clientes: Cliente[] = [];

export function registrarSSE(userId: string, res: Response){
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.write(': ping\n\n');
  const cli = { userId, res };
  clientes.push(cli);
  res.on('close', () => {
    const i = clientes.indexOf(cli);
    if (i >= 0) clientes.splice(i,1);
  });
}

export function publicar(userId: string, event: string, data: any){
  const linha = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clientes.filter(c => c.userId === userId).forEach(c => c.res.write(linha));
}
