
export function generateOrderCode() {
  const prefixo = 'VLO'

  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let parteLetras = ''
  for (let i = 0; i < 3; i++) {
    parteLetras += letras.charAt(Math.floor(Math.random() * letras.length))
  }

  const parteNumeros = Math.floor(100 + Math.random() * 900) // garante 3 dígitos

  return `${prefixo}-${parteLetras}${parteNumeros}`
}

  /* Usado como alternativa ao PageObject
  import { Page } from '@playwright/test'
export async function searchOrder(page: Page, orderNumber: string) {
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(orderNumber)
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()
}*/