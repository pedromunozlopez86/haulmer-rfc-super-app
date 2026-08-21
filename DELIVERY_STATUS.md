# Estado de entrega — Primera versión

**Proyecto:** Haulmer SuperApp
**Desafío:** Staff Engineer Mobile — SuperApp fintech
**Fecha:** Agosto de 2026
**Estado:** Primera versión preparada para revisión y publicación en GitHub

## Alcance de esta versión

La primera versión entrega un thin slice vertical del flujo de pago A2A/QR. El objetivo es demostrar las decisiones arquitectónicas y los controles de riesgo del RFC, no conectar todavía un backend productivo.

Incluye:

- Monorepo npm con workspaces.
- App Host único en `apps/mobile`.
- React Native bare workflow con proyectos fuente iOS y Android.
- `@haulmer/core` como capa fundacional.
- `@haulmer/payments` como módulo de dominio.
- FSM explícita para el flujo de pago.
- APIs mock para intent, confirmación y reconciliación.
- Pantallas React Native para los estados del flujo.
- Adapter biométrico nativo inyectado desde el App Host.
- Validación de deep links y redacción de PII en logs.
- Tests de escenarios financieros críticos.
- Documentación reducida a instalación, revisión del RFC y estado de entrega.

## Estructura actual

```text
.                                 # raíz del repo
├── apps/mobile/
│   ├── App.tsx
│   ├── index.js
│   ├── metro.config.js
│   ├── src/
│   │   ├── navigation/
│   │   └── native/NativeBiometricAdapter.ts
│   ├── ios/
│   ├── android/
│   └── package.json
├── packages/
│   ├── core/
│   │   └── src/{network,security,observability}/
│   └── payments/
│       └── src/{api,fsm,screens}/
├── tools/
├── .eslintrc.json
├── package.json
├── package-lock.json
└── tsconfig.json
```

El proyecto paralelo generado como `HaulmerApp/` fue eliminado. `apps/mobile` es el único host y comparte la instalación de dependencias desde el `node_modules` raíz.

## Decisiones principales reflejadas

### Arquitectura

- Monorepo modular con límites de importación.
- App Host separado de los módulos de dominio.
- `@haulmer/core` no depende de otros módulos de dominio.
- `@haulmer/payments` consume contratos públicos de `@haulmer/core`.

### Flujo de pago

- Estados explícitos en una FSM.
- `CONFIRM` solo es válido desde `READY_TO_PAY`.
- Timeout posterior al POST transiciona a `PENDING`.
- La reconciliación usa lecturas y no repite el POST.
- Idempotencia y `expectedVersion` forman parte del contrato mock.

### Seguridad

- El deep link se considera entrada no confiable.
- Solo se acepta el `intentId` validado; el resto de los datos viene del servidor.
- Los datos sensibles se redactan antes de registrar logs.
- La biometría se abstrae mediante `BiometricAdapter`.

## Escenarios cubiertos

Los tests de `packages/payments/src/fsm/__tests__/` cubren:

1. Doble confirmación.
2. Timeout y reconciliación.
3. Expiración del intent.
4. Sanitización de deep links.
5. Cancelación biométrica.
6. Agotamiento de reintentos de reconciliación.
7. Conflicto de versión `409`.
8. Estabilidad de la clave de idempotencia.

## Validación de la versión

Ejecutar desde la raíz del proyecto:

```bash
npm install
npm test
npm run typecheck
npm run lint
```

Resultado esperado:

- Tests: 33 casos pasando.
- TypeScript: sin errores.
- ESLint: sin errores de código ni de límites de módulos.

La compilación de simuladores requiere toolchains locales:

- Android: Android Studio, SDK, Java y un emulador.
- iOS: macOS, Xcode, Ruby, CocoaPods y un simulador.

La ausencia de `node_modules`, Pods, builds y caches en el checkout es intencional. Se regeneran siguiendo [la guía de instalación](INSTALLATION.md).

## Fuera de alcance

- Backend real.
- Cámara QR real.
- Keychain/Keystore productivo.
- Feature flags remotos y kill switch.
- Módulos completos de Identity y Banking.
- Loyalty, Consumer y mini-apps.
- Publicación en App Store o Google Play.

## Checklist antes de publicar en GitHub

- [ ] Ejecutar `npm install`.
- [ ] Ejecutar `npm test`.
- [ ] Ejecutar `npm run typecheck`.
- [ ] Ejecutar `npm run lint`.
- [ ] Confirmar que no se incluyan `node_modules`, Pods, builds ni caches.
- [ ] Revisar que no existan secretos, tokens ni datos personales.
- [ ] Revisar el diff final antes del primer commit.
