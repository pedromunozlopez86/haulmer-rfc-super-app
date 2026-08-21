# Guía 2: Revisión del RFC en el código

Esta guía permite revisar si la implementación sigue [RFC.md](RFC.md). La fuente de verdad es el código en `apps/mobile` y `packages/*`; los artefactos generados de iOS/Android no forman parte de la revisión lógica.

## 1. Preparar la revisión

Desde la raíz del proyecto:

```bash
npm install
npm test
npm run typecheck
npm run lint
```

La validación esperada es:

- 33 tests pasando.
- TypeScript sin errores.
- ESLint sin errores.

## 2. Mapa RFC → código

| RFC | Evidencia en el código |
|---|---|
| ADR-01: monorepo modular | `package.json`, `apps/mobile`, `packages/core`, `packages/payments`, `.eslintrc.json` |
| ADR-02: FSM para estado financiero | `packages/payments/src/fsm/paymentMachine.ts` y `paymentMachine.types.ts` |
| ADR-03: navegación y deep links | `apps/mobile/src/navigation/RootNavigator.tsx` y `deepLinkConfig.ts` |
| ADR-04: bare workflow | `apps/mobile/ios`, `apps/mobile/android`, `apps/mobile/metro.config.js` |
| Contratos de red | `packages/payments/src/api` |
| Seguridad biométrica | `packages/core/src/security` y `apps/mobile/src/native/NativeBiometricAdapter.ts` |
| Observabilidad y PII | `packages/core/src/observability` |
| Escenarios críticos | `packages/payments/src/fsm/__tests__` |

## 3. Revisar la arquitectura

### Límites de módulos

Comprueba que los paquetes de dominio no importen desde el host ni entre sí:

```bash
npm run lint
```

Revisa las reglas `import/no-restricted-paths` en `.eslintrc.json`. `@haulmer/core` debe permanecer como capa fundacional y `@haulmer/payments` debe consumirlo mediante su API pública.

### Host único

El único host es `apps/mobile`:

```text
apps/mobile/App.tsx
apps/mobile/src/navigation/
apps/mobile/src/native/
apps/mobile/ios/
apps/mobile/android/
```

No debe existir otro proyecto generado como `HaulmerApp/` en la raíz.

## 4. Revisar el flujo financiero

Abre `packages/payments/src/fsm/paymentMachine.ts` y verifica estas propiedades:

1. El pago tiene estados explícitos, no una combinación de booleanos.
2. `CONFIRM` solo es válido desde `READY_TO_PAY`.
3. Un segundo `CONFIRM` no produce otra transición ni otro POST.
4. Un timeout posterior al POST lleva a `PENDING`.
5. `PENDING` reconcilia mediante lecturas y no repite el POST.
6. La expiración impide confirmar el intent.

Ejecuta las pruebas que cubren esos riesgos:

```bash
npm test -- packages/payments/src/fsm/__tests__/doubleTap.test.ts
npm test -- packages/payments/src/fsm/__tests__/reconciliation.test.ts
npm test -- packages/payments/src/fsm/__tests__/expiration.test.ts
```

## 5. Revisar seguridad y red

### Entrada no confiable

Revisa la sanitización del `intentId` y confirma que monto, comercio y expiración no provienen del deep link:

```bash
npm test -- packages/payments/src/fsm/__tests__/deepLinkSanitization.test.ts
```

Código relacionado: `packages/payments/src/api/deepLinkSanitization.ts` y `apps/mobile/src/navigation/deepLinkConfig.ts`.

### Idempotencia y reconciliación

Revisa los contratos en:

```text
packages/payments/src/api/paymentIntentsApi.ts
packages/payments/src/api/paymentsApi.ts
packages/payments/src/api/reconcileApi.ts
```

Confirma que el POST envía `expectedVersion`, `idempotencyKey`, `deviceId` y `authProof`, y que la reconciliación solo realiza GET.

### Biometría

La interfaz testeable está en `packages/core/src/security`. La implementación nativa se inyecta desde `apps/mobile/App.tsx` mediante `NativeBiometricAdapter`.

El adapter debe devolver un proof opaco y tratar cancelación e indisponibilidad como errores diferenciados.

### PII y trazabilidad

Revisa:

```text
packages/core/src/observability/logger.ts
packages/core/src/network/HttpClient.ts
```

Confirma que los logs redactan datos sensibles y que las requests incluyen correlation ID y request ID sin registrar montos ni identificadores financieros.

## 6. Revisar la cobertura de riesgo

Los escenarios definidos en la sección 7 del RFC deben estar representados en:

```text
packages/payments/src/fsm/__tests__/
```

El criterio de revisión no es cobertura total. Pregunta para cada escenario: “¿un fallo aquí puede duplicar, perder o autorizar incorrectamente un pago?”.

## 7. Revisar la implementación nativa

La parte nativa confirma que el host bare existe, pero no reemplaza los tests de dominio:

```text
apps/mobile/ios/Info.plist
apps/mobile/android/app/src/main/AndroidManifest.xml
apps/mobile/ios/Podfile
apps/mobile/android/settings.gradle
```

Comprueba que:

- El scheme `cuenta://` está declarado en iOS y Android.
- El adapter biométrico está conectado al host.
- Metro resuelve `react` y `react-native` desde el `node_modules` raíz.
- `packages/core` y `packages/payments` están en `watchFolders`.

## 8. Resultado de la revisión

Una revisión está completa cuando puedes responder afirmativamente:

- El árbol coincide con la estructura del RFC.
- El host único está en `apps/mobile`.
- La FSM impide doble confirmación y modela `PENDING`.
- La reconciliación no repite el POST.
- El deep link se valida antes de cualquier request.
- Los contratos de red contienen idempotencia y optimistic locking.
- Los logs no exponen PII.
- Los 33 tests, typecheck y lint pasan.

Las decisiones arquitectónicas y sus trade-offs siguen documentadas en [RFC.md](RFC.md). Esta guía solo conecta esas decisiones con sus puntos verificables en el código.
