# NPS Frontend App

La aplicación cliente para el sistema de encuestas NPS, desarrollada como una **SPA (Single Page Application)** moderna. 

## Tecnologías Principales

- **Framework:** Angular 21
- **Estilos:** TailwindCSS 4 + PostCSS
- **Server:** Nginx (usado como web server final nativo para estáticos)
- **Node:** Node.js 20+

## Arquitectura y Estructura de Proyecto

El proyecto sigue una aproximación modularizada **Feature-Based Architecture**, dividiendo elementos por su foco lógico dentro de la aplicación. 

La carpeta `src/app/` posee esta jerarquía:

```text
src/app/
├── core/       # Singleton services, interceptors, guards y modelos globales
├── features/   # Módulos / vistas segregadas (Dashboard, Login, NPS Vote, etc)
├── layouts/    # Plantillas de diseño global de la web
└── shared/     # Componentes, directivas y pipes transversales y genéricos
```

### Patrones y Funcionalidades Clave

- **Standalones Components:** Al ser Angular 21, se utilizan componentes *Standalone* optimizando la inyección de dependencias (Tree-Shaking) y desechando la de pre-estructuración vía `NgModules`.
- **Inyección de Dependencias (DI):** Angular core provee servicios únicos en `root` mediante DI.
- **Route Tracking y Lazy Loading:** Configurado dentro del `app.routes.ts` con técnicas modulares.
- **TailwindCSS Integrado:** Se omite uso pesado de CSS personalizado en favor de las clases de utilidad provistas por Tailwind 4.

## Estrategia de Contenedores y Docker

El proyecto integra un **Dockerfile Multi-Stage** sofisticado, optimizado estrictamente para SPA de frameworks modernos (Angular >17):

1. **Etapa 1 (Build):** Usa Node (`node:20-alpine`) para compilar los estáticos (`npm run build`). Esta versión extrae la compilación final a la subcarpeta `dist/nps.frontend/browser`.
2. **Etapa 2 (Run):** Usa `nginx:alpine` para alojar y exponer los archivos `index.html` generados.
3. **Inyección de Entorno Dinámica:** A través del archivo `entrypoint.sh`, la imagen de Docker reemplaza dinámicamente el apuntador de la API base (`API_URL`) antes de inyectarlo, sobrealimentando un `config.json` inicial. Esto asegura que la misma imagen construida pueda usarse limpiamente en múltiples entornos (Dev, Staging, Prod).
4. **Nginx SPA Routing:** Se integró un `nginx.conf` especial capaz de lidiar con las URLs virtuales del enrutador de Angular mediante `try_files $uri $uri/ /index.html;`, para prevenir respuestas `404 Not Found` al refrescar URLs directas en el navegador.

## Scripts Claves

En el directorio del proyecto (`/nps.frontend`):

- Iniciar el servidor de desarrollo: `npm run start` o `ng serve`
- Transpilar compilación (Dist): `npm run build`
- Ejecutar test base: `npm run test`
