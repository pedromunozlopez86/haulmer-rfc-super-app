import { transition } from '../paymentMachine';
import type { PaymentState } from '../paymentMachine.types';

const PROCESSING_STATE: PaymentState = {
  status: 'PROCESSING',
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

describe('Optimistic Locking — VERSION_CONFLICT (HTTP 409)', () => {
  it('VERSION_CONFLICT rejection transitions PROCESSING → REJECTED', () => {
    const rejected = transition(PROCESSING_STATE, {
      type: 'PAYMENT_REJECTED',
      reason: 'VERSION_CONFLICT',
    });

    expect(rejected.status).toBe('REJECTED');
    if (rejected.status === 'REJECTED') {
      expect(rejected.reason).toBe('VERSION_CONFLICT');
    }
  });

  it('REJECTED is terminal — further CONFIRM events are absorbed', () => {
    const rejected: PaymentState = {
      status: 'REJECTED',
      reason: 'VERSION_CONFLICT',
      correlationId: 'corr_test_001',
    };

    const after = transition(rejected, { type: 'CONFIRM' });
    expect(after).toBe(rejected);
    expect(after.status).toBe('REJECTED');
  });

  it('correlationId is preserved through the rejection', () => {
    const rejected = transition(PROCESSING_STATE, {
      type: 'PAYMENT_REJECTED',
      reason: 'VERSION_CONFLICT',
    });

    if (rejected.status === 'REJECTED') {
      expect(rejected.correlationId).toBe('corr_test_001');
    }
  });
});
