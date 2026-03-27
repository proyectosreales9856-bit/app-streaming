# Sistema de Ventas de Streaming

Sistema CRUD para gestionar ventas de cuentas de streaming.

## Requisitos

- Node.js (versión 14 o superior)

## Instalación

1. Instalar Node.js desde https://nodejs.org
2. Abrir terminal en la carpeta del proyecto
3. Ejecutar:
```bash
npm install
```

## Ejecutar

```bash
npm start
```

El servidor se iniciará en http://localhost:3000

## Características

### Pestaña 1 - Ventas
- Formulario para agregar/editar ventas
- Campos: Número orden, Tipo cuenta, Precios, WhatsApp, Fecha expiración, Renovable
- Tabla ordenada por fecha de expiración
- Cuentas renovables aparecen primero

### Pestaña 2 - Tipos de Cuenta
- CRUD de tipos de cuentas de streaming
- Campos: Nombre, Precio tienda (sugerencia), Precio público (sugerencia)
- Los precios se cargan automáticamente en el formulario de ventas

## Tecnologías

- Backend: Node.js + Express
- Base de datos: SQLite
- Frontend: HTML + CSS + JavaScript vanilla
