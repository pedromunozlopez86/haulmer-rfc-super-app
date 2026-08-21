import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function PaymentLoadingScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0057FF" />
      <Text style={styles.text}>Cargando información del pago…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
  text: { marginTop: 16, fontSize: 16, color: '#6B7280' },
});
