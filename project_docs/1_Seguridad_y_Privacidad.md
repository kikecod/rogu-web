# Documento de Seguridad y Privacidad - ROGU

## 1. Introducción
Este documento describe las medidas de seguridad y privacidad implementadas en la plataforma ROGU para proteger la información de los usuarios, propietarios y administradores, así como asegurar la integridad de las transacciones y datos del sistema.

## 2. Autenticación y Control de Acceso

### 2.1. Mecanismo de Autenticación
- **JWT (JSON Web Tokens):** El sistema utiliza tokens JWT para la autenticación de usuarios.
- **Almacenamiento Seguro:** Los tokens se almacenan en el `localStorage` del navegador del cliente para mantener la sesión activa.
- **Ciclo de Vida:** Los tokens se adjuntan automáticamente a las cabeceras de las peticiones HTTP (`Authorization: Bearer <token>`) mediante interceptores de Axios.

### 2.2. Registro de Usuarios
- **Proceso de Dos Pasos:** El registro separa la creación de la identidad personal (`/personas`) de la cuenta de usuario (`/auth/register`), asegurando una validación de datos más robusta.
- **Datos Recopilados:** Nombre completo, teléfono, fecha de nacimiento, género, correo electrónico y contraseña.

### 2.3. Roles y Permisos (RBAC)
El sistema implementa un control de acceso basado en roles para restringir funcionalidades:
- **Cliente:** Búsqueda, reservas, pagos y gestión de perfil.
- **Dueño (Owner):** Gestión de sedes, canchas, horarios y visualización de reservas.
- **Administrador:** Gestión global del sistema, usuarios y validaciones.

## 3. Protección de Datos y Comunicaciones

### 3.1. Cifrado en Tránsito
- **HTTPS:** Todas las comunicaciones entre el frontend (Vercel) y el backend (AWS) están encriptadas utilizando el protocolo HTTPS/TLS, protegiendo los datos contra interceptaciones.

### 3.2. Gestión de Archivos
- **AWS S3:** Las imágenes y documentos (como licencias de funcionamiento) se almacenan de forma segura en AWS S3.
- **URLs Firmadas/Públicas:** El acceso a los recursos se gestiona mediante URLs generadas por el backend, evitando la exposición directa de la estructura de almacenamiento.

## 4. Seguridad en Pagos

### 4.1. Pasarela de Pagos (Libélula)
- **Integración Segura:** Los pagos se procesan a través de la pasarela externa Libélula.
- **Sin Almacenamiento de Tarjetas:** ROGU no almacena números de tarjetas de crédito ni información financiera sensible en sus bases de datos.
- **Validación de Transacciones:** Se utiliza un identificador único de deuda (`ROGU-XXXXXXXX-YYYYYYYY`) para rastrear y validar cada transacción.

## 5. Privacidad del Usuario

### 5.1. Uso de la Ubicación
- **Geolocalización:** Se solicita permiso al usuario para acceder a su ubicación únicamente para mejorar la experiencia de búsqueda de canchas cercanas.
- **Mapas:** Se utiliza MapTiler y OpenStreetMap, respetando las políticas de privacidad de estos proveedores.

### 5.2. Datos Personales
- Los datos personales se utilizan exclusivamente para la gestión de reservas y la comunicación entre el complejo deportivo y el usuario.
- No se comparten datos con terceros no autorizados.

## 6. Monitoreo y Auditoría
- **Logs de Sistema:** El backend mantiene registros de actividades críticas (errores, transacciones) para auditoría y depuración.
- **Websockets:** Las conexiones en tiempo real (Socket.io) son monitoreadas para asegurar la entrega correcta de notificaciones de estado de pago.
