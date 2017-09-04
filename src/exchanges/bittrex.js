/* https://www.bittrex.com/Home/Api */

const request = require('request')
const lo = require('lodash')

function getOrderBook(market) {
  const url = 'https://bittrex.com/api/v1.1/public/getorderbook?market=' + market.first + '-' + market.second + '&type=both'

  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        reject(error)
        return
      }
      const responseObj = JSON.parse(response.toJSON().body)
      if (!responseObj.success) {
        reject(responseObj)
        return
      }

      const buySellOrders = lo.map([responseObj.result.buy, responseObj.result.sell], (orders) => {
        return lo.map(orders, (order) => {
          return {
            'RATE':     Number(order.Rate),
            'QUANTITY': Number(order.Quantity)
          }
        })
      })

      resolve({
        'BUY':  buySellOrders[0],
        'SELL': buySellOrders[1]
      })
    })
  })
}

module.exports.getOrderBook = getOrderBook
