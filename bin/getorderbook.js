#!/usr/bin/env node

let debug = require('debug')('change:cli')
let config = require('../exchanges.config.js')
let request = require('request')

let dataUtils = require('../data/utils.js')
let Decimal = require('decimal.js')

// CLI args
let market = dataUtils.parseMarketFromCli(process.argv[2])
let exchange = process.argv[3] || 'Bittrex';


if (!market) {
  console.error(`Market should be provided in XXX-YYY format, i.e. BTC-ETH, while given "${market}"`);
  process.exit(2);
}

if (config.exchanges[exchange] === undefined) {
  console.error(`The exchange "${exchange}" is unknown!`);
  process.exit(2);
}

debug(`Requesting new data from the exchange "${exchange}"...`)

config.exchanges[exchange](market).then((ordersDict) => {
  Decimal.set({ precision: 8 })
  debug(`Order book received.`)
  console.log('* BID ORDERS *')

  let sortFunc = (x, y)=> { return x.PRICE - y.PRICE }

  let sortedBids = ordersDict[utils.const.BID].sort(sortFunc)
  for (var i = 0; i < sortedBids.length; i++) {
    console.log('Price: ' + sortedBids[i].PRICE + ' Volume:' + sortedBids[i].VOLUME);
  }

  console.log('* ASK ORDERS *');
  let sortedAsks = ordersDict[utils.const.ASK].sort(sortFunc)
  for (var i = 0; i < sortedAsks.length; i++) {
    console.log('Price: ' + sortedAsks[i].PRICE + ' Volume:' + sortedAsks[i].VOLUME);
  }

}).catch((reason) => {
  debug(`Error has occured. Explanation: ${reason}`);
  if (reason === 'INVALID_MARKET') {
    console.log('See the list of proper markets follow this link: https://bittrex.com/api/v1.1/public/getmarkets or wait a second...\n');
    if (exchange === 'Bittrex') {
      request.get('https://bittrex.com/api/v1.1/public/getmarkets', (error, response, body) => {
        const responseObj = JSON.parse(response.toJSON().body)
        const markets = []
        for (var i = 0; i < responseObj.result.length; i++)
          markets.push(responseObj.result[i].MarketName)
        console.log(markets.join(', '))
      });
    }
  }
});


//
// Promise.all(lo.values(lo.each(config.exchanges, (getOrderBook, exchangeName) => {
//   return getOrderBook(market).then((ordersDict) => {
//     emitter.emit('exchangeData', {
//       'exchange': exchangeName,
//       'market': market,
//       'orderBook': {
//         'buy': ordersDict['BUY'],
//         'sell': ordersDict['SELL']
//       }
//     })
//   }).catch((reason)=>{
//     console.error('[' + exchangeName + '] Unable to retrieve data: ' + reason);
//   })
// })))
