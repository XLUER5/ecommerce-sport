# ShopHub - E-commerce Deportivo

ShopHub es una aplicación web de e-commerce enfocada en productos deportivos, desarrollada con **React**, **Vite** y **Ant Design**. Permite a los usuarios explorar productos, gestionar un carrito de compras, realizar pedidos, ver historial de órdenes y administrar su perfil personal.

## Características

- **Autenticación de usuarios**: Registro, login y logout seguro.
- **Gestión de perfil**: Edición de datos personales y dirección de envío.
- **Catálogo de productos**: Búsqueda, filtrado y visualización de productos deportivos.
- **Carrito de compras**: Añadir, modificar cantidad y eliminar productos.
- **Órdenes**: Confirmación de pedidos, historial y detalles de órdenes.
- **Responsive**: Interfaz adaptada para dispositivos móviles y escritorio.
- **Notificaciones**: Mensajes de éxito y error para acciones del usuario.

## Tecnologías principales

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Ant Design](https://ant.design/)
- [React Router](https://reactrouter.com/)
- [SweetAlert2](https://sweetalert2.github.io/)

## Estructura del proyecto

```
├── public/
│   └── assets/img/             # Imágenes de productos
├── src/
│   ├── auth/                   # Contextos y rutas privadas de autenticación
│   ├── components/             # Componentes reutilizables (modales, carrito, etc.)
│   ├── config/                 # Configuración de endpoints
│   ├── helpers/                # Funciones utilitarias
│   ├── hooks/                  # Custom hooks
│   ├── layout/                 # Layout principal
│   ├── pages/                  # Vistas principales (Home, Cart, Profile, Ordenes)
│   ├── router/                 # Definición de rutas
│   └── theme/                  # Temas y estilos personalizados
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Scripts

- `npm run dev` – Inicia el servidor de desarrollo.
- `npm run build` – Genera la build de producción.
- `npm run preview` – Previsualiza la build de producción.
- `npm run lint` – Ejecuta ESLint para revisar el código.

## Configuración

1. **Clona el repositorio**  
   ```bash
   git clone <url-del-repo>
   ```

2. **Instala dependencias**  
   ```bash
   npm install
   ```

3. **Configura el backend**  
   Asegúrate de tener un backend compatible corriendo en `http://localhost:8080/api`.

4. **Inicia la app**  
   ```bash
   npm run dev
   ```

## Variables de entorno

Los endpoints están configurados en [`src/config/config.js`](src/config/config.js).

## Autores

- Luis Carlos Estrada

---

> Proyecto realizado con fines educativos y demostrativos.