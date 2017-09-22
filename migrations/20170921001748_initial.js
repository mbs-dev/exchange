exports.up = (knex, Promise) => {
  return Promise.all([
    knex.schema.createTable('orders', (table) => {
        table.increments('id').primary()
        table.string('exchange')
        table.string('marketFirst')
        table.string('marketSecond')
        table.string('type')  // BUY or SELL
        table.decimal('volume', 14, 5)
        table.decimal('price', 14, 5)
        table.timestamps()
        table.index(['exchange', 'marketFirst', 'marketSecond', 'type'])
    })
  ])
}

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.dropTable('orders')
  ])
}
