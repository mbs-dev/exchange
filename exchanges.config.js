const config = {
  exchanges: {
    'Bittrex': require('./data/exchanges/bittrex').getOrderBook,
    'Poloniex': require('./data/exchanges/poloniex').getOrderBook,
    'Bitfinex': require('./data/exchanges/bitfinex').getOrderBook
  }
}

module.exports = config
