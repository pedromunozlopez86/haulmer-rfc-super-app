import type { StepUpProof } from '@haulmer/core';
import type { RejectionReason } from '../fsm/paymentMachine.types';
import { mockConfig } from './mockHandlers';
import { NetworkTimeoutError } from '@haulmer/core';

export interface ConfirmPaymentRequest {
  intentId: string;
  expectedVersion: number;
  idempotencyKey: string;
  deviceId: string;
  authProof: StepUpProof;
}

export interface ConfirmPaymentResponse {
  paymentId: string;
  status: 'APPROVED';
}

export class PaymentRejectedError extends Error {
  constructor(public readonly reason: RejectionReason) {
    super(`Payment rejected: ${reason}`);
    this.name = 'PaymentRejectedError';
  }
}

/** POST /v1/payments */
export async function confirmPayment(_req: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> {
  await delay(mockConfig.delayMs);

  switch (mockConfig.scenario) {
    case 'TIMEOUT':
      throw new NetworkTimeoutError('mock-correlation-id');
    case 'REJECTED':
      throw new PaymentRejectedError('INSUFFICIENT_FUNDS');
    case 'VERSION_CONFLICT':
      throw new PaymentRejectedError('VERSION_CONFLICT');
    case 'APPROVED':
    default:
      return { paymentId: `pay_${Date.now()}`, status: 'APPROVED' };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
