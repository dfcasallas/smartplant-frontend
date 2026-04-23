# Smartplants Frontend

Interfaz Angular para el proyecto Smartplants. Incluye:

- CRUD de plantas
- CRUD de catálogos (`Tipo`, `Familia`, `Mantenimiento`, `Salud`)
- conexión al backend Spring Boot mediante `/api`
- proxy de desarrollo para evitar problemas de CORS en `localhost:4200`

## Requisitos

- Node.js 20.19 o superior
- Angular CLI 21
- Backend Spring Boot ejecutándose en `http://localhost:8080`

## Instalación

```bash
npm install
npm run start
```

La aplicación quedará disponible en:

```bash
http://localhost:4200
```

## Estructura principal

- `src/app/services/api.service.ts`: consumo de endpoints REST
- `src/app/models/smartplants.models.ts`: modelos TypeScript
- `src/app/app.ts`: lógica principal del dashboard
- `src/app/app.html`: vista principal
- `proxy.conf.json`: proxy local hacia Spring Boot

## Endpoints esperados

- `GET/POST/PUT/DELETE /api/plantas`
- `GET/POST/PUT/DELETE /api/tipos`
- `GET/POST/PUT/DELETE /api/familias`
- `GET/POST/PUT/DELETE /api/mantenimientos`
- `GET/POST/PUT/DELETE /api/saludes`
