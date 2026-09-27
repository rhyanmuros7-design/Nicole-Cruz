import React from 'react';
import { calculateLuhn } from '../utils/luhn';
import { CheckCircle2, XCircle, Info, Calculator, Check } from 'lucide-react';

interface LuhnVisualizerProps {
  cardNumber: string;
}

export const LuhnVisualizer: React.FC<LuhnVisualizerProps> = ({ cardNumber }) => {
  const result = calculateLuhn(cardNumber);
  const cleanDigits = cardNumber.replace(/\D/g, '');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-mono font-bold text-white">
              Inspeção do Algoritmo de Luhn (MOD 10)
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Fórmula matemática padronizada pela norma ISO/IEC 7812 para validação de dígitos verificadores
          </p>
        </div>

        {cleanDigits.length >= 12 ? (
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold ${
              result.isValid
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                : 'bg-rose-950/80 text-rose-300 border-rose-500/50'
            }`}
          >
            {result.isValid ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>SOMA MOD 10 VÁLIDA ({result.sum} % 10 = 0)</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>CHECKSUM INVÁLIDO ({result.sum} % 10 = {result.sum % 10})</span>
              </>
            )}
          </div>
        ) : (
          <span className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-1.5 rounded-lg">
            Aguardando dígitos (mínimo 12 números)
          </span>
        )}
      </div>

      {cleanDigits.length > 0 ? (
        <div className="space-y-5">
          {/* Step breakdown table / badges */}
          <div className="overflow-x-auto pb-2">
            <div className="inline-flex min-w-full flex-col space-y-3 font-mono text-xs">
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Passo a passo por dígito (da direita para a esquerda):</span>
                <span className="text-slate-500">Total de dígitos: {cleanDigits.length}</span>
              </div>

              <div className="grid grid-flow-col auto-cols-[minmax(42px,1fr)] gap-1.5 text-center">
                {result.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg p-2 border transition-all ${
                      step.positionFromRight === 1
                        ? 'bg-amber-950/40 border-amber-500/60'
                        : step.isDoubled
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : 'bg-slate-800/60 border-slate-700'
                    }`}
                  >
                    <div className="text-[10px] text-slate-500">#{step.positionFromRight}</div>
                    <div className="text-base font-bold text-white my-1">{step.digit}</div>
                    <div className="text-[10px] text-slate-400">
                      {step.isDoubled ? '× 2' : '× 1'}
                    </div>
                    <div
                      className={`text-xs font-bold mt-1 pt-1 border-t border-slate-700/60 ${
                        step.isDoubled ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {step.processedValue}
                    </div>
                    {step.positionFromRight === 1 && (
                      <span className="text-[8px] uppercase tracking-tighter text-amber-400 block mt-1">
                        DV
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Educational Calculation Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <span className="text-slate-500 text-[11px]">Soma Ponderada Total</span>
              <div className="text-xl font-bold text-white">{result.sum}</div>
              <p className="text-[10px] text-slate-400">
                Soma de todos os dígitos processados com dobro alternado.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <span className="text-slate-500 text-[11px]">Operação Módulo 10</span>
              <div className="text-xl font-bold text-emerald-400">
                {result.sum} mod 10 = {result.sum % 10}
              </div>
              <p className="text-[10px] text-slate-400">
                {result.sum % 10 === 0
                  ? 'Perfeito: o resto zero comprova a integridade.'
                  : 'Erro: o resto deve ser estritamente zero.'}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <span className="text-slate-500 text-[11px]">Dígito Verificador (DV)</span>
              <div className="text-xl font-bold text-amber-400">
                {result.checkDigit}{' '}
                <span className="text-xs font-normal text-slate-400">
                  (esperado: {result.calculatedCheckDigit})
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {result.checkDigit === result.calculatedCheckDigit
                  ? 'O último dígito coincide com o cálculo.'
                  : 'Divergência detectada no dígito final.'}
              </p>
            </div>
          </div>

          {/* Didactic explanation card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-start space-x-3 text-xs text-slate-300">
            <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 font-mono text-[11px] leading-relaxed">
              <span className="text-white font-semibold">Como funciona no laboratório de QA:</span>
              <p>
                O algoritmo de Luhn não verifica se o cartão possui fundos nem consulta bancos de dados em tempo real.
                Ele é puramente uma função de <em>checksum de primeira linha</em> implementada no frontend de e-commerces
                para evitar erros de digitação antes de enviar requisições onerosas para a adquirente ou gateway.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-slate-500 font-mono text-xs">
          Nenhum número inserido no simulador. Digite ou escolha um cartão predefinido para inspecionar.
        </div>
      )}
    </div>
  );
};
