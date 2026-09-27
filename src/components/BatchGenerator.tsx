import React, { useState } from 'react';
import { generateLuhnSyntheticNumber } from '../utils/luhn';
import { FileCode2, Copy, Check, Download, AlertTriangle, RefreshCw } from 'lucide-react';

export const BatchGenerator: React.FC = () => {
  const [brandPrefix, setBrandPrefix] = useState<string>('424242');
  const [totalLength, setTotalLength] = useState<number>(16);
  const [quantity, setQuantity] = useState<number>(10);
  const [format, setFormat] = useState<'pipe' | 'json' | 'csv'>('pipe');
  const [generatedData, setGeneratedData] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = () => {
    const lines: Array<{ number: string; month: string; year: string; cvv: string }> = [];

    for (let i = 0; i < quantity; i++) {
      const num = generateLuhnSyntheticNumber(brandPrefix, totalLength);
      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const currentYear = new Date().getFullYear();
      const year = String(currentYear + Math.floor(Math.random() * 5) + 1);
      const cvvLen = totalLength === 15 ? 4 : 3;
      let cvv = '';
      for (let c = 0; c < cvvLen; c++) {
        cvv += Math.floor(Math.random() * 10);
      }
      lines.push({ number: num, month, year, cvv });
    }

    if (format === 'pipe') {
      const text = lines.map((l) => `${l.number}|${l.month}|${l.year}|${l.cvv}`).join('\n');
      setGeneratedData(text);
    } else if (format === 'csv') {
      const header = 'CardNumber,ExpMonth,ExpYear,CVV\n';
      const text = header + lines.map((l) => `${l.number},${l.month},${l.year},${l.cvv}`).join('\n');
      setGeneratedData(text);
    } else if (format === 'json') {
      setGeneratedData(JSON.stringify(lines, null, 2));
    }
  };

  const handleCopy = () => {
    if (!generatedData) return;
    navigator.clipboard.writeText(generatedData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedData) return;
    const ext = format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'txt';
    const blob = new Blob([generatedData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qa_sandbox_fixtures_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <FileCode2 className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-mono font-bold text-white">
            Gerador de Massa Sintética para Testes de Automação (QA)
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Produza fixtures compatíveis com Luhn para testes automatizados unitários, end-to-end (Cypress, Playwright) e pipelines CI/CD
        </p>
      </div>

      {/* Safety Banner */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3.5 flex items-start space-x-3 text-xs text-amber-300 font-mono">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-200 block">Aviso de Conformidade Técnica:</span>
          Os registros gerados contêm números puramente sintéticos computados pelo algoritmo de Luhn (MOD 10).
          Eles são destinados exclusivamente para testes de interface, validações de regex em checkouts e mocks de homologação.
        </div>
      </div>

      {/* Config Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div>
          <label className="text-slate-300 block mb-1.5 font-semibold">Prefixo / BIN:</label>
          <select
            value={brandPrefix}
            onChange={(e) => {
              const val = e.target.value;
              setBrandPrefix(val);
              if (val.startsWith('37') || val.startsWith('34')) {
                setTotalLength(15);
              } else {
                setTotalLength(16);
              }
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
          >
            <option value="424242">Visa Sandbox (424242)</option>
            <option value="555555">Mastercard Sandbox (555555)</option>
            <option value="506778">Elo Brasil Test (506778)</option>
            <option value="378282">Amex Test (378282 - 15 dig)</option>
            <option value="606282">Hipercard Test (606282)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-300 block mb-1.5 font-semibold">Quantidade de Registros:</label>
          <select
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
          >
            <option value={5}>5 fixtures de teste</option>
            <option value={10}>10 fixtures de teste</option>
            <option value={20}>20 fixtures de teste</option>
            <option value={50}>50 fixtures de teste</option>
          </select>
        </div>

        <div>
          <label className="text-slate-300 block mb-1.5 font-semibold">Formato de Saída:</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'pipe' | 'json' | 'csv')}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
          >
            <option value="pipe">Pipe: NUM|MM|AAAA|CVV</option>
            <option value="json">JSON: Array de Objetos</option>
            <option value="csv">CSV: Planilha de QA</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleGenerate}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-950 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Gerar Fixtures</span>
          </button>
        </div>
      </div>

      {/* Output Console */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-slate-400">
            Saída dos Dados de Teste Sintéticos:
          </label>
          {generatedData && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Exportar Arquivo</span>
              </button>
            </div>
          )}
        </div>

        <textarea
          readOnly
          rows={7}
          value={generatedData || 'Clique em "Gerar Fixtures" para criar uma massa de dados sintetizada de teste...'}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-400/90 focus:outline-none resize-none leading-relaxed select-all"
        />
      </div>
    </div>
  );
};
