import React, { useState } from 'react';
import { CardDetails, CardBrand, GatewayResponse, StandardTestCard } from '../types';
import { detectCardBrand, formatCardNumber, calculateLuhn } from '../utils/luhn';
import { CardVisualizer } from './CardVisualizer';
import { Play, RotateCcw, AlertTriangle, CheckCircle2, XCircle, Sliders, ShieldCheck, Zap } from 'lucide-react';

interface GatewaySimulatorProps {
  cardDetails: CardDetails;
  setCardDetails: React.Dispatch<React.SetStateAction<CardDetails>>;
  onTransactionComplete: (response: GatewayResponse) => void;
}

export const GatewaySimulator: React.FC<GatewaySimulatorProps> = ({
  cardDetails,
  setCardDetails,
  onTransactionComplete,
}) => {
  const [amount, setAmount] = useState<number>(150.0);
  const [latency, setLatency] = useState<number>(450);
  const [forcedOutcome, setForcedOutcome] = useState<string>('auto');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [latestResponse, setLatestResponse] = useState<GatewayResponse | null>(null);

  const brand = detectCardBrand(cardDetails.number);
  const luhn = calculateLuhn(cardDetails.number);
  const cleanNumber = cardDetails.number.replace(/\D/g, '');

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const detected = detectCardBrand(raw);
    const formatted = formatCardNumber(raw, detected);
    setCardDetails((prev) => ({ ...prev, number: formatted }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);

    let month = '';
    let year = '';

    if (val.length >= 1) {
      month = val.slice(0, 2);
    }
    if (val.length >= 3) {
      year = val.slice(2, 4);
    }

    setCardDetails((prev) => ({
      ...prev,
      expiryMonth: month,
      expiryYear: year,
    }));
  };

  const handleReset = () => {
    setCardDetails({
      number: '',
      holderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    });
    setLatestResponse(null);
  };

  const executeSimulation = async () => {
    if (!cleanNumber) return;

    setIsProcessing(true);
    setLatestResponse(null);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, latency));

    let status: 'approved' | 'declined' | 'error' | 'challenge_required' = 'approved';
    let code = '00';
    let message = 'Transação Aprovada com Sucesso';
    let riskScore = Math.floor(Math.random() * 25) + 5;
    let recommendation: 'APROVAR' | 'NEGAR' | 'REVISÃO_MANUAL' = 'APROVAR';
    let authCode = String(Math.floor(100000 + Math.random() * 900000));
    let nsu = String(Math.floor(100000000 + Math.random() * 900000000));

    // Evaluate rules if forced or auto
    if (forcedOutcome === 'force_approve') {
      status = 'approved';
      code = '00';
      message = 'Transação Aprovada (Forçada via Override QA)';
    } else if (forcedOutcome === 'force_insufficient') {
      status = 'declined';
      code = '51';
      message = 'Não Aprovada: Limite de Crédito ou Saldo Insuficiente';
      authCode = '';
    } else if (forcedOutcome === 'force_expired') {
      status = 'declined';
      code = '54';
      message = 'Não Aprovada: Cartão com Data de Validade Expirada';
      authCode = '';
    } else if (forcedOutcome === 'force_3ds') {
      status = 'challenge_required';
      code = '3DS';
      message = 'Desafio 3D Secure 2.0 Requerido (Step-up Auth)';
      authCode = 'PENDING_SCA';
    } else if (forcedOutcome === 'force_fraud') {
      status = 'declined';
      code = '59';
      message = 'Bloqueio Preventivo por Motor Antifraude';
      riskScore = 96;
      recommendation = 'NEGAR';
      authCode = '';
    } else {
      // Automatic evaluation based on card number & Luhn
      if (!luhn.isValid && cleanNumber.length >= 12) {
        status = 'declined';
        code = '14';
        message = 'Cartão Inválido: Falha de Algoritmo de Luhn (MOD 10)';
        authCode = '';
      } else if (cleanNumber.endsWith('9995')) {
        status = 'declined';
        code = '51';
        message = 'Recusa do Emissor: Limite Insuficiente';
        authCode = '';
      } else if (cleanNumber.endsWith('0069')) {
        status = 'declined';
        code = '54';
        message = 'Recusa: Cartão Expirado';
        authCode = '';
      } else if (cleanNumber.endsWith('0041')) {
        status = 'declined';
        code = '04';
        message = 'Recusa: Cartão com Restrição de Furto / Extravio';
        authCode = '';
      } else if (cleanNumber.endsWith('3220')) {
        status = 'challenge_required';
        code = '3DS';
        message = 'Requer Autenticação Forte do Portador (3D Secure)';
      } else if (cleanNumber.endsWith('0082')) {
        status = 'declined';
        code = '59';
        message = 'Suspeita de Fraude: Rejeitado por Análise de Risco';
        riskScore = 94;
        recommendation = 'NEGAR';
        authCode = '';
      } else {
        status = 'approved';
        code = '00';
        message = 'Transação Autorizada pelo Emissor';
      }
    }

    const response: GatewayResponse = {
      id: 'tx_' + Math.random().toString(36).substring(2, 10),
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      status,
      code,
      message,
      authCode: authCode || undefined,
      nsu,
      latencyMs: latency,
      cardBrand: brand,
      last4: cleanNumber.slice(-4) || '0000',
      amount,
      currency: 'BRL',
      riskScore,
      recommendation,
      avsResult: 'MATCH_EXACT',
      cvvResult: cardDetails.cvv ? 'MATCH' : 'NOT_CHECKED',
      rawResponse: {
        gateway_version: '2.4.0-sandbox',
        transaction_id: 'gw_' + Date.now(),
        card_scheme: brand,
        bin: cleanNumber.slice(0, 6),
        luhn_passed: luhn.isValid,
        iso8583_response_code: code,
        authorized: status === 'approved',
        processor: 'MOCK_ACQUIRER_SANDBOX',
        captured: false,
        created_at: new Date().toISOString(),
      },
    };

    setLatestResponse(response);
    setIsProcessing(false);
    onTransactionComplete(response);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Visual Card + Controls */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Preview Interativo do Cartão</span>
            </span>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
              {brand.toUpperCase()}
            </span>
          </div>

          <CardVisualizer
            number={cardDetails.number}
            holderName={cardDetails.holderName}
            expiryMonth={cardDetails.expiryMonth}
            expiryYear={cardDetails.expiryYear}
            cvv={cardDetails.cvv}
            brand={brand}
          />

          {/* Quick Integrity Badges */}
          <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Algoritmo Luhn:</span>
              {cleanNumber.length >= 12 ? (
                luhn.isValid ? (
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Válido</span>
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold flex items-center space-x-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Inválido</span>
                  </span>
                )
              ) : (
                <span className="text-slate-500">Incompleto</span>
              )}
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Bandeira:</span>
              <span className="text-white font-bold uppercase">{brand}</span>
            </div>
          </div>
        </div>

        {/* Simulation Parameters Config */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 font-mono text-xs">
          <div className="flex items-center space-x-2 text-slate-300 font-bold border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Configurações do Sandbox de QA</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Latência de Rede Simulada:</span>
                <span className="text-emerald-400 font-bold">{latency} ms</span>
              </div>
              <input
                type="range"
                min="100"
                max="2500"
                step="50"
                value={latency}
                onChange={(e) => setLatency(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Comportamento do Gateway (Override):</label>
              <select
                value={forcedOutcome}
                onChange={(e) => setForcedOutcome(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
              >
                <option value="auto">Automático (Baseado no Cartão e Luhn)</option>
                <option value="force_approve">Forçar Sucesso (Code 00 - Aprovado)</option>
                <option value="force_insufficient">Forçar Recusa (Code 51 - Saldo Insuficiente)</option>
                <option value="force_expired">Forçar Recusa (Code 54 - Cartão Expirado)</option>
                <option value="force_3ds">Forçar Desafio (3DS 2.0 Challenge)</option>
                <option value="force_fraud">Forçar Antifraude (Code 59 - Risco Elevado)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Form & Execution Panel */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-mono font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Simulador de Checkout & Gateway</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Envie transações de teste para aferir a resposta do processador adquirente
              </p>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center space-x-1 text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="text-slate-300 block mb-1.5 font-semibold">
                Número do Cartão (PAN):
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={23}
                  value={cardDetails.number}
                  onChange={handleNumberChange}
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 font-mono text-base text-white outline-none tracking-widest transition-all placeholder:text-slate-600"
                />
                <div className="absolute right-3 top-3 text-[11px] font-bold uppercase text-slate-400">
                  {brand}
                </div>
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1.5 font-semibold">
                Nome do Titular impresso no Cartão:
              </label>
              <input
                type="text"
                value={cardDetails.holderName}
                onChange={(e) =>
                  setCardDetails((prev) => ({ ...prev, holderName: e.target.value.toUpperCase() }))
                }
                placeholder="EX: JOAO SOUZA QA TESTER"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white outline-none transition-all placeholder:text-slate-600 uppercase"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-300 block mb-1.5 font-semibold">
                  Validade (MM/AA):
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={
                    cardDetails.expiryMonth || cardDetails.expiryYear
                      ? `${cardDetails.expiryMonth}${cardDetails.expiryYear ? '/' + cardDetails.expiryYear : ''}`
                      : ''
                  }
                  onChange={handleExpiryChange}
                  placeholder="MM/AA"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white outline-none transition-all text-center placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1.5 font-semibold">
                  CVV / CVC:
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={cardDetails.cvv}
                  onChange={(e) =>
                    setCardDetails((prev) => ({
                      ...prev,
                      cvv: e.target.value.replace(/\D/g, ''),
                    }))
                  }
                  placeholder="123"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white outline-none transition-all text-center placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1.5 font-semibold">
                  Valor da Cobrança (BRL):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-emerald-400 font-bold outline-none transition-all text-center"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={executeSimulation}
                disabled={isProcessing || !cleanNumber}
                className={`w-full py-3.5 px-4 rounded-xl font-mono text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-xl cursor-pointer ${
                  isProcessing || !cleanNumber
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/60 active:scale-[0.99]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Comunicando com Adquirente ({latency}ms)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Disparar Autorização no Gateway de Teste</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Latest Response Card */}
        {latestResponse && (
          <div
            className={`border rounded-2xl p-5 shadow-2xl space-y-4 font-mono transition-all animate-in fade-in duration-300 ${
              latestResponse.status === 'approved'
                ? 'bg-emerald-950/30 border-emerald-500/50'
                : latestResponse.status === 'challenge_required'
                ? 'bg-amber-950/30 border-amber-500/50'
                : 'bg-rose-950/30 border-rose-500/50'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2.5">
                {latestResponse.status === 'approved' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : latestResponse.status === 'challenge_required' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {latestResponse.status === 'approved'
                      ? 'TRANSAÇÃO AUTORIZADA // CODE ' + latestResponse.code
                      : latestResponse.status === 'challenge_required'
                      ? 'AUTENTICAÇÃO NECESSÁRIA // CODE ' + latestResponse.code
                      : 'TRANSAÇÃO NÃO AUTORIZADA // CODE ' + latestResponse.code}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">{latestResponse.message}</p>
                </div>
              </div>

              <span className="text-[11px] text-slate-400">
                Latência: <strong className="text-emerald-400">{latestResponse.latencyMs}ms</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">ID DA TRANSAÇÃO</span>
                <span className="font-bold text-slate-200">{latestResponse.id}</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">CÓDIGO DE AUTORIZAÇÃO</span>
                <span className="font-bold text-emerald-400">
                  {latestResponse.authCode || 'N/A'}
                </span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">NSU ADQUIRENTE</span>
                <span className="font-bold text-slate-200">{latestResponse.nsu}</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">SCORE DE RISCO</span>
                <span className="font-bold text-white">
                  {latestResponse.riskScore}/100 ({latestResponse.recommendation})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
