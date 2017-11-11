let should = require('chai').should()
let expect = require('chai').expect

let arbitrage = require('./index.js')


describe('OrderBook', () => {
  describe('constructor', () => {
    it('should exist', () => {
      // Given
      let book = new arbitrage.OrderBook([{'RATE': 98, 'QUANTITY': 10}, {'RATE': 100, 'QUANTITY': 1}], [{'RATE': 105, 'QUANTITY': 1000}, {'RATE': 200, 'QUANTITY': 1}])

      // Then
      book.should.exist
    })
  })
  describe('#bidsDepth', () => {
    it('should return minimal bids (buyers orders) depth', () => {
      // Given
      let book = new arbitrage.OrderBook([{'RATE': 98, 'QUANTITY': 10}, {'RATE': 100, 'QUANTITY': 1}], [{'RATE': 105, 'QUANTITY': 1000}])

      // Then
      book.bidsDepth.should.equal(2)
    })
  })
  describe('#asksDepth', () => {
    it('should return minimal asks (sell orders) depth', () => {
      // Given
      let book = new arbitrage.OrderBook([{'RATE': 98, 'QUANTITY': 10}, {'RATE': 100, 'QUANTITY': 1}], [{'RATE': 105, 'QUANTITY': 1000}])

      // Then
      book.asksDepth.should.equal(1)
    })
  })
  describe('#getBidsAtDepth', () => {
    it('should return bids in ascending order', () => {
      // Given
      let book = new arbitrage.OrderBook([
        {'RATE': 101, 'QUANTITY': 1},
        {'RATE': 98, 'QUANTITY': 10},
        {'RATE': 100, 'QUANTITY': 1},
        {'RATE': 103, 'QUANTITY': 2}
      ],
      [
        {'RATE': 105, 'QUANTITY': 1000},
        {'RATE': 106, 'QUANTITY': 1000}
      ])

      // Then
      book.getBidsAtDepth(0)['RATE'].should.equal(98)
      book.getBidsAtDepth(1)['RATE'].should.equal(100)
      book.getBidsAtDepth(2)['RATE'].should.equal(101)
      book.getBidsAtDepth(3)['RATE'].should.equal(103)
    })
    it('should fail when depth provided is > max depth', () => {
      // Given
      let book = new arbitrage.OrderBook([
        {'RATE': 101, 'QUANTITY': 1},
        {'RATE': 98, 'QUANTITY': 10},
        {'RATE': 100, 'QUANTITY': 1},
        {'RATE': 103, 'QUANTITY': 2}
      ],
      [
        {'RATE': 105, 'QUANTITY': 1000},
        {'RATE': 106, 'QUANTITY': 1000}
      ])
      // When
      let willThrow = () => {book.getBidsAtDepth(1E3)}
      // Then
      willThrow.should.throw
    })
    it('should fail when depth provided is < 0', () => {
      // Given
      let book = new arbitrage.OrderBook([
        {'RATE': 101, 'QUANTITY': 1},
        {'RATE': 98, 'QUANTITY': 10},
        {'RATE': 100, 'QUANTITY': 1},
        {'RATE': 103, 'QUANTITY': 2}
      ],
      [
        {'RATE': 105, 'QUANTITY': 1000},
        {'RATE': 106, 'QUANTITY': 1000}
      ])
      // When
      let willThrow = () => {book.getBidsAtDepth(-1)}
      // Then
      willThrow.should.throw
    })
  })
})
