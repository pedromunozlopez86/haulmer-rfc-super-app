import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onAuthenticate: () => Promise<void>;
  onCancel: () => void;
}

export function PaymentAuthenticationScreen({ onAuthenticate, onCancel }: Props): React.JSX.Element {
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  async function handleAuthenticate() {
    if (isAuthorizing) return;

    setIsAuthorizing(true);
    await onAuthenticate();
  }

  return (
    <View style={styles.container}>
      <View style={styles.icon} accessibilityLabel="Autenticación requerida">
        <Text style={styles.iconText}>ID</Text>
      </View>
      <Text style={styles.title}>Autoriza este pago</Text>
      <Text style={styles.subtitle}>
        Antes de enviar el pago, confirma tu identidad con Face ID o PIN.
      </Text>

      {isAuthorizing ? (
        <View style={styles.progress} accessibilityLiveRegion="polite">
          <ActivityIndicator color="#0057FF" />
          <Text style={styles.progressText}>Verificando identidad…</Text>
        </View>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.authorizeButton}
            onPress={() => void handleAuthenticate()}
            accessibilityRole="button"
            accessibilityLabel="Autorizar con Face ID o PIN"
          >
            <Text style={styles.authorizeButtonText}>Autorizar con Face ID o PIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Volver al pago"
          >
            <Text style={styles.cancelButtonText}>Volver al pago</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA', padding: 32 },
  icon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DBEAFE' },
  iconText: { color: '#0057FF', fontSize: 22, fontWeight: '800' },
  title: { marginTop: 24, fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  actions: { width: '100%', marginTop: 32, gap: 8 },
  authorizeButton: { backgroundColor: '#0057FF', paddingVertical: 15, alignItems: 'center', borderRadius: 8 },
  authorizeButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  cancelButton: { paddingVertical: 14, alignItems: 'center' },
  cancelButtonText: { color: '#4B5563', fontSize: 16, fontWeight: '600' },
  progress: { marginTop: 32, flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressText: { color: '#4B5563', fontSize: 16 },
});