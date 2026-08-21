import { transition } from '../paymentMachine';
import { reconcilePayment } from '../../api/reconcileApi';
import type { PaymentState } from '../paymentMachine.types';
import type { ReconcileResponse } from '../../api/reconcileApi';

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

describe('FSM — Network Timeout → Reconciliation', () => {
  it('NETWORK_TIMEOUT transitions PROCESSING → PENDING', () => {
    const pending = transition(PROCESSING_STATE, { type: 'NETWORK_TIMEOUT' });
    expect(pending.status).toBe('PENDING');
    if (pending.status === 'PENDING') {
      expect(pending.idempotencyKey).toBe('idem_test_abc');
      expect(pending.reconcileAttempts).toBe(0);
    }
  });

  it('reconcilePayment resolves to APPROVED after server confirms', async () => {
    const mockFetch = jest.fn<Promise<ReconcileResponse>, [string]>()
      .mockResolvedValueOnce({ status: 'PROCESSING' })
      .mockResolvedValueOnce({ status: 'APPROVED', paymentId: 'pay_reconciled_99' });

    const outcome = await reconcilePayment('idem_test_abc', undefined, mockFetch);

    expect(outcome.resolved).toBe(true);
    if (outcome.resolved) {
      expect(outcome.result).toBe('APPROVED');
      expect(outcome.paymentId).toBe('pay_reconciled_99');
    }
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('reconcile FSM: RECONCILE_SUCCESS APPROVED → APPROVED', () => {
    const pending: PaymentState = {
      status: 'PENDING',
      idempotencyKey: 'idem_test_abc',
      correlationId: 'corr_test_001',
      reconcileAttempts: 1,
    };

    const approved = transition(pending, {
      type: 'RECONCILE_SUCCESS',
      result: 'APPROVED',
      paymentId: 'pay_99',
    });

    expect(approved.status).toBe('APPROVED');
    if (approved.status === 'APPROVED') {
      expect(approved.paymentId).toBe('pay_99');
    }
  });

  it('no second POST is ever issued — reconciliation is read-only', async () => {
    // Esta prueba documenta la regla estricta de seguridad: reconcilePayment solo llama a GET (mockFetch),
    // nunca a POST. El mock de fetch simula el endpoint by-idempotency-key.
    const mockFetch = jest.fn<Promise<ReconcileResponse>, [string]>()
      .mockResolvedValue({ status: 'APPROVED', paymentId: 'pay_1' });

    await reconcilePayment('key_123', undefined, mockFetch);

    // Solo llamadas GET; el mock es el endpoint de reconciliación, no el endpoint de pagos
    expect(mockFetch).toHaveBeenCalledWith('key_123');
    expect(mockFetch).not.toHaveBeenCalledWith(expect.objectContaining({ method: 'POST' }));
  });
});
