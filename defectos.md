# Registro de Defectos - Taller Pruebas de Carga

## Defecto 01
- **Caso:** p95 supera el SLO bajo carga de 200 VUs
- **Esperado:** p95 < 300 ms
- **Obtenido:** p95 ~ 620 ms en escenario load
- **Causa probable:** H2 en memoria sin pool de conexiones: cada request
  abre y cierra una conexion JDBC nueva, generando overhead acumulado.
- **Estado:** Abierto
- **Evidencia:** perf/results/load_summary.json -> http_req_duration p(95)

## Defecto 02
- **Caso:** Error rate supera 1% en escenario stress (mas de 400 VUs)
- **Esperado:** error_rate < 1%
- **Obtenido:** error_rate ~ 3.2% a partir de 400 VUs
- **Causa probable:** Tomcat embebido tiene limite de 200 hilos por defecto,
  se satura con mas de 400 usuarios concurrentes.
- **Estado:** Abierto
- **Evidencia:** perf/results/stress_summary.json -> http_req_failed rate
- **Mejora:** server.tomcat.threads.max=400 en application.properties

## Defecto 03
- **Caso:** Throughput cae a 0 req/s durante ramp-down en stress
- **Esperado:** degradacion gradual al reducir VUs
- **Obtenido:** caida abrupta (posible crash del proceso JVM)
- **Causa probable:** OutOfMemoryError por acumulacion de objetos sin GC.
- **Estado:** Cerrado
- **Solucion aplicada:** Agregar -Xmx512m al arrancar la app en el pipeline.