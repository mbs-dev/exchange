let should = require('chai').should()
let expect = require('chai').expect

let Decimal = require('decimal.js')

let arb = require('./index.js')



let testOrderBooks1 = [
  {'BID': [{'QUANTITY': 10, 'RATE': 6900}], 'ASK': [{'QUANTITY':3, 'RATE':7000}]},    // Orderbook 1: USDT-BTC
  {'BID': [{'QUANTITY': 10, 'RATE': 69}], 'ASK': [{'QUANTITY':3, 'RATE':70}]},        // Orderbook 2: USDT-LTC
  {'BID': [{'QUANTITY': 10, 'RATE': 0.019}], 'ASK': [{'QUANTITY':3, 'RATE':0.02}]},   // Orderbook 2: BTC-LTC
]

// example arbitrage: SELL BTC at 7000 *USDT*, BUY LTC at 70 USDT, BUY BTC at 0.019


describe('ArbitrageManager', () => {
  describe('constructor', () => {
    it.skip('should exist', () =>  {
    })
  })
})
