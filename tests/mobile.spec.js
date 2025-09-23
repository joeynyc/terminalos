const { test, expect, devices } = require('playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const fileUrl = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;

test.use({
  ...devices['iPhone 14 Pro'],
  viewport: devices['iPhone 14 Pro'].viewport,
  userAgent: devices['iPhone 14 Pro'].userAgent,
  launchOptions: {
    args: ['--no-sandbox'],
  },
});

test.describe('Mobile hero layout', () => {
  test('text cards remain fully visible within viewport', async ({ page }) => {
    await page.goto(fileUrl);

    await page.waitForSelector('.boot-overlay.hidden', { timeout: 15000 });

    const cards = page.locator('.text-block');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    const viewport = await page.viewportSize();
    for (let i = 0; i < count; i += 1) {
      const card = cards.nth(i);
      await card.scrollIntoViewIfNeeded();
      await expect(card).toBeVisible();
      await page.waitForTimeout(120);

      const box = await card.boundingBox();
      expect(box, `Card ${i} should have a bounding box`).not.toBeNull();
      if (!box) continue;

      expect(box.top).toBeGreaterThanOrEqual(0);
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(viewport.width + 1);
      expect(box.bottom).toBeLessThanOrEqual(viewport.height + 1);
    }
  });
});
