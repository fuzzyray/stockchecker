'use strict';

const getStockPrice = (stockSymbol) => {
  const result = new Promise((resolve, reject) => {
    setTimeout(() => resolve(
      {'stock': stockSymbol, 'price': Math.floor(Math.random() * 100) + 1}),
      500);
  });
  return result;
};

const getStockLikes = (stockSymbol, ipAddress = null, like = false) => {
  const result = new Promise((resolve, reject) => {
    setTimeout(() => resolve(
      {'stock': stockSymbol, 'likes': Math.floor(Math.random() * 10) + 1}),
      600);
  });
  return result;
};

module.exports = function(app) {

  app.route('/api/stock-prices')
    .get(function(req, res) {
      const symbols = (typeof req.query['stock'] === 'string')
        ? [req.query['stock']]
        : req.query['stock'];
      if (symbols.length > 2) {
        res.json({'error': 'Max of two stock symbols allowed'});
      } else {
        Promise.all(symbols.map(symbol => {
          return Promise.all([getStockPrice(symbol), getStockLikes(symbol)]);
        })).then((results) => {
          const stockData = results.map(d => {
            return Object.assign(...d);
          });
          if (stockData.length === 1) {
            return res.json({'stockData': stockData[0]});
          } else {
            stockData[0]['rel_likes'] = stockData[0]['likes'] -
              stockData[1]['likes'];
            stockData[1]['rel_likes'] = stockData[1]['likes'] -
              stockData[0]['likes'];
            delete stockData[0]['likes'];
            delete stockData[1]['likes'];
            return res.json({'stockData': stockData});
          }
        });
      }
    });
};
