import { expect, type Page, test } from '@playwright/test';

// Runs once per fixture app (see playwright.config.ts): the same checks must pass with
// theme.css in a Tailwind v4 app and with the prebuilt styles.css in an app without Tailwind.

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

/** Blocks every request that leaves localhost and records it (fonts must load offline). */
async function goOffline(page: Page): Promise<string[]> {
  const external: string[] = [];
  await page.route(
    (url) => url.hostname !== 'localhost' && url.hostname !== '127.0.0.1',
    async (route) => {
      external.push(route.request().url());
      await route.abort();
    },
  );
  return external;
}

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

/** The computed value of a theme token on <html>, resolved through a probe element. */
async function tokenColor(page: Page, token: string): Promise<string> {
  return page.evaluate((name) => {
    const probe = document.createElement('div');
    probe.style.color = `var(--${name})`;
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, token);
}

test('renders styled components with no console errors and no external requests', async ({
  page,
}) => {
  const external = await goOffline(page);
  const errors = collectErrors(page);
  await page.goto('/');

  const button = page.getByTestId('primary-button');
  await expect(button).toBeVisible();
  const background = await button.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(background).not.toBe(TRANSPARENT);
  expect(background).toBe(await tokenColor(page, 'primary'));

  const card = page.getByTestId('card');
  const cardStyle = await card.evaluate((element) => {
    const style = getComputedStyle(element);
    return { radius: style.borderTopLeftRadius, background: style.backgroundColor };
  });
  expect(cardStyle.radius).not.toBe('0px');
  expect(cardStyle.background).toBe(await tokenColor(page, 'card'));

  // The DataTable renders its rows and its toolbar.
  await expect(page.getByRole('cell', { name: 'Ada' })).toBeVisible();
  await expect(page.getByRole('searchbox')).toBeVisible();

  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test('loads Inter and Unbounded from the package, offline', async ({ page }) => {
  const external = await goOffline(page);
  await page.goto('/');
  await page.getByTestId('theme-integr8').click();

  const loaded = await page.evaluate(async () => {
    const inter = await document.fonts.load('16px "Inter Variable"');
    const unbounded = await document.fonts.load('800 16px "Unbounded"');
    return { inter: inter.length, unbounded: unbounded.length };
  });
  expect(loaded.inter).toBeGreaterThan(0);
  expect(loaded.unbounded).toBeGreaterThan(0);

  const headingFont = await page
    .getByTestId('heading')
    .evaluate((element) => getComputedStyle(element).fontFamily);
  expect(headingFont).toMatch(/^"?Unbounded/);
  expect(external).toEqual([]);
});

test('switches themes live, with the dark class and Integr8 pills', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const button = page.getByTestId('primary-button');

  await expect(html).toHaveAttribute('data-theme', 'light');
  const lightPrimary = await tokenColor(page, 'primary');

  await page.getByTestId('theme-dark').click();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect(html).toHaveClass(/\bdark\b/);

  await page.getByTestId('theme-integr8').click();
  await expect(html).toHaveAttribute('data-theme', 'integr8');
  expect(await tokenColor(page, 'primary')).toBe('rgb(198, 255, 61)');
  expect(await tokenColor(page, 'primary')).not.toBe(lightPrimary);
  const radius = await button.evaluate((element) => getComputedStyle(element).borderTopLeftRadius);
  expect(Number.parseFloat(radius)).toBeGreaterThan(100);

  await page.getByTestId('theme-integr8-light').click();
  await expect(html).toHaveAttribute('data-theme', 'integr8-light');
  await expect(html).not.toHaveClass(/\bdark\b/);
  const lightPill = await button.evaluate(
    (element) => getComputedStyle(element).borderTopLeftRadius,
  );
  expect(Number.parseFloat(lightPill)).toBeGreaterThan(100);
});

test('maps the tokens to the app’s own Tailwind utilities', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'tailwind-app', 'Only the Tailwind app has its own classes.');
  await page.goto('/');

  const color = await page
    .getByTestId('own-utility')
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(color).toBe('rgb(124, 92, 255)');
});
