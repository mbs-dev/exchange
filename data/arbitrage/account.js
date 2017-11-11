let Decimal = require('decimal.js')
let _ = require('lodash')


/**
@class The class represents account of multiple currencies.
*/
class MulticurrencyAccount {
  constructor() {
    this._changes = []
  }

  updateBalance(diff) {
    this._changes.push(diff)
  }

  getTransactions() {
    return this._changes
  }

  compare(otherAccount) {
    let diffObj = {}
    let otherBalance = otherAccount.getBalance()
    let thisBalance = this.getBalance()
    let currencies = _.uniq(_.concat(Object.keys(otherBalance), Object.keys(thisBalance)))

    _.each(currencies, (currency) => {
      let diff = Decimal(otherBalance[currency] || 0).minus(Decimal(thisBalance[currency] || 0))
      diffObj[currency] = diff
    })

    return diffObj
  }

  copy() {
    let newBalanceObj = new MulticurrencyAccount()
    for (var i = 0; i < this._changes.length; i++) {
      let diff = this._changes[i]
      newBalanceObj.updateBalance(_.clone(diff))
    }
    return newBalanceObj
  }

  getBalance() {
    let balance = {}
    _.each(this._changes, (diffObj) => {
      _.each(diffObj, (debet, currency) => {
        if (balance[currency] === undefined)
          balance[currency] = Decimal(0)
        balance[currency] = balance[currency].add(Decimal(debet))
      })
    })
    return balance
  }
}

module.exports = MulticurrencyAccount
