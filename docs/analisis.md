# Análisis de diseño y decisiones (FakeStore)

## 1. Objetivo de la aplicación
La aplicación muestra productos obtenidos desde la API pública de FakeStore y permite al usuario:
- Ver productos en un layout tipo grid.
- Buscar por nombre o descripción.
- Filtrar por categoría.
- Ordenar por precio o nombre.
- Agregar y eliminar productos del carrito.
- Mantener el carrito guardado al recargar mediante localStorage.

## 2. Decisiones de UI/UX (interfaz y experiencia de usuario)
### Enfoque responsive (mobile first)
Se implementó un enfoque mobile first para asegurar buena experiencia en pantallas pequeñas y luego escalar a tablet/escritorio.

Breakpoints:
- Móvil: estilos base (hasta 767px).
- Tablet: 768px a 1023px (productos en 2 columnas).
- Escritorio: 1024px en adelante (productos en 3 columnas y carrito lateral).

### Organización visual
- Header simple con acceso visible al carrito (contador).
- Bloque de filtros en la parte superior para que el usuario pueda refinar resultados sin desplazarse demasiado.
- Productos como tarjetas con imagen, título, categoría, precio y botón claro de “Agregar al carrito”.
- Carrito visible:
  - En móvil/tablet: sección debajo de productos.
  - En escritorio: sidebar sticky para mantenerlo accesible mientras se navega.

### Accesibilidad y legibilidad
- Botones con tamaño adecuado, texto claro y contraste suficiente.
- Tipografía legible y espaciados consistentes.
- Se mantiene un lenguaje simple (nivel junior) evitando componentes complejos.

## 3. Estructura de datos (carrito)
El carrito se representa como un objeto JavaScript:

- Clave: id del producto
- Valor: objeto con { id, title, price, quantity }

Ejemplo:
cart = {
  "5": { "id": 5, "title": "Producto X", "price": 12.5, "quantity": 2 },
  "9": { "id": 9, "title": "Producto Y", "price": 99.0, "quantity": 1 }
}

Motivos:
- Acceso rápido por id.
- Fácil incrementar/decrementar quantity.
- Cálculo simple del total recorriendo las claves.

## 4. Persistencia con localStorage
El carrito se guarda en localStorage usando JSON:

- Guardado: JSON.stringify(cart)
- Carga: JSON.parse(storedCart)

Se actualiza localStorage cada vez que el usuario agrega o elimina productos, y se carga al iniciar para mantener el estado después de recargar.

## 5. Justificación de filtros, búsqueda y ordenamientos (usabilidad)
### Búsqueda (input)
Permite encontrar productos escribiendo parte del nombre o descripción, reduciendo el tiempo de exploración cuando hay muchos items.

### Filtro por categoría (change)
Ayuda a acotar el listado rápidamente a un tipo de producto, evitando scroll innecesario y mejorando la navegación.

### Ordenamiento (change)
- Precio asc/desc: útil para comparar opciones según presupuesto.
- Nombre A-Z/Z-A: útil cuando el usuario busca orden alfabético.

Los filtros se aplican en este orden:
1) búsqueda
2) categoría
3) ordenamiento
Esto mantiene resultados consistentes y predecibles.

## 6. Evidencias (wireframes)
Los wireframes/bocetos del proyecto se encuentran en:
- docs/wireframes/
Incluyen versiones para móvil, tablet y escritorio.
