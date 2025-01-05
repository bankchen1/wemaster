import { test, expect } from '@playwright/test';
import { OWASP } from 'zap-api-client';
import * as nmap from 'node-nmap';
import * as sslChecker from 'ssl-checker';

describe('Security Tests', () => {
  // OWASP ZAP 安全扫描
  test('OWASP ZAP Security Scan', async () => {
    const zap = new OWASP({
      apiKey: process.env.ZAP_API_KEY,
      proxy: 'http://localhost:8080',
    });

    // 启动扫描
    await zap.core.newSession('/security-tests', true);
    await zap.spider.scan('https://wepal.example.com');
    await zap.ascan.scan('https://wepal.example.com');

    // 获取警报
    const alerts = await zap.core.alerts();
    const highRiskAlerts = alerts.filter(alert => alert.risk === 'High');

    expect(highRiskAlerts.length).toBe(0);
  });

  // SSL/TLS 配置测试
  test('SSL/TLS Configuration', async () => {
    const sslResult = await sslChecker('wepal.example.com');

    expect(sslResult.valid).toBe(true);
    expect(sslResult.daysRemaining).toBeGreaterThan(30);
    expect(sslResult.validFrom).toBeTruthy();
    expect(sslResult.validTo).toBeTruthy();
  });

  // JWT 安全测试
  test('JWT Security', async () => {
    const response = await fetch('https://wepal.example.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const { token } = await response.json();

    // 检查 JWT 格式
    expect(token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);

    // 测试过期的 token
    const expiredTokenResponse = await fetch('https://wepal.example.com/api/meetings', {
      headers: {
        Authorization: 'Bearer expired.token.here',
      },
    });

    expect(expiredTokenResponse.status).toBe(401);

    // 测试无效的 token
    const invalidTokenResponse = await fetch('https://wepal.example.com/api/meetings', {
      headers: {
        Authorization: 'Bearer invalid.token.here',
      },
    });

    expect(invalidTokenResponse.status).toBe(401);
  });

  // XSS 防护测试
  test('XSS Protection', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    
    const response = await fetch('https://wepal.example.com/api/meetings/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid.token.here',
      },
      body: JSON.stringify({
        content: xssPayload,
      }),
    });

    const { content } = await response.json();
    expect(content).not.toContain('<script>');
  });

  // CSRF 防护测试
  test('CSRF Protection', async () => {
    const response = await fetch('https://wepal.example.com/api/meetings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Meeting',
      }),
    });

    expect(response.status).toBe(403);
  });

  // SQL 注入测试
  test('SQL Injection Protection', async () => {
    const sqlInjectionPayload = "'; DROP TABLE users; --";
    
    const response = await fetch(`https://wepal.example.com/api/users/search?q=${sqlInjectionPayload}`, {
      headers: {
        Authorization: 'Bearer valid.token.here',
      },
    });

    expect(response.status).not.toBe(500);
  });

  // 文件上传安全测试
  test('File Upload Security', async () => {
    const formData = new FormData();
    formData.append('file', new Blob(['test']), 'malicious.php');

    const response = await fetch('https://wepal.example.com/api/files/upload', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid.token.here',
      },
      body: formData,
    });

    expect(response.status).toBe(400);
  });

  // 速率限制测试
  test('Rate Limiting', async () => {
    const requests = Array(100).fill(null).map(() =>
      fetch('https://wepal.example.com/api/meetings')
    );

    const responses = await Promise.all(requests);
    const tooManyRequests = responses.filter(r => r.status === 429);

    expect(tooManyRequests.length).toBeGreaterThan(0);
  });

  // 会话管理测试
  test('Session Management', async () => {
    // 登录
    const loginResponse = await fetch('https://wepal.example.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const { token } = await loginResponse.json();

    // 注销
    const logoutResponse = await fetch('https://wepal.example.com/api/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(logoutResponse.status).toBe(200);

    // 尝试使用注销后的 token
    const invalidatedTokenResponse = await fetch('https://wepal.example.com/api/meetings', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(invalidatedTokenResponse.status).toBe(401);
  });

  // 端口扫描测试
  test('Port Scan', async () => {
    const scan = new nmap.NmapScan('wepal.example.com', '-p 1-65535');
    
    scan.on('complete', results => {
      const openPorts = results[0].openPorts;
      const allowedPorts = [80, 443, 8443];
      
      openPorts.forEach(port => {
        expect(allowedPorts).toContain(port.port);
      });
    });

    scan.startScan();
  });
});
