import { test, expect } from '@playwright/test';

test.describe('对账导出', () => {
  test.beforeEach(async ({ page }) => {
    // 管理员登录
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('财务对账', async ({ page }) => {
    await page.goto('/finance/reconciliation');
    
    // 设置日期范围
    await page.fill('[data-testid="start-date"]', '2025-11-01');
    await page.fill('[data-testid="end-date"]', '2025-11-02');
    await page.click('[data-testid="generate-report"]');
    
    // 验证报告生成
    await expect(page.locator('[data-testid="report-table"]')).toBeVisible();
  });

  test('导出CSV', async ({ page }) => {
    await page.goto('/finance/reconciliation');
    
    // 下载CSV
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-csv"]');
    const download = await downloadPromise;
    
    // 验证下载
    expect(download.suggestedFilename()).toContain('reconciliation');
    await download.saveAs('../logs/reconciliation-export.csv');
  });

  test('导出Excel', async ({ page }) => {
    await page.goto('/finance/reconciliation');
    
    // 下载Excel
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-excel"]');
    const download = await downloadPromise;
    
    // 验证下载
    expect(download.suggestedFilename()).toContain('reconciliation');
    await download.saveAs('../logs/reconciliation-export.xlsx');
  });
});
