import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 20,
  duration: '30s',
};

const BASE_URL = 'http://localhost:3002/api/v1';

export default function() {
  // 测试公开端点
  let coursesResponse = http.get(`${BASE_URL}/offerings`);
  check(coursesResponse, {
    'courses status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'courses response time < 500ms': (r) => r.timings.duration < 500,
  });

  // 测试健康检查
  let healthResponse = http.get('http://localhost:3002/');
  check(healthResponse, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 100ms': (r) => r.timings.duration < 100,
  });

  sleep(0.5);
}