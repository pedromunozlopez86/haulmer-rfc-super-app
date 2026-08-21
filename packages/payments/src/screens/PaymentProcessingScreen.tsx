import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function PaymentProcessingScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0057FF" />
      <Text style={styles.title}>Procesando pago</Text>
      <Text style={styles.subtitle}>
        Por favor no cierres la aplicación.{'\n'}Esto tomará solo un momento.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA', padding: 32 },
  title: { marginTop: 24, fontSize: 20, fontWeight: '700', color: '#111827' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
});
