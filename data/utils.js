const fs = require('fs')
const lo = require('lodash')

let consts = {
  BUY: 'BUY',
  SELL: 'SELL',
  VOLUME: 'QUANTITY',
  PRICE: 'RATE',
  BID: 'BID',
  ASK: 'ASK',

  order: {
    LIMIT: 'LIMIT',
    IMMEDIATE_OR_CANCEL: 'IMMEDIATE_OR_CANCEL',
    GOOD_TIL_CANCELLED: 'GOOD_TIL_CANCELLED',
    FILL_OR_KILL: 'FILL_OR_KILL',
    NONE: 'NONE',
    GREATER_THAN: 'GREATER_THAN',
    LESS_THAN: 'LESS_THAN'
  }
}

let parseMarketFromCli = (marketString) => {
  try {
    const pair = marketString || process.argv[2]
    const chunks = pair.split('-')

    return {
      first: chunks[0].toUpperCase(),
      second: chunks[1].toUpperCase()
    }
  } catch (error) {
    return undefined
  }
}

let formatFloatNumber = (number) => {
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 8
  });
}

let stupidOrderBookFormat = (buyOrders, sellOrders) => {
  const _lo = lo
  lo.map([buyOrders, sellOrders], (orders, index) => {
    if (index) console.log('\n============ SELL ORDERS ============\n         Quantity |          Price')
    else       console.log('\n============  BUY ORDERS ============\n         Quantity |          Price')

    _lo.each(orders, (order) => { console.log(formatFloatNumber(order['QUANTITY']) + ' | ' + formatFloatNumber(order['RATE'])) })
  })
}


let Eventually = (operation, period) => {
  return setInterval(operation, period)
}

let JSONUtils = {
  saveToFile: (filename, json) => {
    let fd = fs.openSync(filename, 'w')
    fs.writeFileSync(fd, JSON.stringify(json))
    fs.closeSync(fd)
  },
  readFromFile: (filename, json) => {
    let fd = fs.openSync(filename, 'r')
    let s = fs.readFileSync(fd, 'utf8')
    fs.closeSync(fd)
    return JSON.parse(s)
  }
}

module.exports = {
  'JSON': JSONUtils,
  'Eventually': Eventually,
  'stupidOrderBookFormat': stupidOrderBookFormat,
  'formatFloatNumber': formatFloatNumber,
  'parseMarketFromCli': parseMarketFromCli,
  'const': consts
}
