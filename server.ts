import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory webhook log storage for QA testing
const webhookLogs: Array<{
  id: string;
  receivedAt: string;
  topic?: string;
  type?: string;
  action?: string;
  dataId?: string;
  payload: Record<string, unknown>;
}> = [];

// Dynamic helper to get active Mercado Pago client
function getMpConfig(): { client: MercadoPagoConfig | null; token: string | undefined; isSandbox: boolean } {
  dotenv.config();
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token || token.includes('TEST-0000000000000000')) {
    return { client: null, token, isSandbox: true };
  }
  const isSandbox = token.startsWith('TEST-');
  try {
    const client = new MercadoPagoConfig({
      accessToken: token,
      options: { timeout: 15000 },
    });
    return { client, token, isSandbox };
  } catch (err) {
    console.error('[Mercado Pago] Erro ao criar configuração do client:', err);
    return { client: null, token, isSandbox };
  }
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Status do Ambiente do Mercado Pago
app.get('/api/mercadopago/status', (req: Request, res: Response) => {
  const { client, token, isSandbox } = getMpConfig();
  const hasToken = Boolean(client && token);
  const maskedToken = token && hasToken
    ? `${token.substring(0, 11)}••••••••••••••••${token.slice(-4)}`
    : 'Não configurado (Usando Emulador Sandbox Local)';

  res.json({
    configured: hasToken,
    environment: isSandbox ? 'SANDBOX (Homologação)' : 'PRODUÇÃO (Conta Real)',
    isSandbox,
    maskedToken,
    webhookUrl: `${process.env.APP_URL || `http://localhost:${PORT}`}/api/mercadopago/webhook`,
    officialDocumentation: 'https://www.mercadopago.com.br/developers/pt/reference',
  });
});

// 2. Criar Preferência de Pagamento (Checkout Pro)
app.post('/api/mercadopago/create-preference', async (req: Request, res: Response) => {
  try {
    const { title, price, quantity = 1, payerEmail = 'test_payer_qa@testuser.com' } = req.body;

    const itemPrice = Number(price) || 49.9;
    const itemTitle = String(title || 'Plano de Assinatura QA Lab');

    const { client: mpClient } = getMpConfig();

    if (mpClient) {
      const preference = new Preference(mpClient);
      const response = await preference.create({
        body: {
          items: [
            {
              id: 'item-qa-' + Date.now(),
              title: itemTitle,
              unit_price: itemPrice,
              quantity: Number(quantity) || 1,
              currency_id: 'BRL',
            },
          ],
          payer: {
            email: payerEmail,
          },
          back_urls: {
            success: `${process.env.APP_URL || `http://localhost:${PORT}`}/?payment_status=success`,
            failure: `${process.env.APP_URL || `http://localhost:${PORT}`}/?payment_status=failure`,
            pending: `${process.env.APP_URL || `http://localhost:${PORT}`}/?payment_status=pending`,
          },
          auto_return: 'approved',
        },
      });

      return res.json({
        mode: 'LIVE_MERCADOPAGO_API',
        preferenceId: response.id,
        initPoint: response.init_point,
        sandboxInitPoint: response.sandbox_init_point,
        details: response,
      });
    }

    // Modo Sandbox Simulado
    const mockPrefId = `pref_mock_${Date.now()}_sandbox`;
    return res.json({
      mode: 'LOCAL_SANDBOX_SIMULATOR',
      preferenceId: mockPrefId,
      initPoint: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${mockPrefId}`,
      sandboxInitPoint: `https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=${mockPrefId}`,
      message: 'Preferência gerada no simulador sandbox. Para conectar à sua conta oficial do Mercado Pago, informe MERCADO_PAGO_ACCESS_TOKEN no .env.',
      items: [
        {
          title: itemTitle,
          quantity,
          unit_price: itemPrice,
          currency_id: 'BRL',
        },
      ],
    });
  } catch (error: any) {
    console.error('[Mercado Pago] Erro ao criar preferência:', error);
    res.status(500).json({
      error: 'Falha ao gerar preferência no Mercado Pago',
      details: error?.message || error,
    });
  }
});

// 3. Processar Pagamento Transparente (Checkout Transparente)
app.post('/api/mercadopago/process-payment', async (req: Request, res: Response) => {
  try {
    const {
      token,
      transactionAmount,
      description = 'Pagamento de Teste QA',
      installments = 1,
      paymentMethodId = 'visa',
      payerEmail = 'qa_customer@test.com',
      cardLast4 = '4242',
    } = req.body;

    const { client: mpClient } = getMpConfig();

    if (mpClient) {
      const payment = new Payment(mpClient);

      // Se for Pix
      if (paymentMethodId === 'pix') {
        const paymentData = await payment.create({
          body: {
            transaction_amount: Number(transactionAmount) || 10,
            description,
            payment_method_id: 'pix',
            payer: {
              email: payerEmail,
              first_name: 'Comprador',
              last_name: 'Teste',
            },
          },
        });

        const pointOfInteraction = paymentData.point_of_interaction?.transaction_data;

        return res.json({
          mode: 'LIVE_MERCADOPAGO_API',
          paymentId: paymentData.id,
          status: paymentData.status,
          statusDetail: paymentData.status_detail,
          amount: paymentData.transaction_amount,
          paymentMethodId: 'pix',
          qrCode: pointOfInteraction?.qr_code,
          qrCodeBase64: pointOfInteraction?.qr_code_base64,
          ticketUrl: pointOfInteraction?.ticket_url,
          rawResponse: paymentData,
        });
      }

      // Se for Cartão com token
      if (token) {
        const paymentData = await payment.create({
          body: {
            transaction_amount: Number(transactionAmount) || 100,
            token,
            description,
            installments: Number(installments) || 1,
            payment_method_id: paymentMethodId,
            payer: {
              email: payerEmail,
            },
          },
        });

        return res.json({
          mode: 'LIVE_MERCADOPAGO_API',
          paymentId: paymentData.id,
          status: paymentData.status,
          statusDetail: paymentData.status_detail,
          amount: paymentData.transaction_amount,
          rawResponse: paymentData,
        });
      }
    }

    // Resposta Simulada baseada no valor ou cartão
    let status = 'approved';
    let statusDetail = 'accredited';
    const amountNum = Number(transactionAmount) || 100;

    if (cardLast4 === '9995') {
      status = 'rejected';
      statusDetail = 'cc_rejected_insufficient_amount';
    } else if (cardLast4 === '0069') {
      status = 'rejected';
      statusDetail = 'cc_rejected_bad_filled_date';
    } else if (cardLast4 === '0082') {
      status = 'rejected';
      statusDetail = 'cc_rejected_high_risk';
    }

    const mockPaymentResponse = {
      mode: 'LOCAL_SANDBOX_SIMULATOR',
      paymentId: Math.floor(1000000000 + Math.random() * 9000000000),
      status,
      statusDetail,
      amount: amountNum,
      currency: 'BRL',
      paymentMethodId,
      installments,
      payerEmail,
      dateApproved: status === 'approved' ? new Date().toISOString() : null,
      message:
        status === 'approved'
          ? 'Pagamento simulado aprovado com sucesso no Sandbox.'
          : `Pagamento simulado rejeitado (${statusDetail}).`,
    };

    return res.json(mockPaymentResponse);
  } catch (error: any) {
    console.error('[Mercado Pago] Erro ao processar pagamento:', error);
    res.status(500).json({
      error: 'Erro no processamento de pagamento do Mercado Pago',
      details: error?.message || error,
    });
  }
});

// 4. Endpoint Webhook IPN Oficial do Mercado Pago
app.post('/api/mercadopago/webhook', (req: Request, res: Response) => {
  const payload = req.body || {};
  const query = req.query || {};

  const eventLog = {
    id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    receivedAt: new Date().toLocaleTimeString('pt-BR'),
    topic: (query.topic as string) || payload.type || payload.action || 'payment',
    type: payload.type || (query.type as string) || 'payment',
    action: payload.action || 'payment.updated',
    dataId: payload?.data?.id || (query['data.id'] as string) || 'simulated_id',
    payload: { ...payload, queryParams: query },
  };

  webhookLogs.unshift(eventLog);
  if (webhookLogs.length > 30) webhookLogs.pop();

  console.log(`[Mercado Pago Webhook] Evento recebido: ${eventLog.topic} - ID: ${eventLog.dataId}`);
  // O Mercado Pago exige resposta HTTP 200/201 imediata
  res.status(200).send('OK');
});

// 5. Histórico de Webhooks recebidos para QA
app.get('/api/mercadopago/webhook-logs', (req: Request, res: Response) => {
  res.json(webhookLogs);
});

// ==========================================
// VITE CLIENT MOUNT
// ==========================================
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Payment QA Lab] Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
