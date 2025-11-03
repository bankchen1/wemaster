import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// 自定义指标
export let errorRate = new Rate('errors');

// 测试配置
export let options = {
  stages: [
    { duration: '2m', target: 100 }, // 2分钟内增加到100用户
    { duration: '5m', target: 100 }, // 保持100用户5分钟
    { duration: '2m', target: 300 }, // 2分钟内增加到300用户
    { duration: '5m', target: 300 }, // 保持300用户5分钟
    { duration: '2m', target: 500 }, // 2分钟内增加到500用户
    { duration: '5m', target: 500 }, // 保持500用户5分钟
    { duration: '2m', target: 1000 }, // 2分钟内增加到1000用户
    { duration: '10m', target: 1000 }, // 保持1000用户10分钟
    { duration: '5m', target: 0 }, // 5分钟内减少到0用户
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95%的请求响应时间小于500ms
    http_req_failed: ['rate<0.1'], // 错误率小于10%
    errors: ['rate<0.1'], // 自定义错误率小于10%
  },
};

const BASE_URL = 'http://localhost:3002/api/v1';

// 测试数据
const users = [
  { email: 'student1@test.com', password: 'password123' },
  { email: 'student2@test.com', password: 'password123' },
  { email: 'tutor1@test.com', password: 'password123' },
  { email: 'tutor2@test.com', password: 'password123' },
  { email: 'admin@test.com', password: 'password123' },
];

let authToken = '';

export function setup() {
  // 登录获取token
  const loginPayload = JSON.stringify({
    email: 'student1@test.com',
    password: 'password123'
  });
  
  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const loginResponse = http.post(`${BASE_URL}/auth/login`, loginPayload, loginParams);
  
  if (loginResponse.status === 200) {
    const tokenData = JSON.parse(loginResponse.body);
    authToken = tokenData.access_token;
    console.log('Setup completed: Authentication token obtained');
  } else {
    console.error('Setup failed: Unable to authenticate');
  }
  
  return { authToken };
}

export default function(data) {
  const params = {
    headers: {
      'Authorization': `Bearer ${data.authToken}`,
      'Content-Type': 'application/json',
    },
  };

  // 测试场景1: 获取课程列表
  let courseResponse = http.get(`${BASE_URL}/offerings`, params);
  let courseSuccess = check(courseResponse, {
    'courses status is 200': (r) => r.status === 200,
    'courses response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(!courseSuccess);

  // 测试场景2: 获取用户信息
  let userResponse = http.get(`${BASE_URL}/users/profile`, params);
  let userSuccess = check(userResponse, {
    'user profile status is 200': (r) => r.status === 200,
    'user profile response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  errorRate.add(!userSuccess);

  // 测试场景3: 获取订单列表
  let orderResponse = http.get(`${BASE_URL}/orders`, params);
  let orderSuccess = check(orderResponse, {
    'orders status is 200': (r) => r.status === 200,
    'orders response time < 400ms': (r) => r.timings.duration < 400,
  });
  
  errorRate.add(!orderSuccess);

  // 测试场景4: 创建订单草稿 (20%概率)
  if (Math.random() < 0.2) {
    const orderPayload = JSON.stringify({
      offeringId: 'test-offering-id',
      variantId: 'test-variant-id',
    });
    
    let createOrderResponse = http.post(`${BASE_URL}/orders/draft`, orderPayload, params);
    let createOrderSuccess = check(createOrderResponse, {
      'create order status is 200 or 201': (r) => r.status === 200 || r.status === 201,
      'create order response time < 1000ms': (r) => r.timings.duration < 1000,
    });
    
    errorRate.add(!createOrderSuccess);
  }

  // 测试场景5: 获取社区统计
  let communityResponse = http.get(`${BASE_URL}/community/statistics`, params);
  let communitySuccess = check(communityResponse, {
    'community stats status is 200': (r) => r.status === 200,
    'community stats response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  errorRate.add(!communitySuccess);

  sleep(1);
}

export function teardown(data) {
  console.log('Load test completed');
}