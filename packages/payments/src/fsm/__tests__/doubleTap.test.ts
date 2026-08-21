import { transition, INITIAL_STATE } from '../paymentMachine';
import type { PaymentState } from '../paymentMachine.types';

const READY_STATE: PaymentState = {
  status: 'READY_TO_PAY',
  intent: {
    id: 'pi_123',
    merchant: { id: 'm_45', displayName: 'Café Central' },
    amount: 12500,
    currency: 'CLP',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    status: 'READY',
    version: 3,
  },
  idempotencyKey: 'idem_test_abc',
  correlationId: 'corr_test_001',
};

describe('FSM — Double Tap Prevention', () => {
  it('first CONFIRM transitions READY_TO_PAY → PROCESSING', () => {
    const next = transition(READY_STATE, { type: 'CONFIRM' });
    expect(next.status).toBe('PROCESSING');
  });

  it('second CONFIRM on PROCESSING state is silently discarded', () => {
    const processing = transition(READY_STATE, { type: 'CONFIRM' });
    expect(processing.status).toBe('PROCESSING');

    // Simular doble toque: enviar CONFIRM nuevamente mientras está en PROCESSING
    const stillProcessing = transition(processing, { type: 'CONFIRM' });
    expect(stillProcessing.status).toBe('PROCESSING');
    expect(stillProcessing).toBe(processing); // misma referencia; no se crea una nueva instancia
  });

  it('CONFIRM is discarded in all non-READY_TO_PAY states', () => {
    const terminalStates: PaymentState[] = [
      { status: 'LOADING' },
      { status: 'PROCESSING', intent: READY_STATE.intent, idempotencyKey: 'x', correlationId: 'y' },
      { status: 'APPROVED', paymentId: 'pay_1', correlationId: 'y' },
      { status: 'REJECTED', reason: 'UNKNOWN', correlationId: 'y' },
      { status: 'EXPIRED', correlationId: 'y' },
      { status: 'PENDING', idempotencyKey: 'x', correlationId: 'y', reconcileAttempts: 0 },
    ];

    for (const s of terminalStates) {
      const next = transition(s, { type: 'CONFIRM' });
      expect(next).toBe(s);
    }
  });
});

describe('FSM — Initial State', () => {
  it('starts in LOADING', () => {
    expect(INITIAL_STATE.status).toBe('LOADING');
  });
});
