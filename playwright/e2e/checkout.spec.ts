import { test, expect } from '../support/fixtures'
import testData from '../support/fixture/orders.json' with { type: 'json' }
import { deleteOrderByDocument } from '../support/database/orderRepository'

test.describe('Checkout', () => {



  test.describe('Validações de campos obrigatórios', () => {

    let alerts: any

    test.beforeEach(async ({ page, app }) => {
      await page.goto('/order')
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()

      alerts = app.checkout.elements.alerts
    })

    test('deve validar obrgatoriedade de todos campos em branco', async ({
      page, app }) => {

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(alerts.email).toHaveText('Email inválido')
      await expect(alerts.phone).toHaveText('Telefone inválido')
      await expect(alerts.document).toHaveText('Documento inválido')
      await expect(alerts.store).toHaveText('Selecione uma loja')
      await expect(alerts.terms).toHaveText('Aceite os termos')

    })

    test('deve validar limite minimo de caracteres para Nome e Sobrenome', async ({ app }) => {

      const custumer = {
        name: 'A',
        lastname: 'B',
        email: 'cliente.valido@example.com',
        phone: '(11) 98765-4321',
        document: '529.982.247-25',
      }
      //Arrange
      await app.checkout.fillCustomerData(custumer)
      await app.checkout.selectStore('Velô Paulista - Av. Paulista, 1000')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    })

    test('deve exibir erro para Email com formato inválido', async ({ app }) => {

      const custumer = {
        name: 'João',
        lastname: 'Silva',
        email: 'a@b',
        phone: '(11) 98765-4321',
        document: '529.982.247-25',
      }
      //Arrange
      await app.checkout.fillCustomerData(custumer)
      await app.checkout.selectStore('Velô Paulista - Av. Paulista, 1000')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.email).toHaveText('Email inválido')
    })

    test('deve exibir erro para CPF inválido', async ({ app }) => {

      const custumer = {
        name: 'João',
        lastname: 'Silva',
        email: 'cliente.valido@example.com',
        phone: '(11) 98765-4321',
        document: '00000014199',
      }
      //Arrange
      await app.checkout.fillCustomerData(custumer)
      await app.checkout.selectStore('Velô Paulista - Av. Paulista, 1000')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.document).toHaveText('Documento inválido')
    })

    test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {

      const custumer = {
        name: 'João',
        lastname: 'Silva',
        email: 'cliente.valido@example.com',
        phone: '(11) 98765-4321',
        document: '529.982.247-25',
      }
      //Arrange
      await app.checkout.fillCustomerData(custumer)
      await app.checkout.selectStore('Velô Paulista - Av. Paulista, 1000')

      await expect(app.checkout.elements.terms).not.toBeChecked()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })

  })

  test.describe('Fluxo Feliz', () => {

    test.beforeAll(async () => {
      await deleteOrderByDocument(testData.novoPedido.customer.document)
    })

    test('deve criar um pedido com pagamento à vista com sucesso', async ({ page, app }) => {

      const orderData = testData.novoPedido

      // Arrange
      // 1. Acessar a página principal e navegar para o configurador
      await page.goto('/')
      await page.getByRole('link', { name: 'Configure o Seu' }).first().click()

      // 2. Selecionar opções padrão e ir para o checkout
      await app.configurator.ensureBaseState()
      await app.configurator.finishConfiguration()
      await app.checkout.expectLoaded()

      // 3. Preencher dados de checkout
      await app.checkout.fillCustomerData(orderData.customer)
      await app.checkout.selectStore(orderData.store)

      // Selecionar aba À Vista
      await page.getByRole('button', { name: orderData.paymentMethod }).click()
      await app.checkout.expectSummaryTotal(orderData.totalPrice)

      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByText('Pedido Aprovado!')).toBeVisible()
    })

  })

})
