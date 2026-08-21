# Haulmer SuperApp

Implementación inicial de un thin slice para el flujo de pagos A2A/QR de una SuperApp fintech. El proyecto demuestra una arquitectura modular, una máquina de estados finitos para el pago y pruebas orientadas a riesgos financieros.

## Documentos principales

- [Requerimientos](REQ.md): desafío técnico original.
- [RFC-0001](RFC.md): decisiones de arquitectura, seguridad, ownership y plan de adopción.
- [Guía de instalación](INSTALLATION.md): instalación y ejecución en simuladores Android/iOS.
- [Guía de revisión del RFC](EVALUATOR_GUIDE.md): relación entre las decisiones del RFC y el código.
- [AI_USAGE](AI_USAGE.md): directrices de uso de IA y su rol en el desarrollo y revisión del proyecto.

## Inicio rápido

Desde la raíz del proyecto:

```bash
npm install
npm test
npm run typecheck
npm run lint

```

Para ejecutar iOS en macOS, instala primero las dependencias nativas de CocoaPods. Este paso solo es necesario para la compilación iOS:

```bash
brew install ruby cocoapods
export PATH="$(brew --prefix ruby)/bin:$PATH"
cd apps/mobile
bundle install
bundle exec pod install --project-directory=ios
cd ../..

```

Después, ejecuta Metro desde la raíz del monorepo. La primera vez o después de cambiar dependencias, usa `--reset-cache`:

```bash
# Terminal 1: Metro
npm start --workspace=@haulmer/app -- --reset-cache

```

En una segunda terminal, ejecuta el simulador correspondiente.

### Android — Windows o macOS

```bash
npm run android --workspace=@haulmer/app

```

### iOS — solo macOS

Requiere Xcode, CocoaPods y haber ejecutado `bundle exec pod install --project-directory=ios`.

```bash
npm run ios --workspace=@haulmer/app

```

Windows permite ejecutar el thin slice y el simulador Android. El simulador iOS requiere macOS, Xcode y CocoaPods. Si solo vas a validar TypeScript y tests, no necesitas instalar CocoaPods.

## Estado de la implementación y Alcance

| Área | Estado |
| --- | --- |
| Monorepo npm con workspaces | Implementado |
| `@haulmer/core` | Implementado como capa fundacional |
| `@haulmer/payments` | Implementado con FSM, APIs mock, pantallas y tests |
| App Host único en `apps/mobile` | Implementado |
| Proyectos nativos iOS y Android | Integrados en `apps/mobile` |
| Biometría | Adapter nativo integrado; backend real pendiente |

**Fuera de alcance intencional (No-objetivos):**

* Backend productivo y cámara QR real (se utilizan mocks e inputs simulados).
* Módulos completos de Identity, Banking, Loyalty y Consumer (reservados para fases posteriores).
* Integración productiva de HSM, feature flags remotos, kill switch en vivo y publicación en tiendas.

## Declaración de Entorno y Tiempo

* **Tiempo invertido:** Aproximadamente 9 horas distribuidas durante los 7 días (incluyendo diseño del RFC, configuración del monorepo, desarrollo del flujo FSM, pruebas y redacción de documentación con IA).
* **Versión de Node:** `v22.11` (o superior).
* **Plataformas verificadas:**
* iOS (Simulador iPhone 15 Pro, iOS 17.x, macOS).
* Android (Emulador Pixel 7 API 34, macOS/Windows).


* **Herramientas de testing:** Jest (ejecutado vía `npm test`).

## Estructura

```text
.                                # raíz del repo
├── apps/mobile/                 # único App Host React Native bare
│   ├── src/navigation/          # navegación y deep links
│   ├── src/native/              # adapter biométrico nativo
│   ├── ios/                     # proyecto iOS
│   └── android/                 # proyecto Android
├── packages/core/               # red, seguridad y observabilidad
├── packages/payments/           # FSM, APIs mock, pantallas y tests
├── tools/                       # configuración compartida
├── package.json                 # workspaces y scripts
└── package-lock.json            # resolución reproducible de npm

```

Los artefactos generados como `node_modules`, `Pods/`, builds, `DerivedData/`, `.gradle/` y `.xcode.env.local` están ignorados por Git. Los lockfiles `package-lock.json`, `Podfile.lock` y `Gemfile.lock` sí se conservan para reproducir las instalaciones.