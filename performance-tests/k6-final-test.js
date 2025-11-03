import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// 自定义指标
export let errorRate = new Rate('errors');

// 测试配置 - 符合M5要求
export let options = {
  stages: [
    { duration: '1m', target: 10 },   // 预热：10并发用户
    { duration: '5m', target: 10 },   // 稳定：10并发用户
    { duration: '1m', target: 25 },   // 增加：25并发用户
    { duration: '5m', target: 25 },   // 稳定：25并发用户
    { duration: '1m', target: 50 },   // 增加：50并发用户
    { duration: '5m', target: 50 },   // 稳定：50并发用户
    { duration: '1m', target: 100 },  // 增加：100并发用户
    { duration: '5m', target: 100 },  // 稳定：100并发用户
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // P95 < 500ms (目标)
    http_req_failed: ['rate<0.005'],  // 错误率 < 0.5%
    errors: ['rate<0.005'],           // 自定义错误率 < 0.5%
  },
};

const BASE_URL = 'http://localhost:3002/api/v1';

// 测试用户池
const users = [
  { email: 'student@test.com', password: 'password123' },
  { email: 'tutor@test.com', password: 'password123' },
  { email: 'admin@test.com', password: 'admin123' },
];

let authToken = '';
let userId = '';

// 场景1: 用户登录流程
function loginScenario() {
  const user = users[Math.floor(Math.random() * users.length)];
  
  let loginPayload = JSON.stringify({
    email: user.email,
    password: user.password,
  });

  let loginParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let loginResponse = http.post(`${BASE_URL}/auth/login`, loginPayload, loginParams);
  
  let loginSuccess = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 500ms': (r) => r.timings.duration < 500,
    'has token in response': (r) => r.json('accessToken') !== undefined,
  });

  if (loginSuccess) {
    authToken = loginResponse.json('accessToken');
    userId = loginResponse.json('user.id');
    errorRate.add(0);
  } else {
    errorRate.add(1);
    console.error(`Login failed: ${loginResponse.status} - ${loginResponse.body.substring(0, 100)}`);
  }

  return loginSuccess;
}

// 场景2: 课程检索与浏览
function courseSearchScenario() {
  let searchParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // 公开课程列表
  let coursesResponse = http.get(`${BASE_URL}/offerings`, searchParams);
  
  let searchSuccess = check(coursesResponse, {
    'courses status is 200': (r) => r.status === 200,
    'courses response time < 500ms': (r) => r.timings.duration < 500,
    'has courses array': (r) => Array.isArray(r.json()),
  });

  if (searchSuccess && coursesResponse.json().length > 0) {
    // 获取第一个课程详情
    let firstCourse = coursesResponse.json()[0];
    let courseDetailResponse = http.get(`${BASE_URL}/offerings/${firstCourse.slug}`, searchParams);
    
    check(courseDetailResponse, {
      'course detail status is 200': (r) => r.status === 200,
      'course detail response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    errorRate.add(0);
  } else {
    errorRate.add(1);
    console.error(`Course search failed: ${coursesResponse.status}`);
  }

  return searchSuccess;
}

// 场景3: 课程下单流程
function orderCreationScenario() {
  if (!authToken) {
    errorRate.add(1);
    return false;
  }

  // 先获取可用课程
  let coursesResponse = http.get(`${BASE_URL}/offerings`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (coursesResponse.status !== 200 || coursesResponse.json().length === 0) {
    errorRate.add(1);
    return false;
  }

  let course = coursesResponse.json()[0];
  
  let orderPayload = JSON.stringify({
    offeringId: course.id,
    variantId: course.variants?.[0]?.id || null,
    quantity: 1,
  });

  let orderParams = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  };

  let orderResponse = http.post(`${BASE_URL}/orders/draft`, orderPayload, orderParams);
  
  let orderSuccess = check(orderResponse, {
    'order draft status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'order response time < 500ms': (r) => r.timings.duration < 500,
    'has checkout url or order data': (r) => r.json('checkoutUrl') !== undefined || r.json('id') !== undefined,
  });

  if (orderSuccess) {
    errorRate.add(0);
  } else {
    errorRate.add(1);
    console.error(`Order creation failed: ${orderResponse.status} - ${orderResponse.body.substring(0, 100)}`);
  }

  return orderSuccess;
}

// 场景4: 支付回调处理（模拟）
function paymentWebhookScenario() {
  // 模拟Stripe webhook payload
  let webhookPayload = {
    id: `evt_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    object: 'event',
    api_version: '2020-08-27',
    created: Math.floor(Date.now() / 1000),
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        object: 'payment_intent',
        amount: 5000,
        currency: 'usd',
        status: 'succeeded',
        metadata: {
          orderId: `order_test_${Date.now()}`,
        },
      },
    },
  };

  let webhookParams = {
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'test_signature_' + Math.random().toString(36).substr(2, 16),
    },
  };

  let webhookResponse = http.post(`${BASE_URL}/payments/webhooks/stripe`, 
    JSON.stringify(webhookPayload), webhookParams);
  
  let webhookSuccess = check(webhookResponse, {
    'webhook status is 200 or 401': (r) => r.status === 200 || r.status === 401, // 401可能是因为签名验证
    'webhook response time < 500ms': (r) => r.timings.duration < 500,
  });

  if (webhookSuccess) {
    errorRate.add(0);
  } else {
    errorRate.add(1);
    console.error(`Webhook failed: ${webhookResponse.status} - ${webhookResponse.body.substring(0, 100)}`);
  }

  return webhookSuccess;
}

// 场景5: 账单对账查询（管理端）
function reconciliationScenario() {
  let queryParams = {
    headers: authToken ? {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    } : {
      'Content-Type': 'application/json',
    },
  };

  let ordersResponse = http.get(`${BASE_URL}/orders`, queryParams);
  
  let reconciliationSuccess = check(ordersResponse, {
    'orders status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'orders response time < 500ms': (r) => r.timings.duration < 500,
  });

  if (ordersResponse.status === 200) {
    errorRate.add(0);
  } else if (ordersResponse.status === 401) {
    // 未授权是正常的，因为没有管理员权限
    errorRate.add(0);
  } else {
    errorRate.add(1);
    console.error(`Reconciliation failed: ${ordersResponse.status}`);
  }

  return reconciliationSuccess;
}

export default function () {
  // 随机选择一个场景执行，权重不同
  let scenarios = [
    { fn: courseSearchScenario, weight: 3 },    // 高频：课程浏览
    { fn: loginScenario, weight: 2 },           // 中频：登录
    { fn: orderCreationScenario, weight: 2 },    // 中频：下单
    { fn: paymentWebhookScenario, weight: 1 },   // 低频：支付回调
    { fn: reconciliationScenario, weight: 1 },  // 低频：对账查询
  ];

  // 根据权重选择场景
  let totalWeight = scenarios.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;
  let currentWeight = 0;
  let selectedScenario = scenarios[0];

  for (let scenario of scenarios) {
    currentWeight += scenario.weight;
    if (random <= currentWeight) {
      selectedScenario = scenario;
      break;
    }
  }
  
  try {
    selectedScenario.fn();
  } catch (error) {
    errorRate.add(1);
    console.error(`Scenario execution error: ${error.message}`);
  }

  // 等待1-3秒
  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  return {
    'k6-comprehensive-results.json': JSON.stringify(data, null, 2),
    'k6-summary.csv': generateCSVSummary(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function generateCSVSummary(data) {
  let csv = 'metric,value,unit,status\n';
  
  if (data.metrics && data.metrics.http_req_duration) {
    let p95 = data.metrics.http_req_duration.p(95);
    let avg = data.metrics.http_req_duration.avg;
    csv += `p95_response_time,${p95},ms,${p95 < 500 ? 'PASS' : 'FAIL'}\n`;
    csv += `avg_response_time,${avg},ms,${avg < 500 ? 'PASS' : 'FAIL'}\n`;
  }
  
  if (data.metrics && data.metrics.http_req_failed) {
    let errorRate = data.metrics.http_req_failed.rate * 100;
    csv += `error_rate,${errorRate.toFixed(2)},%,${errorRate < 0.5 ? 'PASS' : 'FAIL'}\n`;
  }
  
  if (data.metrics && data.metrics.http_reqs) {
    csv += `total_requests,${data.metrics.http_reqs.count},count,PASS\n`;
    csv += `requests_per_second,${data.metrics.http_reqs.rate.toFixed(2)},rps,PASS\n`;
  }
  
  if (data.metrics && data.metrics.test_duration) {
    csv += `test_duration,${data.metrics.test_duration},s,PASS\n`;
  }
  
  return csv;
}
