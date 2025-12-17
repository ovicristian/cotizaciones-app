# 🚀 Instrucciones de Configuración - Sistema de Cotizaciones

## ✅ Proyecto Base Completado

El proyecto React ya está creado y funcionando en desarrollo. Ahora necesitas completar estos pasos:

---

## 📋 PASO 1: Crear cuenta en Supabase

1. Ve a https://supabase.com
2. Crea una cuenta gratuita (puedes usar Google/GitHub)
3. Haz clic en "New Project"
4. Rellena:
   - **Name**: cotizaciones-internacional (o el nombre que quieras)
   - **Database Password**: Crea una contraseña segura (¡guárdala!)
   - **Region**: South America (São Paulo) - más cercano a Colombia
   - **Plan**: Free

---

## 📋 PASO 2: Crear las tablas en Supabase

1. En tu proyecto de Supabase, ve al menú lateral: **SQL Editor**
2. Haz clic en "New Query"
3. Copia y pega TODO el contenido del archivo `supabase-setup.sql`
4. Haz clic en **Run** (o presiona Ctrl+Enter)
5. Deberías ver: "Success. No rows returned"

Esto creará:
- ✅ Tabla `clientes`
- ✅ Tabla `referencias` (productos)
- ✅ Tabla `cotizaciones`
- ✅ Tabla `cotizacion_referencias`
- ✅ Todas las políticas de seguridad (RLS)
- ✅ Índices de base de datos

---

## 📋 PASO 3: Obtener las credenciales de Supabase

1. En Supabase, ve a **Settings** (⚙️ en el menú lateral)
2. Luego a **API**
3. Encontrarás dos valores importantes:

   **Project URL**: `https://xxxxx.supabase.co`
   **anon public key**: `eyJhbGciOiJIUz...` (clave larga)

4. **¡COPIA ESTOS VALORES!**

---

## 📋 PASO 4: Configurar variables de entorno

1. En el proyecto, copia el archivo `.env.example` como `.env`:
   ```bash
   cp .env.example .env
   ```

2. Abre el archivo `.env` y reemplaza con tus datos reales:
   ```
   VITE_SUPABASE_URL=https://tuproyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Guarda el archivo

---

## 📋 PASO 5: Crear primer usuario

1. En Supabase, ve a **Authentication** > **Users**
2. Haz clic en "Add user" > "Create new user"
3. Ingresa:
   - **Email**: tu@email.com
   - **Password**: Una contraseña que recuerdes
4. Desmarca "Auto Confirm User" (para confirmar automáticamente)
5. Haz clic en "Create user"

---

## 📋 PASO 6: Probar la aplicación

1. Si el servidor de desarrollo no está corriendo, ejecútalo:
   ```bash
   npm run dev
   ```

2. Abre http://localhost:5173 en tu navegador

3. Deberías ver la pantalla de login

4. Ingresa las credenciales que creaste en el PASO 5

5. Si todo está bien, entrarás al Dashboard con el menú lateral

---

## 🎯 Verificación

Después de loguearte, deberías poder:
- ✅ Ver el Dashboard
- ✅ Navegar por el menú lateral
- ✅ Ver las páginas de Clientes, Cotizaciones, Referencias (vacías por ahora)
- ✅ Cerrar sesión

---

## 💱 IMPORTANTE: Sistema de Moneda

**Los precios funcionan así:**

1. **Referencias**: Precio en **COP** (pesos colombianos)
   - Ejemplo: ACUTRAX = $9,500 COP

2. **Cotizaciones**: Tienen campo **tasa_cambio**
   - Ejemplo: 4,000 = $4,000 COP por cada $1 USD

3. **Conversión automática**: Precio USD = Precio COP ÷ Tasa
   - $9,500 ÷ 4,000 = $2.375 USD

📖 **Lee `SISTEMA-MONEDA.md` para más detalles**

---

## 🚨 Problemas Comunes

### "Invalid API key"
- Verifica que copiaste correctamente el `VITE_SUPABASE_ANON_KEY`
- Asegúrate que el archivo `.env` está en la raíz del proyecto
- Reinicia el servidor de desarrollo después de editar `.env`

### "Invalid login credentials"
- Verifica que el usuario esté confirmado en Supabase
- Asegúrate de usar el email y password correctos

### Las tablas están vacías
- Normal! Aún no has agregado datos
- Los formularios de creación se implementarán en la siguiente fase

---

## 🔥 Deploy en Netlify (Opcional ahora)

Cuando quieras publicar tu app en internet:

1. Sube tu proyecto a GitHub
2. Ve a https://netlify.com
3. "Add new site" > "Import an existing project"
4. Conecta tu repositorio de GitHub
5. Netlify detectará automáticamente la configuración
6. En "Environment variables", agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy!

---

## 📁 Archivos Importantes

- **`.env`**: Configuración local (NO subir a GitHub)
- **`supabase-setup.sql`**: Script de base de datos
- **`README.md`**: Documentación del proyecto
- **`netlify.toml`**: Configuración para deploy

---

## 🎓 Próximos Pasos (Desarrollo)

Una vez que la app esté funcionando:

1. **Formularios**: Crear/Editar Clientes, Referencias, Cotizaciones
2. **Validaciones**: Validar datos de formularios
3. **CSV Import**: Importación masiva de referencias
4. **PDF Generation**: Generar proformas y listas de empaque
5. **Búsqueda y Filtros**: Filtrar tablas de datos
6. **Paginación**: Para tablas grandes

---

¿Algún problema? Revisa los logs de la consola del navegador (F12) y los errores de Supabase.
