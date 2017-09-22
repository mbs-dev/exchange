const _ = require('lodash')
const Socket = require('socket.io')

var WebsocketServer = function(httpServer, app){
  const io = new Socket(httpServer);
  const emitter = app.get("dataEmitter");

  io.sockets.on('connection', function(socket){
    console.log('new websocket connection');
  })

  emitter.on('exchangeData', (rawData) => {
    const processedData = rawData

    let buyRates = _.flatMap(rawData.orderBook.buy, (value)=>{ return value['RATE'] })
    let buyVolumes = _.flatMap(rawData.orderBook.buy, (value)=>{ return value['QUANTITY'] })
    let sellRates = _.flatMap(rawData.orderBook.sell, (value)=>{ return value['RATE'] })
    let sellVolumes = _.flatMap(rawData.orderBook.sell, (value)=>{ return value['QUANTITY'] })

    processedData.minRateBuyOrders = _.min(buyRates)
    processedData.maxRateBuyOrders = _.max(buyRates)
    processedData.minRateSellOrders = _.min(sellRates)
    processedData.maxRateSellOrders = _.max(sellRates)
    processedData.minRates = _.min([processedData.minRateBuyOrders, processedData.minRateSellOrders])
    processedData.maxRates = _.max([processedData.maxRateBuyOrders, processedData.maxRateSellOrders])

    processedData.minVolBuyOrders = _.min(buyVolumes)
    processedData.maxVolBuyOrders = _.max(buyVolumes)
    processedData.minVolSellOrders = _.min(sellVolumes)
    processedData.maxVolSellOrders = _.max(sellVolumes)
    processedData.minVolumes = _.min([processedData.minVolBuyOrders, processedData.minVolSellOrders])
    processedData.maxVolumes = _.max([processedData.maxVolBuyOrders, processedData.maxVolSellOrders])

    io.sockets.emit('newData', processedData)
  })
}

module.exports = WebsocketServer;
