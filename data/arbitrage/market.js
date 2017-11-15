let Decimal = require('decimal.js')
let utils = require('../utils')

/**
@class  Market represents a logic of chaning balances while performing actual buying and selling
across prferred market.

Use method {@link Market#buy buy} to make a balance change equivalent to buying assets,
and method {@link Market#sell sell} to make a balance change equivalent to selling assets.
You then can use balance changes in {@link MulticurrencyAccount}

Base currency is the currency marked as base at exchange.
I.e. for USDT-BTC market on Bittrex, the 'BTC' is a base currency, while
the USDT is second currency.
*/
class Market {
  /**
  Market represents a logic of actual buying and selling.
  @constructor
  @param {String} secondCurrency - The base currency
  @param {String} marketCurrency - The market currency (it will be bought and sold during buy/sell orders execution)
  @param {String} marketName - The name of the market as listed on exchange
  */
  constructor(secondCurrency, marketCurrency, marketName) { // i.e. USDT - BTC
    this.marketCurrency = marketCurrency
    this.secondCurrency = secondCurrency
    this.name = marketName
  }

  /**
  buy second currency
  */
  buy(baseCurrencyPrice, quantity) {
    var diff = {}

    diff[this.secondCurrency] = (Decimal.mul(quantity, baseCurrencyPrice)).negated()
    diff[this.marketCurrency] = quantity

    return diff
  }

  /**
  sell second currency
  */
  sell(baseCurrencyPrice, quantity) { // sell to asks
    var diff = {}

    diff[this.secondCurrency] = Decimal.mul(quantity, baseCurrencyPrice)
    diff[this.marketCurrency] = quantity.negated()

    return diff
  }

  buyOrSell(buyOrSellDirection, currencyPrice, quantity) {
    if (buyOrSellDirection === utils.const.BUY) return this.buy(currencyPrice, quantity)
    else if (buyOrSellDirection === utils.const.SELL) return this.sell(currencyPrice, quantity)
    else throw new Error(`Unknown direction of the deal ${buyOrSellDirection}`)
  }

  toString() {
    return `${this.name}` //`, base currency ${this.secondCurrency}, market currency ${this.marketCurrency}`
  }
}

module.exports.Market = Market


class MarketWithFees extends Market {
  constructor(secondCurrency, marketCurrency, marketName, feeFunc) {
    super(secondCurrency, marketCurrency, marketName)
    this.feeFunc = feeFunc
  }

  buy(baseCurrencyPrice, quantity) {
    let diff = super.buy(baseCurrencyPrice, quantity)

    diff[this.marketCurrency] = Decimal(diff[this.marketCurrency]).sub(this.feeFunc(diff[this.marketCurrency]))

    return diff
  }

  /**
  sell second currency
  */
  sell(baseCurrencyPrice, quantity) { // sell to asks
    let diff = super.sell(baseCurrencyPrice, quantity)

    diff[this.secondCurrency] = Decimal(diff[this.secondCurrency]).sub(this.feeFunc(diff[this.secondCurrency]))

    return diff
  }


}

module.exports.MarketWithFees = MarketWithFees
