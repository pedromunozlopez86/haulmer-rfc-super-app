import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { PaymentIntent } from '../fsm/paymentMachine.types';

interface Props {
  intent: PaymentIntent;
  canConfirm: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PaymentConfirmScreen({ intent, canConfirm, onConfirm, onCancel }: Props): React.JSX.Element {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const ms = new Date(intent.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(ms / 1000));
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, []);

  const formattedAmount = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: intent.currency,
    minimumFractionDigits: 0,
  }).format(intent.amount);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  const isExpired = secondsLeft === 0;

  return (
    <View style={styles.container}>
      {/* Merchant */}
      <View style={styles.card}>
        <Text style={styles.label}>Comercio</Text>
        <Text style={styles.merchantName} accessibilityLabel={`Comercio: ${intent.merchant.displayName}`}>
          {intent.merchant.displayName}
        </Text>

        {/* Amount — no logs, no screenshots of this value (FLAG_SECURE handled natively) */}
        <Text style={styles.label}>Monto a pagar</Text>
        <Text style={styles.amount} accessibilityLabel={`Monto: ${formattedAmount}`}>
          {formattedAmount}
        </Text>

        {/* Expiry countdown */}
        <Text style={[styles.countdown, isExpired && styles.countdownExpired]}>
          {isExpired
            ? 'Esta solicitud de pago ha expirado'
            : `Expira en ${minutes}:${seconds}`}
        </Text>
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={[styles.confirmButton, (!canConfirm || isExpired) && styles.buttonDisabled]}
        onPress={onConfirm}
        disabled={!canConfirm || isExpired}
        accessibilityRole="button"
        accessibilityLabel="Confirmar pago"
        accessibilityState={{ disabled: !canConfirm || isExpired }}
      >
        <Text style={styles.confirmButtonText}>Confirmar pago</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Cancelar"
      >
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F7FA', justifyContent: 'space-between' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  label: { fontSize: 12, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  merchantName: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 12 },
  amount: { fontSize: 36, fontWeight: '800', color: '#0057FF' },
  countdown: { fontSize: 14, color: '#6B7280', marginTop: 16 },
  countdownExpired: { color: '#EF4444', fontWeight: '600' },
  confirmButton: {
    backgroundColor: '#0057FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#D1D5DB' },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  cancelButton: { alignItems: 'center', paddingVertical: 12 },
  cancelButtonText: { color: '#6B7280', fontSize: 16 },
});
