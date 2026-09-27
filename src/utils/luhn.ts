import { CardBrand, LuhnResult, LuhnStep } from '../types';

export function detectCardBrand(cardNumber: string): CardBrand {
  const clean = cardNumber.replace(/\D/g, '');
  if (!clean) return 'unknown';

  // Elo (Brazil)
  if (/^(401178|401179|431274|438935|451416|457393|457631|457632|504175|627780|636297|636368|(506699|5067[0-6]\d|50677[0-8])|(509\d{3})|(65003[1-3]|6500[3-5]\d|6504[8-9]\d|6505[0-3]\d)|(6505[4-9]\d|6509[0-7]\d)|(6516[5-7]\d)|(6550[0-5]\d))/i.test(clean)) {
    return 'elo';
  }

  // Hipercard (Brazil)
  if (/^(606282\d{10}(\d{3})?)|(3841(0|4|6)0\d{10})/i.test(clean)) {
    return 'hipercard';
  }

  // Visa
  if (/^4\d{12}(\d{3})?(\d{3})?$/.test(clean)) {
    return 'visa';
  }

  // Mastercard
  if (/^(5[1-5]\d{4}|222[1-9]\d{2}|22[3-9]\d{3}|2[3-6]\d{4}|27[01]\d{3}|2720\d{2})\d{10}$/.test(clean)) {
    return 'mastercard';
  }

  // Amex
  if (/^3[47]\d{13}$/.test(clean)) {
    return 'amex';
  }

  // Discover
  if (/^6(?:011|5[0-9]{2}|4[4-9][0-9])\d{12}$/.test(clean)) {
    return 'discover';
  }

  // Diners Club
  if (/^3(?:0[0-5]|[68][0-9])\d{11}$/.test(clean)) {
    return 'diners';
  }

  // Partial match prefix identification
  if (clean.startsWith('4')) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
  if (/^3[47]/.test(clean)) return 'amex';
  if (/^(6011|65|64[4-9])/.test(clean)) return 'discover';
  if (/^3(0[0-5]|[68])/.test(clean)) return 'diners';

  return 'unknown';
}

export function formatCardNumber(value: string, brand: CardBrand = 'unknown'): string {
  const digits = value.replace(/\D/g, '');
  if (brand === 'amex') {
    // 4-6-5
    const parts = [
      digits.slice(0, 4),
      digits.slice(4, 10),
      digits.slice(10, 15),
    ].filter(Boolean);
    return parts.join(' ');
  }
  // 4-4-4-4
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(' ') : digits;
}

export function calculateLuhn(cardNumber: string): LuhnResult {
  const clean = cardNumber.replace(/\D/g, '');
  if (!clean) {
    return {
      isValid: false,
      steps: [],
      sum: 0,
      checkDigit: 0,
      calculatedCheckDigit: 0,
    };
  }

  const digits = clean.split('').map(Number);
  const steps: LuhnStep[] = [];
  let sum = 0;

  // Process from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    const digit = digits[i];
    const posFromRight = digits.length - i;
    // In standard Luhn, every second digit from right (pos 2, 4, 6...) is multiplied by 2
    const isDoubled = posFromRight % 2 === 0;
    const doubledValue = isDoubled ? digit * 2 : digit;
    const processedValue = doubledValue > 9 ? doubledValue - 9 : doubledValue;

    sum += processedValue;

    steps.unshift({
      digit,
      positionFromRight: posFromRight,
      isDoubled,
      doubledValue,
      processedValue,
    });
  }

  const checkDigit = digits[digits.length - 1];

  // Calculate what the check digit should be if we exclude the last digit
  const payloadDigits = digits.slice(0, -1);
  let payloadSum = 0;
  for (let i = payloadDigits.length - 1; i >= 0; i--) {
    const d = payloadDigits[i];
    const pos = payloadDigits.length - i;
    const isD = pos % 2 !== 0; // because excluding check digit shifts parity
    const val = isD ? d * 2 : d;
    payloadSum += val > 9 ? val - 9 : val;
  }
  const calculatedCheckDigit = (10 - (payloadSum % 10)) % 10;

  return {
    isValid: clean.length >= 12 && sum % 10 === 0,
    steps,
    sum,
    checkDigit,
    calculatedCheckDigit,
  };
}

export function generateLuhnSyntheticNumber(prefix: string, totalLength: number): string {
  let num = prefix.replace(/\D/g, '');
  while (num.length < totalLength - 1) {
    num += Math.floor(Math.random() * 10).toString();
  }

  // Calculate check digit
  const digits = num.split('').map(Number);
  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    const d = digits[i];
    const pos = digits.length - i;
    const isDoubled = pos % 2 !== 0;
    const val = isDoubled ? d * 2 : d;
    sum += val > 9 ? val - 9 : val;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return num + checkDigit.toString();
}
