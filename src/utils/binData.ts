import { BinInfo } from '../types';

export const KNOWN_BINS: Record<string, BinInfo> = {
  '424242': {
    bin: '424242',
    brand: 'Visa',
    type: 'Crédito',
    level: 'Standard',
    bank: 'Sandbox Global Test Bank',
    country: 'Estados Unidos / Internacional',
    countryCode: 'US',
    currency: 'USD, BRL, EUR',
    miiDescription: '4 - Bancos e Instituições Financeiras (Visa)',
  },
  '555555': {
    bin: '555555',
    brand: 'Mastercard',
    type: 'Crédito',
    level: 'Black / Infinite',
    bank: 'Sandbox Global Test Bank',
    country: 'Internacional',
    countryCode: 'US',
    currency: 'USD, EUR',
    miiDescription: '5 - Bancos e Instituições Financeiras (Mastercard)',
  },
  '506778': {
    bin: '506778',
    brand: 'Elo',
    type: 'Múltiplo',
    level: 'Gold',
    bank: 'Banco do Brasil / Bradesco / Caixa (Elo Test Consortium)',
    country: 'Brasil',
    countryCode: 'BR',
    currency: 'BRL',
    miiDescription: '5 - Bancos e Instituições Financeiras (Elo)',
  },
  '378282': {
    bin: '378282',
    brand: 'American Express',
    type: 'Crédito',
    level: 'Platinum',
    bank: 'American Express Travel Related Services',
    country: 'Estados Unidos',
    countryCode: 'US',
    currency: 'USD',
    miiDescription: '3 - Companhias Aéreas / Entretenimento / Amex',
  },
  '400000': {
    bin: '400000',
    brand: 'Visa',
    type: 'Débito',
    level: 'Standard',
    bank: 'Visa Developer Platform QA',
    country: 'Global Sandbox',
    countryCode: 'GL',
    currency: 'Multi-moeda',
    miiDescription: '4 - Bancos e Instituições Financeiras (Visa Sandbox)',
  },
  '606282': {
    bin: '606282',
    brand: 'Hipercard',
    type: 'Crédito',
    level: 'Standard',
    bank: 'Itaú Unibanco (Hipercard)',
    country: 'Brasil',
    countryCode: 'BR',
    currency: 'BRL',
    miiDescription: '6 - Comércio, Serviços e Instituições Financeiras',
  },
  '305699': {
    bin: '305699',
    brand: 'Diners Club',
    type: 'Crédito',
    level: 'Corporate',
    bank: 'Diners Club International',
    country: 'Reino Unido',
    countryCode: 'GB',
    currency: 'GBP',
    miiDescription: '3 - Viagens e Entretenimento',
  },
  '601100': {
    bin: '601100',
    brand: 'Discover',
    type: 'Crédito',
    level: 'Standard',
    bank: 'Discover Financial Services',
    country: 'Estados Unidos',
    countryCode: 'US',
    currency: 'USD',
    miiDescription: '6 - Comércio e Finanças',
  }
};

export function lookupBin(cardNumber: string): BinInfo {
  const digits = cardNumber.replace(/\D/g, '');
  const bin6 = digits.slice(0, 6);
  
  if (KNOWN_BINS[bin6]) {
    return KNOWN_BINS[bin6];
  }

  // Derive general ISO 7812 information from first digit
  const firstDigit = digits.charAt(0);
  let mii = 'Desconhecido';
  if (firstDigit === '1' || firstDigit === '2') mii = `${firstDigit} - Companhias Aéreas`;
  else if (firstDigit === '3') mii = '3 - Viagens, Companhias Aéreas e Entretenimento (Amex, Diners, JCB)';
  else if (firstDigit === '4') mii = '4 - Bancos e Instituições Financeiras (Visa)';
  else if (firstDigit === '5') mii = '5 - Bancos e Instituições Financeiras (Mastercard, Elo)';
  else if (firstDigit === '6') mii = '6 - Comércio e Instituições Financeiras (Discover, Elo, Hipercard)';
  else if (firstDigit === '7') mii = '7 - Indústria do Petróleo';
  else if (firstDigit === '8') mii = '8 - Cuidados de Saúde e Telecomunicações';
  else if (firstDigit === '9') mii = '9 - Atribuição por Órgãos Nacionais de Padronização';

  let brand = 'Bandeira Desconhecida';
  if (firstDigit === '4') brand = 'Visa Network';
  else if (firstDigit === '5') brand = 'Mastercard Network';
  else if (firstDigit === '3') brand = 'American Express / Diners';
  else if (firstDigit === '6') brand = 'Discover / Redes Nacionais';

  return {
    bin: bin6 || 'N/A',
    brand,
    type: 'Crédito',
    level: 'Standard',
    bank: 'Emissor Não Catalogado / Simulação Genérica',
    country: 'Internacional',
    countryCode: 'INT',
    currency: 'USD / BRL',
    miiDescription: mii,
  };
}
