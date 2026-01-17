# Manual de Usuario
## Sistema de Gestión Documental - FIEC

---

## 1. Introducción

El Sistema de Gestión Documental de la Facultad de Ingeniería en Electricidad y Computación (FIEC) es una aplicación web diseñada para optimizar el seguimiento, control y gestión de procesos documentales institucionales. Este manual proporciona las instrucciones necesarias para utilizar todas las funcionalidades del sistema.

---

## 2. Acceso al Sistema

### 2.1 Inicio de Sesión

1. Acceda a la URL del sistema proporcionada por el administrador.
2. Ingrese sus credenciales:
   - **Correo electrónico institucional**
   - **Contraseña**
3. Haga clic en el botón **"Iniciar Sesión"**.

### 2.2 Recuperación de Contraseña

Si olvidó su contraseña, contacte al administrador del sistema para solicitar el restablecimiento de credenciales.

---

## 3. Panel Principal

Al iniciar sesión, accederá al panel principal que muestra:

- **Resumen de procesos**: Vista general de procesos pendientes, en progreso y completados.
- **Accesos rápidos**: Botones para crear nuevos procesos y acceder a plantillas.
- **Navegación lateral**: Menú con acceso a todas las secciones del sistema.

---

## 4. Gestión de Procesos

### 4.1 Crear un Nuevo Proceso

1. Haga clic en el botón **"Nuevo Proceso"** en el panel principal.
2. Complete el formulario:
   - **Tipo de proceso**: Seleccione la categoría correspondiente.
   - **Plantilla**: Elija la plantilla que define los pasos del proceso.
   - **Título**: Ingrese un nombre descriptivo.
   - **Año y Mes**: Especifique el período correspondiente.
   - **Fecha límite** (opcional): Establezca una fecha de vencimiento.
   - **Responsable**: Seleccione el usuario responsable del proceso (por defecto es usted mismo, puede delegarlo a otro usuario).
3. Haga clic en **"Crear Proceso"**.

### 4.2 Visualizar Procesos

La lista de procesos muestra:

| Campo | Descripción |
|-------|-------------|
| Tipo | Categoría del proceso |
| Título | Nombre identificativo |
| Año | Período correspondiente |
| Responsable | Usuario asignado |
| Estado | Pendiente, En Progreso o Completado |
| Progreso | Porcentaje de pasos completados |

### 4.3 Filtros y Búsqueda

- **Búsqueda**: Ingrese términos para buscar por título del proceso o nombre de pasos. Si la coincidencia es en un paso específico, se mostrará un indicador "Coincide en paso: [nombre]".
- **Filtro por año**: Seleccione un año específico.
- **Filtro por estado**: Filtre por procesos pendientes o completados.
- **Filtro por tipo**: Seleccione una categoría específica.

### 4.4 Detalle del Proceso

Al hacer clic en un proceso, accederá a la vista detallada que incluye:

- **Información general**: Estado, responsable, fechas.
- **Lista de pasos**: Cada paso muestra su estado y documentos asociados.
- **Botón Delegar**: Permite asignar el proceso a otro usuario del sistema.
- **Acciones**: Subir documentos, marcar pasos como completados.

### 4.5 Delegación de Procesos

Para delegar un proceso a otro usuario:

1. Acceda al detalle del proceso.
2. Junto al nombre del responsable actual, haga clic en el botón **"Delegar"**.
3. Seleccione el nuevo usuario responsable de la lista desplegable.
4. Confirme la asignación haciendo clic en **"Delegar"**.

**Nota**: El proceso delegado aparecerá automáticamente en la lista de procesos del nuevo responsable.

---

## 5. Gestión de Documentos

### 5.1 Subir Documentos

1. En el detalle del proceso, localice el paso correspondiente.
2. Haga clic en el botón **"Subir"** (icono de carga).
3. Seleccione el archivo desde su dispositivo.
4. Complete los campos requeridos:
   - **Nombre del documento**
   - **Tipo de documento** (si aplica)
5. Confirme la carga.

### 5.2 Formatos Soportados

El sistema acepta los siguientes formatos:
- Documentos: PDF, DOC, DOCX
- Hojas de cálculo: XLS, XLSX
- Imágenes: JPG, PNG
- Otros: Según configuración del administrador

### 5.3 Visualizar y Descargar Documentos

- **Vista previa**: Haga clic en el icono de ojo para previsualizar documentos PDF.
- **Descarga**: Haga clic en el icono de descarga para obtener el archivo.
- **Descarga masiva**: Use el botón "Exportar ZIP" para descargar todos los documentos de un proceso.

### 5.4 Eliminar Documentos

1. Localice el documento en la lista de archivos del paso.
2. Haga clic en el icono de eliminar (papelera).
3. Confirme la eliminación en el diálogo de confirmación.

---

## 6. Gestión de Plantillas

### 6.1 Acceder a Plantillas

1. En el menú lateral, seleccione **"Plantillas"**.
2. Visualice la lista de plantillas disponibles por categoría.

### 6.2 Crear una Nueva Plantilla

1. Haga clic en **"Nueva Plantilla"**.
2. Complete la información básica:
   - **Nombre**: Identificador de la plantilla.
   - **Descripción**: Propósito y uso de la plantilla.
   - **Tipo de proceso**: Categoría a la que pertenece.
   - **Bloquear plantilla**: Active esta opción si desea que solo administradores puedan modificarla.
3. Defina los pasos:
   - Haga clic en **"Agregar Paso"** para cada etapa del proceso.
   - Configure: nombre, descripción, documentos requeridos y si es obligatorio.
4. Guarde la plantilla.

### 6.3 Editar Plantilla

1. Localice la plantilla en la lista.
2. Haga clic en el icono de edición (lápiz).
3. Modifique los campos necesarios.
4. Guarde los cambios.

**Nota**: Las plantillas con el icono de candado (🔒) son plantillas bloqueadas y solo pueden ser editadas por administradores.

### 6.4 Activar/Desactivar Plantilla

- Las plantillas inactivas no aparecen en la selección al crear procesos.
- Use el interruptor de estado para cambiar la disponibilidad.

---

## 7. Administración de Usuarios

*(Disponible solo para usuarios con rol de Administrador)*

### 7.1 Gestionar Usuarios

1. Acceda a **"Configuración" > "Usuarios"**.
2. Visualice la lista de usuarios registrados.

### 7.2 Crear Usuario

1. Haga clic en **"Nuevo Usuario"**.
2. Complete los datos:
   - Nombre completo
   - Correo electrónico
   - Rol (Administrador, Gestor, Lector, Ayudante)
3. Guarde el usuario.

### 7.3 Modificar Usuario

1. Seleccione el usuario de la lista.
2. Edite los campos necesarios.
3. Guarde los cambios.

### 7.4 Roles del Sistema

| Rol | Permisos |
|-----|----------|
| Administrador | Acceso total al sistema, gestión de usuarios, edición de plantillas bloqueadas, visualización de todos los procesos |
| Gestor | Gestión completa de procesos y plantillas, puede crear y delegar procesos |
| Lector | Visualización de procesos asignados, puede subir documentos a los pasos |
| Ayudante | Acceso limitado de apoyo, visualización y colaboración en procesos asignados |

---

## 8. Reportes y Exportación

### 8.1 Exportar Procesos

1. En la lista de procesos, seleccione los procesos deseados.
2. Haga clic en **"Exportar"**.
3. Seleccione el formato (Excel, PDF).
4. Descargue el archivo generado.

### 8.2 Exportar Documentos de un Proceso

1. Acceda al detalle del proceso.
2. Haga clic en **"Descargar ZIP"**.
3. Obtenga todos los documentos asociados en un archivo comprimido.

---

## 9. Preguntas Frecuentes

### ¿Cómo cambio mi contraseña?
Contacte al administrador del sistema para solicitar el cambio de credenciales.

### ¿Puedo recuperar un proceso eliminado?
No. Los procesos eliminados no pueden recuperarse. Asegúrese antes de confirmar la eliminación.

### ¿Por qué no puedo editar una plantilla?
Verifique si la plantilla está bloqueada (icono de candado). Solo los administradores pueden modificar plantillas bloqueadas.

### ¿Cómo delego un proceso a otro usuario?
En el detalle del proceso, haga clic en el botón "Delegar" junto al nombre del responsable actual y seleccione el nuevo usuario.

### ¿Por qué no veo ciertos procesos?
Solo puede ver procesos que usted creó o que le fueron delegados, a menos que tenga rol de Administrador.

---

## 10. Soporte Técnico

Para reportar problemas o solicitar asistencia:

- **Correo**: [correo de soporte institucional]
- **Teléfono**: [número de contacto]
- **Horario de atención**: Lunes a Viernes, 8:00 - 17:00

---

*Documento elaborado para el Sistema de Gestión Documental FIEC*  
*Versión 1.0 - Enero 2026*
