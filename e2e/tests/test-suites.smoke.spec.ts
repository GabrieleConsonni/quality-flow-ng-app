import { expect, test } from '@playwright/test';

/**
 * F1 smoke for the Test Suites refactor — happy path with the Phase 2 flow:
 *   1. land on the suites list
 *   2. create a new suite via the "+ New suite" popup
 *   3. land on the suite editor of the newly created suite
 *   4. open the New Test dialog (Mockup 3) → pick "Custom" → Continue
 *   5. fill the custom-test description in the "Add custom test" popup
 *   6. go back to the list and verify the new suite is visible.
 *
 * Requires the BE (docker-compose up) and the FE in mock-auth mode
 * (`pnpm run start:mock-auth`, port 4400).
 */

const uniqueSuiteName = () =>
  `qfw-smoke ${new Date().toISOString().replace(/[^\d]/g, '').slice(0, 14)}`;

test.describe('@qfw @smoke Test Suites — F1 happy path', () => {
  test('creates a suite, adds a custom test and shows it in the list', async ({ page }) => {
    const description = uniqueSuiteName();

    await page.goto('/test-suites');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Test Suites' })).toBeVisible();

    await page.getByRole('button', { name: '+ New suite' }).first().click();

    const newSuiteInput = page.locator('#qf-new-suite-description');
    await expect(newSuiteInput).toBeVisible();
    await newSuiteInput.fill(description);

    await page.getByRole('button', { name: 'Create' }).click();

    // Expect navigation to the suite editor.
    await expect(page).toHaveURL(/\/test-suites\/[^/]+$/);
    await expect(page.getByText('Suite description')).toBeVisible();

    // F2 flow: "+ Add test" now opens the New Test dialog (Mockup 3).
    await page.getByRole('button', { name: '+ Add test' }).first().click();
    const customCard = page.locator('.new-test-dialog__card', { hasText: 'Custom' });
    await expect(customCard).toBeVisible();
    await customCard.click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // The legacy "Add custom test" popup is reached only for kind=custom.
    const newTestInput = page.locator('#qf-new-test-description');
    await expect(newTestInput).toBeVisible();
    await newTestInput.fill('Smoke test step 1');
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    // The test card should appear in the Tests section.
    await expect(page.getByText('Smoke test step 1')).toBeVisible({ timeout: 10_000 });

    // Go back to the list and verify the suite is there.
    await page.getByRole('link', { name: 'Test Suites' }).click();
    await expect(page).toHaveURL(/\/test-suites$/);
    await expect(page.getByText(description)).toBeVisible({ timeout: 10_000 });
  });
});
