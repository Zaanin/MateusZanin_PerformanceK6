import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Métricas personalizadas
const tempoRequisicao = new Trend('tempo_requisicao');
const taxaStatusCode = new Rate('status_code_sucesso');

export const options = {
  stages: [
    { duration: '5m', target: 300 }, // Rampa de 10 VUs até 300 em 5 minutos
  ],
  vus: 10, // Começa com 10 VUs
  thresholds: {
    http_req_duration: ['p(95)<5700'], // 95% abaixo de 5700ms
    http_req_failed: ['rate<0.12'],    // Menos de 12% de erro
    status_code_sucesso: ['rate>0.88'], // Nossa métrica customizada
  },
};

export default function () {
  const res = http.get('https://test-api.k6.io/public/crocodiles/');

  tempoRequisicao.add(res.timings.duration);
  taxaStatusCode.add(res.status === 200);

  check(res, {
    'status é 200': (r) => r.status === 200,
    'tempo aceitável': (r) => r.timings.duration < 5700,
  });

  sleep(1);
}
