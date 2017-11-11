let debug = require('debug')
let colors = require('colors')

var Table = require('cli-table');


let bittrexConfig = require('../secret.config.js')['Bittrex']
let bittrex = require('node-bittrex-api')
let Decimal = require('decimal.js')
let _ = require('lodash')
let combinatorics = require('js-combinatorics')
let utils = require('../data/utils')

let getOrderBook = require('../data/exchanges/bittrex').getOrderBook
let ar = require('../data/arbitrage/index')

let BittrexFee = (depositAmount) => { return Decimal(depositAmount).mul(0.025) }

let markets = [
  new ar.MarketWithFees('USDT', 'BTC', 'USDT-BTC', BittrexFee),
  new ar.MarketWithFees('USDT', 'ETH', 'USDT-ETH', BittrexFee),
  new ar.MarketWithFees( 'BTC', 'ETH', 'BTC-ETH',  BittrexFee)
]

let goal = 'BTC'
let myCurrentAccount = new ar.MulticurrencyAccount()
myCurrentAccount.updateBalance({'BTC': Decimal(0.0001)})  // now we have 0.0001 BTC in our account


let whatCurrencyISpend = (diff) => {
  for (var k in diff) {
    if (Decimal(diff[k]).isNegative()) return k
  }

  throw new Error('Provided diff that have no spendings. May be it is malformed deal?')
}

let whatCurrencyIGet = (diff) => {
  for (var k in diff) {
    if (diff[k].isPositive()) return k
  }
  throw new Error('Provided diff that have no incomes. May be it is malformed deal?')
}


function beautyBalanceOutputOfAccount(account) {
  var balance = account.getBalance()
  var currencies = Object.keys(balance)
  var tableHeader = _.flatMap(currencies, (val) => { return [val.bold.white, `-${val}`.bold.white]})
  tableHeader.unshift('#'.bold.white)
  var table = new Table({
    'head': tableHeader,
    chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
         , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
         , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
         , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
  })
  var transactions = account.getTransactions()
  _.forEach(transactions, (transaction, index) => {
    var row = _.map(new Array(currencies.length * 2 + 1), (v) => { return '' })
    for (var currency in transaction) {
      var i = 1 + currencies.indexOf(currency) * 2
      if (transaction[currency].isNegative()) i = i + 1
      row[i] = transaction[currency].toFixed(6).toString().grey
    }
    row[0] = `${index+1}`
    table.push(row)
  })
  //total
  row = _.map(new Array(currencies.length * 2 + 1), (v) => { return '' })
  for (var currency in balance) {
    var i = 1 + currencies.indexOf(currency) * 2
    if (balance[currency].isNegative()) {
      i = i + 1
      row[i] = balance[currency].toFixed(6).toString().red
    } else {
      row[i] = balance[currency].toFixed(6).toString().green
    }
  }
  row[0] = 'Total'.bold.white
  table.push(row)
  return table
}


console.logDiff = (diff) => {
  var a = new ar.MulticurrencyAccount()
  a.updateBalance(diff)
  console.log(beautyBalanceOutputOfAccount(a).toString())
}


/////////////////////////////////////////////////////////////////////////////////////////
const buySell = combinatorics.baseN([utils.const.BUY, utils.const.SELL], markets.length).toArray()

const marketsVsOrdersDirections = _.reduce(buySell, (acc, orderDirections) => {
  acc.push(_.zip(orderDirections, markets)) // after _.zip, markets[i] will correspond to orderBook[i], for every i
  return acc
}, [])


console.log('\n\n  Table 1. Possible arbitrages')
let beautyTable1 = new Table({
  head: ['N'.gray.bold, 'Order #1'.gray.bold, 'Market #1'.gray.bold, 'Order #2'.gray.bold, 'Market #2'.gray.bold, 'Order #3'.gray.bold, 'Market #3'.gray.bold]
})

for (var i = 0; i < marketsVsOrdersDirections.length; i++ ) {
  let arbitrage = marketsVsOrdersDirections[i]

  var row = []

  row.push(`${i+1}`)
  let arbitrageStr = `Arbitrage #${i+1}: `
  for (var j = 0; j < markets.length; j++) {
    let direction = arbitrage[j][0] // buy or sell?
    let marketName = arbitrage[j][1].name
    arbitrageStr = arbitrageStr + ` ${direction} on ${marketName}`
    row.push(direction == utils.const.BUY ? direction.green : direction.red)
    row.push(`${marketName}`)
  }
  beautyTable1.push(row)
}

console.log(beautyTable1.toString())


const TOP = 0  // the index of orderbook "top" in any orderbook

let directionToOrder = (d) => {
  if (d === utils.const.BUY) return utils.const.ASK // you can `buy` from ASK
  if (d === utils.const.SELL) return utils.const.BID // you can `sell` to BID
  throw new Error('Direction of the deal should be either BUY or SELL and will respond with corresponding side of OrderBook')
}

/////////////////////////////////////////////////////////////////////////////////////////
debug('Bittrex')('Obtaining orderbooks')
Promise.all(_.map(markets, (market) => { return getOrderBook(market.name) }))
  .then((orderBooks) => {

    console.log('\n\n  Table 2. Market state')
    let beautyTable2 = new Table({
      head: ['Market'.gray.bold, 'Bid vol.'.gray.bold, 'Bid (buyers) price'.gray.bold, 'Ask (sellers) price'.gray.bold, 'Ask vol.'.gray.bold]
    })


    for (var i = 0; i < orderBooks.length; i++) {
      var marketName = markets[i].name
      var bidPrice = orderBooks[i][utils.const.BID][TOP][utils.const.PRICE].toString()
      var bidVolume = orderBooks[i][utils.const.BID][TOP][utils.const.VOLUME].toString()
      var askPrice = orderBooks[i][utils.const.ASK][TOP][utils.const.PRICE].toString()
      var askVolume = orderBooks[i][utils.const.ASK][TOP][utils.const.VOLUME].toString()

      // debug('Bittrex')(`${marketName} BID PRICE [${bidPrice}] VOL [${bidVolume}] ASK PRICE [${askPrice}] VOL [${askVolume}]`)
      beautyTable2.push([marketName, bidVolume.green, bidPrice.green, askPrice.red, askVolume.red])
    }


    console.log(beautyTable2.toString())

    return orderBooks
   })
  .then((orderBooks) => {
    console.log('\n\n  Table 3. Calculating orders for every arbitrage')

    for (var i = 0; i < marketsVsOrdersDirections.length; i++ ) { // for every arbitrage
      var arbitrage = marketsVsOrdersDirections[i]
      var arbitrageAccount = myCurrentAccount.copy()

      var correctArbitrage = true

      var deals = []

      for (var j = 0; j < markets.length; j++) {
        var direction = arbitrage[j][0]
        var orderBookColumn = directionToOrder(direction) // inversed buy or sell, because we need counteroffer
        var market = arbitrage[j][1]

        var availableVolume = orderBooks[j][orderBookColumn][TOP][utils.const.VOLUME]  // decimal containing volume for the deal
        var availablePrice =  orderBooks[j][orderBookColumn][TOP][utils.const.PRICE]

        //////////
        // we start from hypotetically buying/selling whole the volume available

        var requiredVolume = availableVolume
        var diff = market.buyOrSell(direction, availablePrice, requiredVolume)

        var whatISpend = whatCurrencyISpend(diff)
        var whatIget = whatCurrencyIGet(diff)

        var fundsIhaveForSpend = arbitrageAccount.getBalance()[whatISpend] || Decimal(0)

        if (fundsIhaveForSpend.lessThanOrEqualTo(0)) {
          correctArbitrage = false
          break
        }

        console.log(`I have ${fundsIhaveForSpend} ${whatISpend}`);

        // if I should spend more than I have,
        if (diff[whatISpend].negated().greaterThan(fundsIhaveForSpend)) {
          // I adjust required volume to desirable
          console.log('I have less than required');
          requiredVolume = Decimal.mul(requiredVolume, fundsIhaveForSpend.absoluteValue().dividedBy(diff[whatISpend].absoluteValue()))
          // and update balance again
          diff = market.buyOrSell(direction, availablePrice, requiredVolume)
        }

        if (requiredVolume.lessThan(Decimal(0.0000001))) break

        // then I store the new deal into `deals` buffer of this arbitrage
        deals.push([direction, requiredVolume, availablePrice, diff])
        // and update arbitrage balance as well
        arbitrageAccount.updateBalance(diff)
      }

      if (!correctArbitrage) continue
      // Now let's describe arbitrage
      console.log(` -- Arbitrage #${i+1} calculation`);
      console.log(beautyBalanceOutputOfAccount(arbitrageAccount).toString());
      console.log(deals);
    }

  }).catch((err) => {console.log(err);})






// exchange.getOrderBook

// //
// bittrex.options(bittrexConfig);
// //
//
// new Promise(function(resolve, reject) {
//   bittrex.getorderbook({ market : 'USDT-BTC', type : 'both' }, function( data, err ) {
//     let ascendingOrder = (x, y) => { return (Decimal(x.Rate).sub(Decimal(y.Rate))).toNumber() }
//     let descendingOrder = (x, y) => { return (Decimal(y.Rate).sub(Decimal(x.Rate))).toNumber() }
//
//     let buyOrders = data.result.buy.sort(descendingOrder)
//     let sellOrders = data.result.sell.sort(ascendingOrder)
//
//   });
//
// });
//
//
//
// // bittrex.tradesell({
// //   MarketName: 'BTC-ZEC',
// //   OrderType: 'LIMIT',
// //   Quantity: 1.00000000,
// //   Rate: 0.04423432,
// //   TimeInEffect: 'IMMEDIATE_OR_CANCEL', // supported options are 'IMMEDIATE_OR_CANCEL', 'GOOD_TIL_CANCELLED', 'FILL_OR_KILL'
// //   ConditionType: 'NONE', // supported options are 'NONE', 'GREATER_THAN', 'LESS_THAN'
// //   Target: 0, // used in conjunction with ConditionType
// // }, function( data, err ) {
// //   console.log( data );
// // });
// //
// // bittrex.tradebuy({
// //   MarketName: 'BTC-ZEC',
// //   OrderType: 'LIMIT',
// //   Quantity: 1.00000000,
// //   Rate: 0.04423432,
// //   TimeInEffect: 'IMMEDIATE_OR_CANCEL', // supported options are 'IMMEDIATE_OR_CANCEL', 'GOOD_TIL_CANCELLED', 'FILL_OR_KILL'
// //   ConditionType: 'NONE', // supported options are 'NONE', 'GREATER_THAN', 'LESS_THAN'
// //   Target: 0, // used in conjunction with ConditionType
// // }, function( data, err ) {
// //   console.log( data );
// // });
