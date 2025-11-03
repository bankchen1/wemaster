import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// 自定义指标
export let errorRate = new Rate('errors');
export let pageLoadTime = new Rate('page_load_time');

export let options = {
  stages: [
    { duration: '2m', target: 50 }, // 2分钟内增加到50用户
    { duration: '3m', target: 200 }, // 3分钟内增加到200用户
    { duration: '5m', target: 500 }, // 5分钟内增加到500用户
    { duration: '5m', target: 800 }, // 5分钟内增加到800用户
    { duration: '3m', target: 1000 }, // 3分钟内增加到1000用户
    { duration: '2m', target: 0 }, // 2分钟内减少到0用户
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 前端资源加载允许更长时间
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.1'],
  },
};

const FRONTEND_URL = 'http://localhost:5173';

// 页面列表
const pages = [
  '/',
  '/dashboard',
  '/courses',
  '/orders',
  '/users',
  '/community',
  '/analytics',
  '/settings',
];

export default function() {
  // 随机选择页面
  const randomPage = pages[Math.floor(Math.random() * pages.length)];
  const url = `${FRONTEND_URL}${randomPage}`;

  // 测试页面加载
  let response = http.get(url, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'User-Agent': 'Mozilla/5.0 (compatible; k6/0.46.0)',
    },
  });

  // 检查页面响应
  let success = check(response, {
    'page status is 200': (r) => r.status === 200,
    'page load time < 2s': (r) => {
      pageLoadTime.add(r.timings.duration);
      return r.timings.duration < 2000;
    },
    'page contains HTML': (r) => r.body.includes('<!DOCTYPE html>') || r.body.includes('<html'),
  });

  errorRate.add(!success);

  // 模拟静态资源加载
  if (response.status === 200 && response.body) {
    // 提取CSS和JS资源
    const cssMatches = response.body.match(/href="([^"]+\.css)"/g) || [];
    const jsMatches = response.body.match(/src="([^"]+\.js)"/g) || [];

    // 随机加载部分静态资源（模拟真实浏览器行为）
    const resourcesToLoad = [...cssMatches, ...jsMatches]
      .map(match => match.match(/"(.*?)"/)[1])
      .filter(resource => !resource.startsWith('http')) // 只加载相对路径资源
      .slice(0, 3); // 最多加载3个资源

    resourcesToLoad.forEach(resource => {
      const resourceUrl = resource.startsWith('/') ? `${FRONTEND_URL}${resource}` : `${FRONTEND_URL}/${resource}`;
      
      let resourceResponse = http.get(resourceUrl, {
        headers: {
          'Accept': resource.includes('.css') ? 'text/css,*/*;q=0.1' : 'application/javascript,*/*;q=0.1',
        },
      });

      check(resourceResponse, {
        'resource loaded successfully': (r) => r.status < 400,
        'resource load time < 1s': (r) => r.timings.duration < 1000,
      });
    });
  }

  // 模拟用户交互等待
  sleep(Math.random() * 3 + 2); // 等待2-5秒，模拟用户浏览时间
}

export function teardown() {
  console.log('Frontend performance test completed');
}