let should = require('chai').should()
let expect = require('chai').expect

let Decimal = require('decimal.js')

let arbitrage = require('./index.js')



describe('Market', () => {
  describe('constructor', () => {
    it('should exist', () => {
      let m = new arbitrage.Market('USDT', 'BTC')

      m.should.exist
    })
  })
  describe('#buy', () => {
    it('should return proper diff on BUY: base currency balance should grow, secondary currency balance should shrink', () => {
      // Given
      let m = new arbitrage.Market('USDT', 'BTC')

      // When
      let balanceChange = m.buy(Decimal(1000), Decimal(0.5))

      // Then

      Decimal(balanceChange['BTC']).equals(Decimal(0.5)).should.be.true
      Decimal(balanceChange['USDT']).equals(Decimal(-500)).should.be.true
    })
  })
  describe('#sell', () => {
    it('should return proper diff on SELL: base currency balance should grow, secondary currency balance should shrink', () => {
      // Given
      let m = new arbitrage.Market('USDT', 'BTC')

      // When
      let balanceChange = m.sell(Decimal(6370), Decimal(2.0))

      // Then
      Decimal(balanceChange['BTC']).equals(Decimal(-2.0)).should.be.true
      Decimal(balanceChange['USDT']).equals(Decimal(12740)).should.be.true
    })
  })
})


describe('MarketWithFees', () => {
  describe('constructor', () => {
    it('should exist', () => {
      let m = new arbitrage.MarketWithFees('USDT', 'BTC', 'USDT-BTC', (depositedAmount) => { return Decimal(0) })

      m.should.exist
    })
  })
  describe('#buy', () => {
    it('should return proper diff on BUY: base currency balance should grow, secondary currency balance should shrink', () => {
      // Given
      let m = new arbitrage.MarketWithFees('USDT', 'BTC', 'USDT-BTC', (depositedAmount) => { return Decimal.mul(depositedAmount, Decimal(0.025)) })

      // When
      let balanceChange = m.buy(Decimal(6374), Decimal(0.5))

      // Then
      Decimal(balanceChange['BTC']).equals(Decimal(0.5 - 0.025*0.5)).should.be.true
      Decimal(balanceChange['USDT']).equals(Decimal(-3187)).should.be.true
    })
  })
  describe('#sell', () => {
    it('should return proper diff on SELL: base currency balance should grow, secondary currency balance should shrink', () => {
      // Given
      let m = new arbitrage.MarketWithFees('USDT', 'BTC', 'USDT-BTC', (depositedAmount) => { return Decimal.mul(depositedAmount, Decimal(0.025)) })

      // When
      let balanceChange = m.sell(Decimal(6370), Decimal(2.0))

      // Then
      Decimal(balanceChange['BTC']).equals(Decimal(-2.0)).should.be.true
      Decimal(balanceChange['USDT']).equals(Decimal(12740-0.025*12740)).should.be.true
    })
  })
})
