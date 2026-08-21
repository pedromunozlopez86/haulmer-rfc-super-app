import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { NativeBiometricAdapter } from './src/native/NativeBiometricAdapter';

const biometric = new NativeBiometricAdapter();

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <RootNavigator biometric={biometric} />
    </SafeAreaProvider>
  );
}

export default App;
