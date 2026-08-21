import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { RejectionReason } from '../fsm/paymentMachine.types';

interface ApprovedProps {
  paymentId: string;
  onDone: () => void;
}

interface RejectedProps {
  reason: RejectionReason;
  onDone: () => void;
}

export function PaymentApprovedScreen({ paymentId, onDone }: ApprovedProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✅</Text>
      <Text style={styles.title}>Pago aprobado</Text>
      <Text style={styles.subtitle} accessibilityLabel={`Número de transacción: ${paymentId}`}>
        N° transacción: {paymentId}
      </Text>
      <TouchableOpacity style={styles.doneButton} onPress={onDone} accessibilityRole="button">
        <Text style={styles.doneButtonText}>Listo</Text>
      </TouchableOpacity>
    </View>
  );
}

const REJECTION_MESSAGES: Record<RejectionReason, string> = {
  INSUFFICIENT_FUNDS: 'Saldo insuficiente para completar el pago.',
  INTENT_EXPIRED: 'La solicitud de pago ha expirado.',
  VERSION_CONFLICT: 'Esta solicitud ya fue procesada.',
  NETWORK_ERROR: 'Error de red. Verifica tu historial de transacciones.',
  UNKNOWN: 'El pago no pudo completarse. Verifica tu historial.',
};

export function PaymentRejectedScreen({ reason, onDone }: RejectedProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>❌</Text>
      <Text style={styles.title}>Pago rechazado</Text>
      <Text style={styles.subtitle}>{REJECTION_MESSAGES[reason]}</Text>
      <TouchableOpacity style={[styles.doneButton, styles.rejectedButton]} onPress={onDone} accessibilityRole="button">
        <Text style={styles.doneButtonText}>Entendido</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA', padding: 32 },
  icon: { fontSize: 64 },
  title: { marginTop: 16, fontSize: 24, fontWeight: '800', color: '#111827' },
  subtitle: { marginTop: 8, fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  doneButton: {
    marginTop: 32,
    backgroundColor: '#0057FF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
  },
  rejectedButton: { backgroundColor: '#EF4444' },
  doneButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
