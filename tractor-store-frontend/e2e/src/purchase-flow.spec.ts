import { test, expect } from '@playwright/test';

test.describe('Tractor Store purchase flow', () => {
  test('browse, add to cart, checkout with delivery and see thanks', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Tractor Store/i }).first()).toBeVisible();
    await expect(page.getByText('Categories')).toBeVisible({ timeout: 15_000 });

    const productCard = page.locator('ts-product-card').first();
    await productCard.click();

    await expect(page).toHaveURL(/\/product\//);
    await page.getByRole('button', { name: /Add to cart/i }).click();

    await page.goto('/checkout/cart');
    await expect(page.getByRole('heading', { name: /Tu selección/i })).toBeVisible();
    await expect(page.locator('li').first()).toBeVisible();

    await page.getByRole('link', { name: /Finalizar compra/i }).click();
    await page.getByRole('tab', { name: /Envío a domicilio/i }).click();
    await page.locator('#email').fill('farmer@tractor.store');
    await page.locator('#name').fill('John Deere');
    await page.locator('#address').fill('Farm Road 1');
    await page.locator('#city').fill('Springfield');
    await page.locator('#zip').fill('12345');
    await page.getByRole('button', { name: /Confirmar pedido/i }).click();

    await expect(page).toHaveURL(/\/checkout\/thanks/);
    await expect(page.getByRole('heading', { name: /Pedido confirmado/i })).toBeVisible();
    await expect(page.getByText(/Envío a domicilio/i)).toBeVisible();
  });
});
