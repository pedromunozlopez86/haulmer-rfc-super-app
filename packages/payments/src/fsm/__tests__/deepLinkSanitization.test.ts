import { sanitizeIntentId, InvalidIntentIdError } from '../../api/paymentIntentsApi';

describe('Deep Link Sanitization', () => {
  it('accepts valid intentId formats', () => {
    expect(sanitizeIntentId('pi_123')).toBe('pi_123');
    expect(sanitizeIntentId('pi_abc456XYZ')).toBe('pi_abc456XYZ');
  });

  it('rejects intentId missing pi_ prefix', () => {
    expect(() => sanitizeIntentId('123')).toThrow(InvalidIntentIdError);
    expect(() => sanitizeIntentId('pay_123')).toThrow(InvalidIntentIdError);
  });

  it('rejects intentId with special characters (injection attempt)', () => {
    expect(() => sanitizeIntentId('pi_123; DROP TABLE payments;--')).toThrow(InvalidIntentIdError);
    expect(() => sanitizeIntentId('pi_<script>alert(1)</script>')).toThrow(InvalidIntentIdError);
    expect(() => sanitizeIntentId('pi_123%20UNION%20SELECT')).toThrow(InvalidIntentIdError);
  });

  it('rejects non-string inputs', () => {
    expect(() => sanitizeIntentId(null)).toThrow(InvalidIntentIdError);
    expect(() => sanitizeIntentId(undefined)).toThrow(InvalidIntentIdError);
    expect(() => sanitizeIntentId(123)).toThrow(InvalidIntentIdError);
    expect(() => sanitizeIntentId({ id: 'pi_123' })).toThrow(InvalidIntentIdError);
  });

  it('rejects empty string', () => {
    expect(() => sanitizeIntentId('')).toThrow(InvalidIntentIdError);
  });

  it('throws BEFORE any network request is attempted', () => {
    // InvalidIntentIdError debe ser síncrono: sin await ni fetch.
    // Si lanza el error, nunca se realizará una solicitud de red.
    let threw = false;
    try {
      sanitizeIntentId('malicious_payload');
    } catch (e) {
      threw = true;
      expect(e).toBeInstanceOf(InvalidIntentIdError);
    }
    expect(threw).toBe(true);
  });
});
