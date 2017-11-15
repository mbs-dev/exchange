const colors = require('colors')
const Table = require('cli-table')
const _ = require('lodash')


function logDiff(diff) {
  var a = new ar.MulticurrencyAccount()
  a.updateBalance(diff)
  console.log(beautyBalanceOutputOfAccount(a).toString())
}



function beautyBalanceOutputOfAccount(account) {
  var balance = account.getBalance()
  var currencies = Object.keys(balance)
  var tableHeader = _.flatMap(currencies, (val) => { return [val.bold.white, `-${val}`.bold.white]})
  tableHeader.unshift('#'.bold.white)
  var table = new Table({
    'head': tableHeader,
    chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
         , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
         , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
         , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
  })
  var transactions = account.getTransactions()
  _.forEach(transactions, (transaction, index) => {
    var row = _.map(new Array(currencies.length * 2 + 1), (v) => { return '' })
    for (var currency in transaction) {
      var i = 1 + currencies.indexOf(currency) * 2
      if (transaction[currency].isNegative()) i = i + 1
      row[i] = transaction[currency].toFixed(8).toString().grey
    }
    row[0] = `${index+1}`
    table.push(row)
  })
  //total
  row = _.map(new Array(currencies.length * 2 + 1), (v) => { return '' })
  for (var currency in balance) {
    var i = 1 + currencies.indexOf(currency) * 2
    if (balance[currency].isNegative()) {
      i = i + 1
      row[i] = balance[currency].toFixed(8).toString().red
    } else {
      row[i] = balance[currency].toFixed(8).toString().green
    }
  }
  row[0] = 'Total'.bold.white
  table.push(row)
  return table
}


module.exports = {
  'beautyBalanceOutputOfAccount': beautyBalanceOutputOfAccount,
  'logDiff': logDiff
}
