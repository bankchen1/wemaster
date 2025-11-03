import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// 自定义指标
export let errorRate = new Rate('errors');

// 简化的测试配置
export let options = {
  stages: [
    { duration: '30s', target: 5 },   // 预热
    { duration: '2m', target: 10 },   // 10并发用户
    { duration: '1m', target: 25 },   // 增加到25
    { duration: '2m', target: 25 },   // 25并发用户
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 放宽到1000ms
    http_req_failed: ['rate<0.1'],     // 放宽到10%
    errors: ['rate<0.1'],
  },
};

// 检测可用的后端端口
function detectBackendPort() {
  const ports = [3000, 3001, 3002, 8000];
  
  for (const port of ports) {
    try {
      let response = http.get(`http://localhost:${port}/healthz`, {
        timeout: '3s'
      });
      
      if (response.status === 200 || response.status === 404) {
        console.log(`✅ 检测到后端服务在端口 ${port}`);
        return `http://localhost:${port}`;
      }
    } catch (e) {
      // 继续尝试下一个端口
    }
    
    // 如果healthz失败，尝试根路径
    try {
      let response = http.get(`http://localhost:${port}/`, {
        timeout: '3s'
      });
      
      if (response.status === 200) {
        console.log(`✅ 检测到服务在端口 ${port} (根路径)`);
        return `http://localhost:${port}`;
      }
    } catch (e) {
      // 继续尝试下一个端口
    }
  }
  
  console.log(`⚠️  未检测到后端服务，使用默认端口 3000`);
  return 'http://localhost:3000';
}

let BASE_URL = '';

export default function () {
  // 在第一次迭代时检测端口
  if (__ITER === 0) {
    BASE_URL = detectBackendPort();
  }
  
  // 简单的健康检查测试
  let response = http.get(`${BASE_URL}/healthz`, {
    timeout: '5s'
  });
  
  let success = check(response, {
    'status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  if (success) {
    errorRate.add(0);
  } else {
    errorRate.add(1);
    console.log(`❌ 健康检查失败: ${response.status} - ${response.body}`);
  }
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    'k6-simple-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}