const debug = require('debug')
const colors = require('colors')
const _ = require('lodash')
const Queue = require('promise-queue')

const Decimal = require('decimal.js');

const getmarkets = require('../data/exchanges/bittrex/getmarkets')
const MarketWithFees = require('../data/arbitrage/').MarketWithFees
const MulticurrencyAccount = require('../data/arbitrage/account')
const getOrderBook = require('../data/exchanges/bittrex').getOrderBook
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

// we require altcoins that have market as in BTC as in ETH, so we can do BTC->alt, alt->ETH, BTC->ETH arbitrage
const marketsOfInterestTriples = _.reduce(altcoins, (triples, altcoin) => {
  var btcMarket = marketNameToMarket['BTC-' + altcoin] || marketNameToMarket[altcoin + '-BTC']
  var ethMarket = marketNameToMarket['ETH-' + altcoin] || marketNameToMarket[altcoin + '-ETH']
  if (btcMarket !== undefined && ethMarket !== undefined) {
    triples.push([btcMarket, ethMarket, marketNameToMarket['BTC-ETH']])
  }
  return triples
}, [])


debug('Arbitrage')(`Launching arbitrage across ${marketsOfInterestTriples.length} altcoins markets.`)


const GOAL_CURRENCY = 'BTC'

var account = new MulticurrencyAccount()
initialDeposit = {}
initialDeposit[GOAL_CURRENCY] = Decimal(1.0)
account.updateBalance(initialDeposit)


var q = new Queue(1, Infinity)

for (var i = 0; i < marketsOfInterestTriples.length; i++) {
  const markets = marketsOfInterestTriples[i]
  q.add(()=>{
    return Promise.all(_.map(markets, (market) => { return getOrderBook(market.name) })).then((orderbooks) => {
      debug('Arbitrage')(`Received actual orderbooks for markets ${markets}`)

      let arbitrages = Arbitrage.getAllArbitrages(markets, orderbooks, account, GOAL_CURRENCY)

      console.log(`${markets[0].name} ${markets[1].name} ${markets[2].name} ${orderbooks[0]['BID'][0]['RATE']} ${orderbooks[0]['BID'][0]['QUANTITY']} ${orderbooks[0]['ASK'][0]['RATE']} ${orderbooks[0]['ASK'][0]['QUANTITY']} ${orderbooks[1]['BID'][0]['RATE']} ${orderbooks[1]['BID'][0]['QUANTITY']} ${orderbooks[1]['ASK'][0]['RATE']} ${orderbooks[1]['ASK'][0]['QUANTITY']} ${orderbooks[2]['BID'][0]['RATE']} ${orderbooks[2]['BID'][0]['QUANTITY']} ${orderbooks[2]['ASK'][0]['RATE']} ${orderbooks[2]['ASK'][0]['QUANTITY']}`)

      // console.log(arbitrages);

      // for (var i = 0; i < arbitrages.length; i++) {
      //   console.log(i);
      //   console.log(arbitrages[i].getDeals())
      // }
      // process.exit(1)

      let arbitragesOfInterest = _.reduce(arbitrages, (acc, arbitrage, index) => {
        let dealsObject = arbitrage.getDeals()
        if (dealsObject === null) return acc

        let account = dealsObject[1]
        let profit = dealsObject[2]

        console.log(formatutils.beautyBalanceOutputOfAccount(account).toString() )

        if (profit.greaterThan(Decimal(0))) {
          acc.push(arbitrage)
        }
        return acc
      }, [])

      if (arbitragesOfInterest.length > 0) {
        debug('Arbitrage')('Found profitable arbitrage!')
        _.each(arbitragesOfInterest, (arbitrage) => {
          let dealsObject = arbitrage.getDeals()
          if (dealsObject === null) return acc

          let deals = dealsObject[0]
          let account = dealsObject[1]
          let profit = dealsObject[2]

          console.log(arbitrage);
          console.log(`Profit: ${profit} ${GOAL_CURRENCY} `);

        })
      }
    }).catch((err) => {
      console.log(err)
      debug('Arbitrage')(`${err} error for markets ${markets}`)
    })
  })
}
