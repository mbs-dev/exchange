const debug = require('debug')
const colors = require('colors')
const _ = require('lodash')
const Queue = require('promise-queue')

const Decimal = require('decimal.js')

const bittrex = require('node-bittrex-api')
bittrex.options({
  'apikey' : require('../secret.config.js').Bittrex.key,
  'apisecret' : require('../secret.config.js').Bittrex.secret
})

const getmarkets = require('../data/exchanges/bittrex/getmarkets')
const MarketWithFees = require('../data/arbitrage/').MarketWithFees
const MulticurrencyAccount = require('../data/arbitrage/account')
const getOrderBook = require('../data/exchanges/bittrex').getOrderBook
const BittrexOrdersProcessing = require('../data/exchanges/bittrex').DealsExecutor

const Arbitrage = require('../data/arbitrage/arbitrage')

const formatutils = require('../data/formatutils');


// Bittrex Fee is 0.25 % , not 2.5% (see https://bittrex.com/Fees)
let BittrexFee = (depositAmount) => { return Decimal.mul(depositAmount, 0.0025) }


const marketNameToMarket = _.reduce(getmarkets.result, (nameToMarket, item, index) => {
  nameToMarket[item['MarketName']] = new MarketWithFees(item['BaseCurrency'], item['MarketCurrency'], item['MarketName'], BittrexFee)
  return nameToMarket
}, {})


// all altcoins
const altcoins = _.reduce(marketNameToMarket, (alts, market, marketName) => {
  if (!_.includes(['BTC', 'ETH', 'ETC', 'USDT'], market.marketCurrency)) {
    alts.push(market.marketCurrency)
  } else if (!_.includes(['BTC', 'ETH', 'ETC', 'USDT'], market.secondCurrency)) {
    alts.push(market.secondCurrency)
  }
  return alts
}, [])

var uniqueTriples = []

// we require altcoins that have market as in BTC as in ETH, so we can do BTC->alt, alt->ETH, BTC->ETH arbitrage
// const marketsOfInterestTriples = _.reduce(altcoins, (triples, altcoin) => {
//   var btcMarket = marketNameToMarket['BTC-' + altcoin] || marketNameToMarket[altcoin + '-BTC']
//   var ethMarket = marketNameToMarket['ETH-' + altcoin] || marketNameToMarket[altcoin + '-ETH']
//   if (btcMarket !== undefined && ethMarket !== undefined) {
//
//     let tripleStr = [btcMarket.name, ethMarket.name, marketNameToMarket['BTC-ETH'].name].join(' ')
//     if (uniqueTriples.indexOf(tripleStr) < 0) {
//       triples.push([btcMarket, ethMarket, marketNameToMarket['BTC-ETH']])
//       uniqueTriples.push(tripleStr)
//     }
//   }
//   return triples
// }, [])

const marketsOfInterestTriples = [[marketNameToMarket['USDT-BTC'], marketNameToMarket['USDT-ETH'], marketNameToMarket['BTC-ETH']]]


debug('Arbitrage')(`Launching arbitrage across ${marketsOfInterestTriples.length} altcoins markets.`)
for (var i = 0; i < marketsOfInterestTriples.length; i++) {
  console.log(marketsOfInterestTriples[i][0].name, marketsOfInterestTriples[i][1].name, marketsOfInterestTriples[i][2].name)
}


const GOAL_CURRENCY = 'BTC'
const GOAL_AVAILABLE_FUNDS = Decimal('0.05')
const MIN_PROFIT_THRESHOLD = Decimal('0.000005')


var account = new MulticurrencyAccount()
initialDeposit = {}
initialDeposit[GOAL_CURRENCY] = GOAL_AVAILABLE_FUNDS
account.updateBalance(initialDeposit)


var q = new Queue(1, Infinity)

for (var i = 0; i < marketsOfInterestTriples.length; i++) {
  const markets = marketsOfInterestTriples[i]
  q.add(()=>{
    return Promise.all(_.map(markets, (market) => { return getOrderBook(market.name) })).then((orderbooks) => {
      debug('Arbitrage')(`Received actual orderbooks for markets ${markets}`)

      let arbitrages = Arbitrage.getAllArbitrages(markets, orderbooks, account, GOAL_CURRENCY)

      // market state
      console.log(`${markets[0].name} ${markets[1].name} ${markets[2].name} ${orderbooks[0]['BID'][0]['RATE']} ${orderbooks[0]['BID'][0]['QUANTITY']} ${orderbooks[0]['ASK'][0]['RATE']} ${orderbooks[0]['ASK'][0]['QUANTITY']} ${orderbooks[1]['BID'][0]['RATE']} ${orderbooks[1]['BID'][0]['QUANTITY']} ${orderbooks[1]['ASK'][0]['RATE']} ${orderbooks[1]['ASK'][0]['QUANTITY']} ${orderbooks[2]['BID'][0]['RATE']} ${orderbooks[2]['BID'][0]['QUANTITY']} ${orderbooks[2]['ASK'][0]['RATE']} ${orderbooks[2]['ASK'][0]['QUANTITY']}`)

      let arbitragesOfInterest = _.reduce(arbitrages, (acc, arbitrage, index) => {
        let dealsObject = arbitrage.getDeals()
        if (dealsObject === null) return acc

        let account = dealsObject[1]
        let profit = dealsObject[2]

        debug('Arbitrage')(formatutils.beautyBalanceOutputOfAccount(account).toString() )
        debug('Arbitrage')(`Calculated profit: ${profit.toFixed(8).toString()} ${GOAL_CURRENCY}`)

        if (profit.greaterThan(Decimal(MIN_PROFIT_THRESHOLD))) {
          debug('Arbitrage')('Found profitable arbitrage!')
          acc.push(arbitrage)
        }
        return acc
      }, [])

      // if (arbitragesOfInterest.length > 0) {
      // }
      return arbitragesOfInterest
    }).then((arbitragesOfInterest) => {
      if (arbitragesOfInterest.length == 0) return
      debug('Arbitrage')('Processing profitable arbitrages')

      let deals = arbitragesOfInterest[0].getDeals()[0]
      let processing = new BittrexOrdersProcessing(bittrex, deals)

      processing.execute()

    }).catch((err) => {
      console.log(err)
      debug('Arbitrage')(`${err} error for markets ${markets}`)
    })
  })


}

setInterval(()=>{
  if (q.getQueueLength() === 0) {
    process.exit(0)
  }
}, 5000)
