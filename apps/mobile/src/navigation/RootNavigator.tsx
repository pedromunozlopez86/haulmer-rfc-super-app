import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { BiometricAdapter } from '@haulmer/core';
import { PaymentFlowScreen } from '@haulmer/payments';

type Screen = 'Home' | 'PaymentFlow';

interface NavState {
  screen: Screen;
  params?: { intentId?: string };
}

/**
 * Minimal App Host navigator.
 *
 * In production: replace with React Navigation's NavigationContainer + linking config.
 * This implementation simulates deep link routing without the native dependency,
 * allowing the thin slice to be demonstrated without a full RN setup.
 */
interface Props {
  biometric?: BiometricAdapter;
}

export function RootNavigator({ biometric }: Props): React.JSX.Element {
  const [nav, setNav] = useState<NavState>({ screen: 'Home' });
  const [inputId, setInputId] = useState('pi_123');

  function navigateToPayment(intentId: string) {
    setNav({ screen: 'PaymentFlow', params: { intentId } });
  }

  function navigateHome() {
    setNav({ screen: 'Home' });
  }

  if (nav.screen === 'PaymentFlow') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PaymentFlowScreen
          rawIntentId={nav.params?.intentId}
          onDone={navigateHome}
          biometric={biometric}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.home}>
        <Text style={styles.title}>Haulmer SuperApp</Text>
        <Text style={styles.subtitle}>Thin Slice — Flujo de Pago QR</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={inputId}
            onChangeText={setInputId}
            placeholder="intentId (ej: pi_123)"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Payment Intent ID"
          />
        </View>

        {/* Simula el escaneo de un QR — el req permite no usar cámara real */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigateToPayment(inputId)}
          accessibilityRole="button"
          accessibilityLabel="Simular escaneo de QR"
        >
          <Text style={styles.scanButtonText}>📷 Simular QR scan</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          Prueba también con un ID inválido:{'\n'}
          <Text style={styles.code}>pi_invalid!!</Text> para ver la validación de deep link
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  home: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, marginBottom: 32 },
  inputRow: { width: '100%', marginBottom: 16 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  scanButton: {
    backgroundColor: '#0057FF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  scanButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  hint: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
  code: { fontFamily: 'monospace', color: '#EF4444' },
});
