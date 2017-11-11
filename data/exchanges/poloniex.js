/* https://poloniex.com/support/api/ */

const request = require('request')
const lo = require('lodash')
const Decimal = require('decimal.js')


function getOrderBook(market) {
  const url = 'https://poloniex.com/public?command=returnOrderBook&currencyPair=' + market.first + '_' + market.second
  const _lo = lo
  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        reject(error)
        return
      }

      const responseObj = JSON.parse(response.toJSON().body)

      const mylo = _lo
      const buySellOrders = mylo.map([responseObj.asks, responseObj.bids], (orders) => {
        return mylo.map(orders, (order) => {
          return {
            'RATE':     Decimal(order[0]),
            'QUANTITY': Decimal(order[1])
          }
        })
      })

      if (buySellOrders[0].length == 0 || buySellOrders[1].length == 0) reject('Invalid market.')

      resolve({
        'BUY':  buySellOrders[0],
        'SELL': buySellOrders[1]
      })
    })
  })
}

module.exports.getOrderBook = getOrderBook
