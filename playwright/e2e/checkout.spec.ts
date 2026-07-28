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

  test.describe('Pagamento e Confirmação', () => {

    // Arrange
    // 1. Acessar a página principal e navegar para o configurador
    test.beforeEach(async ({ app }) => {
      await app.hero.open()
    })

    test.beforeAll(async () => {
      await deleteOrderByDocument(testData.novoPedido.customer.document)
    })

    test('deve criar um pedido com sucesso para pagamento à vista', async ({ page, app }) => {

      const orderData = testData.novoPedido

      // Arrange
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
      await app.checkout.expectResult('Pedido Aprovado!')
    })

    test('deve aprovar automaticamente o credito quando o score do CPF for maior que 700 no financiamento', async ({ page, app }) => {

      const customer = {
        name: 'Livia',
        lastname: 'Anjos',
        email: 'livia.anjos@teste.com',
        phone: '(11) 99999-8888',
        document: '05366127068',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00'
      }

      await deleteOrderByDocument(customer.document)

      await app.mock.creditAnalysis(710)

      // Arrange
      // 2. Selecionar opções padrão e ir para o checkout
      await app.configurator.expectTotalPrice(customer.totalPrice)
      await app.configurator.finishConfiguration()
      await app.checkout.expectLoaded()

      // 3. Preencher dados de checkout
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.expectSummaryTotal('R$ 40.800,00')
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await app.checkout.expectResult('Pedido Aprovado!')
    })

    test('deve encaminhar para análise de crédito quando o score do CPF for entre 501 e 700 no financiamento', async ({ page, app }) => {

      const customer = {
        name: 'Carlos',
        lastname: 'Silva',
        email: 'carlos.silva@teste.com',
        phone: '(11) 98765-4321',
        document: '97137597025',
        store: 'Velô Paulista - Av. Paulista, 1000',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00'
      }

      await deleteOrderByDocument(customer.document)

      await app.mock.creditAnalysis(600)

      // Arrange
      // 2. Selecionar opções padrão e ir para o checkout
      await app.configurator.expectTotalPrice(customer.totalPrice)
      await app.configurator.finishConfiguration()
      await app.checkout.expectLoaded()

      // 3. Preencher dados de checkout
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.expectSummaryTotal('R$ 40.800,00')
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await app.checkout.expectResult('Pedido em Análise!')

      // Obter o ID do pedido
      const orderId = await page.getByTestId('order-id').innerText()

      // Navegar para consulta de pedidos
      await page.getByTestId('goto-consultar').click()
      await expect(page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible()

      // Buscar o pedido e validar o status "EM_ANALISE" com o ícone de relógio
      await app.orderLockup.searchOrder(orderId)
      await app.orderLockup.validateStatusBadge('EM_ANALISE')
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento sem entrada', async ({ page, app }) => {

      const customer = {
        name: 'Mariana',
        lastname: 'Souza',
        email: 'mariana.souza@teste.com',
        phone: '(11) 97777-6666',
        document: '52998224725',
        store: 'Velô Paulista - Av. Paulista, 1000',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00'
      }

      await deleteOrderByDocument(customer.document)

      await app.mock.creditAnalysis(500)

      // Arrange
      // 2. Selecionar opções padrão e ir para o checkout
      await app.configurator.expectTotalPrice(customer.totalPrice)
      await app.configurator.finishConfiguration()
      await app.checkout.expectLoaded()

      // 3. Preencher dados de checkout
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.expectSummaryTotal('R$ 40.800,00')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await app.checkout.expectResult('Pedido Reprovado!')

      // Obter o ID do pedido
      const orderId = await page.getByTestId('order-id').innerText()

      // Navegar para consulta de pedidos
      await page.getByTestId('goto-consultar').click()
      await expect(page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible()

      // Buscar o pedido e validar o status "REPROVADO"
      await app.orderLockup.searchOrder(orderId)
      await app.orderLockup.validateStatusBadge('REPROVADO')
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada menor que 50%', async ({ page, app }) => {

      const customer = {
        name: 'Fernanda',
        lastname: 'Oliveira',
        email: 'fernanda.oliveira@teste.com',
        phone: '(11) 98888-7777',
        document: '11144477735',
        store: 'Velô Paulista - Av. Paulista, 1000',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
        downPayment: '10000'

      }

      await deleteOrderByDocument(customer.document)

      await app.mock.creditAnalysis(500)

      // Arrange
      // 2. Selecionar opções padrão e ir para o checkout
      await app.configurator.expectTotalPrice(customer.totalPrice)
      await app.configurator.finishConfiguration()
      await app.checkout.expectLoaded()

      // 3. Preencher dados de checkout
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.fillDownPayment(customer.downPayment)

      await app.checkout.expectSummaryTotal('R$ 30.600,00')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await app.checkout.expectResult('Pedido Reprovado!')

      // Obter o ID do pedido
      const orderId = await page.getByTestId('order-id').innerText()

      // Navegar para consulta de pedidos
      await page.getByTestId('goto-consultar').click()
      await expect(page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible()

      // Buscar o pedido e validar o status "REPROVADO"
      await app.orderLockup.searchOrder(orderId)
      await app.orderLockup.validateStatusBadge('REPROVADO')
    })


    test('deve aprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada igual a 50%', async ({ page, app }) => {

      const customer = {
        name: 'Richard',
        lastname: 'Fortus',
        email: 'richard@gmail.com',
        document: '39434745004',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
        downPayment: '20000'
      }

      await deleteOrderByDocument(customer.document)

      await app.mock.creditAnalysis(450)


      // Arrange
      // 2. Selecionar opções padrão e ir para o checkout
      await app.configurator.expectTotalPrice(customer.totalPrice)
      await app.configurator.finishConfiguration()
      await app.checkout.expectLoaded()

      // 3. Preencher dados de checkout
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.fillDownPayment(customer.downPayment)

      await app.checkout.expectSummaryTotal('R$ 20.400,00')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await app.checkout.expectResult('Pedido Aprovado!')

      // Obter o ID do pedido
      const orderId = await page.getByTestId('order-id').innerText()

      // Navegar para consulta de pedidos
      await page.getByTestId('goto-consultar').click()
      await expect(page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible()

      // Buscar o pedido e validar o status "REPROVADO"
      await app.orderLockup.searchOrder(orderId)
      await app.orderLockup.validateStatusBadge('APROVADO')
    })
    test('deve aprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada mair que 50%', async ({ page, app }) => {

      const customer = {
        name: 'Axl',
        lastname: 'Rose',
        email: 'alx@gnr.com',
        document: '79327557000',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
        downPayment: '30000'
      }
      await deleteOrderByDocument(customer.document)

      await app.mock.creditAnalysis(300)

      // Arrange
      // 2. Selecionar opções padrão e ir para o checkout
      await app.configurator.expectTotalPrice(customer.totalPrice)
      await app.configurator.finishConfiguration()
      await app.checkout.expectLoaded()

      // 3. Preencher dados de checkout
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.fillDownPayment(customer.downPayment)

      await app.checkout.expectSummaryTotal('R$ 10.200,00')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await app.checkout.expectResult('Pedido Aprovado!')

      // Obter o ID do pedido
      const orderId = await page.getByTestId('order-id').innerText()

      // Navegar para consulta de pedidos
      await page.getByTestId('goto-consultar').click()
      await expect(page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible()

      // Buscar o pedido e validar o status "APROVADO"
      await app.orderLockup.searchOrder(orderId)
      await app.orderLockup.validateStatusBadge('APROVADO')
    })

  })


})

