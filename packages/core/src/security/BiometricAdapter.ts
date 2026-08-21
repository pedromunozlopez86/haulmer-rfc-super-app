export type StepUpProof = {
  token: string;
  algorithm: 'ES256' | 'RS256';
  expiresAt: number; // marca de tiempo Unix en ms
};

export class BiometricCancelledError extends Error {
  constructor() {
    super('Step-up authentication was cancelled by the user');
    this.name = 'BiometricCancelledError';
  }
}

export class BiometricUnavailableError extends Error {
  constructor(reason: string) {
    super(`Biometric unavailable: ${reason}`);
    this.name = 'BiometricUnavailableError';
  }
}

/**
 * Abstracción sobre la autenticación nativa mediante biometría/PIN.
 *
 * Devuelve una prueba firmada opaca, nunca un booleano simple.
 * Un booleano puede manipularse en memoria; una prueba firmada
 * requiere la clave privada almacenada en el enclave seguro del hardware.
 */
export interface BiometricAdapter {
  requestStepUpProof(challenge: string): Promise<StepUpProof>;
}

const MOCK_DELAY_MS = 800;

/** Adapter simulado para la thin slice; no requiere puente nativo */
export class MockBiometricAdapter implements BiometricAdapter {
  constructor(private readonly shouldCancel = false) {}

  async requestStepUpProof(challenge: string): Promise<StepUpProof> {
    await delay(MOCK_DELAY_MS);

    if (this.shouldCancel) {
      throw new BiometricCancelledError();
    }

    return {
      token: `mock_es256_proof.${challenge}.${Date.now()}`,
      algorithm: 'ES256',
      expiresAt: Date.now() + 60_000,
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
