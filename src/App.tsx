/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CardDetails, GatewayResponse, StandardTestCard } from './types';
import { Header } from './components/Header';
import { GatewaySimulator } from './components/GatewaySimulator';
import { LuhnVisualizer } from './components/LuhnVisualizer';
import { TestCardPresets } from './components/TestCardPresets';
import { BinLookup } from './components/BinLookup';
import { BatchGenerator } from './components/BatchGenerator';
import { AuditTerminal } from './components/AuditTerminal';
import { MercadoPagoLab } from './components/MercadoPagoLab';
import { DisclaimerModal } from './components/DisclaimerModal';
import { ShieldCheck, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('simulator');
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(false);

  // Shared Card State
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: '4242 4242 4242 4242',
    holderName: 'ANA SILVA QA TESTER',
    expiryMonth: '12',
    expiryYear: '28',
    cvv: '123',
  });

  // Transaction Logs
  const [logs, setLogs] = useState<GatewayResponse[]>([
    {
      id: 'tx_init_001',
      timestamp: '18:15:02',
      status: 'approved',
      code: '00',
      message: 'Transação de Teste Aprovada com Sucesso (Sandbox Seed)',
      authCode: '982314',
      nsu: '109283741',
      latencyMs: 340,
      cardBrand: 'visa',
      last4: '4242',
      amount: 150.0,
      currency: 'BRL',
      riskScore: 12,
      recommendation: 'APROVAR',
      avsResult: 'MATCH_EXACT',
      cvvResult: 'MATCH',
      rawResponse: {
        status: 'authorized',
        code: '00',
        message: 'Mock test transaction ready',
        timestamp: new Date().toISOString(),
      },
    },
  ]);

  const handleTransactionComplete = (response: GatewayResponse) => {
    setLogs((prev) => [response, ...prev]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleSelectPresetCard = (card: StandardTestCard) => {
    const parts = card.expDate.split('/');
    setCardDetails({
      number: card.cardNumber,
      holderName: 'DEV QA ENVIRONMENT',
      expiryMonth: parts[0] || '12',
      expiryYear: parts[1] || '28',
      cvv: card.cvv,
    });
    setActiveTab('simulator');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Lab Status Banner */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block">
                LABORATÓRIO DE HOMOLOGAÇÃO DE CHECKOUT // AMBIENTE ISOLADO
              </span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Validador do Algoritmo de Luhn, conformidade ISO/IEC 7812 e simulação de códigos de resposta de gateway.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setIsDisclaimerOpen(true)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 underline underline-offset-2 cursor-pointer flex items-center space-x-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Ver normas de segurança</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'simulator' && (
          <div className="space-y-8">
            <GatewaySimulator
              cardDetails={cardDetails}
              setCardDetails={setCardDetails}
              onTransactionComplete={handleTransactionComplete}
            />

            <AuditTerminal logs={logs} onClearLogs={handleClearLogs} />
          </div>
        )}

        {activeTab === 'mercadopago' && <MercadoPagoLab />}

        {activeTab === 'luhn' && (
          <div className="space-y-8">
            <LuhnVisualizer cardNumber={cardDetails.number} />
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-mono font-bold text-white mb-2">
                Cartão em teste atualmente no laboratório:
              </h3>
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-400 font-bold tracking-wider">
                  {cardDetails.number || 'Nenhum número'}
                </span>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Alterar número no formulário do simulador &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'presets' && (
          <TestCardPresets onSelectCard={handleSelectPresetCard} />
        )}

        {activeTab === 'bin' && (
          <BinLookup
            initialBin={cardDetails.number.replace(/\D/g, '').slice(0, 6)}
            onApplyBin={(bin) => {
              setCardDetails((prev) => ({
                ...prev,
                number: `${bin}00 0000 0000`,
              }));
            }}
          />
        )}

        {activeTab === 'batch' && <BatchGenerator />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            Payment Sandbox & QA Lab &copy; {new Date().getFullYear()} — Ferramenta de Testes e Homologação
          </span>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Algoritmo de Luhn (MOD 10)</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">ISO/IEC 7812</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400">Ambiente 100% Mock / Sandbox</span>
          </div>
        </div>
      </footer>

      {/* Ethics & Sandbox Disclaimer Modal */}
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
}
