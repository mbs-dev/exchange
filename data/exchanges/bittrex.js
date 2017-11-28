/* https://www.bittrex.com/Home/Api */

const request = require('request')
const _ = require('lodash')
const Decimal = require('decimal.js')
const Queue = require('promise-queue')

const Bittrex = require('node-bittrex-api')

let utils = require('../utils.js')

let ascendingOrder = (x, y) => { return Decimal(x[utils.const.PRICE]).sub(Decimal(y[utils.const.PRICE])) }
let descendingOrder = (x, y) => { return Decimal(y[utils.const.PRICE]).sub(Decimal(x[utils.const.PRICE])) }

const debug = require('debug')('Bittrex')

function getOrderBook(marketName) {
  const url = 'https://bittrex.com/api/v1.1/public/getorderbook?market=' + marketName + '&type=both'

  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        reject(error)
        return
      }
      const responseObj = JSON.parse(response.toJSON().body)
      if (!responseObj.success) {
        reject(responseObj.message)
        return
      }

      const buySellOrders = _.map([responseObj.result.buy, responseObj.result.sell], (orders) => {
        return _.map(orders, (order) => {
          const result = {}
          result[utils.const.PRICE] = Decimal(order.Rate)
          result[utils.const.VOLUME] = Decimal(order.Quantity)
          return result
        })
      })

      if (buySellOrders[0].length == 0 || buySellOrders[1].length == 0) reject('Invalid market.')

      const result = {}
      result[utils.const.BID] =  buySellOrders[0].sort(descendingOrder)
      result[utils.const.ASK] = buySellOrders[1].sort(ascendingOrder)

      resolve(result)
    })
  })
}

function tradeSell(bittrex, marketName, price, volume) {
  return new Promise(function(resolve, reject) {
    bittrex.tradesell({
      MarketName: marketName,
      OrderType: 'LIMIT',
      Quantity: Decimal(volume).toFixed(8).toString(),
      Rate: Decimal(price).toFixed(8).toString(),
      TimeInEffect: 'IMMEDIATE_OR_CANCEL', // supported options are 'IMMEDIATE_OR_CANCEL', 'GOOD_TIL_CANCELLED', 'FILL_OR_KILL'
      ConditionType: 'NONE', // supported options are 'NONE', 'GREATER_THAN', 'LESS_THAN'
      Target: 0, // used in conjunction with ConditionType
    }, function( data, err ) {
      if (err) {
        reject(err.message)
        return
      } else {
        resolve(data)
      }
    })
  })
}




function tradeBuy(bittrex, marketName, price, volume) {
  return new Promise(function(resolve, reject) {
    bittrex.tradebuy({
      MarketName: marketName,
      OrderType: 'LIMIT',
      Quantity: Decimal(volume).toFixed(8).toString(),
      Rate: Decimal(price).toFixed(8).toString(),
      TimeInEffect: 'IMMEDIATE_OR_CANCEL', // supported options are 'IMMEDIATE_OR_CANCEL', 'GOOD_TIL_CANCELLED', 'FILL_OR_KILL'
      ConditionType: 'NONE', // supported options are 'NONE', 'GREATER_THAN', 'LESS_THAN'
      Target: 0, // used in conjunction with ConditionType
    }, function( data, err ) {
      if (err) {
        reject(err.message)
        return
      } else {
        resolve(data)
      }
    })
  })
}

class DealsExecutor {
  constructor(bittrex, q) {
    this.bittrex = bittrex
    this.q = q || new Queue(1, Infinity)  // no concurrency, run promises sequentially
    this.orders = []
  }

  execute(deals) {
    var q = this.q
    var bittrex = this.bittrex

    for (var i = 0; i < deals.length; i++) {
      let deal = deals[i]
      let marketName = deal[0]
      let direction = deal[1]
      let requiredVolume = deal[2]
      let price = deal[3]
      //[market.name, direction, requiredVolume, availablePrice]
      if (direction === utils.const.BUY) {
        q.add(() => {
          return tradeBuy(bittrex, marketName, price, requiredVolume).catch((err) => {
            debug(err)
          })
        })
      } else if (direction === utils.const.SELL) {
        q.add(() => {
          return tradeBuy(bittrex, marketName, price, requiredVolume).catch((err) => {
            debug(err)
          })
        })
      }
    }
    return new Promise(function(resolve, reject) {
      var i;
      i = setInterval(() => {
        if (q.getQueueLength() === 0) {
          clearInterval(i)
          resolve()
        }
      }, 1000)
    });
  }
}

module.exports.DealsExecutor = DealsExecutor
module.exports.getOrderBook = getOrderBook
