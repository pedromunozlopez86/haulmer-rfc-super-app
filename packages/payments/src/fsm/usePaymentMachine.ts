import { useReducer, useCallback } from 'react';
import { transition, INITIAL_STATE } from './paymentMachine';
import type { PaymentState, PaymentEvent } from './paymentMachine.types';

interface UsePaymentMachine {
  state: PaymentState;
  dispatch: (event: PaymentEvent) => void;
  /** Selector auxiliar: solo es true cuando el botón de confirmación debe habilitarse */
  canConfirm: boolean;
}

export function usePaymentMachine(): UsePaymentMachine {
  const [state, dispatch] = useReducer(
    (s: PaymentState, e: PaymentEvent) => transition(s, e),
    INITIAL_STATE,
  );

  const stableDispatch = useCallback(dispatch, [dispatch]);

  const canConfirm = state.status === 'READY_TO_PAY';

  return { state, dispatch: stableDispatch, canConfirm };
}
