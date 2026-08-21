# Take-home · Staff Engineer (Mobile)[cite: 1]

**Diseño e implementación de una capacidad crítica para una SuperApp fintech**[cite: 1]

**PLAZO**[cite: 1]
7 días corridos[cite: 1]

**DEDICACIÓN**[cite: 1]
8 h objetivo · 12 h máximo[cite: 1]

**STACK**[cite: 1]
React Native + TypeScript[cite: 1]

Lo importante: No buscamos la mayor cantidad de código ni una UI perfecta.[cite: 1] Queremos entender cómo tomas decisiones de nivel Staff, reduces riesgos y construyes una base que varios equipos puedan evolucionar.[cite: 1]

## 1. Contexto[cite: 1]

Haulmer está construyendo una SuperApp que consumirá capacidades financieras ya disponibles en Una cuenta digital: identidad/KYC, cuentas, saldos y transferencias e incorporará experiencias de consumidor, loyalty, pagos A2A/QR y, a futuro, un marketplace o miniapps.[cite: 1]

La aplicación debe operar en iOS y Android, manejar flujos monetarios sensibles y permitir que varios equipos trabajen en paralelo sin degradar seguridad, experiencia, performance ni velocidad de entrega.[cite: 1]

El producto está en una etapa temprana: necesitamos avanzar rápido, pero evitando decisiones que hagan difícil escalar la plataforma y el equipo.[cite: 1]

## 2. El desafío[cite: 1]

Propón la arquitectura mobile objetivo de esta SuperApp y construye una thin slice del flujo “pagar por QR/A2A”.[cite: 1] La implementación sirve como evidencia de tus decisiones; no se espera una aplicación completa.[cite: 1]

Tu solución debe mostrar cómo abordarías simultáneamente dos niveles:[cite: 1]
* Nivel plataforma: límites entre módulos, contratos, navegación, estado, integración nativa, seguridad, observabilidad, delivery y ownership entre equipos.[cite: 1]
* Nivel producto: un flujo de pago comprensible y recuperable frente a errores, concurrencia, expiración y resultados inciertos.[cite: 1]

## 3. Flujo a implementar[cite: 1]

1. La app recibe un deep link o payload equivalente a `cuenta://pay?intentId=pi_123`.[cite: 1] No es obligatorio integrar una cámara real.[cite: 1]
2. El cliente valida el input como dato no confiable y obtiene desde el servicio la información autoritativa del payment intent.[cite: 1]
3. La app muestra comercio, monto, moneda y expiración, y permite confirmar o cancelar.[cite: 1]
4. Antes de confirmar, ejecuta una autenticación de step-up mediante una abstracción de biometría/PIN.[cite: 1] Puede utilizar un adapter simulado.[cite: 1]
5. La confirmación debe resistir doble tap y reintentos.[cite: 1] Si la red falla después de que el servidor procesó el pago, la app debe poder reconciliar el resultado sin duplicar el cargo.[cite: 1]
6. La experiencia debe representar explícitamente, como mínimo: listo para confirmar, procesando, aprobado, pendiente/resultado desconocido, expirado y rechazado.[cite: 1]

**Contrato de referencia para el mock**[cite: 1]
Puedes modificar este contrato si explicas el motivo.[cite: 1] Los datos provenientes del QR no deben considerarse autoritativos.[cite: 1]

```json
GET /v1/payment-intents/{intentId}
{
"id": "pi_123",
"merchant": { "id": "m_45", "displayName": "Café Central" },
"amount": 12500,
"currency": "CLP",
"expiresAt": "2026-08-20T18:30:00Z",
"status": "READY",
"version": 3
}
```[cite: 1]

```json
POST /v1/payments
{
"intentId": "pi_123",
"expectedVersion": 3,
"idempotencyKey": "<stable-client-key>",
"deviceId": "<bound-device-id>",
"authProof": "<opaque-step-up-proof>"
}
```[cite: 1]

```text
GET /v1/payments/by-idempotency-key/{key} // reconciliación