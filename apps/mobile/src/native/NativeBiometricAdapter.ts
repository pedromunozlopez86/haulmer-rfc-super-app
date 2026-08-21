import ReactNativeBiometrics from 'react-native-biometrics';
import {
  BiometricCancelledError,
  BiometricUnavailableError,
  type BiometricAdapter,
  type StepUpProof,
} from '@haulmer/core';

const biometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

export class NativeBiometricAdapter implements BiometricAdapter {
  async requestStepUpProof(challenge: string): Promise<StepUpProof> {
    const sensor = await biometrics.isSensorAvailable();

    if (!sensor.available) {
      throw new BiometricUnavailableError(sensor.error ?? 'No biometric sensor is available');
    }

    const keys = await biometrics.biometricKeysExist();
    if (!keys.keysExist) {
      await biometrics.createKeys();
    }

    const result = await biometrics.createSignature({
      promptMessage: 'Autoriza este pago en Haulmer',
      cancelButtonText: 'Cancelar',
      payload: challenge,
    });

    if (!result.success || !result.signature) {
      throw new BiometricCancelledError();
    }

    return {
      token: result.signature,
      algorithm: 'RS256',
      expiresAt: Date.now() + 60_000,
    };
  }
}