import type { PaymentIntent } from '../fsm/paymentMachine.types';
import { mockConfig, MOCK_INTENT } from './mockHandlers';

export class InvalidIntentIdError extends Error {
  constructor(id: string) {
    super(`intentId "${id}" failed validation — must match /^pi_[a-zA-Z0-9]+$/`);
    this.name = 'InvalidIntentIdError';
  }
}

const INTENT_ID_PATTERN = /^pi_[a-zA-Z0-9]+$/;

/**
 * Valida y sanitiza el intentId proveniente del deep link.
 *
 * Los datos del deep link NO SON CONFIABLES; solo se acepta el ID.
 * Todos los datos autoritativos (monto, comercio, expiración) provienen del servidor.
 */
export function sanitizeIntentId(raw: unknown): string {
  if (typeof raw !== 'string' || !INTENT_ID_PATTERN.test(raw)) {
    throw new InvalidIntentIdError(String(raw));
  }
  return raw;
}

/** GET /v1/payment-intents/{intentId} */
export async function fetchPaymentIntent(intentId: string): Promise<PaymentIntent> {
  // Validar antes de cualquier llamada al backend; el deep link puede ser manipulado por un atacante
  sanitizeIntentId(intentId);

  await delay(mockConfig.delayMs);

  return {
    ...MOCK_INTENT,
    id: intentId,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };
}

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
