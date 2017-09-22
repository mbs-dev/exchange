const config = require('./exchanges.config.js')

const lo = require('lodash')
const utils = require('./data/utils')
const EventEmitter = require('events')
const market = utils.parseMarketFromCli()

const ExchangeWatcher = require('./data/watcher/watcher.js')

const db = require('./db.js')

const dataEmitter = new EventEmitter()

if (!market) {
  console.log('no valid market provided')
  process.exit(1)
}

dataEmitter.on('exchangeData', (data) => {
  // console.log('-- ' + data['exchange'] + ' --')
  // utils.stupidOrderBookFormat(data['orderBook']['buy'], data['orderBook']['sell'])

  const marketFirst = data['market'].first
  const marketSecond = data['market'].second
  const exchange = data['exchange']
  const orderBook = data['orderBook']

  const now = new Date()


  //todo: remove duplicated code
  const dataBatch = []

  lo.each(orderBook['buy'], (order, index) => {
    dataBatch.push({
      exchange: exchange,
      marketFirst: marketFirst,
      marketSecond: marketSecond,
      type: utils.consts.buy,
      volume: order[utils.consts.volume],
      price: order[utils.consts.price],
      created_at: now,
      updated_at: now
    })
  })

  //todo: remove duplicated code
  lo.each(orderBook['sell'], (order, index) => {
    dataBatch.push({
      exchange: exchange,
      marketFirst: marketFirst,
      marketSecond: marketSecond,
      type: utils.consts.sell,
      volume: order[utils.consts.volume],
      price: order[utils.consts.price],
      created_at: now,
      updated_at: now
    })
  })

  db.batchInsert('orders', dataBatch, 30).then((res)=>{
    console.log('Data from ' + data['exchange'] + ' retrieved and saved.')
  }).catch((err)=>{
    console.log(err);
  })
})

const ew = new ExchangeWatcher(config, 15000, market, dataEmitter)
ew.enable()
