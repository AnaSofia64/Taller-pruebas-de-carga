
# Taller de Pruebas de Carga y Rendimiento

Este taller tiene como objetivo aprender a **diseñar, implementar y ejecutar pruebas de carga y rendimiento** sobre un sistema tipo API/HTTP, aplicando buenas prácticas de ingeniería, análisis de resultados y automatización con CI.

---

## 🎯 Objetivo General

Comprender, diseñar e implementar **pruebas de rendimiento** (baseline, carga, stress, spike, soak) con herramientas como **JMeter / k6 / Gatling**, definiendo **SLA/SLO**, modelos de carga, datos de prueba, y generando **reportes reproducibles** para la toma de decisiones técnicas.

---

## 📑 Índice

- [Conceptos clave](#conceptos-clave)
- [COMOCE EL TALLER](#comoce-el-taller)
  - [Estructura de proyecto](#estructura-de-proyecto)
  - [Herramientas y dependencias](#herramientas-y-dependencias)
- [Tipos de pruebas de rendimiento](#tipos-de-pruebas-de-rendimiento)
- [Diseño del plan de pruebas](#diseño-del-plan-de-pruebas)
- [Modelos de carga](#modelos-de-carga)
- [Escenarios de prueba](#escenarios-de-prueba)
- [Métricas y criterios de aceptación](#métricas-y-criterios-de-aceptación)
- [Script de ejemplo (JMeter)](#script-de-ejemplo-jmeter)
- [Ejecución local y en CI](#ejecución-local-y-en-ci)
- [Análisis de resultados](#análisis-de-resultados)
- [Buenas prácticas](#buenas-prácticas)
- [Para entregar](#para-entregar-con-este-taller)
- [Resumen del Taller](#hagamos-un-resumen)
- [Conclusión](#conclusión)
- [Recursos recomendados](#recursos-recomendados)
- [Créditos y uso académico](#créditos-y-uso-académico)
- [Licencia](#licencia-de-uso)

---

## Conceptos clave

- **Prueba de rendimiento**: evalúa la **capacidad del sistema** bajo diferentes niveles de carga (tiempo de respuesta, throughput, consumo de CPU/Memoria, errores).
- **Prueba de carga**: verifica el comportamiento del sistema en **niveles esperados de demanda** (usuarios concurrentes/reqs por segundo).
- **Prueba de estrés**: empuja el sistema **más allá de su capacidad** para identificar el punto de falla y su degradación.
- **Prueba de picos (spike)**: aplica aumentos **bruscos** de tráfico para evaluar elasticidad y resiliencia.
- **Prueba de resistencia (soak)**: mantiene una carga prolongada para descubrir **fugas de memoria**, acumulación de conexiones, etc.
- **SLA/SLO/SLI**: conceptos fundamentales de confiabilidad **acordados/objetivo** (p.ej., *p95 Latency < 300 ms, Error Rate < 1%*).

---

## COMOCE EL TALLER

### Estructura de proyecto

```gherkin
perf/
 ├─ scripts/                 # .jmx (JMeter), .js (k6) o .scala (Gatling)
 ├─ data/                    # datos de prueba (CSV, JSON)
 ├─ results/                 # reportes y artefactos (HTML/CSV/JTL)
 ├─ dashboards/              # plantillas de dashboards (Grafana, etc.)
 ├─ ci/                      # pipelines (GitHub Actions/Jenkins/GitLab CI)
 └─ README.md                # este documento
```

### Herramientas y dependencias

- **JMeter** (GUI + CLI): para crear planes de prueba (.jmx) y ejecutarlos en CLI para CI/CD.
- **k6** (CLI-first): scripts en JS, fácil de versionar, buen soporte de métricas.
- **Gatling** (Scala): alto desempeño, reportes HTML detallados.
- **Soporte de monitoreo**: Prometheus/Grafana, APM (New Relic, Datadog, Elastic APM).
- **Utilitarios**: `jq`, `csvkit`, `python` para post-procesamiento de resultados.

> Puedes usar **JMeter** como herramienta principal y complementar con k6 o Gatling según preferencias del equipo.

---

## Tipos de pruebas de rendimiento

1. **Smoke de performance**: 1–2 min, baja carga, valida que el entorno responde.
2. **Baseline**: establece la línea base (sin optimizaciones) para comparar.
3. **Carga**: demanda esperada (p.ej., 50–200 usuarios concurrentes).
4. **Estrés**: incrementos progresivos hasta saturación y fallo controlado.
5. **Picos (Spike)**: saltos abruptos (x5–x10) para medir recuperación.
6. **Resistencia (Soak)**: 1–4 horas (o más) a carga estable para detectar degradación.

---

## Diseño del plan de pruebas

- **Alcance**: endpoints críticos (p.ej., `POST /login`, `GET /orders`, `POST /register`).

**Ejemplo:**

**Ruta:** `POST /register`  
**Body esperado (JSON):**

```json
{
  "name": "Ana",
  "id": 100,
  "age": 30,
  "gender": "FEMALE",
  "alive": true
}
```

**Respuesta esperada:** `200 OK` con cuerpo `VALID` (texto).

> Puedes ajustar las validaciones del script si tu servicio responde de forma diferente (por ejemplo, JSON con campos específicos).

- **SLA/SLO**: p95 < 300 ms, p99 < 800 ms, error rate < 1%.
- **Datos de prueba**: usuarios, tokens, catálogos; evitar “caché feliz” usando **parametrización** y **correlación**.
- **Ambiente**: staging lo más **representativo** posible (réplicas, RAM/CPU, versión).
- **Calentamiento (warmup)**: 2–5 min para estabilizar JIT/cachés.
- **Monitoreo**: CPU, Mem, GC, hilos, conexiones, I/O, tiempos de DB y colas (RabbitMQ/Kafka si aplica).
- **Riesgos**: límites de rate, *throttling*, dependencias externas, *feature flags*.

---

## Modelos de carga

- **Usuarios concurrentes (VUs)**: cantidad de usuarios simultáneos.
- **Req/s (RPS)**: útil para APIs idempotentes.
- **Rampa (ramp-up/ramp-down)**: crecimiento/descenso controlado.
- **Closed vs Open models**: *closed* controla VUs; *open* controla la tasa de llegada (RPS).
- **Patrones de tráfico**: horario laboral, eventos, campañas, estacionalidad.

---

## Pre-requisitos

- Servicio **Spring Boot** corriendo localmente en `http://localhost:8080` (o URL base equivalente).
- **k6** instalado: <https://grafana.com/docs/k6/latest/get-started/installation/>
- (Opcional) Base de datos o perfil `perf` para datos sintéticos.

## Instalación de k6

### Windows

#### Opción 1 – Chocolatey

```bash
choco install k6
```

#### Opción 2 – Winget

```bash
winget install grafana.k6
```

#### Opción 3 – Manual

1. Descarga desde la página oficial:  
   [https://grafana.com/docs/k6/latest/get-started/installation/](https://grafana.com/docs/k6/latest/get-started/installation/)
2. Descomprime el `.zip` en:  
   `C:\Program Files\k6\`
3. Agrega esa ruta al **PATH** de tu sistema.
4. Verifica la instalación:

```bash
k6 version
```

### Linux / Mac

```bash
curl -s https://packagecloud.io/install/repositories/loadimpact/k6/script.deb.sh | sudo bash
sudo apt install k6
```

> Verifica siempre con `k6 version` que esté disponible globalmente.

---

## Escenarios de prueba

- **Escenario A – Baseline**: 5 min warmup + 10 min a 50 VUs, medir p50/p95/p99 y error rate.
- **Escenario B – Carga**: rampa 0→200 VUs en 10 min, sostener 20 min.
- **Escenario C – Estrés**: rampa 200→600 VUs, detectar punto de quiebre.
- **Escenario D – Spike**: saltos de 50→300 VUs por 1–2 min, recuperación a 50 VUs.
- **Escenario E – Soak**: 2 horas a 120 VUs, revisar GC, memoria y *leaks*.

---

## Métricas y criterios de aceptación

- **Latencias**: p50/p90/p95/p99, *max*.
- **Throughput**: req/s.
- **Errores**: 4xx, 5xx, timeouts, *connection reset*.
- **Recursos**: CPU, RAM, GC, FD, *threads*, conexiones DB, colas.
- **Capacidad**: utilización del 70–80% con SLO cumplidos.
- **Criterios**: aprobar si p95 ≤ SLO y errores ≤ 1%; reprobar si se exceden límites o hay *leaks*.

---

## Dataset mínimo `perf/data/persons.csv`

Ejemplo de **5 filas** (puedes ampliarlo a cientos/miles):

```csv
id,name,age,gender,alive
101,Juan,28,MALE,true
102,María,31,FEMALE,true
103,Carlos,25,MALE,true
104,Sofia,27,FEMALE,true
105,Andrés,35,MALE,true
```

---

## Script de prueba `perf/scripts/register_person_k6.js`

El script envía solicitudes `POST /register` con datos del CSV, valida **status 200** y que el cuerpo contenga `VALID`.  
Variables de entorno soportadas:

- `BASE_URL` (por defecto `http://localhost:8080`)
- `DATA_FILE` (por defecto `perf/data/persons.csv`)
- `SCENARIO`: `baseline` | `load` | `stress` (por defecto `baseline`)
- `TIMEOUT_MS`: timeout del cliente HTTP (por defecto `2000`)

> Si ya tienes el archivo desde el taller, úsalo tal cual. Si no, crea uno con el contenido proporcionado anteriormente.

---

## Paso a paso: **Ejecución básica**

### 1) Levanta el servicio

```bash
mvn -DskipTests spring-boot:run
# o
java -jar target/app.jar
```

Confirma que `/register` responde con `200 OK` y `VALID` para un JSON válido.

```bash
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Ana\",\"id\":1,\"age\":30,\"gender\":\"FEMALE\",\"alive\":true}"
```

### 2) Baseline (calentamiento + medición corta)

```bash
set BASE_URL="http://localhost:8080" 
set SCENARIO="baseline" 
set k6 run perf/scripts/register_person_k6.js -o json=perf/results/baseline.json
```

### 3) Carga (rampa hasta 200 VUs)

```bash
set BASE_URL=http://localhost:8080
set SCENARIO='load' 
k6 run perf/scripts/register_person_k6.js -o json=perf/results/load.json
```

### 4) Resultados

Al finalizar cada corrida, k6 mostrará algo como:

```gherkin
http_req_duration........: p(95)=220ms p(99)=410ms
http_req_failed..........: 0.7%
iterations...............: 10k
```

Guarda los `*.json` en `perf/results/` y documenta un breve análisis.

---

## SLO / SLA sugeridos (ajústalos a tu entorno)

| Métrica         | Objetivo            |
|-----------------|---------------------|
| p95 latencia    | ≤ 300 ms            |
| p99 latencia    | ≤ 800 ms            |
| Error rate      | < 1%                |
| Throughput base | ≥ 100 req/s (referencia) |

> Considera tu hardware/infra: en máquinas locales, el throughput puede ser menor; en staging/cluster, mayor.

---

## Ejecución local y en CI

- **Local**: validar *smoke* (1–2 min) antes de cargas largas.
- **CI/CD**:
  - GitHub Actions / Jenkins / GitLab CI ejecutan escenarios clave.
  - Publicar artefactos: `*.jtl`, reportes HTML, gráficos.
  - **Gates** de calidad: fallar el *pipeline* si p95 > SLO o error rate > 1%.
  - Paralelizar por escenarios (baseline, carga, estrés).

**Ejemplo mínimo (GitHub Actions)**:

```yaml
name: perf-tests
on: [push, workflow_dispatch]
jobs:
  jmeter:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup JMeter
        run: |
          sudo apt-get update && sudo apt-get install -y jmeter
      - name: Run baseline
        run: |
          jmeter -n -t perf/scripts/checkout.jmx -Jusers=50 -Jrampup=120 -l perf/results/baseline.jtl                  -e -o perf/results/baseline-report
      - name: Publish artifacts
        uses: actions/upload-artifact@v4
        with:
          name: perf-results
          path: perf/results/**
```

---

## Análisis de resultados

1. **Valida primero errores y p95**: si no cumple SLO, no sigas afinando.
2. **Correlaciona** latencias con **CPU/RAM/GC/DB** para ubicar cuellos de botella.
3. **Perf triage**:
   - ¿Baja reutilización de conexiones? ⇒ HikariCP/pool tuning.
   - ¿Elevada latencia en DB? ⇒ índices, *query plan*, N+1, cacheo.
   - **I/O bloqueante** en APIs externas ⇒ *timeouts*, *circuit breakers*, *bulkheads*.
   - **GC/heap**: revisa *young/old gen*, *pause times*.
4. **Compara con baseline**: muestra mejoras en %.
5. **Repite**: optimiza → re-ejecuta → documenta.

---

## Buenas prácticas

1. **Datos realistas**: variabilidad para evitar cachés engañosos.
2. **Correlación**: extrae tokens/IDs en lugar de valores fijos.
3. **Warmup**: estabiliza JIT y cachés antes de medir.
4. **Modelo de carga correcto**: *open* vs *closed* según negocio.
5. **Evidencia reproducible**: versiona scripts, datos y reportes.
6. **No mezclar** cambios de código y de entorno entre corridas.
7. **Observabilidad**: logs con *traceId*, métricas, *profilers* puntuales.

---

## PARA ENTREGAR CON ESTE TALLER

### 1) Repositorio

- **Repositorio Git** con carpeta `perf/` y scripts (JMeter/k6/Gatling).
- `README.md` con **SLA/SLO**, escenarios, cómo ejecutar y interpretar resultados.
- **Datos de prueba** en `perf/data/` (sin información sensible).
- **Resultados** (`perf/results/`) con reportes HTML/CSV de las corridas.

### 2) Wiki (obligatoria)

Estructura mínima sugerida:

- **Inicio**: dominio del sistema y objetivos de rendimiento.
- **Tipos de pruebas**: baseline, carga, stress, spike, soak (con tablas).
- **Modelos de carga**: VUs vs RPS; *open* vs *closed*.
- **Plan de pruebas**: SLA/SLO, escenarios, ambiente, riesgos.
- **Ejecución**: comandos, *pipeline* CI, artefactos.
- **Resultados**: capturas de reportes y análisis (p95, errores, recursos).
- **Conclusiones técnicas**: hallazgos y *trade-offs*.
- **Mejoras propuestas**: acciones de performance tuning.

### 3) Escenarios y scripts

- ≥ **3 escenarios** (baseline, carga, estrés) implementados y versionados.

- `perf/scripts/register_voter_k6.js`
- `perf/data/voter.csv` (≥ 200 filas)
- `perf/results/*` (`baseline.json`, `load.json`)
- Breve análisis: p95/p99, error rate, hallazgos y próximas acciones.

- **Parametrización** y **correlación** en el script (tokens/IDs dinámicos).
- **Asserts** de tiempo de respuesta y código HTTP.

### 4) Reportes y cobertura de escenarios

- Reporte **HTML** por escenario y artefactos `*.jtl`/`*.json`.
- Tabla de **comparación** vs baseline con % de mejora/degradación.

### 5) Matriz de pruebas de rendimiento

| Escenario | Modelo | Duración | SLO | Resultado | Artefactos |
|---|---|---|---|---|---|
| Baseline | 50 VUs, p95<300ms | 15 min | p95<300ms | Cumple / No | `results/baseline-report/` |
| Carga | 0→200 VUs 20 min | p95<500ms | Cumple / No | `results/load-report/` |
| Estrés | 200→600 VUs | Error<1% | Cumple / No | `results/stress-report/` |

### 6) Gestión de defectos

- **`defectos.md`** con al menos 1 hallazgo (ej.: N+1, timeout, fuga de memoria), evidencia y estado.

### 7) Integración continua

- *Pipeline* que ejecute **baseline** y **carga** en cada PR; **estrés/soak** on-demand.
- **Gates** automáticos (fallar si SLO no se cumple).

### 8) Reflexión final (en el Wiki)

- ¿Qué métrica fue más sensible y por qué?
- ¿Cuál fue el principal cuello de botella y cómo lo mitigaste?
- ¿Qué cambiarías del diseño para mejorar el rendimiento?

### 9) Rúbrica – Taller de Pruebas de Carga y Rendimiento

| **Criterios de evaluación** | **Indicadores de cumplimiento** | **Excelente (5 pts)** | **Bueno (4 pts)** | **Necesita mejorar (3.5 pts)** | **Deficiente (2.5 pts)** | **No cumple (0 pts)** |
|---|---|---|---|---|---|---|
| **Estructura del repositorio** | `perf/` con scripts, datos, resultados y README claro. | Estructura impecable y reproducible. | Clara, pocos ajustes. | Parcialmente ordenada. | Desorden o ejecuciones fallan. | No entrega. |
| **Plan de pruebas (SLA/SLO, modelos, escenarios)** | Definición y justificación. | Completo y alineado al negocio. | Completo con leves omisiones. | Parcial e impreciso. | Incompleto y confuso. | Ausente. |
| **Scripts (parametrización, correlación, asserts)** | Calidad técnica. | Correctos, robustos y comentados. | Correctos con detalles menores. | Limitados o frágiles. | Errores o sin correlación. | No existen. |
| **Ejecución y artefactos** | Reportes HTML/CSV y evidencias. | Artefactos limpios y comparables. | Artefactos adecuados. | Evidencia parcial. | Artefactos incompletos. | Sin evidencia. |
| **Análisis de resultados** | Diagnóstico y recomendaciones. | Análisis profundo y accionable. | Análisis correcto. | Superficial o sin datos. | Conclusiones erróneas. | No analiza. |
| **CI/CD y gates** | Automatización y umbrales. | Pipeline con gates efectivos. | Pipeline básico. | Pipeline parcial. | Pipeline defectuoso. | Sin CI. |
| **Matriz de rendimiento** | Tabla y trazabilidad. | Completa y consistente. | Adecuada con omisiones leves. | Incompleta. | Confusa. | Ausente. |
| **Gestión de defectos** | Registro y estado. | Casos bien documentados. | Casos adecuados. | Superficial. | Sin evidencia. | Ausente. |
| **Reflexión técnica** | Aprendizajes y mejoras. | Profunda y clara. | Correcta. | Breve. | Vaga. | Ausente. |

| Rango de puntaje | Desempeño                                                |
| ---------------- | -------------------------------------------------------- |
| 45 – 50          | Excelente dominio técnico y metodológico.                |
| 35 – 44          | Buen trabajo con documentación o cobertura parcial.      |
| 30 – 34          | Cumple con lo básico pero sin profundidad.               |
| < 30             | No cumple con los criterios mínimos del taller/proyecto. |

---

## Hagamos un resumen

- Define **SLA/SLO**, escenarios y **modelo de carga** adecuado.
- Versiona **scripts, datos y resultados** para reproducibilidad.
- Ejecuta en **CI** con **gates** automáticos.
- Analiza **p95, errores y recursos**; prioriza cuellos de botella.
- Itera: **mide → optimiza → vuelve a medir**.

---

## Conclusión

Las **pruebas de carga y rendimiento** brindan evidencia objetiva para **dimensionar, optimizar y dar confiabilidad** al sistema bajo demanda realista. Integradas a CI/CD, permiten **evitar degradaciones** y sostener la calidad en producción.

---

## Recursos recomendados

- Apache JMeter (User Manual)
- k6 (docs.k6.io)
- Gatling (gatling.io)
- Google SRE Book – Service Level Objectives
- *Systems Performance* – Brendan Gregg
- *Release It!* – Michael Nygard

---

## Créditos y uso académico

**Autor:** César Augusto Vega Fernández
**Curso:** Testing y Validación de Software
**Programa:** Maestría en Ingeniería de Software – Universidad de La Sabana
**Año:** 2025

Este taller es material académico para el curso *Testing y Validación de Software* y está orientado a fortalecer competencias de **planificación y ejecución de pruebas de rendimiento**, automatización y análisis.

---

## Licencia de uso

Este material se distribuye bajo **CC BY-NC-SA 4.0**. Puedes **usar, adaptar o compartir** con fines educativos, siempre que:

1. Se reconozca la autoría del profesor **César Augusto Vega Fernández**.
2. No se utilice con fines comerciales.
3. Las obras derivadas se distribuyan bajo la misma licencia.
