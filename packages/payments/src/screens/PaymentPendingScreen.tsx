import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function PaymentPendingScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⏳</Text>
      <Text style={styles.title}>Resultado desconocido</Text>
      <Text style={styles.body}>
        Tu pago está siendo procesado. Verifica tu historial de transacciones en unos minutos.
      </Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Si se descontó el monto de tu cuenta, el pago fue exitoso.{'\n'}
          Si tienes dudas, contacta soporte con tu número de correlación.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA', padding: 32 },
  icon: { fontSize: 64 },
  title: { marginTop: 16, fontSize: 22, fontWeight: '700', color: '#111827' },
  body: { marginTop: 12, fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  infoBox: {
    marginTop: 24,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
  },
  infoText: { fontSize: 13, color: '#92400E', lineHeight: 20, textAlign: 'center' },
});
