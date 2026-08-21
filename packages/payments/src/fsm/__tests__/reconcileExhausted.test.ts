import { reconcilePayment } from '../../api/reconcileApi';
import { transition } from '../paymentMachine';
import type { PaymentState } from '../paymentMachine.types';
import type { ReconcileResponse } from '../../api/reconcileApi';

describe('Reconciliation — Exhausted Attempts', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns resolved:false after 5 PROCESSING responses', async () => {
    const mockFetch = jest.fn<Promise<ReconcileResponse>, [string]>()
      .mockResolvedValue({ status: 'PROCESSING' });

    const promise = reconcilePayment('idem_test_abc', undefined, mockFetch);
    // Avanzar todos los temporizadores de backoff para completar el ciclo
    await jest.runAllTimersAsync();
    const outcome = await promise;

    expect(outcome.resolved).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(5);
  });

  it('RECONCILE_EXHAUSTED keeps FSM in PENDING (terminal, informative)', () => {
    const pending: PaymentState = {
      status: 'PENDING',
      idempotencyKey: 'idem_test_abc',
      correlationId: 'corr_test_001',
      reconcileAttempts: 5,
    };

    const after = transition(pending, { type: 'RECONCILE_EXHAUSTED' });

    expect(after.status).toBe('PENDING');
    // El objeto de estado es el mismo: no hay mutación ni error
    expect(after).toBe(pending);
  });

  it('onAttempt callback is invoked once per attempt', async () => {
    const mockFetch = jest.fn<Promise<ReconcileResponse>, [string]>()
      .mockResolvedValue({ status: 'PROCESSING' });

    const onAttempt = jest.fn();
    const promise = reconcilePayment('idem_test_abc', onAttempt, mockFetch);
    await jest.runAllTimersAsync();
    await promise;

    expect(onAttempt).toHaveBeenCalledTimes(5);
  });

  it('resolves immediately on first APPROVED response', async () => {
    const mockFetch = jest.fn<Promise<ReconcileResponse>, [string]>()
      .mockResolvedValueOnce({ status: 'APPROVED', paymentId: 'pay_fast' });

    const outcome = await reconcilePayment('idem_test_abc', undefined, mockFetch);

    expect(outcome.resolved).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
