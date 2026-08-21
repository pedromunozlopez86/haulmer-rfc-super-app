# Registro de Uso de IA

**Proyecto:** Haulmer SuperApp — Take-home Staff Engineer
**Fecha:** Agosto 2026

## 1. Herramientas y Modelos Utilizados

* **GitHub Copilot (Agente Custom):** Utilizado como asistente integrado en el IDE (VS Code) para la generación de *boilerplate* de TypeScript, pruebas unitarias y componentes funcionales de React Native.
* **Claude / LLMs Avanzados:** Utilizados para el refinamiento de la redacción, revisión ortotipográfica y estructuración lógica del documento RFC inicial.
* **Gemini:** Utilizado para el debate arquitectónico (sparring técnico), validación de los trade-offs (Monorepo vs Micro-frontends) y revisión profunda de las reglas estrictas de seguridad en el código.

## 2. Tareas donde Aportaron

* **Documentación Estratégica:** Estructuración del RFC y redacción de los *Architecture Decision Records* (ADRs) basados en los lineamientos técnicos de escalabilidad y límites de módulos que definí previamente.
* **Máquina de Estados (FSM):** Generación del esqueleto inicial (`switch/case` y tipado de uniones discriminadas) para el manejador de estados puros en base a los 6 estados finitos requeridos por el flujo de pago.
* **Testing de Riesgos:** Creación ágil del *setup* y *mocks* (ej. `jest.useFakeTimers()`) para la suite de pruebas unitarias enfocada en los escenarios críticos del negocio (expiración, doble concurrencia, y sanitización de inputs).
* **UI Base (Thin Slice):** Construcción rápida de los componentes visuales de React Native para las distintas pantallas, permitiéndome enfocarme en delegar la lógica de presentación a los hooks de la máquina de estados.

## 3. Decisiones y Outputs Descartados

* **Manejo de Estado Estándar (Rechazado):** La IA sugirió inicialmente manejar el flujo de pagos usando variables booleanas dispersas (`isLoading`, `isError`) y un estado global estándar. Se descartó este output y se forzó a la IA a reescribir la lógica utilizando una Máquina de Estados Finitos (FSM) pura para evitar condiciones de carrera y acoplamiento con la UI.
* **Sobreingeniería Arquitectónica (Rechazado):** Durante el brainstorming, la IA propuso configurar una infraestructura de Micro-frontends dinámicos (Module Federation) para aislar a los equipos. Se descartó a favor de un Monorepo con límites de importación estrictos (Feature-Sliced Design), dado que el producto está en una etapa temprana y requiere priorizar la velocidad de iteración sobre la independencia absoluta de despliegues.

## 4. Estrategia de Validación

Ningún código autogenerado fue aceptado sin revisión estructural. 
* **Trust Boundaries:** Cada bloque de código fue revisado manualmente para asegurar que no se rompieran los límites de confianza (ej. verificando explícitamente que la IA no utilizara los montos del deep link directamente en la UI, forzando la sanitización y el fetch autoritativo).
* **Reglas estrictas de negocio:** Los tests se validaron ejecutándolos para comprobar que las reglas estrictas de seguridad se mantenían intactas ante escenarios de concurrencia y fallos de red simulados.

## 5. Impacto y Tiempo Ahorrado

* **Estimación de tiempo ahorrado:** Aproximadamente **6 a 8 horas** de trabajo mecánico y redacción.
* **Beneficio Principal:** El uso de IA permitió condensar el ciclo de escritura de documentación extensa (RFC) y la creación de *boilerplate* a una fracción del tiempo habitual. Esto me permitió invertir mi carga cognitiva y el tiempo del desafío casi exclusivamente en el diseño de alto nivel: los límites de confianza, la idempotencia, la seguridad biométrica y la estrategia de reconciliación de pagos.