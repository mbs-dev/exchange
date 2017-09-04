const lo = require('lodash')
const utils = require('./src/utils')

const exchanges = {
  // 'Bittrex': require('./src/exchanges/bittrex').getOrderBook,
  // 'Poloniex': require('./src/exchanges/poloniex').getOrderBook,
  'Bitfinex': require('./src/exchanges/bitfinex').getOrderBook
}

const market = utils.parseMarketFromCli()

if (!market) {
  console.log('no valid market provided')
  process.exit(1)
}

Promise.all(lo.values(lo.each(exchanges, (getOrderBook, exchangeName) => {
  const _utils = utils
  return getOrderBook(market).then((ordersDict) => {
    console.log('-- ' + exchangeName + ' --')
    _utils.stupidOrderBookFormat(ordersDict['BUY'], ordersDict['SELL'])
  }).catch((reason)=>{
    console.error(reason);
  })
})))
