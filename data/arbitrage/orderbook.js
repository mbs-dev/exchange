let Decimal = require('decimal.js')
let utils = require('../utils.js')

class OrderBook {
  /**
   * Represents an order book of a market.
   * It maintains two separate list for buy orders (bids) and sell orders (asks).
   * @constructor
   * @param {Array} bidOrders - The array of raw bid orders, obtained from API. Every order should be an object {'RATE': ..., 'QUANTITY'}
   * @param {Array} asksOrders - The array of raw ask orders.
   * @param {Market} market - The associated market object
   */
  constructor (bidsOrders, asksOrders, market) {
    this.bidsOrders = this._sort(bidsOrders)
    this.asksOrders = this._sort(asksOrders)
    this.market = market
  }

  _sort(orders) {
    return orders.sort((x, y) => {
      return Decimal(x[utils.const.PRICE]).sub(Decimal(y[utils.const.PRICE])).toNumber()
    })
  }

  get bidsDepth() {
    return this.bidsOrders.length
  }

  get asksDepth() {
    return this.asksOrders.length
  }

  getBidsAtDepth(depth) {
    if (depth > this.bidsDepth) throw new Error(`Depth "${depth}" is too big. Max depth of bids is "${this.bidsDepth}"`)
    if (depth < 0) throw new Error(`Depth should be 0 or greater.`)
    return this.bidsOrders[depth]
  }

  getAsksAtDepth(depth) {
    if (depth > this.asksDepth) throw new Error(`Depth "${depth}" is too big. Max depth of bids is "${this.asksDepth}"`)
    if (depth < 0) throw new Error(`Depth should be 0 or greater.`)
    return this.asksOrders[depth]
  }
}

module.exports = OrderBook
