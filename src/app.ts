import express from 'express';
import cors from 'cors';
import { suporteRouter } from './routes/suporte.routes';
import { webhookRouter } from './routes/webhook.routes';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/suporte', suporteRouter);
app.use('/webhooks', webhookRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API on http://localhost:${port}`));
