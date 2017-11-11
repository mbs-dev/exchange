let _ = require('lodash')
let utils = require('../utils.js')
let Combinatorics = require('js-combinatorics')



class Manager {
  constructor(orderBooks) {
    this.orderBooks = orderBooks
    this.markets = _.map(orderBooks, (orderBook) => { return orderBook.market })
    this.marketNames = _.map(this.markets, (market) => { return market.name })
  }

  getAllPossibleDealsVsMarkets() {
    const buySell = Combinatorics.baseN([utils.const.BUY, utils.const.SELL], this.markets.length).toArray()
    const marketsVsOrdersDirections = _.reduce(buySell, (acc, orderDirections) => {
      acc.push(_.zip(orderDirections, this.markets))
      return acc
    }, [])
    return marketsVsOrdersDirections
  }

}


class Arbitrage {
  constructor(orders) {
    this.orders = orders
  }
}

class ExchangeOrder {
  constructor(marketName, volume, price, orderType, timeInEffect, conditionType, target) {
    this.marketName = marketName
    this.volume = volume
    this.price = price
    this.orderType = orderType || utils.const.order.LIMIT
    this.timeInEffect = timeInEffect || utils.const.order.IMMEDIATE_OR_CANCEL
    this.conditionType = conditionType || utils.const.order.NONE
    this.target = target || 0
  }
  
}

module.exports = Manager
