import React, { useState } from 'react';
import { GatewayResponse } from '../types';
import { Terminal, Trash2, ChevronDown, ChevronRight, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface AuditTerminalProps {
  logs: GatewayResponse[];
  onClearLogs: () => void;
}

export const AuditTerminal: React.FC<AuditTerminalProps> = ({ logs, onClearLogs }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">
            CONSOLE DE AUDITORIA DE REQUISIÇÕES // GATEWAY MOCK
          </h3>
          <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full">
            {logs.length} eventos
          </span>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Console</span>
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          Nenhuma requisição de teste simulada ainda. Envie uma requisição no formulário acima.
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            const isSuccess = log.status === 'approved';
            const isChallenge = log.status === 'challenge_required';

            return (
              <div
                key={log.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3 text-xs transition-all"
              >
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="flex flex-wrap items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}

                    {isSuccess ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isChallenge ? (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}

                    <span className="text-slate-400 text-[11px]">{log.timestamp}</span>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isSuccess
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : isChallenge
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {log.code}
                    </span>

                    <span className="text-slate-200 font-semibold truncate max-w-[200px] sm:max-w-none">
                      {log.message}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span className="uppercase text-slate-300">{log.cardBrand} •••• {log.last4}</span>
                    <span className="text-emerald-400">R$ {log.amount.toFixed(2)}</span>
                    <div className="flex items-center space-x-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{log.latencyMs}ms</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details and Raw Payload */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">AUTH CODE (ACQUIRER)</span>
                        <span className="text-white font-bold">{log.authCode || 'N/A'}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">NSU / TRANSACTION ID</span>
                        <span className="text-white font-bold">{log.nsu || 'N/A'}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">ANTIFRAUD SCORE</span>
                        <span className={`font-bold ${log.riskScore > 70 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {log.riskScore}/100 ({log.recommendation})
                        </span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">CVV & AVS STATUS</span>
                        <span className="text-white font-bold">{log.cvvResult}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500">PAYLOAD JSON DE RESPOSTA HTTP DO GATEWAY:</span>
                      <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] text-emerald-400 overflow-x-auto">
                        {JSON.stringify(log.rawResponse, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
