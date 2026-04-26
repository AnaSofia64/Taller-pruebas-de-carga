# Registro de Defectos -- Pruebas de Carga y Rendimiento

Curso: Testing y Validación de Software\
Proyecto: Pruebas de Carga y Rendimiento\
Equipo: \[Nombre del equipo\]\
Fecha: \[Fecha\]

------------------------------------------------------------------------

## Introducción

Este documento recopila los defectos identificados durante la ejecución
de pruebas de rendimiento (Baseline, Load, Stress, Spike, Soak y
Regresión).\
Cada defecto se documenta para garantizar trazabilidad, análisis técnico
y propuesta de mejora.

------------------------------------------------------------------------

# Formato 1: Lista detallada

## Defecto PERF-01 --- Incumplimiento de SLO de latencia bajo Load

-   Capa afectada: Aplicación / Base de datos\
-   Escenario: Load Test (200 VUs)\
-   SLO definido: p95 \< 300 ms\
-   Resultado esperado: Cumplimiento del SLO bajo carga nominal.\
-   Resultado obtenido: p95 = 612 ms

### Evidencia

http_req_duration: avg=402ms\
p(95)=612ms\
p(99)=890ms

### Impacto

Incumplimiento del objetivo de nivel de servicio bajo carga esperada.

### Causa probable

-   Saturación del pool de conexiones.\
-   Consulta sin índice.

### Estado

Abierto

### Prioridad

Alta

------------------------------------------------------------------------

## Defecto PERF-02 --- Error rate elevado bajo Stress

-   Capa afectada: Servidor de aplicación\
-   Escenario: Stress Test (600 VUs)\
-   SLO definido: Error rate \< 1%\
-   Resultado obtenido: 3.8%

### Evidencia

http_req_failed: 3.8%\
status=500 detectado

### Impacto

Fallas del sistema bajo carga alta.

### Causa probable

-   Agotamiento de threads.\
-   Configuración insuficiente.

### Estado

En progreso

### Prioridad

Crítica

------------------------------------------------------------------------

## Defecto PERF-03 --- Degradación progresiva en Soak Test

-   Capa afectada: JVM / Memoria\
-   Escenario: Soak Test (2 horas)\
-   Resultado esperado: Latencia estable\
-   Resultado obtenido: Incremento progresivo de 210ms a 480ms

### Impacto

Posible fuga de memoria o acumulación de recursos.

### Estado

Abierto

### Prioridad

Media

------------------------------------------------------------------------

# Formato 2: Tabla de seguimiento

  ----------------------------------------------------------------------------------
  ID        Escenario   Resultado Esperado Resultado Obtenido Estado     Prioridad
  --------- ----------- ------------------ ------------------ ---------- -----------
  PERF-01   Load        p95 \< 300ms       612ms              Abierto    Alta

  PERF-02   Stress      Error \< 1%        3.8%               En         Crítica
                                                              progreso   

  PERF-03   Soak        Latencia estable   Degradación        Abierto    Media
  ----------------------------------------------------------------------------------

------------------------------------------------------------------------

## Convenciones de Estado

Abierto: Defecto identificado sin corrección aplicada.\
En progreso: En proceso de corrección.\
Resuelto: Corregido y validado con nuevas pruebas.

------------------------------------------------------------------------

Universidad de La Sabana -- Facultad de Ingeniería\
Curso: Testing y Validación de Software (2025-1)
