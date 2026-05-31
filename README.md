# PulpeAnálisis 📊🛒
> **Sistema de Rotación de Inventario y Compras Inteligentes para Pulperías**

Este proyecto es el entregable final para el curso de **Ingeniería de Software I (Capstone)**. Consiste en una propuesta de producto de software end-to-end (MVP) diseñada para una pulpería real de la comunidad, enfocada en resolver las pérdidas financieras por mermas y quiebres de stock mediante un "Semáforo de Rotación" analítico.

---

## 👥 Información del Proyecto
* **Autor:** Osman Herrera
* **Asignatura:** Ingeniería de Software I
* **Dominio Seleccionado:** Pulpería de barrio
* **Cliente Real:** Dueño de la pulpería local
* **Ubicación:** Honduras

---

## 🚀 Características Principales (MVP)
* **Registro de Ventas Express:** Interfaz móvil optimizada con botones de alta visibilidad para registrar transacciones en el mostrador en menos de 5 segundos.
* **Semáforo de Rotación:** Clasificación automatizada de productos basada en el volumen de ventas semanal:
    * 🔴 **Alta Rotación (Rojo):** Productos estrella con alta demanda.
    * 🟡 **Rotación Media (Amarillo):** Productos con movimiento constante pero pausado.
    * 🔵 **Baja Rotación (Azul):** Productos estancados en riesgo de vencimiento.
* **Asistente de Pedidos Inteligentes:** Generación automática de listas de compras recomendadas organizadas por proveedor, con opción de copiado rápido para WhatsApp.

---

## 🛠️ Stack Tecnológico
* **Frontend:** Progressive Web App (PWA) construida con React, Vite y Tailwind CSS.
* **Backend & Base de Datos:** Supabase (PostgreSQL) actuando como Backend-as-a-Service (BaaS).
* **Despliegue e Integración Continua:** Vercel para hosting automatizado y GitHub Actions para pipelines de CI/CD.

---

## 📂 Estructura del Repositorio
```text
├── .github/workflows/   # Configuración de GitHub Actions (CI)
├── src/                 # Código fuente de la aplicación PWA
├── docs/                # Documentación del proyecto
│   └── ARQUITECTURA.md  # Diseño detallado de componentes y modelo de datos
├── README.md            # Archivo principal de presentación
└── package.json         # Dependencias del proyecto
```
