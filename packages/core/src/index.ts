export { httpClient, HttpError, NetworkTimeoutError, createUuid } from './network/HttpClient';
export type { RequestOptions, HttpResponse } from './network/HttpClient';

export { MockBiometricAdapter, BiometricCancelledError, BiometricUnavailableError } from './security/BiometricAdapter';
export type { BiometricAdapter, StepUpProof } from './security/BiometricAdapter';

export { MockSecureStorage } from './security/SecureStorage';
export type { SecureStorage } from './security/SecureStorage';

export { logger } from './observability/logger';
