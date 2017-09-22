$(document).ready(function(){
  var socket = io();

  socket.on('newData', function(exchangeData){
    console.log(exchangeData);

    var div;

    switch(exchangeData.exchange) {
      case 'Poloniex': div = '#poloniex'; break;
      case 'Bittrex': div = '#bittrex'; break;
      case 'Bitfinex': div = '#bitfinex'; break;
      default:
        return;
    }

    $('#market').html('<strong>' + exchangeData.market.first + '-' + exchangeData.market.second + '</strong>');

    d3.select(div).selectAll('tr').data(exchangeData.orderBook.buy).enter().append('small').text(function(d){
      return d['RATE'] + ' - ' + d['QUANTITY'];
    });
  });
});
