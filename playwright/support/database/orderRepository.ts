import { db } from './index'

export const orderFixtures = [
  {
    id: '1fa137eb-00e9-4e9a-acde-ef0902433501',
    order_number: 'VLO-AY2HRQ',
    color: 'midnight-black',
    wheel_type: 'sport',
    customer_name: 'Livia Anjos',
    customer_email: 'lsa@hotmail.com',
    customer_phone: '(71) 99267-8558',
    customer_cpf: '836.054.150-75',
    payment_method: 'avista',
    total_price: '42000',
    status: 'APROVADO',
    optionals: []
  },
  {
    id: '1fa137eb-00e9-4e9a-acde-ef0902433502',
    order_number: 'VLO-R9RU6F',
    color: 'midnight-black',
    wheel_type: 'sport',
    customer_name: 'Maria Chiquinha',
    customer_email: 'chiquinha@teste.com.br',
    customer_phone: '(71) 99999-9999',
    customer_cpf: '111.111.111-11',
    payment_method: 'avista',
    total_price: '42000',
    status: 'REPROVADO',
    optionals: []
  },
  {
    id: '1fa137eb-00e9-4e9a-acde-ef0902433503',
    order_number: 'VLO-89K26W',
    color: 'lunar-white',
    wheel_type: 'aero',
    customer_name: 'Hermione Granger',
    customer_email: 'leviosaaa@teste.com',
    customer_phone: '(11) 98888-8888',
    customer_cpf: '222.222.222-22',
    payment_method: 'avista',
    total_price: '38000',
    status: 'EM_ANALISE',
    optionals: []
  }
];

export async function seedTestOrders() {
  await db
    .insertInto('orders')
    .values(orderFixtures)
    .onConflict((oc) => oc.column('order_number').doNothing()) // Do nothing if order_number already exists
    .execute()
}

export async function cleanupTestOrders() {
  const orderNumbers = orderFixtures.map(f => f.order_number)
  await db
    .deleteFrom('orders')
    .where('order_number', 'in', orderNumbers)
    .execute()
}
