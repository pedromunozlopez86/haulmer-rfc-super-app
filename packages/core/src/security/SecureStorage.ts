/**
 * Abstracción sobre el almacenamiento seguro de la plataforma.
 *
 * iOS  → Keychain Services
 * Android → Keystore + EncryptedSharedPreferences
 *
 * AsyncStorage está explícitamente PROHIBIDO para cualquier dato de identidad o financiero.
 */
export interface SecureStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const MOCK_DEVICE_ID = 'device_mock_abc123';

/** Mock en memoria para la thin slice; no requiere puente nativo */
export class MockSecureStorage implements SecureStorage {
  private store: Map<string, string> = new Map([
    ['deviceId', MOCK_DEVICE_ID],
  ]);

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }
}
