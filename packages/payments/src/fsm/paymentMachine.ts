import type { PaymentState, PaymentEvent } from './paymentMachine.types';

export const INITIAL_STATE: PaymentState = { status: 'LOADING' };

/**
 * Función pura de transición de estados.
 *
 * Reglas estrictas principales:
 * - CONFIRM solo se procesa desde AUTHENTICATING, y el propio tipo del evento
 *   exige un authProof firmado — no es posible confirmar un pago sin haber
 *   pasado por step-up real, ni por convención de UI ni por bug de reducer.
 *   (FIX 2026-08: antes CONFIRM también era válido desde READY_TO_PAY con el
 *   mismo resultado que desde AUTHENTICATING, lo cual permitía saltarse la
 *   autenticación por completo. Ver nota de corrección en el RFC, sección 4.1.)
 * - PENDING es el único estado que acepta eventos RECONCILE_*.
 * - RECONCILE_EXHAUSTED transiciona a PENDING_UNRESOLVED, no a un self-loop
 *   en PENDING — son situaciones distintas para telemetría y para la UI.
 * - Los estados terminales (APPROVED, REJECTED, EXPIRED, PENDING_UNRESOLVED)
 *   ignoran todos los eventos.
 */
export function transition(state: PaymentState, event: PaymentEvent): PaymentState {
  switch (state.status) {

    case 'LOADING':
      switch (event.type) {
        case 'INTENT_LOADED':
          return {
            status: 'READY_TO_PAY',
            intent: event.intent,
            idempotencyKey: event.idempotencyKey,
            correlationId: event.correlationId,
          };
        case 'INTENT_INVALID':
          return { status: 'EXPIRED', correlationId: event.correlationId };
        case 'FETCH_ERROR':
          return { status: 'REJECTED', reason: 'NETWORK_ERROR', correlationId: event.correlationId };
        default:
          return state;
      }

    case 'READY_TO_PAY':
      switch (event.type) {
        case 'TIMER_EXPIRED':
          return { status: 'EXPIRED', correlationId: state.correlationId };
        case 'AUTHENTICATION_REQUESTED':
          return {
            status: 'AUTHENTICATING',
            intent: state.intent,
            idempotencyKey: state.idempotencyKey,
            correlationId: state.correlationId,
          };
        case 'CANCEL':
          // La navegación hacia atrás la gestiona la capa de pantalla; la FSM permanece consistente.
          return state;
        // FIX: CONFIRM ya NO se maneja aquí. Antes existía una rama idéntica a
        // la de AUTHENTICATING que permitía saltar directo a PROCESSING sin
        // step-up. Ahora cae al default y se descarta sin efecto — el único
        // camino válido hacia PROCESSING es AUTHENTICATING -> CONFIRM.
        default:
          return state;
      }

    case 'AUTHENTICATING':
      switch (event.type) {
        case 'AUTHENTICATION_CANCELLED':
          return {
            status: 'READY_TO_PAY',
            intent: state.intent,
            idempotencyKey: state.idempotencyKey,
            correlationId: state.correlationId,
          };
        case 'TIMER_EXPIRED':
          return { status: 'EXPIRED', correlationId: state.correlationId };
        case 'CONFIRM':
          // Único punto de entrada válido a PROCESSING. event.authProof es
          // obligatorio a nivel de tipo (ver PaymentEvent) — no existe forma
          // de construir este evento sin una prueba de step-up real.
          return {
            status: 'PROCESSING',
            intent: state.intent,
            idempotencyKey: state.idempotencyKey,
            correlationId: state.correlationId,
            authProof: event.authProof,
          };
        default:
          return state;
      }

    case 'PROCESSING':
      switch (event.type) {
        case 'PAYMENT_SUCCESS':
          return { status: 'APPROVED', paymentId: event.paymentId, correlationId: state.correlationId };
        case 'PAYMENT_REJECTED':
          return { status: 'REJECTED', reason: event.reason, correlationId: state.correlationId };
        case 'NETWORK_TIMEOUT':
          // La red falló después de enviar el POST; no sabemos si el servidor lo procesó.
          // Transicionar a PENDING e iniciar las consultas de reconciliación.
          return {
            status: 'PENDING',
            idempotencyKey: state.idempotencyKey,
            correlationId: state.correlationId,
            reconcileAttempts: 0,
          };
        default:
          return state;
      }

    case 'PENDING':
      switch (event.type) {
        case 'RECONCILE_ATTEMPT':
          return { ...state, reconcileAttempts: state.reconcileAttempts + 1 };
        case 'RECONCILE_SUCCESS':
          if (event.result === 'APPROVED') {
            return {
              status: 'APPROVED',
              paymentId: event.paymentId ?? 'reconciled',
              correlationId: state.correlationId,
            };
          }
          // FIX: se propaga el reason del evento en vez de forzar 'UNKNOWN'
          // con un `as`. El fallback sigue existiendo para cuando el backend
          // de verdad no lo manda (gap de contrato documentado en el RFC).
          return {
            status: 'REJECTED',
            reason: event.reason ?? 'UNKNOWN',
            correlationId: state.correlationId,
          };
        case 'RECONCILE_EXHAUSTED':
          // FIX: antes retornaba `state` sin cambios (self-loop PENDING ->
          // PENDING). Ahora transiciona a un estado terminal explícito y
          // distinguible de "todavía reintentando".
          return {
            status: 'PENDING_UNRESOLVED',
            idempotencyKey: state.idempotencyKey,
            correlationId: state.correlationId,
          };
        default:
          return state;
      }

    // Estados terminales: absorben todos los eventos
    case 'APPROVED':
    case 'REJECTED':
    case 'EXPIRED':
    case 'PENDING_UNRESOLVED':
      return state;
  }
}