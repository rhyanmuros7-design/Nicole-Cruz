import React from 'react';
import { ShieldAlert, CheckCircle2, Lock, BookOpen, X } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5 font-mono">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 text-emerald-400">
          <ShieldAlert className="w-7 h-7 shrink-0" />
          <h2 className="text-lg font-bold text-white tracking-wide">
            Diretrizes de Segurança & Ambiente de Sandbox QA
          </h2>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalidade Exclusiva: Homologação e Engenharia de Software</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Este laboratório foi projetado como um simulador de testes para desenvolvedores frontend,
              engenheiros de QA e especialistas em fintech que necessitam validar formulários de pagamento,
              rotinas de máscara, cálculo do algoritmo de Luhn (MOD 10) e mockar respostas de adquirentes (Cielo, Stripe, Adyen).
            </p>
          </div>

          <div className="bg-rose-950/30 border border-rose-800/50 p-4 rounded-xl space-y-2 text-rose-200">
            <div className="flex items-center space-x-2 font-bold text-rose-400">
              <Lock className="w-4 h-4" />
              <span>Política Contra Carding e Verificação Não Autorizada</span>
            </div>
            <p className="text-[11px] text-rose-300/90">
              O sistema não realiza conexões com redes de liquidação de cartões reais nem processa dados confidenciais de terceiros.
              A validação executada é local e matemática (Algoritmo de Luhn e tabela de prefixos IIN/BIN ISO 7812).
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Padrões Internacionais Suportados</span>
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[11px]">
              <li><strong>ISO/IEC 7812-1:</strong> Estrutura de identificação e numeração de emissores bancários (MII e BIN).</li>
              <li><strong>Algoritmo de Luhn:</strong> Checagem de integridade contra falhas de digitação e checksums.</li>
              <li><strong>ISO 8583 / ISO 20022:</strong> Simulação de códigos de retorno de adquirentes (00, 51, 54, 59, 3DS).</li>
            </ul>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Entendido, acessar laboratório
          </button>
        </div>
      </div>
    </div>
  );
};
