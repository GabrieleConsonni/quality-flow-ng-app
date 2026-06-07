import { expect, test } from '@playwright/test';

/**
 * F2 smoke for the Test Suites template engine — happy path Send & Verify:
 *   1. land on the suites list
 *   2. create a new suite via the popup
 *   3. open the New Test dialog and pick "Send & Verify"
 *   4. fill queue_id, payload (inline JSON), wait_ms, add 1 exists assert on a queue
 *   5. wait for the generated-steps-timeline to render the expected step count
 *   6. Save → back to the suite editor → the new test appears in the list
 *
 * Requires the BE (docker compose up) and the FE in mock-auth mode
 * (`pnpm run start:mock-auth`, port 4400). Run via `pnpm run e2e:run`.
 */

const uniqueSuiteName = () =>
  `qfw-tpl ${new Date().toISOString().replace(/[^\d]/g, '').slice(0, 14)}`;

test.describe('@qfw @smoke @template Test Suites · Send & Verify happy path', () => {
  test('creates a Send & Verify test from the New Test dialog', async ({ page }) => {
    const suiteDescription = uniqueSuiteName();
    const testDescription = 'send_verify smoke';

    await page.goto('/test-suites');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Test Suites' })).toBeVisible();

    // Create the suite from the suites list popup.
    await page.getByRole('button', { name: '+ New suite' }).first().click();
    await page.locator('#qf-new-suite-description').fill(suiteDescription);
    await page.getByRole('button', { name: 'Create' }).click();

    // We're now on the suite editor.
    await expect(page).toHaveURL(/\/test-suites\/[^/]+$/);
    await expect(page.getByText('Suite description')).toBeVisible();

    // Open the New Test dialog and pick Send & Verify.
    await page.getByRole('button', { name: '+ Add test' }).first().click();
    const sendVerifyCard = page.locator('.new-test-dialog__card', { hasText: 'Send & Verify' });
    await expect(sendVerifyCard).toBeVisible();
    await sendVerifyCard.click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // We're on the Test Editor template mode.
    await expect(page).toHaveURL(/\/tests\/new\?template_kind=send_verify/);

    // DevExtreme's inputAttr binding is fragile across builds, so we target
    // inputs by placeholder text (stable contract from the template HTML).
    const descriptionInput = page.locator('input[placeholder="What does this test verify?"]');
    await expect(descriptionInput).toBeVisible();
    await descriptionInput.fill(testDescription);

    const queueIdInput = page.locator('input[placeholder="customer-events"]');
    await queueIdInput.fill('queue-out');

    // Add an exists assert on a queue (defaults: target='queue', operator='exists').
    await page.getByRole('button', { name: '+ Add assertion' }).click();
    await page.locator('input[placeholder="Queue id"]').first().fill('queue-out-ack');

    // Wait for the generated-steps-timeline to render at least the expected number
    // of steps for "setVariable + sendMessageQueue + sleep + receiveQueue + assert".
    await expect(page.locator('.timeline__step')).toHaveCount(5, { timeout: 5_000 });

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/\/test-suites\/[^/]+$/);
    await expect(page.getByText(testDescription)).toBeVisible({ timeout: 10_000 });
  });
});
