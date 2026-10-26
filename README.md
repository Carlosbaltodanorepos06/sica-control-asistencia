# SICA - Sistema Integral de Control de Asistencia

Prototipo web navegable del proyecto universitario de **Ingeniería de Software**.
Empresa del caso: Grupo Comercial Horizonte, S.A. (empresa ficticia), casa matriz y seis sucursales.

**Demostración:** https://carlosbaltodanorepos06.github.io/sica-control-asistencia/

> Todos los datos son ficticios. Ningún registro es una marca laboral real ni una instrucción de pago.

## Problema
El control de salidas se hace en libros físicos: hay anotaciones tardías, firmas por otras personas y errores al pasar la información a Excel, lo que ya causó un pago de más.

## Qué demuestra el prototipo
| Módulo | Requisito |
|---|---|
| Inicio / dashboard | RF-14 |
| Marcación (entrada, salida, duplicados y secuencia inválida) | RF-06, RF-08 |
| Personal (tabla, filtros, alta) | RF-03 |
| Horarios y reglas | RF-05 |
| Incidencias (formulario, aprobación con observación) | RF-12, RF-13 |
| Reportes (filtros y advertencias antes de exportar) | RF-15 |
| Auditoría (solo lectura) | RF-17 |
| Roles: empleado, supervisor, RR. HH., administrador | RF-02 |

## Cómo usarlo
Abre la página y elige un rol en la pantalla de inicio. El menú cambia según el rol.
Los cambios se guardan solo en memoria: al recargar la página, se reinician.

Para ejecutarlo en tu computadora basta con abrir `index.html` en el navegador. No requiere instalación.

## Qué es simulado
No prueba biometría, GPS real, seguridad de la API, persistencia en Firestore ni el cálculo de nómina.
Esas funciones se comprueban en la versión conectada (carpeta `firebase/`).

## Equipo
Tania Valentina Cinto Bonilla, Carlos Abraham Baltodano Luna, Ronaldo José Mejía Gutiérrez, Yasmir Exequiel Cárcamo Carrero.
