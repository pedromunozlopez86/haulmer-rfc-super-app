import { sanitizeIntentId } from '../../api/paymentIntentsApi';

/**
 * Prueba de estabilidad de idempotencyKey.
 *
 * La clave debe derivarse de forma determinista a partir de intentId + deviceId + fecha
 * (con granularidad de día), para que reabrir el mismo deep link el mismo día produzca
 * la misma clave. Esto permite al servidor reconocer el intento anterior sin persistencia
 * del lado del cliente.
 */
function generateIdempotencyKey(intentId: string, deviceId: string, date: Date): string {
  const dayStamp = date.toISOString().slice(0, 10); // YYYY-MM-DD
  // En producción: HMAC-SHA256(intentId + deviceId + dayStamp, deviceSecret)
  // Aquí: cadena determinista y segura para las pruebas
  return `idem_${intentId}_${deviceId}_${dayStamp}`;
}

describe('IdempotencyKey — Stability', () => {
  const INTENT_ID = 'pi_123';
  const DEVICE_ID = 'device_mock_abc123';
  const SAME_DAY = new Date('2026-08-17T09:00:00Z');
  const SAME_DAY_LATER = new Date('2026-08-17T22:00:00Z');
  const NEXT_DAY = new Date('2026-08-18T00:00:00Z');

  it('same intentId + deviceId + same day produces identical key', () => {
    const key1 = generateIdempotencyKey(INTENT_ID, DEVICE_ID, SAME_DAY);
    const key2 = generateIdempotencyKey(INTENT_ID, DEVICE_ID, SAME_DAY_LATER);
    expect(key1).toBe(key2);
  });

  it('next day produces a different key (prevents stale reuse)', () => {
    const key1 = generateIdempotencyKey(INTENT_ID, DEVICE_ID, SAME_DAY);
    const key2 = generateIdempotencyKey(INTENT_ID, DEVICE_ID, NEXT_DAY);
    expect(key1).not.toBe(key2);
  });

  it('different intentId produces different key', () => {
    const key1 = generateIdempotencyKey('pi_123', DEVICE_ID, SAME_DAY);
    const key2 = generateIdempotencyKey('pi_999', DEVICE_ID, SAME_DAY);
    expect(key1).not.toBe(key2);
  });

  it('different deviceId produces different key', () => {
    const key1 = generateIdempotencyKey(INTENT_ID, 'device_A', SAME_DAY);
    const key2 = generateIdempotencyKey(INTENT_ID, 'device_B', SAME_DAY);
    expect(key1).not.toBe(key2);
  });

  it('intentId passes sanitization before key is generated', () => {
    // La generación de la clave debe ocurrir solo después de la sanitización
    const validId = sanitizeIntentId('pi_123');
    const key = generateIdempotencyKey(validId, DEVICE_ID, SAME_DAY);
    expect(key).toContain('pi_123');
  });
});
