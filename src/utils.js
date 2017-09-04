const lo = require('lodash')

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
  const localizedString = number.toLocaleString(undefined, {minimumIntegerDigits: 8, minimumFractionDigits: 8})
  const parts = localizedString.split('.')

  // i'm sorry
  parts[0] = parts[0].replace(/^00000000/, '       0')
  parts[0] = parts[0].replace(/^0000000/,  '       ')
  parts[0] = parts[0].replace(/^000000/,   '      ')
  parts[0] = parts[0].replace(/^00000/,    '     ')
  parts[0] = parts[0].replace(/^0000/,     '    ')
  parts[0] = parts[0].replace(/^000/,      '   ')
  parts[0] = parts[0].replace(/^00/,       '  ')
  parts[0] = parts[0].replace(/^0/,        ' ')
  return parts[0] + '.' + parts[1]
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
