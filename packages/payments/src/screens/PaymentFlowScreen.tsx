import React, { useEffect, useRef } from 'react';
import {
  BiometricCancelledError,
  BiometricUnavailableError,
  MockBiometricAdapter,
  MockSecureStorage,
  createUuid,
} from '@haulmer/core';
import type { BiometricAdapter, StepUpProof } from '@haulmer/core';
import { usePaymentMachine } from '../fsm/usePaymentMachine';
import { fetchPaymentIntent, sanitizeIntentId, InvalidIntentIdError } from '../api/paymentIntentsApi';
import { confirmPayment, PaymentRejectedError } from '../api/paymentsApi';
import { reconcilePayment } from '../api/reconcileApi';
import { NetworkTimeoutError } from '@haulmer/core';

import { PaymentLoadingScreen } from './PaymentLoadingScreen';
import { PaymentAuthenticationScreen } from './PaymentAuthenticationScreen';
import { PaymentConfirmScreen } from './PaymentConfirmScreen';
import { PaymentProcessingScreen } from './PaymentProcessingScreen';
import { PaymentApprovedScreen, PaymentRejectedScreen } from './PaymentResultScreen';
import { PaymentPendingScreen } from './PaymentPendingScreen';
import { PaymentExpiredScreen } from './PaymentExpiredScreen';

interface Props {
  /** Raw intentId from deep link — treated as untrusted input */
  rawIntentId: unknown;
  onDone: () => void;
  biometric?: BiometricAdapter;
}

const defaultBiometric = new MockBiometricAdapter();
const storage = new MockSecureStorage();

export function PaymentFlowScreen({ rawIntentId, onDone, biometric = defaultBiometric }: Props): React.JSX.Element {
  const { state, dispatch, canConfirm } = usePaymentMachine();

  // Generate stable idempotencyKey once, bound to intentId + device + day
  const idempotencyKeyRef = useRef<string | null>(null);
  const correlationIdRef = useRef<string>(createUuid());

  // ── Load payment intent on mount ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const intentId = sanitizeIntentId(rawIntentId);

        // Stable key derived from intentId + deviceId + calendar day (UTC)
        const deviceId = (await storage.getItem('deviceId')) ?? 'unknown';
        const dayStamp = new Date().toISOString().slice(0, 10);
        idempotencyKeyRef.current = `idem_${intentId}_${deviceId}_${dayStamp}`;

        const intent = await fetchPaymentIntent(intentId);

        if (cancelled) return;

        const isExpired =
          intent.status !== 'READY' || new Date(intent.expiresAt).getTime() < Date.now();

        if (isExpired) {
          dispatch({ type: 'INTENT_INVALID', correlationId: correlationIdRef.current });
        } else {
          dispatch({
            type: 'INTENT_LOADED',
            intent,
            idempotencyKey: idempotencyKeyRef.current,
            correlationId: correlationIdRef.current,
          });
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof InvalidIntentIdError) {
          dispatch({ type: 'INTENT_INVALID', correlationId: correlationIdRef.current });
        } else {
          dispatch({ type: 'FETCH_ERROR', correlationId: correlationIdRef.current });
        }
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reconciliation loop (only when PENDING) ──────────────────────────────────
  useEffect(() => {
    if (state.status !== 'PENDING') return;

    let cancelled = false;

    async function reconcile() {
      if (state.status !== 'PENDING') return;
      const key = state.idempotencyKey;

      const outcome = await reconcilePayment(
        key,
        () => { if (!cancelled) dispatch({ type: 'RECONCILE_ATTEMPT' }); },
      );

      if (cancelled) return;

      if (outcome.resolved) {
        dispatch({ type: 'RECONCILE_SUCCESS', result: outcome.result, paymentId: outcome.paymentId });
      } else {
        dispatch({ type: 'RECONCILE_EXHAUSTED' });
      }
    }

    void reconcile();
    return () => { cancelled = true; };
  }, [state.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Confirm handler ──────────────────────────────────────────────────────────
  async function handleConfirm() {
    if (state.status !== 'READY_TO_PAY') return; // guard — FSM is the real lock

    dispatch({ type: 'AUTHENTICATION_REQUESTED' });
  }

  async function handleAuthenticate() {
    if (state.status !== 'AUTHENTICATING') return;

    let deviceId: string;
    let proof: StepUpProof;

    try {
      deviceId = (await storage.getItem('deviceId')) ?? 'unknown';
      proof = await biometric.requestStepUpProof(correlationIdRef.current);
    } catch (err) {
      if (err instanceof BiometricCancelledError || err instanceof BiometricUnavailableError) {
        dispatch({ type: 'AUTHENTICATION_CANCELLED' });
      } else {
        dispatch({ type: 'AUTHENTICATION_CANCELLED' });
      }
      return;
    }

    // The payment request cannot begin until the step-up proof exists.
    dispatch({ type: 'CONFIRM' });

    try {
      const response = await confirmPayment({
        intentId: state.intent.id,
        expectedVersion: state.intent.version,
        idempotencyKey: state.idempotencyKey,
        deviceId,
        authProof: proof,
      });

      dispatch({ type: 'PAYMENT_SUCCESS', paymentId: response.paymentId });
    } catch (err) {
      if (err instanceof NetworkTimeoutError) {
        dispatch({ type: 'NETWORK_TIMEOUT' });
      } else if (err instanceof PaymentRejectedError) {
        dispatch({ type: 'PAYMENT_REJECTED', reason: err.reason });
      } else {
        dispatch({ type: 'PAYMENT_REJECTED', reason: 'UNKNOWN' });
      }
    }
  }

  function handleAuthenticationCancel() {
    if (state.status === 'AUTHENTICATING') {
      dispatch({ type: 'AUTHENTICATION_CANCELLED' });
    }
  }

  // ── Render based on FSM state ─────────────────────────────────────────────────
  switch (state.status) {
    case 'LOADING':
      return <PaymentLoadingScreen />;

    case 'READY_TO_PAY':
      return (
        <PaymentConfirmScreen
          intent={state.intent}
          canConfirm={canConfirm}
          onConfirm={() => void handleConfirm()}
          onCancel={onDone}
        />
      );

    case 'AUTHENTICATING':
      return (
        <PaymentAuthenticationScreen
          onAuthenticate={handleAuthenticate}
          onCancel={handleAuthenticationCancel}
        />
      );

    case 'PROCESSING':
      return <PaymentProcessingScreen />;

    case 'APPROVED':
      return <PaymentApprovedScreen paymentId={state.paymentId} onDone={onDone} />;

    case 'REJECTED':
      return <PaymentRejectedScreen reason={state.reason} onDone={onDone} />;

    case 'PENDING':
      return <PaymentPendingScreen />;

    case 'EXPIRED':
      return <PaymentExpiredScreen onDone={onDone} />;
  }
}
