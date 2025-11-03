import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// 自定义指标
export let errorRate = new Rate('errors');
export let systemLoadTime = new Rate('system_load_time');
export let memoryUsage = new Rate('memory_usage');

export let options = {
  stages: [
    { duration: '1m', target: 100 }, // 预热
    { duration: '2m', target: 500 }, // 快速增加到500
    { duration: '2m', target: 1000 }, // 增加到1000
    { duration: '2m', target: 2000 }, // 增加到2000
    { duration: '3m', target: 3000 }, // 增加到3000
    { duration: '5m', target: 5000 }, // 极限测试5000并发
    { duration: '2m', target: 100 }, // 快速减少
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 极限测试允许更长时间
    http_req_failed: ['rate<0.3'], // 允许更高错误率
    errors: ['rate<0.3'],
  },
};

const BASE_URL = 'http://localhost:3002/api/v1';

// 系统监控端点
const healthEndpoints = [
  '/healthz',
  '/api/v1/health',
  '/metrics',
];

export function setup() {
  console.log('Starting system极限测试 - 极限负载测试');
  
  // 检查系统健康状态
  healthEndpoints.forEach(endpoint => {
    const healthResponse = http.get(`${BASE_URL}${endpoint}`);
    console.log(`Health check ${endpoint}: ${healthResponse.status}`);
  });
  
  return { startTime: Date.now() };
}

export default function(data) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'k6-stress-test/1.0',
    },
  };

  // 极限测试场景

  // 1. 高频健康检查
  let healthResponse = http.get(`${BASE_URL}/healthz`, params);
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check time < 100ms': (r) => {
      systemLoadTime.add(r.timings.duration);
      return r.timings.duration < 100;
    },
  });

  // 2. 无认证API测试（测试系统基础性能）
  let publicCoursesResponse = http.get(`${BASE_URL}/offerings?limit=100`, params);
  check(publicCoursesResponse, {
    'public courses status is 200': (r) => r.status === 200,
    'public courses time < 1000ms': (r) => {
      systemLoadTime.add(r.timings.duration);
      return r.timings.duration < 1000;
    },
  });

  // 3. 高频登录测试（测试认证系统极限）
  if (Math.random() < 0.3) {
    const loginPayload = JSON.stringify({
      email: `test${Math.floor(Math.random() * 1000)}@test.com`,
      password: 'password123'
    });
    
    let loginResponse = http.post(`${BASE_URL}/auth/login`, loginPayload, params);
    check(loginResponse, {
      'login attempt processed': (r) => r.status >= 200 && r.status < 500,
      'login response time < 2000ms': (r) => {
        systemLoadTime.add(r.timings.duration);
        return r.timings.duration < 2000;
      },
    });
  }

  // 4. 并发注册测试（测试数据库写入极限）
  if (Math.random() < 0.1) {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000000);
    const registerPayload = JSON.stringify({
      email: `stress${randomId}_${timestamp}@test.com`,
      password: 'password123',
      name: `Stress Test User ${randomId}`,
      role: 'STUDENT'
    });
    
    let registerResponse = http.post(`${BASE_URL}/auth/register`, registerPayload, params);
    check(registerResponse, {
      'registration processed': (r) => r.status >= 200 && r.status < 500,
      'registration time < 3000ms': (r) => {
        systemLoadTime.add(r.timings.duration);
        return r.timings.duration < 3000;
      },
    });
  }

  // 5. 缓存系统测试
  let cacheTestResponse = http.get(`${BASE_URL}/community/statistics`, params);
  check(cacheTestResponse, {
    'cache test status is 200': (r) => r.status === 200,
    'cache test time < 500ms': (r) => {
      systemLoadTime.add(r.timings.duration);
      return r.timings.duration < 500;
    },
  });

  // 6. 数据库连接池测试
  if (Math.random() < 0.2) {
    const complexQueryResponse = http.get(`${BASE_URL}/orders/statistics`, params);
    check(complexQueryResponse, {
      'complex query processed': (r) => r.status >= 200 && r.status < 500,
      'complex query time < 2000ms': (r) => {
        systemLoadTime.add(r.timings.duration);
        return r.timings.duration < 2000;
      },
    });
  }

  // 7. 内存压力测试 - 大数据量请求
  if (Math.random() < 0.15) {
    const largeDataResponse = http.get(`${BASE_URL}/offerings?limit=100`, params);
    check(largeDataResponse, {
      'large data request processed': (r) => r.status >= 200 && r.status < 500,
      'large data response time < 1500ms': (r) => {
        systemLoadTime.add(r.timings.duration);
        return r.timings.duration < 1500;
      },
    });
  }

  // 8. 并发写入测试
  if (Math.random() < 0.05) {
    const orderPayload = JSON.stringify({
      offeringId: 'test-offering',
      variantId: 'test-variant',
      quantity: 1
    });
    
    let orderResponse = http.post(`${BASE_URL}/orders/draft`, orderPayload, params);
    check(orderResponse, {
      'order creation processed': (r) => r.status >= 200 && r.status < 500,
      'order creation time < 3000ms': (r) => {
        systemLoadTime.add(r.timings.duration);
        return r.timings.duration < 3000;
      },
    });
  }

  // 短暂等待以模拟真实负载
  sleep(Math.random() * 0.5 + 0.1);
}

export function teardown(data) {
  const endTime = Date.now();
  const totalDuration = endTime - data.startTime;
  console.log(`System极限测试 completed in ${totalDuration}ms`);
  
  // 最终健康检查
  const finalHealthResponse = http.get(`${BASE_URL}/healthz`);
  console.log(`Final health check status: ${finalHealthResponse.status}`);
  
  // 检查系统恢复能力
  if (finalHealthResponse.status === 200) {
    console.log('✅ System recovered successfully after stress test');
  } else {
    console.log('❌ System did not recover properly after stress test');
  }
}