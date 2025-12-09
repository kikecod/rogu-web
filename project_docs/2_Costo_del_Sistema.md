# Documento de Costos del Sistema - ROGU

## 1. Introducción
Este documento detalla los costos asociados a la infraestructura y servicios externos utilizados para la operación de la plataforma ROGU. Se consideran tanto los costos fijos de infraestructura como los costos variables por uso de servicios de terceros.

## 2. Infraestructura Cloud (AWS)

### 2.1. Backend (Compute)
- **Servicio:** Amazon EC2 (Elastic Compute Cloud)
- **Tipo de Instancia:** t2.micro / t3.micro (Capa gratuita elegible o bajo costo)
- **Costo Estimado:**
    - **Capa Gratuita:** $0.00 / mes (primer año)
    - **Bajo Demanda:** ~$8.00 - $10.00 USD / mes (dependiendo de la región y uso continuo)
- **Función:** Alojamiento del servidor API (NestJS) y gestión de Websockets.

### 2.2. Almacenamiento (Storage)
- **Servicio:** Amazon S3 (Simple Storage Service)
- **Uso:** Almacenamiento de imágenes de perfil, fotos de sedes/canchas y documentos legales.
- **Costo Estimado:**
    - **Almacenamiento:** ~$0.023 USD por GB / mes
    - **Transferencia:** ~$0.09 USD por GB de salida (los primeros 100GB suelen ser gratuitos)
- **Total Estimado:** Variable según volumen, típicamente < $5.00 USD / mes para startups iniciales.

## 3. Frontend Hosting

### 3.1. Vercel
- **Servicio:** Hosting y despliegue continuo para React/Vite.
- **Plan:** Hobby (Gratuito) o Pro.
- **Costo Estimado:**
    - **Hobby:** $0.00 / mes (para proyectos personales/no comerciales directos)
    - **Pro:** $20.00 USD / mes (por miembro, si se requiere mayor ancho de banda o funciones de equipo)

## 4. Servicios Externos (APIs)

### 4.1. Mapas y Geolocalización
- **Proveedor:** MapTiler (con OpenStreetMap)
- **Uso:** Visualización de mapas, selección de ubicación de sedes.
- **Costo Estimado:**
    - **Plan Free:** $0.00 / mes (hasta 100,000 peticiones)
    - **Plan Flex:** Desde $20.00 USD / mes (si se excede el límite gratuito)

### 4.2. Pasarela de Pagos
- **Proveedor:** Libélula
- **Modelo:** Comisión por transacción.
- **Costo Estimado:** Variable. Generalmente un porcentaje del valor de la reserva (ej. 3% - 5%) + una tarifa fija por transacción. Este costo suele ser absorbido por el negocio o trasladado al usuario final.

## 5. Resumen de Costos Mensuales (Estimado)

| Concepto | Plan Inicial (MVP) | Escalamiento (Producción) |
| :--- | :--- | :--- |
| **Backend (AWS EC2)** | $0.00 (Free Tier) | ~$10.00 |
| **Storage (AWS S3)** | < $1.00 | ~$5.00 |
| **Frontend (Vercel)** | $0.00 | $20.00 |
| **Mapas (MapTiler)** | $0.00 | $20.00 |
| **Base de Datos** | $0.00 (Local en EC2) | ~$15.00 (RDS Gestionado) |
| **Total Estimado** | **~ $1.00 USD** | **~ $70.00 USD** |

*Nota: Los costos son aproximados y pueden variar según el tráfico, volumen de datos y cambios en las tarifas de los proveedores.*
