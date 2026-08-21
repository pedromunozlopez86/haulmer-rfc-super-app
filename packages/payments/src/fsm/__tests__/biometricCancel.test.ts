import { MockBiometricAdapter, BiometricCancelledError } from '@haulmer/core';
import { transition } from '../paymentMachine';
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

describe('Biometric Step-Up', () => {
  it('successful biometric returns a signed proof (not a boolean)', async () => {
    const adapter = new MockBiometricAdapter(false);
    const proof = await adapter.requestStepUpProof('challenge_abc');

    expect(proof).toHaveProperty('token');
    expect(proof).toHaveProperty('algorithm', 'ES256');
    expect(proof).toHaveProperty('expiresAt');
    expect(typeof proof.token).toBe('string');
    expect(proof.token.length).toBeGreaterThan(0);
  });

  it('cancelling biometric throws BiometricCancelledError', async () => {
    const adapter = new MockBiometricAdapter(true);
    await expect(adapter.requestStepUpProof('challenge_abc')).rejects.toThrow(BiometricCancelledError);
  });

  it('returns to READY_TO_PAY after biometric cancellation without processing a payment', () => {
    const authenticating = transition(READY_STATE, { type: 'AUTHENTICATION_REQUESTED' });
    const next = transition(authenticating, { type: 'AUTHENTICATION_CANCELLED' });

    expect(authenticating.status).toBe('AUTHENTICATING');
    expect(next.status).toBe('READY_TO_PAY');
  });
});
