import React, { useState } from 'react';
import { OFFICIAL_SANDBOX_CARDS } from '../utils/testCards';
import { StandardTestCard } from '../types';
import { Copy, Check, Play, ShieldAlert, Sparkles, Filter } from 'lucide-react';

interface TestCardPresetsProps {
  onSelectCard: (card: StandardTestCard) => void;
}

export const TestCardPresets: React.FC<TestCardPresetsProps> = ({ onSelectCard }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['Todas', 'Sucesso', 'Recusa', 'Segurança', 'Especiais'];

  const filteredCards = selectedCategory === 'Todas'
    ? OFFICIAL_SANDBOX_CARDS
    : OFFICIAL_SANDBOX_CARDS.filter((c) => c.category === selectedCategory);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-mono font-bold text-white">
              Cartões de Teste Oficiais de Documentação (Sandbox)
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Conjunto de dados padronizado utilizado em ambientes de homologação (Stripe, Adyen, Cielo, Rede)
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCards.map((card) => {
          const isCopied = copiedId === card.id;

          const getStatusBadge = (cat: string) => {
            switch (cat) {
              case 'Sucesso':
                return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
              case 'Recusa':
                return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
              case 'Segurança':
                return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
              default:
                return 'bg-blue-950/80 text-blue-300 border-blue-700/60';
            }
          };

          return (
            <div
              key={card.id}
              className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold font-mono text-white group-hover:text-emerald-400 transition-colors">
                    {card.title}
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getStatusBadge(
                      card.category
                    )}`}
                  >
                    {card.category}
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-mono mt-1.5 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Card specs box */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2.5 font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[10px]">NÚMERO DE TESTE</span>
                  <span className="text-[10px] text-slate-400 uppercase">{card.brand}</span>
                </div>
                <div className="font-bold text-white tracking-wider flex items-center justify-between">
                  <span>{card.cardNumber}</span>
                  <button
                    onClick={() => handleCopy(card.id, card.cardNumber.replace(/\s+/g, ''))}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Copiar número"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Validade: <strong className="text-slate-200">{card.expDate}</strong></span>
                  <span>CVV: <strong className="text-slate-200">{card.cvv}</strong></span>
                  <span className="text-emerald-400 font-bold">{card.responseCode}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  <span className="truncate max-w-[170px] sm:max-w-[210px]">{card.expectedOutcome}</span>
                </span>

                <button
                  onClick={() => onSelectCard(card)}
                  className="flex items-center space-x-1.5 text-xs font-mono font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-emerald-400" />
                  <span>Carregar no Lab</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
