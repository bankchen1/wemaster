import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// 自定义指标
export let errorRate = new Rate('errors');
export let dbQueryTime = new Rate('db_query_time');

export let options = {
  stages: [
    { duration: '1m', target: 50 }, // 预热
    { duration: '3m', target: 200 }, // 增加到200并发
    { duration: '5m', target: 500 }, // 增加到500并发
    { duration: '5m', target: 1000 }, // 增加到1000并发
    { duration: '3m', target: 2000 }, // 极限测试2000并发
    { duration: '2m', target: 0 }, // 冷却
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'], // 数据库操作允许更长时间
    http_req_failed: ['rate<0.15'], // 数据库测试允许更高错误率
    errors: ['rate<0.15'],
  },
};

const BASE_URL = 'http://localhost:3002/api/v1';

// 测试数据生成器
function generateTestData() {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000000);
  return {
    email: `testuser_${randomId}_${timestamp}@test.com`,
    name: `Test User ${randomId}`,
    content: `Test post content ${timestamp} ${randomId}`,
  };
}

export function setup() {
  // 创建测试用户
  const loginPayload = JSON.stringify({
    email: 'admin@test.com',
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
    console.log('Database stress test setup completed');
    return { authToken: tokenData.access_token };
  } else {
    console.error('Database stress test setup failed');
    return { authToken: '' };
  }
}

export default function(data) {
  const params = {
    headers: {
      'Authorization': `Bearer ${data.authToken}`,
      'Content-Type': 'application/json',
    },
  };

  const testData = generateTestData();

  // 数据库压力测试场景

  // 1. 高频读取操作 - 获取课程列表
  let coursesResponse = http.get(`${BASE_URL}/offerings?limit=50&page=1`, params);
  check(coursesResponse, {
    'courses query status is 200': (r) => r.status === 200,
    'courses query time < 600ms': (r) => {
      dbQueryTime.add(r.timings.duration);
      return r.timings.duration < 600;
    },
  });

  // 2. 复杂查询 - 获取订单统计
  let statsResponse = http.get(`${BASE_URL}/orders/statistics`, params);
  check(statsResponse, {
    'stats query status is 200': (r) => r.status === 200,
    'stats query time < 800ms': (r) => {
      dbQueryTime.add(r.timings.duration);
      return r.timings.duration < 800;
    },
  });

  // 3. 连接查询 - 获取用户详情
  let userDetailResponse = http.get(`${BASE_URL}/users/${Math.floor(Math.random() * 1000)}`, params);
  check(userDetailResponse, {
    'user detail query status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'user detail query time < 400ms': (r) => {
      dbQueryTime.add(r.timings.duration);
      return r.timings.duration < 400;
    },
  });

  // 4. 聚合查询 - 获取社区统计
  let communityStatsResponse = http.get(`${BASE_URL}/community/statistics`, params);
  check(communityStatsResponse, {
    'community stats status is 200': (r) => r.status === 200,
    'community stats time < 500ms': (r) => {
      dbQueryTime.add(r.timings.duration);
      return r.timings.duration < 500;
    },
  });

  // 5. 写入操作测试 (10%概率)
  if (Math.random() < 0.1) {
    const postPayload = JSON.stringify({
      title: `Test Post ${testData.email}`,
      content: testData.content,
      communityId: 'test-community-id',
    });

    let createPostResponse = http.post(`${BASE_URL}/community/posts`, postPayload, params);
    check(createPostResponse, {
      'create post status is 201 or 400': (r) => r.status === 201 || r.status === 400,
      'create post time < 1000ms': (r) => {
        dbQueryTime.add(r.timings.duration);
        return r.timings.duration < 1000;
      },
    });
  }

  // 6. 更新操作测试 (5%概率)
  if (Math.random() < 0.05) {
    const updatePayload = JSON.stringify({
      lastLoginAt: new Date().toISOString(),
    });

    let updateResponse = http.patch(`${BASE_URL}/users/profile`, updatePayload, params);
    check(updateResponse, {
      'update profile status is 200': (r) => r.status === 200,
      'update profile time < 600ms': (r) => {
        dbQueryTime.add(r.timings.duration);
        return r.timings.duration < 600;
      },
    });
  }

  // 7. 分页查询测试
  let page = Math.floor(Math.random() * 10) + 1;
  let paginatedResponse = http.get(`${BASE_URL}/community/posts?page=${page}&limit=20`, params);
  check(paginatedResponse, {
    'paginated query status is 200': (r) => r.status === 200,
    'paginated query time < 400ms': (r) => {
      dbQueryTime.add(r.timings.duration);
      return r.timings.duration < 400;
    },
  });

  sleep(Math.random() * 2 + 1); // 随机等待1-3秒
}

export function teardown(data) {
  console.log('Database stress test completed');
}