/**
 * Script de pruebas de carga con k6 - Registraduria Electoral
 * Endpoint: POST /register
 *
 * Escenarios (variable SCENARIO):
 *   baseline → warmup + 10 min a 50 VUs
 *   load     → rampa 0 -> 200 VUs, sostener 20 min
 *   stress   → rampa escalonada hasta 600 VUs
 *
 * Ejecucion:
 *   k6 run perf/scripts/register_voter_k6.js
 *   k6 run -e SCENARIO=load perf/scripts/register_voter_k6.js
 *   k6 run -e SCENARIO=stress -e BASE_URL=http://miservidor:8080 perf/scripts/register_voter_k6.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

// ─── Metricas personalizadas ─────────────────────────────────────────────────
const validRegistrations   = new Counter('valid_registrations');
const duplicatedResults    = new Counter('duplicated_results');
const rejectedResults      = new Counter('rejected_results');
const errorRate            = new Rate('error_rate');
const registrationDuration = new Trend('registration_duration', true);

// ─── Configuracion ────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL  || 'http://localhost:8080';
const SCENARIO = __ENV.SCENARIO  || 'baseline';
const TIMEOUT  = __ENV.TIMEOUT_MS ? `${__ENV.TIMEOUT_MS}ms` : '2000ms';

// ─── Datos de prueba (CSV compartido entre VUs) ───────────────────────────────
const voters = new SharedArray('voters', function () {
  const raw = open('../data/voters.csv');
  return papaparse.parse(raw, { header: true, skipEmptyLines: true }).data;
});

// ─── Definicion de escenarios ─────────────────────────────────────────────────
const scenarios = {

  // Baseline: establece la linea base de rendimiento
  baseline: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m',  target: 10 }, // warmup suave
      { duration: '5m',  target: 50 }, // carga estable
      { duration: '1m',  target: 0  }, // ramp-down
    ],
    gracefulRampDown: '30s',
  },

  // Load: simula la carga esperada en produccion
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '5m',  target: 50  }, // warmup
      { duration: '10m', target: 200 }, // rampa hacia carga esperada
      { duration: '20m', target: 200 }, // sostener carga
      { duration: '5m',  target: 0   }, // ramp-down
    ],
    gracefulRampDown: '30s',
  },

  // Stress: detecta el punto de quiebre del sistema
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '5m', target: 100 },
      { duration: '5m', target: 200 },
      { duration: '5m', target: 300 },
      { duration: '5m', target: 400 },
      { duration: '5m', target: 500 },
      { duration: '5m', target: 600 }, // punto de quiebre esperado
      { duration: '5m', target: 0   }, // ramp-down
    ],
    gracefulRampDown: '30s',
  },
};

// ─── Opciones globales de k6 ──────────────────────────────────────────────────
export const options = {
  scenarios: {
    registry_test: scenarios[SCENARIO] || scenarios.baseline,
  },

  // SLO / criterios de aceptacion (el test falla si no se cumplen)
  thresholds: {
    http_req_duration:     ['p(95)<300', 'p(99)<800'],
    http_req_failed:       ['rate<0.01'],
    error_rate:            ['rate<0.01'],
    registration_duration: ['p(95)<300'],
  },
};

// ─── Funcion principal (ejecutada por cada VU en cada iteracion) ──────────────
export default function () {

  // Seleccionar votante del CSV de forma circular por VU
  const voter    = voters[(__VU * __ITER + __VU) % voters.length];

  // ID unico por VU + iteracion para evitar duplicados no deseados
  const uniqueId = parseInt(voter.id) + (__VU * 10000) + __ITER;

  const payload = JSON.stringify({
    name:   voter.name,
    id:     uniqueId,
    age:    parseInt(voter.age),
    gender: voter.gender,
    alive:  voter.alive === 'true',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
    timeout: TIMEOUT,
  };

  // ── Act: enviar solicitud HTTP ────────────────────────────────────────────
  const start = Date.now();
  const res   = http.post(`${BASE_URL}/register`, payload, params);
  const elapsed = Date.now() - start;

  registrationDuration.add(elapsed);

  // ── Assert: verificar respuesta ───────────────────────────────────────────
  const ok = check(res, {
    'status es 200': (r) => r.status === 200,
    'body no esta vacio': (r) => r.body && r.body.length > 0,
    'resultado reconocido': (r) =>
      ['VALID', 'DUPLICATED', 'DEAD', 'UNDERAGE', 'INVALID', 'INVALID_AGE']
        .includes(r.body),
    'tiempo de respuesta < 300ms': () => elapsed < 300,
  });

  // ── Contabilizar por tipo de resultado ────────────────────────────────────
  if (res.status === 200) {
    if (res.body === 'VALID')           validRegistrations.add(1);
    else if (res.body === 'DUPLICATED') duplicatedResults.add(1);
    else                                rejectedResults.add(1);
  }

  errorRate.add(!ok || res.status !== 200);

  // ── Pausa entre iteraciones (simula usuario real) ─────────────────────────
  sleep(Math.random() * 1 + 0.5); // 0.5s - 1.5s
}

// ─── Resumen personalizado al finalizar ───────────────────────────────────────
export function handleSummary(data) {
  const p95    = data.metrics.http_req_duration.values['p(95)'];
  const p99    = data.metrics.http_req_duration.values['p(99)'];
  const errors = data.metrics.http_req_failed.values.rate;
  const rps    = data.metrics.http_reqs.values.rate;
  const passed = p95 < 300 && errors < 0.01;

  console.log('\n================================================');
  console.log(`  ESCENARIO : ${SCENARIO.toUpperCase()}`);
  console.log(`  RESULTADO : ${passed ? 'SLO CUMPLIDO' : 'SLO INCUMPLIDO'}`);
  console.log(`  p95       : ${p95.toFixed(0)} ms  (SLO: < 300 ms)`);
  console.log(`  p99       : ${p99.toFixed(0)} ms  (SLO: < 800 ms)`);
  console.log(`  Error rate: ${(errors * 100).toFixed(2)}%   (SLO: < 1%)`);
  console.log(`  Throughput: ${rps.toFixed(1)} req/s`);
  console.log('================================================\n');

  return {
    [`perf/results/${SCENARIO}_summary.json`]: JSON.stringify(data, null, 2),
    stdout: JSON.stringify(data.metrics, null, 2),
  };
}