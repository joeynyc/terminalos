const { test, expect } = require('playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const fileUrl = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;

// iPhone 14 Pro tests
test.describe('Mobile Scrolling Tests - iPhone 14 Pro', () => {
  test.use({
    viewport: { width: 393, height: 852 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

    test('navigation is fixed and does not interfere with scrolling', async ({ page }) => {
      await page.goto(fileUrl);
      await page.waitForSelector('.boot-overlay.hidden', { timeout: 15000 });

      // Check that navigation is positioned fixed
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
      expect(parseInt(navStyles.zIndex)).toBeGreaterThan(1000);
    });

    test('terminal container has proper height with viewport fix', async ({ page }) => {
      await page.goto(fileUrl);
      await page.waitForSelector('.boot-overlay.hidden', { timeout: 15000 });

      // Wait for viewport height to be set by JavaScript
      await page.waitForTimeout(500);

      const terminal = page.locator('.terminal-container');
      await expect(terminal).toBeVisible();

      const terminalBox = await terminal.boundingBox();
      const viewport = await page.viewportSize();

      expect(terminalBox).not.toBeNull();
      expect(terminalBox.height).toBeLessThan(viewport.height);
      expect(terminalBox.height).toBeGreaterThan(viewport.height * 0.7); // Should be significant portion
    });

    test('viewport height custom property is set correctly', async ({ page }) => {
      await page.goto(fileUrl);
      await page.waitForSelector('.boot-overlay.hidden', { timeout: 15000 });

      // Wait for JavaScript viewport fix to run
      await page.waitForTimeout(500);

      const vhValue = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--vh');
      });

      expect(vhValue).toMatch(/^\d+(\.\d+)?px$/);

      const vhNumber = parseFloat(vhValue);
      const viewport = await page.viewportSize();
      const expectedVh = viewport.height * 0.01;

      expect(vhNumber).toBeCloseTo(expectedVh, 1);
    });

    test('page scrolls smoothly without horizontal overflow', async ({ page }) => {
      await page.goto(fileUrl);
      await page.waitForSelector('.boot-overlay.hidden', { timeout: 15000 });

      // Check initial scroll position
      const initialScroll = await page.evaluate(() => window.scrollY);
      expect(initialScroll).toBe(0);

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(200);

      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(250);

      // Check no horizontal scroll
      const scrollX = await page.evaluate(() => window.scrollX);
      expect(scrollX).toBe(0);

      // Check body width doesn't exceed viewport
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewport = await page.viewportSize();
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 5); // Small tolerance
    });
  });
});

// iPhone SE tests
test.describe('Mobile Scrolling Tests - iPhone SE', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test('small screen navigation works properly', async ({ page }) => {
    await page.goto(fileUrl);
    await page.waitForSelector('.boot-overlay.hidden', { timeout: 15000 });

    const nav = page.locator('.floating-nav');
    const navToggle = page.locator('.nav-toggle');

    await expect(nav).toBeVisible();
    await expect(navToggle).toBeVisible();

    // Test navigation toggle
    await navToggle.click();
    await page.waitForTimeout(300);

    const navContainer = page.locator('.nav-container');
    await expect(navContainer).toBeVisible();

    // Check that body overflow is hidden when nav is open
    const bodyOverflow = await page.evaluate(() => {
      return window.getComputedStyle(document.body).overflow;
    });
    expect(bodyOverflow).toBe('hidden');
  });
});

// iPad Air tests
test.describe('Mobile Scrolling Tests - iPad Air', () => {
  test.use({
    viewport: { width: 820, height: 1180 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: true,
  });

  test('tablet layout maintains proper proportions', async ({ page }) => {
    await page.goto(fileUrl);
    await page.waitForSelector('.boot-overlay.hidden', { timeout: 15000 });

    const terminal = page.locator('.terminal-container');
    await expect(terminal).toBeVisible();

    const terminalBox = await terminal.boundingBox();
    const viewport = await page.viewportSize();

    expect(terminalBox).not.toBeNull();
    expect(terminalBox.width).toBeLessThanOrEqual(viewport.width);
    expect(terminalBox.height).toBeLessThan(viewport.height);
  });
});