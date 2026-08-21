import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onDone: () => void;
}

export function PaymentExpiredScreen({ onDone }: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🕐</Text>
      <Text style={styles.title}>Solicitud expirada</Text>
      <Text style={styles.subtitle}>
        El tiempo para confirmar este pago ha expirado.{'\n'}
        Solicita un nuevo código QR al comercio.
      </Text>
      <TouchableOpacity style={styles.button} onPress={onDone} accessibilityRole="button">
        <Text style={styles.buttonText}>Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA', padding: 32 },
  icon: { fontSize: 64 },
  title: { marginTop: 16, fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { marginTop: 8, fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  button: {
    marginTop: 32,
    backgroundColor: '#6B7280',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
