import { transition } from '../paymentMachine';
import type { PaymentState } from '../paymentMachine.types';

const INTENT_FUTURE = new Date(Date.now() + 60_000).toISOString();

const readyState = (expiresAt: string): PaymentState => ({
  status: 'READY_TO_PAY',
  intent: {
    id: 'pi_123',
    merchant: { id: 'm_45', displayName: 'Café Central' },
    amount: 12500,
    currency: 'CLP',
    expiresAt,
    status: 'READY',
    version: 3,
  },
  idempotencyKey: 'idem_test_abc',
  correlationId: 'corr_test_001',
});

describe('FSM — Expiration', () => {
  it('TIMER_EXPIRED transitions READY_TO_PAY → EXPIRED', () => {
    const expired = transition(readyState(INTENT_FUTURE), { type: 'TIMER_EXPIRED' });
    expect(expired.status).toBe('EXPIRED');
  });

  it('CONFIRM is rejected after TIMER_EXPIRED', () => {
    const expired = transition(readyState(INTENT_FUTURE), { type: 'TIMER_EXPIRED' });
    const attempted = transition(expired, { type: 'CONFIRM' });
    expect(attempted.status).toBe('EXPIRED'); // permanece en EXPIRED, sin transición
  });

  it('INTENT_INVALID during LOADING (expiresAt in past) → EXPIRED', () => {
    const loading: PaymentState = { status: 'LOADING' };
    const expired = transition(loading, { type: 'INTENT_INVALID', correlationId: 'corr_x' });
    expect(expired.status).toBe('EXPIRED');
  });

  it('EXPIRED is a terminal state — all events are absorbed', () => {
    const expired: PaymentState = { status: 'EXPIRED', correlationId: 'corr_x' };
    const events = [
      { type: 'CONFIRM' as const },
      { type: 'CANCEL' as const },
      { type: 'TIMER_EXPIRED' as const },
    ];
    for (const e of events) {
      expect(transition(expired, e)).toBe(expired);
    }
  });
});
