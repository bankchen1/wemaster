import { test, expect } from '@playwright/test';

test.describe('课程管理', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('创建课程', async ({ page }) => {
    await page.goto('/courses');
    await page.click('[data-testid="create-course-button"]');
    
    // 填写课程信息
    await page.fill('[data-testid="course-title"]', '测试课程');
    await page.fill('[data-testid="course-description"]', '这是一个测试课程');
    await page.selectOption('[data-testid="course-category"]', 'programming');
    await page.fill('[data-testid="course-price"]', '99.99');
    
    await page.click('[data-testid="save-button"]');
    
    // 验证创建成功
    await expect(page.locator('[data-testid="success-message"]')).toContainText('课程创建成功');
  });

  test('编辑课程', async ({ page }) => {
    await page.goto('/courses');
    await page.click('[data-testid="edit-course-1"]');
    
    // 修改课程信息
    await page.fill('[data-testid="course-title"]', '更新后的课程标题');
    await page.click('[data-testid="save-button"]');
    
    // 验证更新成功
    await expect(page.locator('[data-testid="success-message"]')).toContainText('课程更新成功');
  });

  test('删除课程', async ({ page }) => {
    await page.goto('/courses');
    await page.click('[data-testid="delete-course-1"]');
    await page.click('[data-testid="confirm-delete"]');
    
    // 验证删除成功
    await expect(page.locator('[data-testid="success-message"]')).toContainText('课程删除成功');
  });
});
