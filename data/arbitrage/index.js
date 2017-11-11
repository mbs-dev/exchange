let _ = require('lodash')
let Decimal = require('decimal.js')

let utils = require('../utils.js')

let Combinatorics = require('js-combinatorics')


module.exports = {
  'Market': require('./market.js').Market,
  'MarketWithFees': require('./market.js').MarketWithFees,

  'MulticurrencyAccount': require('./account.js'),
  'OrderBook': require('./orderbook.js'),
  'Manager': require('./manager.js')
}



// // class DealsGenerator {
// //   constructor(orderBooks, orderFeeFunc) {
// //     this.orderBooks = orderBooks
// //     this.orderFeeFunc = orderFeeFunc
// //   }
// //
// //   get markets() {
// //     return _.map(this.orderBooks, (orderBook) => { return orderBook.market })
// //   }
// //
// //   getOrderBookByMarket(market) {
// //     return _.find(this.orderBooks, (orderBook) => { return orderBook.market === market })
// //   }
// //
// //   getAllPossibleDealsVsMarkets() {
// //     const buySell = Combinatorics.baseN([utils.const.BUY, utils.const.SELL], this.markets.length).toArray()
// //     const marketsVsOrdersDirections = _.reduce(buySell, (acc, orderDirections) => {
// //       acc.push(_.zip(orderDirections, this.markets))
// //       return acc
// //     }, [])
// //     return marketsVsOrdersDirections
// //   }
// //
// //   makeOrderFromDeal(deal, depth) {
// //     let buyOrSell = deal[0]
// //     let market = deal[1]
// //     const orderBook = this.getOrderBookByMarket(market)
// //
// //     let diff
// //     let respondingOrder
// //     if (buyOrSell === utils.const.BUY) {
// //       respondingOrder = orderBook.getAsksAtDepth(depth)
// //       diff = market.buy(respondingOrder[utils.const.volume], respondingOrder[utils.const.price])
// //     } else if (buyOrSell === utils.const.SELL) {
// //       respondingOrder = orderBook.getBidsAtDepth(depth)
// //       diff = market.sell(respondingOrder[utils.const.volume], respondingOrder[utils.const.price])
// //     } else {
// //       throw new Error("Improper order direction. Should be either BUY or SELL.")
// //     }
// //
// //     return new Order(market, buyOrSell, respondingOrder[utils.const.price], respondingOrder[utils.const.volume], diff)
// //   }
// //
// //
//   /**
//   * From the set of orders tune up volumes to match the "bottleneck" order
//   */
//   getBalancedOrders (orders) {
//
//   }
//
//   getBottleNeckOrder (orders) {
//
//   }
//
//   /**
//   * Generates all possible arbitrages, starting from selected currency and ended with it
//   * @param {String} currency - The currency to start arbitrage "from"
//   * @param {Number} depth - The max depth of orders to watch at orderbook
//   * @return {Array} - Arbitrage objects in array
//   */
//   generateArbitrages(currency, depth) {
//     // 1. check that at least 2 of markets contains currency
//
//     // 2. generate possible deals
//     const possibleDeals = this.getAllPossibleDealsVsMarkets()
//     const balancedDealsOrders = _.map(possibleDeals, (steps) => {
//       const orders = _.each(steps, (deal) => { this.makeOrderFromDeal(deal) })
//       return this.getBalancedOrders(orders)
//     })
//
//     // 3. add fees
//
//     // 4. "balancing" deals
//
//     // 5. find profitable deals
//     // 6. find orders with maximum profitability
//   }
// }
// module.exports.DealsGenerator = DealsGenerator
//
// // TODO:
// module.exports.fees = {}
// module.exports.fees.ZeroFee = (order) => { return 0 }
// module.exports.fees.FixedFee = (fixed) => { return (order) => { return fixed } }
// module.exports.fees.PercentFee = (percents) => { return (order) => { return Decimal(order[utils.const.price]).mul(Decimal(order[utils.const.volume])).mul(Decimal(percents)) } }
//
//
//
//
// class BalanceChange {
//   constructor(diff) {
//     this.diff = diff
//   }
//
//   whatGrows() {
//     return _.compact(_.map(this.diff, (change, currency) => {
//       return Decimal(change).isPositive() ? currency : false
//     }))
//   }
//
//   whatHave() {
//     return this.whatGrows()
//   }
//
//   canSpendAssets(assets) {
//     return _.every(
//       _.map(assets, (asset) => {
//         return !(this.diff[asset] === undefined) && Decimal(this.diff[asset]).isPositive()
//       })
//     )
//   }
//
//   haveEnoughToSpend(diff) {
//     if (!this.canSpendAssets(Object.keys(diff))) return false
//     return _.reduce(diff, (acc, amount, currency) => {
//       return acc && (Decimal(amount).add(Decimal(this.diff[currency])).greaterThanOrEqualTo(0))
//     }, true)
//   }
//
//   whatDecrease() {
//     return _.compact(_.map(this.diff, (change, currency) => {
//       return Decimal(change).isNegative() ? currency : false
//     }))
//   }
// }
//
// module.exports.BalanceChange = BalanceChange
