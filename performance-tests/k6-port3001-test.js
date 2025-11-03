import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// 自定义指标
export let errorRate = new Rate('errors');

// 测试配置
export let options = {
  stages: [
    { duration: '30s', target: 5 },   // 预热
    { duration: '2m', target: 10 },   // 10并发用户
    { duration: '1m', target: 25 },   // 增加到25
    { duration: '2m', target: 25 },   // 25并发用户
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // P95 < 1000ms
    http_req_failed: ['rate<0.1'],     // 错误率 < 10%
    errors: ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:3001';

export default function () {
  // 场景1: 健康检查
  let healthResponse = http.get(`${BASE_URL}/healthz`, {
    timeout: '5s'
  });
  
  check(healthResponse, {
    'health status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'health response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  // 场景2: 根路径检查
  let rootResponse = http.get(`${BASE_URL}/`, {
    timeout: '5s'
  });
  
  check(rootResponse, {
    'root status is 200': (r) => r.status === 200,
    'root response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  // 场景3: 模拟API调用
  let apiResponse = http.get(`${BASE_URL}/api/v1/offerings`, {
    timeout: '5s',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  let apiSuccess = check(apiResponse, {
    'api status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'api response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  if (apiSuccess) {
    errorRate.add(0);
  } else {
    errorRate.add(1);
    console.log(`API调用失败: ${apiResponse.status} - ${apiResponse.body.substring(0, 100)}`);
  }
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    'k6-results.json': JSON.stringify(data, null, 2),
    'k6-summary.csv': generateCSVSummary(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function generateCSVSummary(data) {
  let csv = 'metric,value,unit\n';
  
  if (data.metrics && data.metrics.http_req_duration) {
    csv += `p95_response_time,${data.metrics.http_req_duration.p(95)},ms\n`;
    csv += `avg_response_time,${data.metrics.http_req_duration.avg},ms\n`;
  }
  
  if (data.metrics && data.metrics.http_req_failed) {
    csv += `error_rate,${data.metrics.http_req_failed.rate * 100},%\n`;
  }
  
  if (data.metrics && data.metrics.http_reqs) {
    csv += `total_requests,${data.metrics.http_reqs.count},count\n`;
  }
  
  return csv;
}