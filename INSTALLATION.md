# Guía 1: Instalación y ejecución del thin slice

Esta guía instala el monorepo y ejecuta el único App Host React Native en los simuladores Android o iOS.

## Qué se puede ejecutar

| Sistema | Thin slice TypeScript | Simulador Android | Simulador iOS |
|---|---:|---:|---:|
| Windows | Sí | Sí | No: requiere macOS y Xcode |
| macOS | Sí | Sí | Sí |

El host está en `apps/mobile`. No ejecutes `react-native init`: el proyecto nativo ya existe.

## Requisitos comunes

- Node.js 22.11 o superior
- npm 10 o superior
- Git
- Para Android: Android Studio, Android SDK, emulador iniciado y Java compatible con el proyecto
- Para iOS: macOS, Xcode, Command Line Tools, Ruby y CocoaPods

## 1. Instalar y validar el thin slice

Desde la raíz del repositorio:

```bash
npm install
npm test
npm run typecheck
npm run lint
```

La instalación usa el `package-lock.json` raíz. No instales dependencias dentro de `apps/mobile`.

## 2. Ejecutar Android

Funciona en Windows y macOS.

Primero inicia un emulador Android desde Android Studio. Comprueba que ADB lo vea:

```bash
adb devices
```

Terminal 1, desde la raíz:

```bash
npm start --workspace=@haulmer/app
```

Terminal 2, desde la raíz:

```bash
npm run android --workspace=@haulmer/app
```

En Windows PowerShell se usan los mismos comandos. Para compilar e instalar sin lanzar Metro manualmente:

```powershell
cd apps/mobile/android
.\gradlew.bat assembleDebug
.\gradlew.bat installDebug
```

Para abrir el deep link de prueba:

```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "cuenta://pay?intentId=pi_123" \
  com.haulmerapp
```

## 3. Ejecutar iOS

Solo funciona en macOS.

Instala las dependencias nativas una vez:

```bash
brew install ruby cocoapods
export PATH="$(brew --prefix ruby)/bin:$PATH"
cd apps/mobile
bundle install
bundle exec pod install --project-directory=ios
```

Inicia un simulador desde Xcode o con `open -a Simulator`. Después abre dos terminales.

Terminal 1, desde la raíz:

```bash
npm start --workspace=@haulmer/app
```

Terminal 2, desde la raíz:

```bash
npm run ios --workspace=@haulmer/app
```

También puedes abrir el workspace en Xcode:

```bash
open apps/mobile/ios/HaulmerApp.xcworkspace
```

Para abrir el deep link de prueba:

```bash
xcrun simctl openurl booted "cuenta://pay?intentId=pi_123"
```

### Ejecutar en un iPhone físico

El proyecto no incluye un `DEVELOPMENT_TEAM` personal. Para ejecutar en un iPhone propio, cada desarrollador debe configurar su firma localmente en Xcode:

1. Conecta y desbloquea el iPhone, pulsa **Confiar** cuando lo solicite y activa **Modo desarrollador** en `Ajustes > Privacidad y seguridad`.
2. Abre el workspace, no el proyecto, en Xcode:

  ```bash
  open apps/mobile/ios/HaulmerApp.xcworkspace
  ```

3. Selecciona el target `HaulmerApp`, abre **Signing & Capabilities**, activa **Automatically manage signing** y selecciona tu Apple ID en **Team**.
4. Selecciona el iPhone como dispositivo de ejecución y pulsa **Run**. Si Xcode solicita confiar en el desarrollador, confirma en `Ajustes > General > VPN y gestión de dispositivos`.

Si prefieres instalarla desde la terminal, inicia Metro en una terminal y ejecuta el comando indicando el dispositivo fisico. Por nombre:

```bash
npm run ios --workspace=@haulmer/app -- --device "iPhone de Pedro"
```

Si hay mas de un dispositivo conectado, usa el UDID para evitar que React Native elija un simulador:

```bash
xcrun xctrace list devices
npm run ios --workspace=@haulmer/app -- --udid "UDID_DEL_IPHONE"
```

El nombre o el UDID deben coincidir con el dispositivo que aparece como conectado. No uses `--simulator` en este caso.

El simulador no requiere esta configuración de firma. La cuenta de desarrollo puede caducar según el tipo de Apple ID y debe renovarse ejecutando la app otra vez desde Xcode.

## Si algo falla

- `adb devices` vacío: inicia el emulador y revisa `ANDROID_HOME`.
- Error de Pods: ejecuta `bundle exec pod install --project-directory=apps/mobile/ios` desde la raíz.
- Metro no encuentra `@haulmer/core` o `@haulmer/payments`: confirma que ejecutaste `npm install` en la raíz y reinicia Metro.
- Windows: no intentes ejecutar el simulador iOS; usa macOS para esa validación.

## Limpieza local

Estos artefactos se pueden borrar y regenerar:

```bash
rm -rf node_modules apps/mobile/node_modules
rm -rf apps/mobile/ios/Pods apps/mobile/ios/build
rm -rf apps/mobile/android/build apps/mobile/android/.gradle
npm install
```

No borres `apps/mobile/ios` ni `apps/mobile/android`: son código fuente del bare workflow definido en el RFC.
