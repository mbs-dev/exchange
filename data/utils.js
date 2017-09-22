const lo = require('lodash')

exports.consts = {
  buy: 'BUY',
  sell: 'SELL',
  volume: 'QUANTITY',
  price: 'RATE'
}

exports.parseMarketFromCli = () => {
  try {
    const pair = process.argv[2]
    const chunks = pair.split('-')

    return {
      first: chunks[0].toUpperCase(),
      second: chunks[1].toUpperCase()
    }
  } catch (error) {
    return undefined
  }
}

const formatFloatNumber = (number) => {
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 8
  });
}

exports.formatFloatNumber = formatFloatNumber


exports.stupidOrderBookFormat = (buyOrders, sellOrders) => {
  const _lo = lo
  lo.map([buyOrders, sellOrders], (orders, index) => {
    if (index) console.log('\n============ SELL ORDERS ============\n         Quantity |          Price')
    else       console.log('\n============  BUY ORDERS ============\n         Quantity |          Price')

    _lo.each(orders, (order) => { console.log(formatFloatNumber(order['QUANTITY']) + ' | ' + formatFloatNumber(order['RATE'])) })
  })
}


exports.Eventually = (operation, period) => {
  return setInterval(operation, period)
}
