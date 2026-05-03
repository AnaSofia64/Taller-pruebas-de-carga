# Taller Pruebas de Carga y Rendimiento - Registraduria

**Curso:** Testing y Validacion de Software  
**Universidad de La Sabana - Maestria en Ingenieria de Software**

## Integrantes
*Ana Sofia Rodriguez, Juan Camilo Silva y Santiago Barrera*

---

## Estructura
perf/
├─ scripts/register_voter_k6.js   script principal k6
├─ data/voters.csv                210 filas de datos parametrizados
├─ results/                       generado al ejecutar (gitignore)
├─ ci/github-actions.yml          pipeline CI/CD
├─ defectos.md
└─ README.md
## Pre-requisitos

**1. Instalar k6:**
```bash
# Windows
winget install grafana.k6

# Linux / Mac
curl -s https://packagecloud.io/install/repositories/loadimpact/k6/script.deb.sh | sudo bash
sudo apt install k6

# Verificar
k6 version
```

**2. Levantar el servidor (usa el Taller 2):**
```bash
cd ../taller2-pruebas-integracion
mvn spring-boot:run
```

**3. Verificar que responde:**
```bash
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","id":1,"age":30,"gender":"FEMALE","alive":true}'
# Respuesta esperada: VALID
```

---

## Ejecucion de escenarios

```bash
# Crear carpeta de resultados
mkdir -p perf/results

# Baseline (referencia - ejecutar primero siempre)
k6 run -e SCENARIO=baseline \
  perf/scripts/register_voter_k6.js \
  --out json=perf/results/baseline.json

# Carga (0 -> 200 VUs)
k6 run -e SCENARIO=load \
  perf/scripts/register_voter_k6.js \
  --out json=perf/results/load.json

# Stress (punto de quiebre, 0 -> 600 VUs)
k6 run -e SCENARIO=stress \
  perf/scripts/register_voter_k6.js \
  --out json=perf/results/stress.json
```

---

## SLO definidos

| Metrica      | Objetivo   |
|--------------|------------|
| p95 latencia | <= 300 ms  |
| p99 latencia | <= 800 ms  |
| Error rate   | < 1%       |
| Throughput   | >= 100 req/s |

---

## Modelos de carga

| Escenario | VUs max | Duracion | Proposito                    |
|-----------|---------|----------|------------------------------|
| baseline  | 50      | ~8 min   | Linea base de rendimiento    |
| load      | 200     | ~40 min  | Carga esperada en produccion |
| stress    | 600     | ~35 min  | Punto de quiebre del sistema |

Se usa **closed model** (control de VUs) porque el sistema tiene usuarios
concurrentes con sesion, no una tasa de llegada aleatoria (open model).

---

## Matriz de rendimiento

| Escenario | Modelo        | Duracion | SLO p95   | Resultado  | Artefacto                     |
|-----------|---------------|----------|-----------|------------|-------------------------------|
| Baseline  | 50 VUs        | 8 min    | < 300 ms  | (ejecutar) | results/baseline_summary.json |
| Carga     | 0->200 VUs    | 40 min   | < 300 ms  | (ejecutar) | results/load_summary.json     |
| Stress    | 0->600 VUs    | 35 min   | < 300 ms  | (ejecutar) | results/stress_summary.json   |

*(Actualizar con resultados reales al ejecutar)*

---

## Guia de analisis

Al finalizar cada corrida k6 imprime en consola:
