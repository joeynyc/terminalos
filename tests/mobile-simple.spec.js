const { test, expect } = require('playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const fileUrl = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;

test.use({
  viewport: { width: 393, height: 852 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
  isMobile: true,
  hasTouch: true,
});

test('mobile navigation is fixed positioned', async ({ page }) => {
  await page.goto(fileUrl);
  await page.waitForSelector('.boot-overlay.hidden', { timeout: 15000 });

  const nav = page.locator('.floating-nav');
  await expect(nav).toBeVisible();

  const navStyles = await nav.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      position: styles.position,
      top: styles.top,
      zIndex: styles.zIndex
    };
  });

  expect(navStyles.position).toBe('fixed');
  expect(navStyles.top).toBe('0px');
});

test('viewport height custom property is set', async ({ page }) => {
  await page.goto(fileUrl);
  await page.waitForSelector('.boot-overlay.hidden', { timeout: 15000 });
  await page.waitForTimeout(500);

  const vhValue = await page.evaluate(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--vh');
  });

  expect(vhValue).toMatch(/^\d+(\.\d+)?px$/);
});

test('terminal container has proper mobile height', async ({ page }) => {
  await page.goto(fileUrl);
  await page.waitForSelector('.boot-overlay.hidden', { timeout: 15000 });
  await page.waitForTimeout(500);

  const terminal = page.locator('.terminal-container');
  await expect(terminal).toBeVisible();

  const terminalBox = await terminal.boundingBox();
  const viewport = await page.viewportSize();

  expect(terminalBox).not.toBeNull();
  expect(terminalBox.height).toBeLessThan(viewport.height);
  expect(terminalBox.height).toBeGreaterThan(viewport.height * 0.7);
});

test('page scrolls without horizontal overflow', async ({ page }) => {
  await page.goto(fileUrl);
  await page.waitForSelector('.boot-overlay.hidden', { timeout: 15000 });

  // Test scrolling
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(200);

  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBeGreaterThan(200);

  // Check no horizontal scroll
  const scrollX = await page.evaluate(() => window.scrollX);
  expect(scrollX).toBe(0);

  // Check body width
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewport = await page.viewportSize();
  expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 10);
});