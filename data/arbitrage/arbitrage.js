const debug = require('debug');
const utils = require('../utils')
const Decimal = require('decimal.js')
const combinatorics = require('js-combinatorics');
const _ = require('lodash')

class Arbitrage {
  /**
  * @param {Array} markets
  * @param {Array} buyOrSells
  * @param {Array} orderBooks
  * @param {MulticurrencyAccount} availableFundsAccount
  * @param {String} profitCurrency
  */
  constructor(markets, buyOrSells, orderbooks, availableFundsAccount, profitCurrency) {
    this.markets = markets
    this.buyOrSells = buyOrSells
    this.orderbooks = orderbooks
    this.availableFundsAccount = availableFundsAccount
    this.profitCurrency = profitCurrency

    if (markets.length === 0) throw new Error('Incorrect markets dimensions')
    if (!(markets.length === buyOrSells.length && buyOrSells.length === orderbooks.length)) throw new Error('Improper dimensions for markets, buyOrSells or orderbooks.')
    if (!availableFundsAccount || availableFundsAccount.isEmpty()) throw new Error('Account of available funds should be not empty.')
  }

  getDeals() {
    let shouldOptimizeVolumes = true
    // let multiplicators = _.map(Array(this.markets.length), () => { return Decimal(1.0) })
    let multiplicator = Decimal(1.0)

    var arbitrageAccount
    var deals
    var totalIterations = 0

    while (shouldOptimizeVolumes) {
      totalIterations++
      if (totalIterations > 4) {
        //throw new Error('Unable to rebalance arbitrage.')
        return null
      }
      arbitrageAccount = this.availableFundsAccount.copy()
      deals = []

      for (var j = 0; j < this.markets.length; j++) {
        let direction = this.buyOrSells[j]
        let orderBookColumn = Arbitrage.directionToOrder(direction) // inversed buy or sell, because we need counteroffer
        let market = this.markets[j]

        // we use [0], since we want TOP of the order book
        let orderBookItem = this.orderbooks[j][orderBookColumn][0]
        let availableVolume = orderBookItem[utils.const.VOLUME]  // decimal containing the quantity of currency pairs for the deal available on exchange
        let availablePrice =  orderBookItem[utils.const.PRICE]   // decimal containing price for the deal available on exchange

        let whatCurrencyIspend = Arbitrage.whatCurrencyISpend(market.buyOrSell(direction, availablePrice, availableVolume))
        let fundsIhaveForSpend = arbitrageAccount.getBalance()[whatCurrencyIspend] || Decimal(0)

        debug('Volumes')(`I spend ${whatCurrencyIspend} and I have ${fundsIhaveForSpend} of the ${whatCurrencyIspend}`);
        var requiredVolume
        if (whatCurrencyIspend === market.marketCurrency) {
          requiredVolume = fundsIhaveForSpend  // I must spend everything I have
        } else if (whatCurrencyIspend === market.secondCurrency) {
          requiredVolume = fundsIhaveForSpend.dividedBy(availablePrice) // I must spend everything I have
        } else {
          throw new Error(`I spend strange currency ${whatCurrencyIspend}`)
        }

        if (j == 0) requiredVolume = multiplicator.mul(requiredVolume)

        if (requiredVolume.lessThan('0.00000001')) return null
        if (whatCurrencyIspend === 'BTC' && requiredVolume.lessThan('0.00050000')) return null

        if (requiredVolume.greaterThan(availableVolume)) {
          debug('Volumes')(`The required volume is ${requiredVolume.toString()} but available is only ${availableVolume.toString()}`)
          debug('Volumes')(`Adjusting multiplicator from ${multiplicator.toString()}`)
          multiplicator = multiplicator.mul(availableVolume.dividedBy(requiredVolume))
          debug('Volumes')(`to ${multiplicator.toString()}`)
          shouldOptimizeVolumes = true
          break
        }

        let diff = market.buyOrSell(direction, availablePrice, requiredVolume)
        let whatISpend = Arbitrage.whatCurrencyISpend(diff)

        // then I store the new deal into `deals` buffer of this arbitrage
        deals.push([market.name, direction, requiredVolume, availablePrice])
        // and update arbitrage balance as well
        arbitrageAccount.updateBalance(diff)
        shouldOptimizeVolumes = false
      }
    }

    let profit = Decimal(arbitrageAccount.getBalance()[this.profitCurrency]).sub(this.availableFundsAccount.getBalance()[this.profitCurrency])
    return [deals, arbitrageAccount, profit]
  }

  static whatCurrencyISpend(diff) {
    for (var k in diff) {
      if (Decimal(diff[k]).isNegative()) return k
    }
    throw new Error('Provided diff that have no spendings. May be it is malformed deal?')
  }

  static getAllArbitrages(markets, orderbooks, availableFundsAccount, profitCurrency) {
    const buySell = combinatorics.baseN([utils.const.BUY, utils.const.SELL], markets.length).toArray()
    var _markets = markets
    var _orderbooks = orderbooks
    var _availableFundsAccount = availableFundsAccount
    var _profitCurrency = profitCurrency
    return _.map(buySell, (buyOrSell) => {
      return new Arbitrage(_markets, buyOrSell, _orderbooks, _availableFundsAccount.copy(), _profitCurrency)
    })
  }

  static directionToOrder(d) {
    if (d === utils.const.BUY) return utils.const.ASK // you can `buy` from ASK
    if (d === utils.const.SELL) return utils.const.BID // you can `sell` to BID
    throw new Error('Direction of the deal should be either BUY or SELL and will respond with corresponding side of OrderBook')
  }

  toString() {
    let result = ''
    for (var i = 0; i < this.markets.length; i++) {
      result = result + ` "${this.buyOrSells[i]}" on ${this.markets[i].name}`
    }
    return result
  }

}

module.exports = Arbitrage
