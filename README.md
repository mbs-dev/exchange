Before run
==========
1. Check Node version ```node -v```. It should be >5.0.0, otherwise install it via Brew on Mac
2. Just after clone, cd into clone directory, then ```npm install```
3. To run tests and open Jest CLI, watch changes and code coverage report, ```npm run watch```
4. To make jsdoc documentation run ```npm run doc```
5. TO RUN EXAMPLE ARBITRAGE RUN: ```DEBUG=* node bin/arbitrage.js USDT BTC USDT-BTC USDT ETH USDT-ETH BTC ETH BTC-ETH usdt_arbitrage.csv```
OR ```DEBUG=* node bin/arbitrage.js BTC 1ST BTC-1ST ETH 1ST ETH-1ST BTC ETH BTC-ETH 1st_arbitrage.csv```

