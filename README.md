# Aplicación Web React + Node.js

Esta es una aplicación web simple que utiliza React para el frontend y Node.js con Express para el backend.

## Requisitos Previos

- Node.js instalado
- npm (Node Package Manager)

## Estructura del Proyecto

```
.
├── frontend/          # Aplicación React
└── backend/          # Servidor Node.js
```

## Instalación y Ejecución

### Backend

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor:
```bash
npm run dev
```

El servidor backend estará corriendo en: http://localhost:5000

### Frontend

1. Abrir una nueva terminal y navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar la aplicación React:
```bash
npm start
```

La aplicación frontend estará disponible en: http://localhost:3000

## Endpoints del Backend

- GET `/`: Mensaje de bienvenida
- GET `/api/message`: Retorna un mensaje de prueba

## Notas

- Asegúrate de tener ambos servidores (frontend y backend) corriendo simultáneamente
- El backend debe estar corriendo en el puerto 5000
- El frontend se ejecutará automáticamente en el puerto 3000