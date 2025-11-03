import { test, expect } from '@playwright/test';

test.describe('订单支付', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'student@example.com');
    await page.fill('[data-testid="password-input"]', 'student123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('创建订单', async ({ page }) => {
    await page.goto('/courses');
    await page.click('[data-testid="course-1"]');
    await page.click('[data-testid="enroll-button"]');
    
    // 选择课程变体
    await page.selectOption('[data-testid="course-variant"]', 'standard');
    await page.click('[data-testid="proceed-to-checkout"]');
    
    // 验证订单创建
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
  });

  test('支付流程', async ({ page }) => {
    await page.goto('/orders');
    await page.click('[data-testid="order-1"]');
    await page.click('[data-testid="pay-button"]');
    
    // 模拟支付（测试环境）
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');
    await page.click('[data-testid="submit-payment"]');
    
    // 验证支付成功
    await expect(page.locator('[data-testid="payment-success"]')).toBeVisible();
  });

  test('退款处理', async ({ page }) => {
    await page.goto('/orders');
    await page.click('[data-testid="order-1"]');
    await page.click('[data-testid="refund-button"]');
    await page.click('[data-testid="confirm-refund"]');
    
    // 验证退款成功
    await expect(page.locator('[data-testid="refund-success"]')).toBeVisible();
  });
});
