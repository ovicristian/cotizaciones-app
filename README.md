# Sistema de Cotizaciones Internacionales

Aplicación web para gestionar cotizaciones de ventas internacionales.

## Stack Tecnológico

- **Frontend**: React 18 + Vite
- **Estilos**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Hosting**: Netlify
- **Routing**: React Router v6

## Características

- ✅ Autenticación de usuarios (Login/Logout)
- ✅ Gestión de Clientes
- ✅ Gestión de Cotizaciones
- ✅ Gestión de Referencias/Productos
- ✅ Importación masiva CSV
- ✅ Generación de PDFs (Proformas y Listas de empaque)
- ✅ Menú lateral de navegación
- ✅ Tablas de datos responsivas

## Instalación Local

1. Clona el repositorio
2. Instala dependencias:
```bash
npm install
```

3. Copia `.env.example` a `.env` y configura tus credenciales de Supabase:
```bash
cp .env.example .env
```

4. Edita `.env` con tus datos de Supabase:
```
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

5. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## Configuración de Supabase

### Crear las tablas en Supabase

Ejecuta estos scripts SQL en el Editor SQL de Supabase:

```sql
-- Tabla de clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  pais TEXT,
  ciudad TEXT,
  email TEXT,
  nit TEXT,
  telefono TEXT,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de referencias (productos)
CREATE TABLE referencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  familia TEXT,
  peso_unitario DECIMAL,
  precio DECIMAL,
  cantidad_minima_caja INT,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de cotizaciones
CREATE TABLE cotizaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES clientes,
  tasa_cambio DECIMAL,
  vigencia DATE,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de relación cotizaciones-referencias
CREATE TABLE cotizacion_referencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cotizacion_id UUID REFERENCES cotizaciones ON DELETE CASCADE,
  referencia_id UUID REFERENCES referencias,
  cantidad INT,
  precio_modificado DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Políticas de seguridad (RLS)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizacion_referencias ENABLE ROW LEVEL SECURITY;

-- Permitir a usuarios ver sus propios datos
CREATE POLICY "Usuarios ven sus clientes"
ON clientes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus clientes"
ON clientes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- (Ver README completo para todas las políticas...)
```

## Deploy en Netlify

1. Crea una cuenta en [Netlify](https://netlify.com)
2. Conecta tu repositorio de GitHub
3. Netlify detectará automáticamente la configuración desde `netlify.toml`
4. Agrega las variables de entorno en Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy automático

## Estructura del Proyecto

```
cotizaciones-app/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── layout/
│   │       └── Layout.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Clientes.jsx
│   │   ├── Cotizaciones.jsx
│   │   └── Referencias.jsx
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── App.jsx
│   └── main.jsx
├── netlify.toml
├── tailwind.config.js
└── package.json
```

## Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Vista previa del build de producción
