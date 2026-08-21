// ⚠️ ARCHIVO INFERIDO — no me compartiste el paymentMachine.types.ts original.
// Reconstruí los tipos a partir del uso real en paymentMachine.ts (transition.ts)
// y de los fixes acordados. Antes de aplicar, haz merge campo por campo contra
// tu archivo real — lo más probable es que ya tengas la mayoría de esto y solo
// falten los dos cambios marcados como "FIX" abajo.

export interface PaymentIntent {
  id: string;
  merchant: { id: string; displayName: string };
  amount: number;
  currency: 'CLP';
  expiresAt: string;
  status: 'READY' | 'EXPIRED' | 'COMPLETED' | 'CANCELLED';
  version: number;
}

export type RejectionReason =
  | 'NETWORK_ERROR'
  | 'MERCHANT_CANCELLED'
  | 'INTENT_EXPIRED_SERVER_SIDE'
  | 'ALREADY_PROCESSED'
  | 'UNKNOWN';

// FIX: proof opaco firmado, no un boolean — ver RFC sección 4.5.
export type StepUpProof = { token: string; algorithm: 'ES256'; expiresAt: number };

export type PaymentState =
  | { status: 'LOADING' }
  | {
      status: 'READY_TO_PAY';
      intent: PaymentIntent;
      idempotencyKey: string;
      correlationId: string;
    }
  | {
      status: 'AUTHENTICATING';
      intent: PaymentIntent;
      idempotencyKey: string;
      correlationId: string;
    }
  | {
      status: 'PROCESSING';
      intent: PaymentIntent;
      idempotencyKey: string;
      correlationId: string;
      // FIX: el proof queda trazado dentro del estado, no solo en el POST —
      // así se puede auditar/loggear que la transición a PROCESSING nunca
      // ocurrió sin una prueba de step-up real.
      authProof: StepUpProof;
    }
  | {
      status: 'PENDING';
      idempotencyKey: string;
      correlationId: string;
      reconcileAttempts: number;
    }
  // FIX: estado terminal separado de PENDING — "agotó reintentos, necesita
  // intervención manual" ya no es indistinguible de "todavía reintentando".
  | {
      status: 'PENDING_UNRESOLVED';
      idempotencyKey: string;
      correlationId: string;
    }
  | { status: 'APPROVED'; paymentId: string; correlationId: string }
  | { status: 'REJECTED'; reason: RejectionReason; correlationId: string }
  | { status: 'EXPIRED'; correlationId: string };

export type PaymentEvent =
  | { type: 'INTENT_LOADED'; intent: PaymentIntent; idempotencyKey: string; correlationId: string }
  | { type: 'INTENT_INVALID'; correlationId: string }
  | { type: 'FETCH_ERROR'; correlationId: string }
  | { type: 'TIMER_EXPIRED' }
  | { type: 'AUTHENTICATION_REQUESTED' }
  | { type: 'AUTHENTICATION_CANCELLED' }
  // FIX (el cambio más importante): CONFIRM exige el authProof en su propio
  // tipo. Ya no es posible construir un evento CONFIRM sin haber pasado por
  // step-up real — la garantía deja de ser una convención de la UI y pasa a
  // ser una restricción de tipos.
  | { type: 'CONFIRM'; authProof: StepUpProof }
  | { type: 'CANCEL' }
  | { type: 'PAYMENT_SUCCESS'; paymentId: string }
  | { type: 'PAYMENT_REJECTED'; reason: RejectionReason }
  | { type: 'NETWORK_TIMEOUT' }
  | { type: 'RECONCILE_ATTEMPT' }
  // FIX: reason opcional para que RECONCILE_SUCCESS con resultado rechazado
  // no dependa de un 'UNKNOWN' forzado con `as` — ver RFC 4.2 / tabla de tests.
  | { type: 'RECONCILE_SUCCESS'; result: 'APPROVED' | 'REJECTED'; paymentId?: string; reason?: RejectionReason }
  | { type: 'RECONCILE_EXHAUSTED' };