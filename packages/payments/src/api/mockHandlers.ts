import type { PaymentIntent } from '../fsm/paymentMachine.types';

export type MockScenario = 'APPROVED' | 'REJECTED' | 'TIMEOUT' | 'VERSION_CONFLICT';

interface MockConfig {
  scenario: MockScenario;
  delayMs: number;
  expiresInMs: number; // relativo al momento actual
}

/** Estado configurable del mock; cámbialo para probar distintos escenarios */
export const mockConfig: MockConfig = {
  scenario: 'APPROVED',
  delayMs: 1200,
  expiresInMs: 5 * 60 * 1000, // 5 minutos
};

export const MOCK_INTENT: PaymentIntent = {
  id: 'pi_123',
  merchant: { id: 'm_45', displayName: 'Café Central' },
  amount: 12500,
  currency: 'CLP',
  expiresAt: new Date(Date.now() + mockConfig.expiresInMs).toISOString(),
  status: 'READY',
  version: 3,
};
