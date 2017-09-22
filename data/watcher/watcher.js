const lo = require('lodash')
let debug = require('debug')('change:server')

class Watcher {
  constructor (config, frequencyInterval, market, emitter) {
    this.enabled = false;
    this.market = market;
    this.emitter = emitter;

    const _self = this;

    this.interval = setInterval(()=>{
      if (!_self.enabled) return
      const market = _self.market
      const emitter = _self.emitter

      debug('Requesting new data from exchanges')

      Promise.all(lo.values(lo.each(config.exchanges, (getOrderBook, exchangeName) => {
        return getOrderBook(market).then((ordersDict) => {
          emitter.emit('exchangeData', {
            'exchange': exchangeName,
            'market': market,
            'orderBook': {
              'buy': ordersDict['BUY'],
              'sell': ordersDict['SELL']
            }
          })
        }).catch((reason)=>{
          console.error('[' + exchangeName + '] Unable to retrieve data: ' + reason);
        })
      })))

    }, frequencyInterval)
  }

  enable() {
    this.enabled = true
  }

  disable() {
    this.enabled = false
  }
}


module.exports = Watcher;
