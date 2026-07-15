import { Page, expect } from '@playwright/test'

export function createCheckoutActions(page: Page) {

  const terms = page.getByTestId('checkout-terms')


  const alerts = {
    name: page.getByTestId('checkout-name-error'),
    lastname: page.getByTestId('checkout-lastname-error'),
    email: page.getByTestId('checkout-email-error'),
    phone: page.getByTestId('checkout-phone-error'),
    document: page.getByTestId('checkout-document-error'),
    store: page.getByTestId('checkout-store-error'),
    terms: page.getByTestId('checkout-terms-error'),
  }

  return {

    elements: {
      terms,
      alerts
    },

    async expectLoaded() {
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    },

    async expectSummaryTotal(price: string) {
      await expect(page.getByTestId('summary-total-price')).toHaveText(price)
    },

    async fillCustomerData(data: {
      name: string
      lastname: string
      email: string
      phone: string
      document: string
    }) {
      await page.getByTestId('checkout-name').fill(data.name)
      await page.getByTestId('checkout-lastname').fill(data.lastname)
      await page.getByTestId('checkout-email').fill(data.email)
      await page.getByTestId('checkout-phone').fill(data.phone)
      await page.getByTestId('checkout-document').fill(data.document)
    },

    async selectStore(storeName: string) {
      await page.getByTestId('checkout-store').click()
      await page.getByRole('option', { name: storeName }).click()
    },

    async fillDownPayment(value: string) {
      await page.getByTestId('input-entry-value').fill(value)
    },

    async selectPaymentMethod(paymentMethod: string) {
      await page.getByRole('button', { name: paymentMethod }).click()
    },

    async acceptTerms() {
      await terms.check()
    },

    async submit() {
      await page.getByRole('button', { name: 'Confirmar Pedido' }).click()
    },

    async mockCreditAnalysis(score: number) {
      await page.route('**/functions/v1/credit-analysis', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'Done',
            score,
          })
        })
      })
    },

    async expectSuccessPage() {
      await expect(page).toHaveURL(/\/success/)
    },
  }
}