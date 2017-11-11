/* https://www.bittrex.com/Home/Api */

const request = require('request')
const _ = require('lodash')
const Decimal = require('decimal.js')

let utils = require('../utils.js')

let ascendingOrder = (x, y) => { return Decimal(x[utils.const.PRICE]).sub(Decimal(y[utils.const.PRICE])) }
let descendingOrder = (x, y) => { return Decimal(y[utils.const.PRICE]).sub(Decimal(x[utils.const.PRICE])) }


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

module.exports.getOrderBook = getOrderBook
