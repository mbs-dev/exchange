describe('', ()=> {
  it('', () => {})
})

// let should = require('chai').should()
// let expect = require('chai').expect
//
// let Decimal = require('decimal.js')
//
// let arbitrage = require('./index.js')
//
//
// describe('OrderBook', () => {
//   describe('constructor', () => {
//     it('should exist', () => {
//       // Given
//       let book = new arbitrage.OrderBook([{'RATE': 98, 'QUANTITY': 10}, {'RATE': 100, 'QUANTITY': 1}], [{'RATE': 105, 'QUANTITY': 1000}, {'RATE': 200, 'QUANTITY': 1}])
//
//       // Then
//       book.should.exist
//     })
//   })
//   describe('#bidsDepth', () => {
//     it('should return minimal bids (buyers orders) depth', () => {
//       // Given
//       let book = new arbitrage.OrderBook([{'RATE': 98, 'QUANTITY': 10}, {'RATE': 100, 'QUANTITY': 1}], [{'RATE': 105, 'QUANTITY': 1000}])
//
//       // Then
//       book.bidsDepth.should.equal(2)
//     })
//   })
//   describe('#asksDepth', () => {
//     it('should return minimal asks (sell orders) depth', () => {
//       // Given
//       let book = new arbitrage.OrderBook([{'RATE': 98, 'QUANTITY': 10}, {'RATE': 100, 'QUANTITY': 1}], [{'RATE': 105, 'QUANTITY': 1000}])
//
//       // Then
//       book.asksDepth.should.equal(1)
//     })
//   })
//   describe('#getBidsAtDepth', () => {
//     it('should return bids in ascending order', () => {
//       // Given
//       let book = new arbitrage.OrderBook([
//         {'RATE': 101, 'QUANTITY': 1},
//         {'RATE': 98, 'QUANTITY': 10},
//         {'RATE': 100, 'QUANTITY': 1},
//         {'RATE': 103, 'QUANTITY': 2}
//       ],
//       [
//         {'RATE': 105, 'QUANTITY': 1000},
//         {'RATE': 106, 'QUANTITY': 1000}
//       ])
//
//       // Then
//       book.getBidsAtDepth(0)['RATE'].should.equal(98)
//       book.getBidsAtDepth(1)['RATE'].should.equal(100)
//       book.getBidsAtDepth(2)['RATE'].should.equal(101)
//       book.getBidsAtDepth(3)['RATE'].should.equal(103)
//     })
//     it('should fail when depth provided is > max depth', () => {
//       // Given
//       let book = new arbitrage.OrderBook([
//         {'RATE': 101, 'QUANTITY': 1},
//         {'RATE': 98, 'QUANTITY': 10},
//         {'RATE': 100, 'QUANTITY': 1},
//         {'RATE': 103, 'QUANTITY': 2}
//       ],
//       [
//         {'RATE': 105, 'QUANTITY': 1000},
//         {'RATE': 106, 'QUANTITY': 1000}
//       ])
//       // When
//       let willThrow = () => {book.getBidsAtDepth(1E3)}
//       // Then
//       willThrow.should.throw
//     })
//     it('should fail when depth provided is < 0', () => {
//       // Given
//       let book = new arbitrage.OrderBook([
//         {'RATE': 101, 'QUANTITY': 1},
//         {'RATE': 98, 'QUANTITY': 10},
//         {'RATE': 100, 'QUANTITY': 1},
//         {'RATE': 103, 'QUANTITY': 2}
//       ],
//       [
//         {'RATE': 105, 'QUANTITY': 1000},
//         {'RATE': 106, 'QUANTITY': 1000}
//       ])
//       // When
//       let willThrow = () => {book.getBidsAtDepth(-1)}
//       // Then
//       willThrow.should.throw
//     })
//   })
// })
//
// describe('DealsGenerator', () => {
//   describe('constructor', () => {
//     it('should exist', () => {
//       let deals = new arbitrage.DealsGenerator()
//       deals.should.exist
//     })
//     it('should generate arbitrages', () => {
//       let deals = new arbitrage.DealsGenerator([new arbitrage.Market('ETH', 'BTC'), new arbitrage.Market('ETH', 'USDT'), new arbitrage.Market('USDT', 'BTC')])
//
//     })
//   })
// })
//
//

//
// describe('BalanceChange', () => {
//   describe('#whatGrows', () => {
//     it('should return proper currencies that grows', () => {
//       let bc = new arbitrage.BalanceChange({'BTC': 1, 'USD': -7000})
//       bc.whatGrows().should
//         .have.lengthOf(1)
//         .have.members(['BTC'])
//         .not.have.members(['USD'])
//     })
//   })
//
//   describe('#whatDecrease', () => {
//     it('should return proper currencies that decrease', () => {
//       let bc = new arbitrage.BalanceChange({'LTC': -5, 'BTC': -2, 'USD': 1E8})
//       bc.whatDecrease().should
//         .have.lengthOf(2)
//         .have.members(['LTC', 'BTC'])
//         .not.have.members(['USD'])
//     })
//   })
//
//   describe('#canSpendAssets', () => {
//     it('should return true for currencies that available', () => {
//       let bc = new arbitrage.BalanceChange({'LTC': -5, 'BTC': 2, 'USD': 1E8})
//       bc.canSpendAssets(['BTC']).should.be.true
//       bc.canSpendAssets(['BTC', 'USD']).should.be.true
//       bc.canSpendAssets(['BTC', 'LTC']).should.be.false
//       bc.canSpendAssets(['LTC']).should.be.false
//     })
//   })
//
//   describe('#haveEnoughToSpend', () => {
//     it('should return true for currencies that enough to spend', () => {
//       let bc = new arbitrage.BalanceChange({'LTC': -5, 'BTC': 2, 'USD': 1E8})
//       bc.haveEnoughToSpend({'BTC': -2}).should.be.true
//       bc.haveEnoughToSpend({'BTC': -2, 'USD': 1E8}).should.be.true
//       bc.haveEnoughToSpend({'BTC': -2, 'USD': -100}).should.be.true
//       bc.haveEnoughToSpend({'BTC': -3, 'USD': -100}).should.be.false
//     })
//   })
// })
