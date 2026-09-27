import React, { useState } from 'react';
import { CardBrand } from '../types';
import { Wifi, RotateCw } from 'lucide-react';

interface CardVisualizerProps {
  number: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  brand: CardBrand;
  isFlipped?: boolean;
}

export const CardVisualizer: React.FC<CardVisualizerProps> = ({
  number,
  holderName,
  expiryMonth,
  expiryYear,
  cvv,
  brand,
  isFlipped: controlledFlipped,
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const getBrandLogo = (b: CardBrand) => {
    switch (b) {
      case 'visa':
        return <span className="font-sans italic font-black text-xl tracking-tighter text-blue-300">VISA</span>;
      case 'mastercard':
        return (
          <div className="flex -space-x-2 items-center">
            <div className="w-6 h-6 rounded-full bg-red-500 opacity-90"></div>
            <div className="w-6 h-6 rounded-full bg-amber-500 opacity-90"></div>
          </div>
        );
      case 'amex':
        return <span className="font-mono font-bold text-sm bg-cyan-700/60 px-2 py-0.5 rounded text-white tracking-widest">AMEX</span>;
      case 'elo':
        return <span className="font-bold text-sm text-yellow-400 bg-red-600 px-2 py-0.5 rounded-full">elo</span>;
      case 'hipercard':
        return <span className="font-bold text-xs bg-red-700 px-2 py-1 rounded text-white italic">HIPERCARD</span>;
      case 'discover':
        return <span className="font-bold text-sm text-orange-400 tracking-wider">DISCOVER</span>;
      case 'diners':
        return <span className="font-bold text-xs text-blue-200 tracking-widest">DINERS CLUB</span>;
      default:
        return <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">GENERIC LAB</span>;
    }
  };

  const getBackgroundGradient = (b: CardBrand) => {
    switch (b) {
      case 'visa':
        return 'from-blue-950 via-slate-900 to-indigo-950 border-blue-500/30';
      case 'mastercard':
        return 'from-stone-950 via-neutral-900 to-amber-950 border-amber-500/30';
      case 'amex':
        return 'from-cyan-950 via-slate-900 to-teal-950 border-teal-500/30';
      case 'elo':
        return 'from-slate-950 via-zinc-900 to-slate-900 border-yellow-500/30';
      default:
        return 'from-slate-900 via-slate-950 to-emerald-950 border-emerald-500/30';
    }
  };

  const displayNumber = number.trim() ? number : '•••• •••• •••• ••••';
  const displayHolder = holderName.trim() ? holderName.toUpperCase() : 'TITULAR DE TESTE / QA';
  const displayExp = (expiryMonth || 'MM') + '/' + (expiryYear || 'AA');
  const displayCvv = cvv.trim() ? cvv : '•••';

  return (
    <div className="relative w-full max-w-sm mx-auto select-none perspective">
      <div
        onClick={() => setInternalFlipped(!internalFlipped)}
        className="cursor-pointer transition-transform duration-500 relative"
      >
        {!isFlipped ? (
          /* FRONT SIDE */
          <div
            className={`w-full aspect-[1.586/1] rounded-2xl p-5 bg-gradient-to-br ${getBackgroundGradient(
              brand
            )} border shadow-2xl relative flex flex-col justify-between overflow-hidden text-white transition-all`}
          >
            {/* Holographic background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

            {/* Top row: Chip and Brand */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                {/* EMV Chip */}
                <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-0.5 shadow-sm border border-amber-500/40 relative">
                  <div className="w-full h-full border border-amber-700/30 rounded flex items-center justify-center">
                    <div className="w-4 h-3 border-t border-b border-amber-800/40"></div>
                  </div>
                </div>
                <Wifi className="w-5 h-5 text-slate-300/80 rotate-90" />
              </div>

              <div className="flex items-center space-x-2">
                {getBrandLogo(brand)}
              </div>
            </div>

            {/* Card Number */}
            <div className="z-10 my-auto">
              <div className="font-mono text-lg sm:text-xl font-semibold tracking-widest text-slate-100 drop-shadow-md">
                {displayNumber}
              </div>
              <div className="text-[10px] font-mono text-emerald-400/90 tracking-wider flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>SANDBOX TEST RUNNER</span>
              </div>
            </div>

            {/* Bottom Row: Holder & Expiry */}
            <div className="flex items-end justify-between z-10 text-xs font-mono">
              <div className="max-w-[70%] truncate">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">
                  Nome do Titular
                </span>
                <span className="text-slate-200 font-semibold tracking-wider block truncate">
                  {displayHolder}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">
                  Validade
                </span>
                <span className="text-slate-200 font-semibold tracking-wider">
                  {displayExp}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* BACK SIDE */
          <div
            className={`w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${getBackgroundGradient(
              brand
            )} border shadow-2xl relative flex flex-col justify-between overflow-hidden text-white transition-all`}
          >
            <div className="w-full h-11 bg-slate-950 mt-5 border-y border-slate-800"></div>

            <div className="px-6 py-2">
              <div className="text-[9px] font-mono text-slate-400 text-right mb-1">
                CVV / CVC / CÓDIGO DE SEGURANÇA
              </div>
              <div className="flex items-center justify-end">
                <div className="w-48 h-8 bg-slate-200 rounded-sm flex items-center justify-end px-3 border border-slate-300">
                  <span className="font-mono text-slate-900 font-bold tracking-widest text-sm">
                    {displayCvv}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-4 flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span>TEST ENV // NENHUMA COBRANÇA REAL</span>
              <div className="flex items-center space-x-1">
                {getBrandLogo(brand)}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center space-x-2 mt-2">
        <button
          onClick={() => setInternalFlipped(!internalFlipped)}
          className="text-[11px] font-mono text-slate-400 hover:text-emerald-400 flex items-center space-x-1 transition-colors cursor-pointer py-1 px-2 rounded hover:bg-slate-900"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{isFlipped ? 'Ver Frente do Cartão' : 'Girar para ver Verso (CVV)'}</span>
        </button>
      </div>
    </div>
  );
};
