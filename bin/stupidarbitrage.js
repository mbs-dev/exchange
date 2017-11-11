#!/usr/bin/env node

let _ = require('lodash')

let debug = require('debug')('change:cli')
let config = require('../exchanges.config.js')
let request = require('request')

let dataUtils = require('../data/utils.js')
let Decimal = require('decimal.js')


let arbitrage = require('../data/arbitrage/index.js')

let Combinatorics = require('js-combinatorics')


let utils = require('../data/utils.js')






let marketNames = ['USDT-BTC', 'USDT-ETH', 'BTC-ETH']
let markets = [new arbitrage.Market('USDT', 'BTC'), new arbitrage.Market('ETH', 'USDT'), new arbitrage.Market('ETH', 'BTC')]
let orderBookRequests = _.map(marketNames, (marketName) => { return config.exchanges['Bittrex'](marketName)})




const buySell = Combinatorics.baseN([utils.const.BUY, utils.const.SELL], markets.length).toArray()
const marketsVsOrdersDirections = _.reduce(buySell, (acc, orderDirections) => {
  acc.push(_.zip(orderDirections, marketNames))
  return acc
}, [])




// Promise.all(orderBookRequests).then((orderBooksRaw) => {
//   utils.JSON.saveToFile('orderbooks.json', orderBooksRaw)
// })


let account = new arbitrage.MulticurrencyAccount()
account.updateBalance({'BTC': 1})

let orderBooksRaw = utils.JSON.readFromFile('orderbooks.json')

let orderBooks = _.map(orderBooksRaw, (rawOrderBook, index) => {
  return new arbitrage.OrderBook(rawOrderBook[utils.const.BID], rawOrderBook[utils.const.ASK], markets[index])
})


let possibleArbitrages = []

// for (var arbIndex = 0; arbIndex < marketsVsOrdersDirections.length; arbIndex++) {
for (var arbIndex = 0; arbIndex < 1; arbIndex++) {
  let dealsSerie = marketsVsOrdersDirections[arbIndex] // [buy, eht-udd], [sell, usdd-btc], ...

  let a = account.copy()

  let arbitrage = []

  for (var orderNum = 0; orderNum < dealsSerie.length; orderNum++){
    let aBalance = a.getBalance()  // баланс нашего аккаунта на момент выполнения этого ордера
    let dealRaw = dealsSerie[orderNum]

    let direction = dealRaw[0] // например BUY
    let marketName = dealRaw[1] // например USDT-BTC
    let market = markets[marketNames.indexOf(marketName)] // объект Market для USDT-BTC

    let orderBook = orderBooks[marketNames.indexOf(marketName)] // Orderbook [bid:[...], ask:[...]] для данного рынка

    if (direction === utils.const.BUY) {
      // тк мы делаем встречный ордер, нас интересует ASK ордер для нашего BUY
      let ask = orderBook.getAsksAtDepth(0)
      //asks содержит заявку на продажу пары, которую мы собираемся купить (BUY) ответным ордером
      let price = Decimal(ask[utils.const.PRICE])
      let availableVolume = Decimal(ask[utils.const.VOLUME])

      /// todo: сделать ContrOrder() который принимает rawOrder на вход

      // вычислим объем который можем позволить себе приобрести
      let vol = Decimal(aBalance[market.baseCurrency])
      if (vol.greaterThan(availableVolume)) vol = availableVolume

      // формируем ордер
      // market, type, price, volume, diff
      let diff = market.buy(price, vol);

      let o = {
        'market': market,
        'direction': direction,
        'price': price,
        'volume': vol,
        'diff': diff
      }
      arbitrage.push(o)
      a.updateBalance(diff)
    }
    else if (direction === utils.const.SELL) {
      // тк мы делаем встречный ордер, нас интересует ASK ордер для нашего BUY
      let bid = orderBook.getBidsAtDepth(0)
      //asks содержит заявку на продажу пары, которую мы собираемся купить (BUY) ответным ордером
      let price = Decimal(bid[utils.const.PRICE])
      let availableVolume = Decimal(bid[utils.const.VOLUME])

      /// todo: сделать ContrOrder() который принимает rawOrder на вход

      // вычислим объем который можем позволить себе приобрести
      let vol = Decimal(aBalance[market.baseCurrency])
      if (vol.greaterThan(availableVolume)) vol = availableVolume

      // формируем ордер
      // market, type, price, volume, diff
      let diff = market.sell(price, vol);

      let o = {
        'marketName': marketName,
        'market': market,
        'direction': direction,
        'price': price,
        'volume': vol,
        'diff': diff
      };
      arbitrage.push(o)
      a.updateBalance(diff)
    }

  }
  possibleArbitrages.push(arbitrage)
}
//
// function printArbitrage(arbitrage) {
//   for (var i = 0; i < arbitrage.length; i++) {
//
//   }
// }


console.log(possibleArbitrages);
