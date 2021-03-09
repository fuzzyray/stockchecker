'use strict';

const fetch = require('node-fetch');
const Database = require('../db/database-sqlite').Database;

const databaseConnection = process.env.DB;
const db = new Database({'connectString': databaseConnection});

const getStockPrice = (stockSymbol) => {
  return new Promise((resolve, reject) => {
    const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`;
    fetch(url).then(response => response.json()).then(data => {
      if (data === 'Unknown symbol') {
        reject(`Unknown symbol: ${stockSymbol}`);
      } else if (data === 'Not found') {
        reject(`Symbol not found: ${stockSymbol}`);
      } else {
        resolve({'stock': data['symbol'], 'price': data['latestPrice']});
      }
    }).catch(error => reject(error));
  });
};

const getStockLikes = (stockSymbol, ipAddress = null, like = false) => {
  return new Promise((resolve, reject) => {
    db.connectDatabase(databaseConnection, (err, success) => {
      if (err) {
        console.log(err);
        reject(err.toString());
      } else {
        if (like) {
          db.addLike(stockSymbol, ipAddress, (err, success) => {
            if (err) {
              reject(err.toString());
            } else {
              db.getLikes(stockSymbol, (err, results) => {
                if (err) {
                  console.log(err);
                  reject(err.toString());
                } else {
                  resolve({'stock': stockSymbol, 'likes': results});
                }
              });
            }
          });
        } else {
          db.getLikes(stockSymbol, (err, results) => {
            if (err) {
              console.log(err);
              reject(err.toString());
            } else {
              resolve({'stock': stockSymbol, 'likes': results});
            }
          });
        }
      }
    });
  });
};

module.exports = function(app) {

  app.route('/api/stock-prices')
    .get(function(req, res) {
      if (req.query.hasOwnProperty('stock')) {
        const symbols = (typeof req.query['stock'] === 'string')
          ? [req.query['stock']]
          : req.query['stock'];
        if (symbols.length > 2) {
          res.json({'error': 'Max of two stock symbols allowed'});
        } else {
          const liked = req.query.hasOwnProperty('like');
          Promise.all(symbols.map(symbol => {
            return Promise.all(
              [getStockPrice(symbol.toUpperCase()), getStockLikes(symbol.toUpperCase(), req.ip, liked)]);
          })).then((results) => {
            const stockData = results.map(d => {
              return Object.assign(...d);
            });
            if (stockData.length === 1) {
              return res.json({'stockData': stockData[0]});
            } else {
              stockData[0]['rel_likes'] = stockData[0]['likes'] - stockData[1]['likes'];
              stockData[1]['rel_likes'] = stockData[1]['likes'] - stockData[0]['likes'];
              delete stockData[0]['likes'];
              delete stockData[1]['likes'];
              return res.json({'stockData': stockData});
            }
          }).catch(error => res.json({'error': error}));
        }
      } else {
        res.json({'error': 'No stock symbol provided'});
      }
    });
};
