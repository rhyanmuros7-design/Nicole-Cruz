import React, { useState } from 'react';
import { lookupBin, KNOWN_BINS } from '../utils/binData';
import { Database, Search, Globe, CreditCard, Building, ShieldCheck, ArrowRight } from 'lucide-react';

interface BinLookupProps {
  initialBin?: string;
  onApplyBin?: (bin: string) => void;
}

export const BinLookup: React.FC<BinLookupProps> = ({ initialBin = '', onApplyBin }) => {
  const [binInput, setBinInput] = useState<string>(initialBin || '424242');
  const binInfo = lookupBin(binInput);

  const cleanBin = binInput.replace(/\D/g, '').slice(0, 8);

  const sampleBins = [
    { label: 'Visa Standard (424242)', value: '424242' },
    { label: 'Mastercard Black (555555)', value: '555555' },
    { label: 'Elo Brasil (506778)', value: '506778' },
    { label: 'Amex Platinum (378282)', value: '378282' },
    { label: 'Hipercard (606282)', value: '606282' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-mono font-bold text-white">
            Analisador de BIN / IIN (ISO/IEC 7812)
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Identificador do Emissor: decodifique os primeiros 6 a 8 dígitos do cartão para entender sua taxonomia bancária
        </p>
      </div>

      {/* Input row */}
      <div className="space-y-3">
        <label className="text-xs font-mono text-slate-300 block">
          Digite os 6 ou 8 primeiros dígitos (BIN / IIN):
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="text"
              maxLength={8}
              value={binInput}
              onChange={(e) => setBinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Ex: 424242 ou 555555"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 font-mono text-white text-sm outline-none transition-all"
            />
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            {sampleBins.map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  setBinInput(s.value);
                  if (onApplyBin) onApplyBin(s.value);
                }}
                className="px-2.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ISO Anatomy breakdown visual */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono">
        <span className="text-[11px] text-slate-400 block mb-2 font-semibold">
          ANATOMIA ISO/IEC 7812 DA ESTRUTURA DO PAN (Primary Account Number):
        </span>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-blue-950/40 border border-blue-600/50 rounded-lg p-2">
            <span className="text-[10px] text-blue-400 block">MII (Dígito 1)</span>
            <span className="font-bold text-white text-base">{cleanBin[0] || '4'}</span>
            <span className="text-[9px] text-slate-400 block truncate">Indústria</span>
          </div>
          <div className="bg-emerald-950/40 border border-emerald-600/50 rounded-lg p-2">
            <span className="text-[10px] text-emerald-400 block">IIN / BIN (1 a 6)</span>
            <span className="font-bold text-white text-base">{cleanBin || '424242'}</span>
            <span className="text-[9px] text-slate-400 block truncate">Banco / Rede</span>
          </div>
          <div className="bg-purple-950/40 border border-purple-600/50 rounded-lg p-2">
            <span className="text-[10px] text-purple-400 block">Conta (7 a 15)</span>
            <span className="font-bold text-slate-300 text-base">••••••••</span>
            <span className="text-[9px] text-slate-400 block truncate">Conta do Titular</span>
          </div>
          <div className="bg-amber-950/40 border border-amber-600/50 rounded-lg p-2">
            <span className="text-[10px] text-amber-400 block">Dígito Final (16)</span>
            <span className="font-bold text-amber-400 text-base">DV</span>
            <span className="text-[9px] text-slate-400 block truncate">Luhn Checksum</span>
          </div>
        </div>
      </div>

      {/* Lookup Result Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Bandeira / Esquema</span>
          </div>
          <div className="text-base font-bold text-white pt-1">{binInfo.brand}</div>
          <div className="text-[11px] text-slate-500">MII: {binInfo.miiDescription}</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
            <Building className="w-4 h-4 text-cyan-400" />
            <span>Instituição Emissora (Banco)</span>
          </div>
          <div className="text-base font-bold text-white pt-1">{binInfo.bank}</div>
          <div className="text-[11px] text-slate-500">Tipo: {binInfo.type} ({binInfo.level})</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
            <Globe className="w-4 h-4 text-amber-400" />
            <span>Jurisdição & Moeda</span>
          </div>
          <div className="text-base font-bold text-white pt-1">{binInfo.country}</div>
          <div className="text-[11px] text-slate-500">Moedas de liquidação: {binInfo.currency}</div>
        </div>
      </div>
    </div>
  );
};
