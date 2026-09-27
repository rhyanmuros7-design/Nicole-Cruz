import React from 'react';
import { ShieldCheck, Terminal, Cpu, Layers, HelpCircle, FileCode2, Database, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDisclaimer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenDisclaimer }) => {
  const tabs = [
    { id: 'simulator', label: 'Terminal Gateway & Validador', icon: Terminal },
    { id: 'mercadopago', label: 'Integração Mercado Pago', icon: ShoppingBag },
    { id: 'luhn', label: 'Algoritmo de Luhn', icon: Cpu },
    { id: 'presets', label: 'Cartões Padrão QA', icon: Layers },
    { id: 'bin', label: 'Análise de BIN', icon: Database },
    { id: 'batch', label: 'Gerador Sintético', icon: FileCode2 },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/50">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-base font-bold text-white tracking-wider">
                  PAYMENT<span className="text-emerald-400">LAB</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded-full">
                  Sandbox QA v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">
                Ambiente de Testes para Gateways, Adquirentes e Algoritmo de Luhn
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden lg:flex items-center space-x-1.5 text-xs font-mono text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Ambiente Seguro: Simulado</span>
            </div>

            <button
              onClick={onOpenDisclaimer}
              className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Informações de Segurança e Uso Ético"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Diretrizes de QA</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-none border-t border-slate-800/60 pt-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-xs font-mono rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
