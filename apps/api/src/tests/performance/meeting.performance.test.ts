import { test } from '@playwright/test';
import { chromium } from 'playwright';
import * as k6 from 'k6';
import { check, sleep } from 'k6';
import http from 'k6/http';

// K6 性能测试配置
export const options = {
  stages: [
    { duration: '1m', target: 20 }, // 逐步增加到20个用户
    { duration: '3m', target: 20 }, // 保持20个用户3分钟
    { duration: '1m', target: 0 },  // 逐步减少到0个用户
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95%的请求应该在500ms内完成
    http_req_failed: ['rate<0.01'],   // 错误率应该小于1%
  },
};

// API性能测试
export default function() {
  const BASE_URL = 'http://localhost:4000';
  
  // 创建会议
  const createMeetingRes = http.post(`${BASE_URL}/api/meetings`, {
    title: 'Performance Test Meeting',
    startTime: new Date().toISOString(),
    duration: 60,
  });
  
  check(createMeetingRes, {
    'create meeting status is 200': (r) => r.status === 200,
    'create meeting duration < 200ms': (r) => r.timings.duration < 200,
  });

  const meetingId = createMeetingRes.json('id');

  // 加入会议
  const joinMeetingRes = http.post(`${BASE_URL}/api/meetings/${meetingId}/join`);
  
  check(joinMeetingRes, {
    'join meeting status is 200': (r) => r.status === 200,
    'join meeting duration < 300ms': (r) => r.timings.duration < 300,
  });

  // 模拟发送消息
  for (let i = 0; i < 5; i++) {
    const sendMessageRes = http.post(`${BASE_URL}/api/meetings/${meetingId}/messages`, {
      content: `Performance test message ${i}`,
      type: 'text',
    });

    check(sendMessageRes, {
      'send message status is 200': (r) => r.status === 200,
      'send message duration < 100ms': (r) => r.timings.duration < 100,
    });

    sleep(1);
  }

  // 结束会议
  const endMeetingRes = http.post(`${BASE_URL}/api/meetings/${meetingId}/end`);
  
  check(endMeetingRes, {
    'end meeting status is 200': (r) => r.status === 200,
    'end meeting duration < 200ms': (r) => r.timings.duration < 200,
  });
}

// Playwright UI性能测试
async function runUIPerformanceTest() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // 测试页面加载性能
  const pageLoadMetrics = await page.goto('http://localhost:3000/meeting/test');
  console.log('Page Load Metrics:', {
    domContentLoaded: pageLoadMetrics?.domContentLoadedTime,
    load: pageLoadMetrics?.loadTime,
  });

  // 测试视频加载性能
  await page.waitForSelector('#jitsi-container');
  const videoLoadStart = Date.now();
  await page.waitForSelector('.remotevideo');
  console.log('Video Load Time:', Date.now() - videoLoadStart);

  // 测试聊天性能
  const chatMetrics = [];
  for (let i = 0; i < 100; i++) {
    const start = Date.now();
    await page.fill('[data-testid="chat-input"]', `Test message ${i}`);
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector(`.chat-message:has-text("Test message ${i}")`);
    chatMetrics.push(Date.now() - start);
  }

  console.log('Chat Metrics:', {
    avg: chatMetrics.reduce((a, b) => a + b) / chatMetrics.length,
    max: Math.max(...chatMetrics),
    min: Math.min(...chatMetrics),
  });

  await browser.close();
}

// 运行所有性能测试
async function runAllPerformanceTests() {
  console.log('Starting API Performance Tests...');
  await k6.run();

  console.log('Starting UI Performance Tests...');
  await runUIPerformanceTest();
}

runAllPerformanceTests();
