// API pública de @haulmer/payments.
// Solo exporta lo que necesitan consumir otros módulos o el App Host.
// El estado interno de la FSM, la capa de API y los subcomponentes de pantalla permanecen privados.

export { PaymentFlowScreen } from './screens/PaymentFlowScreen';
export type { PaymentState, PaymentStatus, PaymentIntent } from './fsm/paymentMachine.types';
