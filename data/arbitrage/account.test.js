let should = require('chai').should()
let expect = require('chai').expect

let Decimal = require('decimal.js')

let arbitrage = require('./index.js')


describe('MulticurrencyAccount', () => {
  describe('constructor', () => {
    it('should create an account with empty balance object', () => {
      let account = new arbitrage.MulticurrencyAccount()
      expect(account.getBalance()).to.be.empty
    })
  })
  describe('#updateBalance', () => {
    it('should properly calculate a balance of currency pair', () => {
      // Given
      let account = new arbitrage.MulticurrencyAccount()

      // When
      account.updateBalance({'USDT': 6500, 'BTC': -1})
      account.updateBalance({'USDT': -3000, 'BTC': 0.53846153})
      account.updateBalance({'ETH': 1, 'USDT': -200})

      // Then
      let balance = account.getBalance()
      expect(balance).to.be.not.empty
      balance['USDT'].equals(Decimal(3300)).should.be.true
      balance['BTC'].equals(Decimal('-0.46153847')).should.be.true
      balance['ETH'].equals(Decimal(1)).should.be.true
    })

    it('should work with Array as an argument', () => {
      // Given
      let account = new arbitrage.MulticurrencyAccount()

      // When
      account.updateBalance([ {'USDT': 6500, 'BTC': -1},
                              {'USDT': -3000, 'BTC': 0.53846153},
                              {'ETH': 1, 'USDT': -200}])

      account.updateBalance([])

    })
  })
  describe('#compare', () => {
    it('should return difference of two accounts', () => {
      // Given
      let account1 = new arbitrage.MulticurrencyAccount()
      let account2 = new arbitrage.MulticurrencyAccount()

      account1.updateBalance({'USDT': 6500, 'BTC': -1}) // USDT 6500, BTC -1.0
      account2.updateBalance({'USDT': 6500, 'BTC': -1}) // USDT 6500, BTC -1.0
      account2.updateBalance({'USDT': -1500, 'ETH': 1}) // USDT 5000, BTC -1.0, ETH 1.0

      // When
      let diff = account1.compare(account2)

      // Then
      diff['USDT'].equals(Decimal(-1500)).should.be.true
      diff['BTC'].equals(Decimal(0)).should.be.true
      diff['ETH'].equals(Decimal(1)).should.be.true
    })
    it('should properly compare accounts with missed currencies', () => {
      // Given
      let account1 = new arbitrage.MulticurrencyAccount()
      let account2 = new arbitrage.MulticurrencyAccount()

      account1.updateBalance({'USDT': 6500}) // USDT 6500, BTC -1.0
      account2.updateBalance({'BTC': -1}) // USDT 6500, BTC -1.0

      // When
      let diff = account1.compare(account2)

      // Then
      diff['USDT'].equals(Decimal(-6500)).should.be.true
      diff['BTC'].equals(Decimal(-1)).should.be.true
    })
  })
  describe('#copy', () => {
    it('should make a copy of account', () => {
      // Given
      let account1 = new arbitrage.MulticurrencyAccount()
      account1.updateBalance({'USDT': 6500, 'BTC': -1}) // USDT 6500, BTC -1.0
      account1.updateBalance({'USDT': -1500, 'ETH': 1}) // USDT 5000, BTC -1.0, ETH 1.0

      // When
      let accountCopy = account1.copy()

      // Then
      let diff = account1.compare(accountCopy)

      diff['USDT'].equals(Decimal(0)).should.be.true
      diff['BTC'].equals(Decimal(0)).should.be.true
      diff['ETH'].equals(Decimal(0)).should.be.true
    })
  })
})
