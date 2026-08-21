export type ReconcileStatus = 'APPROVED' | 'REJECTED' | 'PROCESSING';

export interface ReconcileResponse {
  status: ReconcileStatus;
  paymentId?: string;
}

const MAX_ATTEMPTS = 5;
const BACKOFF_MS = [1000, 2000, 4000, 8000, 16000];

/** GET /v1/payments/by-idempotency-key/{key} */
async function fetchReconcileResult(idempotencyKey: string): Promise<ReconcileResponse> {
  // Mock: después de 2 intentos, devuelve APPROVED.
  // En las pruebas, esta función se reemplaza mediante inyección de dependencias.
  void idempotencyKey;
  return { status: 'APPROVED', paymentId: `pay_reconciled_${Date.now()}` };
}

export type ReconcileOutcome =
  | { resolved: true; result: 'APPROVED' | 'REJECTED'; paymentId?: string }
  | { resolved: false };

/**
 * Consulta por idempotency-key hasta obtener un resultado definitivo o agotar los intentos.
 *
 * Regla estricta de seguridad: esta función SOLO ejecuta solicitudes GET.
 * Nunca se emite un segundo POST /v1/payments durante la reconciliación.
 */
export async function reconcilePayment(
  idempotencyKey: string,
  onAttempt?: () => void,
  _fetchFn: (key: string) => Promise<ReconcileResponse> = fetchReconcileResult,
): Promise<ReconcileOutcome> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    onAttempt?.();

    const result = await _fetchFn(idempotencyKey);

    if (result.status === 'APPROVED' || result.status === 'REJECTED') {
      return { resolved: true, result: result.status, paymentId: result.paymentId };
    }

    if (i < MAX_ATTEMPTS - 1) {
      await delay(BACKOFF_MS[i]);
    }
  }

  return { resolved: false };
}

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
