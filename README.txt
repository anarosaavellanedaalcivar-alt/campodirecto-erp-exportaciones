CAMPODIRECTO ERP - MODULO DE EXPORTACIONES
===========================================

CONTENIDO
- index.html: estructura y formularios del módulo.
- styles.css: estilos adaptables a computadora, tablet y celular.
- app.js: registro, cálculo, búsqueda, filtros, detalle, eliminación y descarga CSV.

COMO PROBAR LOCALMENTE
1. Descomprime el archivo ZIP.
2. Abre la carpeta campodirecto-erp-exportaciones.
3. Abre index.html con Chrome, Edge o Firefox.
4. Registra una operación de prueba. Los datos se guardan en localStorage del navegador.

COMO PUBLICAR EN GITHUB PAGES
1. Entra en https://github.com e inicia sesión.
2. Crea un repositorio, por ejemplo: campodirecto-erp-exportaciones.
3. Puedes elegir Public si quieres publicar con GitHub Pages.
4. Pulsa Add file > Upload files.
5. Sube index.html, styles.css y app.js (y opcionalmente README.txt) a la raíz.
6. Pulsa Commit changes.
7. En el repositorio abre Settings > Pages.
8. En Build and deployment selecciona Deploy from a branch.
9. Selecciona Branch: main y Folder: /(root), luego Save.
10. Espera la publicación. GitHub mostrará el enlace de tu sitio en Settings > Pages.

IMPORTANTE SOBRE EL ALCANCE
Este es un prototipo funcional de interfaz con persistencia local en el navegador.
Los datos NO se comparten entre usuarios, dispositivos ni navegadores y no existe
autenticación ni respaldo centralizado. Para operar comercialmente, conecta una base
de datos y autenticación (por ejemplo Supabase), configura permisos, copias de seguridad
y validación del lado del servidor.

El sistema calcula valor comercial como cantidad x precio unitario y suma los costos
que el usuario registra. La diferencia comercial menos esos costos es solo referencial,
no utilidad contable, ni cálculo de valor aduanero, tributos, ni determinación automática
del valor FOB/CIF. El Incoterm se registra como dato contractual, no calcula obligaciones.

DOCUMENTOS
La lista de documentos es orientativa. Los requisitos dependen del producto, país,
destino y operación. Verificar requisitos vigentes con SENAE, Agrocalidad y autoridades
competentes del país importador. El módulo no transmite declaraciones a SENAE ni emite
certificados oficiales.
