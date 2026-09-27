export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard' | 'discover' | 'diners' | 'unknown';

export interface CardDetails {
  number: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface LuhnStep {
  digit: number;
  positionFromRight: number;
  isDoubled: boolean;
  doubledValue: number;
  processedValue: number;
}

export interface LuhnResult {
  isValid: boolean;
  steps: LuhnStep[];
  sum: number;
  checkDigit: number;
  calculatedCheckDigit: number;
}

export interface BinInfo {
  bin: string;
  brand: string;
  type: 'Crédito' | 'Débito' | 'Múltiplo' | 'Pré-pago';
  level: 'Standard' | 'Gold' | 'Platinum' | 'Black / Infinite' | 'Corporate' | 'Business';
  bank: string;
  country: string;
  countryCode: string;
  currency: string;
  miiDescription: string;
}

export interface StandardTestCard {
  id: string;
  title: string;
  category: 'Sucesso' | 'Recusa' | 'Segurança' | 'Especiais';
  cardNumber: string;
  brand: CardBrand;
  expDate: string;
  cvv: string;
  expectedOutcome: string;
  responseCode: string;
  description: string;
}

export interface GatewayResponse {
  id: string;
  timestamp: string;
  status: 'approved' | 'declined' | 'error' | 'challenge_required';
  code: string;
  message: string;
  authCode?: string;
  nsu?: string;
  latencyMs: number;
  cardBrand: CardBrand;
  last4: string;
  amount: number;
  currency: string;
  riskScore: number;
  recommendation: 'APROVAR' | 'NEGAR' | 'REVISÃO_MANUAL';
  avsResult: string;
  cvvResult: 'MATCH' | 'MISMATCH' | 'NOT_CHECKED';
  rawResponse: Record<string, unknown>;
}
