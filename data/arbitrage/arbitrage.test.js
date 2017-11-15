const should = require('chai').should()
const expect = require('chai').expect

const Decimal = require('decimal.js')
const _ = require('lodash')
const Arbitrage = require('./arbitrage')

const MarketWithFees = require('./market').MarketWithFees
const MulticurrencyAccount = require('./account')

const utils = require('../utils')
const formatutils = require('../formatutils');


describe('Arbitrage', () => {
  it('should exist', () => {
    let acc = new MulticurrencyAccount()
    acc.updateBalance({'BTC': Decimal(1.0)})

    let a = new Arbitrage([null, null, null], [null, null, null], [null, null, null], acc, 'BTC')
  })

  it('should generate deals', () => {
    //////////////// Given
    let orderbookUSDTBTC = {}
    orderbookUSDTBTC[utils.const.BID] = [{'QUANTITY': Decimal('0.02392795'), 'RATE': Decimal('6580.74972297')},]
    orderbookUSDTBTC[utils.const.ASK] = [{'QUANTITY': Decimal('0.24747803'), 'RATE': Decimal('6580.74972298')},]

    let orderbookUSDTETH = {}
    orderbookUSDTETH[utils.const.BID] = [{'QUANTITY': Decimal('0.63784758'), 'RATE': Decimal('320.06864764')},]
    orderbookUSDTETH[utils.const.ASK] = [{'QUANTITY': Decimal('6.52426731'), 'RATE': Decimal('320.07000000')},]

    let orderbookBTCETH = {}
    orderbookBTCETH[utils.const.BID] = [{'QUANTITY': Decimal('3.58733748'), 'RATE': Decimal('0.04890000')},]
    orderbookBTCETH[utils.const.ASK] = [{'QUANTITY': Decimal('3.39358303'), 'RATE': Decimal('0.04899999')},]

    let orderbooks = [orderbookUSDTBTC, orderbookUSDTETH, orderbookBTCETH]

    let acc = new MulticurrencyAccount()
    acc.updateBalance({'BTC': Decimal(1.0)})

    // Bittrex Fee is 0.25 % , not 2.5% (see https://bittrex.com/Fees)
    let BittrexFee = (depositAmount) => { return Decimal.mul(depositAmount, 0.0025) }

    let USDTBTCMarket = new MarketWithFees('USDT', 'BTC', 'USDT-BTC', BittrexFee)
    let USDTETHMarket = new MarketWithFees('USDT', 'ETH', 'USDT-ETH', BittrexFee)
    let BTCETHMarket = new MarketWithFees( 'BTC', 'ETH', 'BTC-ETH',  BittrexFee)

    let markets = [USDTBTCMarket, USDTETHMarket, BTCETHMarket]

    ////////////////// When
    let a = new Arbitrage(markets, [utils.const.SELL, utils.const.BUY, utils.const.SELL], orderbooks, acc, 'BTC')

    let dealsResult = a.getDeals()

    expect(dealsResult).to.be.not.null

    let deals = dealsResult[0]
    let arbitrageAccount = dealsResult[1]
    let profit = dealsResult[2]

    console.log(formatutils.beautyBalanceOutputOfAccount(arbitrageAccount).toString())

    deals.should.be.an('array').that.have.lengthOf(3)
    arbitrageAccount.should.be.an('object')
    arbitrageAccount.getBalance().should.be.an('object')
    arbitrageAccount.getBalance()['BTC'].toFixed(8).toString().should.equals('0.99994925')
    arbitrageAccount.getBalance()['ETH'].toFixed(8).toString().should.equals('0.00000000')
    arbitrageAccount.getBalance()['USDT'].toFixed(8).toString().should.equals('0.00000000')
    profit.should.be.an('object')
    profit.toFixed(8).toString().should.equals('-0.00005075')
  })


  it('arbitrage with "funnel neck" at last step', () => {
    //////////////// Given
    let orderbookUSDTBTC = {}
    orderbookUSDTBTC[utils.const.BID] = [{'QUANTITY': Decimal('10.02392795'), 'RATE': Decimal('6580.74972297')},]
    orderbookUSDTBTC[utils.const.ASK] = [{'QUANTITY': Decimal('10.24747803'), 'RATE': Decimal('6580.74972298')},]

    let orderbookUSDTETH = {}
    orderbookUSDTETH[utils.const.BID] = [{'QUANTITY': Decimal('0.63784758'), 'RATE': Decimal('320.06864764')},]
    orderbookUSDTETH[utils.const.ASK] = [{'QUANTITY': Decimal('6.52426731'), 'RATE': Decimal('320.07000000')},]

    let orderbookBTCETH = {}
    orderbookBTCETH[utils.const.BID] = [{'QUANTITY': Decimal('0.1'), 'RATE': Decimal('0.04890000')},]
    orderbookBTCETH[utils.const.ASK] = [{'QUANTITY': Decimal('0.39358303'), 'RATE': Decimal('0.04899999')},]

    let orderbooks = [orderbookUSDTBTC, orderbookUSDTETH, orderbookBTCETH]

    let acc = new MulticurrencyAccount()
    acc.updateBalance({'BTC': Decimal(1.0)})

    // Bittrex Fee is 0.25 % , not 2.5% (see https://bittrex.com/Fees)
    let BittrexFee = (depositAmount) => { return Decimal.mul(depositAmount, 0.0025) }

    let USDTBTCMarket = new MarketWithFees('USDT', 'BTC', 'USDT-BTC', BittrexFee)
    let USDTETHMarket = new MarketWithFees('USDT', 'ETH', 'USDT-ETH', BittrexFee)
    let BTCETHMarket = new MarketWithFees( 'BTC', 'ETH', 'BTC-ETH',  BittrexFee)

    let markets = [USDTBTCMarket, USDTETHMarket, BTCETHMarket]

    ////////////////// When
    let a = new Arbitrage(markets, [utils.const.SELL, utils.const.BUY, utils.const.SELL], orderbooks, acc, 'BTC')

    let dealsResult = a.getDeals()

    expect(dealsResult).to.be.not.null

    let deals = dealsResult[0]
    let arbitrageAccount = dealsResult[1]
    let profit = dealsResult[2]

    console.log(formatutils.beautyBalanceOutputOfAccount(arbitrageAccount).toString())

    deals.should.be.an('array').that.have.lengthOf(3)
    arbitrageAccount.should.be.an('object')
    arbitrageAccount.getBalance().should.be.an('object')
    arbitrageAccount.getBalance()['BTC'].toFixed(8).toString().should.equals('0.99998963')
    arbitrageAccount.getBalance()['ETH'].toFixed(8).toString().should.equals('0.00000000')
    arbitrageAccount.getBalance()['USDT'].toFixed(8).toString().should.equals('0.00000000')

    profit.should.be.an('object')
    profit.toFixed(8).toString().should.equals('-0.00001037')
  })

  it('properly work with incorrect arbitrage', () => {
    //////////////// Given
    let orderbookUSDTBTC = {}
    orderbookUSDTBTC[utils.const.BID] = [{'QUANTITY': Decimal('0.02392795'), 'RATE': Decimal('6580.74972297')},]
    orderbookUSDTBTC[utils.const.ASK] = [{'QUANTITY': Decimal('0.24747803'), 'RATE': Decimal('6580.74972298')},]

    let orderbookUSDTETH = {}
    orderbookUSDTETH[utils.const.BID] = [{'QUANTITY': Decimal('0.63784758'), 'RATE': Decimal('320.06864764')},]
    orderbookUSDTETH[utils.const.ASK] = [{'QUANTITY': Decimal('6.52426731'), 'RATE': Decimal('320.07000000')},]

    let orderbookBTCETH = {}
    orderbookBTCETH[utils.const.BID] = [{'QUANTITY': Decimal('3.58733748'), 'RATE': Decimal('0.04890000')},]
    orderbookBTCETH[utils.const.ASK] = [{'QUANTITY': Decimal('3.39358303'), 'RATE': Decimal('0.04899999')},]

    let orderbooks = [orderbookUSDTBTC, orderbookUSDTETH, orderbookBTCETH]

    let acc = new MulticurrencyAccount()
    acc.updateBalance({'BTC': Decimal(1.0)})

    // Bittrex Fee is 0.25 % , not 2.5% (see https://bittrex.com/Fees)
    let BittrexFee = (depositAmount) => { return Decimal.mul(depositAmount, 0.0025) }

    let USDTBTCMarket = new MarketWithFees('USDT', 'BTC', 'USDT-BTC', BittrexFee)
    let USDTETHMarket = new MarketWithFees('USDT', 'ETH', 'USDT-ETH', BittrexFee)
    let BTCETHMarket = new MarketWithFees( 'BTC', 'ETH', 'BTC-ETH',  BittrexFee)

    let markets = [USDTBTCMarket, USDTETHMarket, BTCETHMarket]

    ////////////////// When
    let a1 = new Arbitrage(markets, [utils.const.SELL, utils.const.SELL, utils.const.SELL], orderbooks, acc, 'BTC')
    let a2 = new Arbitrage(markets, [utils.const.SELL, utils.const.SELL, utils.const.BUY], orderbooks, acc, 'BTC')
    // let a4 = new Arbitrage(markets, [utils.const.SELL, utils.const.BUY, utils.const.SELL], orderbooks, acc, 'BTC') // correct one covered in tests above
    let a3 = new Arbitrage(markets, [utils.const.SELL, utils.const.BUY, utils.const.BUY], orderbooks, acc, 'BTC')
    let a4 = new Arbitrage(markets, [utils.const.BUY, utils.const.SELL, utils.const.SELL], orderbooks, acc, 'BTC')
    let a5 = new Arbitrage(markets, [utils.const.BUY, utils.const.SELL, utils.const.BUY], orderbooks, acc, 'BTC')
    let a6 = new Arbitrage(markets, [utils.const.BUY, utils.const.BUY, utils.const.SELL], orderbooks, acc, 'BTC')
    let a7 = new Arbitrage(markets, [utils.const.BUY, utils.const.BUY, utils.const.BUY], orderbooks, acc, 'BTC')



    expect(a1.getDeals()).to.be.null
    expect(a2.getDeals()).to.be.null
    expect(a3.getDeals()).to.be.null
    expect(a4.getDeals()).to.be.null
    expect(a5.getDeals()).to.be.null
    expect(a6.getDeals()).to.be.null
    expect(a7.getDeals()).to.be.null

  })

  it('should generate possible arbitrage directions', () => {
    let BittrexFee = (depositAmount) => { return Decimal.mul(depositAmount, 0.0025) }

    let USDTBTCMarket = new MarketWithFees('USDT', 'BTC', 'USDT-BTC', BittrexFee)
    let USDTETHMarket = new MarketWithFees('USDT', 'ETH', 'USDT-ETH', BittrexFee)
    let BTCETHMarket = new MarketWithFees( 'BTC', 'ETH', 'BTC-ETH',  BittrexFee)

    let orderbookUSDTBTC = {}
    orderbookUSDTBTC[utils.const.BID] = [{'QUANTITY': Decimal('0.02392795'), 'RATE': Decimal('6580.74972297')},]
    orderbookUSDTBTC[utils.const.ASK] = [{'QUANTITY': Decimal('0.24747803'), 'RATE': Decimal('6580.74972298')},]

    let orderbookUSDTETH = {}
    orderbookUSDTETH[utils.const.BID] = [{'QUANTITY': Decimal('0.63784758'), 'RATE': Decimal('320.06864764')},]
    orderbookUSDTETH[utils.const.ASK] = [{'QUANTITY': Decimal('6.52426731'), 'RATE': Decimal('320.07000000')},]

    let orderbookBTCETH = {}
    orderbookBTCETH[utils.const.BID] = [{'QUANTITY': Decimal('3.58733748'), 'RATE': Decimal('0.04890000')},]
    orderbookBTCETH[utils.const.ASK] = [{'QUANTITY': Decimal('3.39358303'), 'RATE': Decimal('0.04899999')},]

    let orderbooks = [orderbookUSDTBTC, orderbookUSDTETH, orderbookBTCETH]

    let funds = new MulticurrencyAccount()
    funds.updateBalance({'BTC': Decimal(1.0)})

    let arbitrages = Arbitrage.getAllArbitrages([USDTBTCMarket, USDTETHMarket, BTCETHMarket], orderbooks, funds, 'BTC')
    arbitrages.should.be.an('array').that.have.lengthOf(8)

    console.log(_.map(arbitrages, (item) => { return item.toString() }))
  })

  it('should spend everything', () => {
    let BittrexFee = (depositAmount) => { return Decimal.mul(depositAmount, 0.0025) }

    let USDTBTCMarket = new MarketWithFees('USDT', 'BTC', 'USDT-BTC', BittrexFee)
    let USDTETHMarket = new MarketWithFees('USDT', 'ETH', 'USDT-ETH', BittrexFee)
    let BTCETHMarket = new MarketWithFees( 'BTC', 'ETH', 'BTC-ETH',  BittrexFee)

    let markets = [USDTBTCMarket, USDTETHMarket, BTCETHMarket]

    let orderbookUSDTBTC = {}
    orderbookUSDTBTC[utils.const.BID] = [{'QUANTITY': Decimal('1'), 'RATE': Decimal('1000')},]
    orderbookUSDTBTC[utils.const.ASK] = [{'QUANTITY': Decimal('1'), 'RATE': Decimal('1100')},]

    let orderbookUSDTETH = {}
    orderbookUSDTETH[utils.const.BID] = [{'QUANTITY': Decimal('1'), 'RATE': Decimal('100')},]
    orderbookUSDTETH[utils.const.ASK] = [{'QUANTITY': Decimal('1'), 'RATE': Decimal('110')},]

    let orderbookBTCETH = {}
    orderbookBTCETH[utils.const.BID] = [{'QUANTITY': Decimal('1'), 'RATE': Decimal('0.1')},]
    orderbookBTCETH[utils.const.ASK] = [{'QUANTITY': Decimal('1'), 'RATE': Decimal('0.11')},]

    let orderbooks = [orderbookUSDTBTC, orderbookUSDTETH, orderbookBTCETH]

    let funds = new MulticurrencyAccount()
    funds.updateBalance({'BTC': Decimal(1.0)})

    let arbitrages = Arbitrage.getAllArbitrages([USDTBTCMarket, USDTETHMarket, BTCETHMarket], orderbooks, funds, 'BTC')
    arbitrages.should.be.an('array').that.have.lengthOf(8)

    let a = new Arbitrage(markets, [utils.const.SELL, utils.const.BUY, utils.const.SELL], orderbooks, funds, 'BTC')

    let arbitrageAccount = a.getDeals()[1]
    console.log(formatutils.beautyBalanceOutputOfAccount(arbitrageAccount).toString())
  })
})
