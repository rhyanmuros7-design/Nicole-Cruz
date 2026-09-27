import React, { useState, useEffect } from 'react';
import { ShoppingBag, Key, CheckCircle, AlertTriangle, ArrowRight, RefreshCw, Send, ShieldCheck, ExternalLink, Copy, Check } from 'lucide-react';

interface MercadoPagoStatus {
  configured: boolean;
  environment: string;
  isSandbox: boolean;
  maskedToken: string;
  webhookUrl: string;
  officialDocumentation: string;
}

export const MercadoPagoLab: React.FC = () => {
  const [status, setStatus] = useState<MercadoPagoStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  
  // Checkout Pro Preference state
  const [productTitle, setProductTitle] = useState<string>('Licença de Software QA Lab');
  const [productPrice, setProductPrice] = useState<number>(89.90);
  const [payerEmail, setPayerEmail] = useState<string>('qa_tester_comprador@sandbox.com');
  const [creatingPref, setCreatingPref] = useState<boolean>(false);
  const [prefResult, setPrefResult] = useState<any>(null);

  // Transparent Payment state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('pix');
  const [paymentAmount, setPaymentAmount] = useState<number>(5.00);
  const [paymentCardLast4, setPaymentCardLast4] = useState<string>('4242');
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [copiedPix, setCopiedPix] = useState<boolean>(false);

  // Webhooks state
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loadingWebhooks, setLoadingWebhooks] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const fetchStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await fetch('/api/mercadopago/status');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Erro ao buscar status do Mercado Pago:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchWebhooks = async () => {
    try {
      setLoadingWebhooks(true);
      const res = await fetch('/api/mercadopago/webhook-logs');
      const data = await res.json();
      setWebhooks(data);
    } catch (err) {
      console.error('Erro ao buscar logs de webhook:', err);
    } finally {
      setLoadingWebhooks(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchWebhooks();
  }, []);

  const handleCreatePreference = async () => {
    try {
      setCreatingPref(true);
      setPrefResult(null);
      const res = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: productTitle,
          price: productPrice,
          payerEmail,
        }),
      });
      const data = await res.json();
      setPrefResult(data);
    } catch (err: any) {
      setPrefResult({ error: err?.message || 'Falha na requisição' });
    } finally {
      setCreatingPref(false);
    }
  };

  const handleProcessPayment = async () => {
    try {
      setProcessingPayment(true);
      setPaymentResult(null);
      const res = await fetch('/api/mercadopago/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionAmount: paymentAmount,
          description: productTitle,
          paymentMethodId: paymentMethod,
          payerEmail,
          cardLast4: paymentCardLast4,
        }),
      });
      const data = await res.json();
      setPaymentResult(data);
    } catch (err: any) {
      setPaymentResult({ error: err?.message || 'Falha no processamento' });
    } finally {
      setProcessingPayment(false);
    }
  };

  const copyWebhookUrl = () => {
    if (!status?.webhookUrl) return;
    navigator.clipboard.writeText(status.webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Header and Status Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Mercado Pago Developers // Laboratório de Integração</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Checkout oficial em ambiente Sandbox com suporte a Preferências e Pagamentos Transparentes
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchStatus}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              title="Recarregar Status da API"
            >
              <RefreshCw className={`w-4 h-4 ${loadingStatus ? 'animate-spin' : ''}`} />
            </button>
            <a
              href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/landing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-xs text-sky-400 bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>Documentação Oficial</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Credentials Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>ACCESS TOKEN NO SERVIDOR</span>
            </div>
            <div className="text-sm font-bold text-white truncate">
              {status?.maskedToken || 'Carregando...'}
            </div>
            <span className="text-[10px] text-slate-500 block">
              {status?.configured
                ? 'Conectado ao Backend Node.js / Express'
                : 'Defina MERCADO_PAGO_ACCESS_TOKEN no .env para ativar a API ao vivo'}
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>AMBIENTE ATIVO</span>
            </div>
            <div className="text-sm font-bold text-emerald-400">
              {status?.environment || 'SANDBOX'}
            </div>
            <span className="text-[10px] text-slate-500 block">
              Credencial prefixo TEST-... para testes sem cobrança real
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>URL DO WEBHOOK IPN</span>
              <button
                onClick={copyWebhookUrl}
                className="text-sky-400 hover:text-sky-300 flex items-center space-x-1 cursor-pointer"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUrl ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <div className="text-xs font-mono text-slate-300 truncate">
              {status?.webhookUrl || '/api/mercadopago/webhook'}
            </div>
            <span className="text-[10px] text-slate-500 block">
              Recebe eventos HTTP POST automáticos de transações
            </span>
          </div>
        </div>

        {/* Instructions on how to configure token */}
        {!status?.configured && (
          <div className="bg-sky-950/30 border border-sky-800/60 rounded-xl p-4 flex items-start space-x-3 text-xs text-sky-200">
            <div className="p-1 rounded bg-sky-900/50 text-sky-400 shrink-0 mt-0.5">
              <Key className="w-4 h-4" />
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-sky-100 block">
                Como conectar seu Access Token oficial do Mercado Pago:
              </span>
              <p className="text-[11px] text-sky-300/90 leading-relaxed">
                1. Acesse o painel de desenvolvedores: <strong>mercadopago.com.br/developers/panel</strong><br />
                2. Crie uma aplicação de teste ou selecione uma existente.<br />
                3. Copie o <strong>Access Token de Teste (inicia com TEST-...)</strong>.<br />
                4. Insira a variável no arquivo <code>.env</code> do servidor: <code>MERCADO_PAGO_ACCESS_TOKEN="TEST-..."</code>.<br />
                Enquanto não configurado, o laboratório responderá no modo <em>Emulador Sandbox Local</em> para você testar todas as rotas e respostas.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Two Columns: Checkout Pro & Checkout Transparente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Module 1: Checkout Pro (Preference) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>1. Teste de Checkout Pro (Preferência de Pagamento)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Gera uma preferência com itens, comprador e URLs de retorno para redirecionar ao gateway.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Título do Produto / Serviço:</label>
              <input
                type="text"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1">Valor Unitário (BRL):</label>
                <input
                  type="number"
                  step="0.10"
                  value={productPrice}
                  onChange={(e) => setProductPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-emerald-400 font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">E-mail do Pagador (QA):</label>
                <input
                  type="email"
                  value={payerEmail}
                  onChange={(e) => setPayerEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-slate-300 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleCreatePreference}
              disabled={creatingPref}
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer disabled:opacity-50 mt-2"
            >
              {creatingPref ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Criando Preferência...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Criar Preferência de Pagamento</span>
                </>
              )}
            </button>
          </div>

          {/* Preference Output */}
          {prefResult && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px]">ID DA PREFERÊNCIA:</span>
                <span className="text-sky-400 font-bold">{prefResult.preferenceId}</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Modo: <span className="text-emerald-400 font-semibold">{prefResult.mode}</span>
              </div>

              {(prefResult.initPoint || prefResult.sandboxInitPoint) && (
                <div className="pt-1">
                  <a
                    href={status?.isSandbox ? prefResult.sandboxInitPoint || prefResult.initPoint : prefResult.initPoint}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-semibold py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <span>Abrir Tela Oficial de Checkout do Mercado Pago</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <pre className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-300 max-h-36 overflow-y-auto">
                {JSON.stringify(prefResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Module 2: Transparent Payment / Direct API */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>2. Teste de Pagamento Transparente (/v1/payments)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Gere cobranças via Pix Oficial ou simule autorização de cartão na API do Mercado Pago.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Payment Method Selector */}
            <div className="flex space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  paymentMethod === 'pix'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pix Oficial (QR Code & Copia e Cola)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Cartão de Crédito
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1">Valor da Cobrança (BRL):</label>
                <input
                  type="number"
                  step="0.50"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-emerald-400 font-bold outline-none"
                />
              </div>

              {paymentMethod === 'card' ? (
                <div>
                  <label className="text-slate-300 block mb-1">Final do Cartão:</label>
                  <select
                    value={paymentCardLast4}
                    onChange={(e) => setPaymentCardLast4(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="4242">•••• 4242 (Aprovação Imediata)</option>
                    <option value="9995">•••• 9995 (Recusa: Saldo)</option>
                    <option value="0069">•••• 0069 (Recusa: Data Expirada)</option>
                    <option value="0082">•••• 0082 (Recusa: Alto Risco)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-slate-300 block mb-1">Método de Liquidação:</label>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-semibold">
                    PIX (Banco Central / MP)
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-slate-300 block mb-1">E-mail do Pagador:</label>
              <input
                type="email"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-slate-300 outline-none"
              />
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={processingPayment}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer disabled:opacity-50 mt-2"
            >
              {processingPayment ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processando no Mercado Pago...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Gerar Cobrança de Teste</span>
                </>
              )}
            </button>
          </div>

          {/* Payment Output */}
          {paymentResult && (
            <div
              className={`p-4 rounded-xl border space-y-3 text-xs ${
                paymentResult.status === 'approved' || paymentResult.status === 'pending'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>STATUS: {paymentResult.status?.toUpperCase()}</span>
                <span>ID: {paymentResult.paymentId}</span>
              </div>
              <p className="text-[11px]">{paymentResult.message || paymentResult.statusDetail}</p>

              {/* Pix QR Code Display if available */}
              {paymentResult.qrCodeBase64 && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-3">
                  <span className="text-[11px] text-slate-400 block font-semibold">
                    QR CODE PIX OFICIAL MERCADO PAGO:
                  </span>
                  <div className="inline-block p-2 bg-white rounded-lg shadow-md">
                    <img
                      src={`data:image/png;base64,${paymentResult.qrCodeBase64}`}
                      alt="QR Code Pix"
                      className="w-44 h-44 mx-auto"
                    />
                  </div>
                  {paymentResult.qrCode && (
                    <div className="space-y-1 text-left">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Código Copia e Cola:</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(paymentResult.qrCode);
                            setCopiedPix(true);
                            setTimeout(() => setCopiedPix(false), 2000);
                          }}
                          className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
                        >
                          {copiedPix ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPix ? 'Copiado!' : 'Copiar Pix'}</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={paymentResult.qrCode}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-emerald-400 font-mono truncate"
                      />
                    </div>
                  )}
                </div>
              )}

              <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-300 max-h-36 overflow-y-auto">
                {JSON.stringify(paymentResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Webhooks Receiver Console */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Recepção de Notificações Webhook (IPN)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Eventos enviados automaticamente pelo Mercado Pago para a sua URL de retorno
            </p>
          </div>

          <button
            onClick={fetchWebhooks}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingWebhooks ? 'animate-spin' : ''}`} />
            <span>Atualizar Logs</span>
          </button>
        </div>

        {webhooks.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            Nenhum evento de webhook recebido ainda. Quando você configurar sua URL no painel do Mercado Pago, as notificações aparecerão aqui.
          </div>
        ) : (
          <div className="space-y-2">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="text-amber-400 font-bold">{wh.topic}</span>
                  <span>{wh.receivedAt}</span>
                </div>
                <div className="text-slate-300">
                  Data ID: <strong>{wh.dataId}</strong> | Ação: <strong>{wh.action}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
