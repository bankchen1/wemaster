import { test, expect } from '@playwright/test';

test.describe('认证流程', () => {
  test('用户登录', async ({ page }) => {
    await page.goto('/login');
    
    // 填写登录表单
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // 验证登录成功
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('登录失败处理', async ({ page }) => {
    await page.goto('/login');
    
    // 填写错误密码
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    // 验证错误提示
    await expect(page.locator('[data-testid="error-message"]')).toContainText('登录失败');
  });

  test('权限控制', async ({ page }) => {
    // 直接访问需要权限的页面
    await page.goto('/admin/users');
    
    // 应该重定向到登录页
    await expect(page).toHaveURL('/login');
  });
});
