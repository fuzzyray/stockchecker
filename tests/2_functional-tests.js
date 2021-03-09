const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  // Viewing one stock: GET request to /api/stock-prices/
  test('View one stock', (done) => {
    chai.request(server)
      .get('/api/stock-prices')
      .query({'stock': 'goog'})
      .end((err, res) => {
        if (err) {
          console.error(err);
          assert.fail('Error executing test');
        } else {
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'Response is not an object');
          assert.property(res.body, 'stockData', 'Missing stockData property');
          assert.isObject(res.body['stockData'], 'stockData is not an object');
          assert.hasAllKeys(res.body['stockData'], ['stock', 'price', 'likes'], 'stockData object missing keys');
          assert.equal(res.body['stockData']['stock'], 'GOOG', 'GOOG not returned as stock ticker symbol');
          assert.typeOf(res.body['stockData']['price'], 'number', 'price is not a number');
          assert.equal(res.body['stockData']['likes'], 0, 'likes is not zero');
        }
        done();
      });
  });

  // Viewing one stock and liking it: GET request to /api/stock-prices/
  test('View one stock with a like', (done) => {
    chai.request(server)
      .get('/api/stock-prices')
      .query({'stock': 'goog', 'like': true})
      .end((err, res) => {
        if (err) {
          console.error(err);
          assert.fail('Error executing test');
        } else {
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'Response is not an object');
          assert.property(res.body, 'stockData', 'Missing stockData property');
          assert.isObject(res.body['stockData'], 'stockData is not an object');
          assert.hasAllKeys(res.body['stockData'], ['stock', 'price', 'likes'], 'stockData object missing keys');
          assert.equal(res.body['stockData']['stock'], 'GOOG', 'GOOG not returned as stock ticker symbol');
          assert.typeOf(res.body['stockData']['price'], 'number', 'price is not a number');
          assert.equal(res.body['stockData']['likes'], 1, 'likes is not one');
        }
        done();
      });
  });

  // Viewing the same stock and liking it again: GET request to /api/stock-prices/
  test('View one stock and like it again', (done) => {
    chai.request(server)
      .get('/api/stock-prices')
      .query({'stock': 'goog', 'like': true})
      .end((err, res) => {
        if (err) {
          console.error(err);
          assert.fail('Error executing test');
        } else {
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'Response is not an object');
          assert.property(res.body, 'stockData', 'Missing stockData property');
          assert.isObject(res.body['stockData'], 'stockData is not an object');
          assert.hasAllKeys(res.body['stockData'], ['stock', 'price', 'likes'], 'stockData object missing keys');
          assert.equal(res.body['stockData']['stock'], 'GOOG', 'GOOG not returned as stock ticker symbol');
          assert.typeOf(res.body['stockData']['price'], 'number', 'price is not a number');
          assert.equal(res.body['stockData']['likes'], 1, 'likes is not one');
        }
        done();
      });
  });

  // Viewing two stocks: GET request to /api/stock-prices/
  test('View two stocks', (done) => {
    chai.request(server)
      .get('/api/stock-prices')
      .query({'stock': ['goog', 'msft']})
      .end((err, res) => {
        if (err) {
          console.error(err);
          assert.fail('Error executing test');
        } else {
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'Response is not an object');
          assert.property(res.body, 'stockData', 'Missing stockData property');
          assert.isArray(res.body['stockData'], 'stockData is not an array');
          try {
            assert.equal(res.body['stockData'][0]['stock'], 'GOOG', 'GOOG not returned as ticker symbol');
            assert.equal(res.body['stockData'][1]['stock'], 'MSFT', 'MSFT not returned as ticker symbol');
            assert.equal(res.body['stockData'][0]['rel_likes'], 1, 'likes is not 1');
            assert.equal(res.body['stockData'][1]['rel_likes'], -1, 'likes is not -1');
          } catch (err) {
            if (err === 'AssertionError') {
              assert.equal(res.body['stockData'][0]['stock'], 'MSFT', 'MSFT not returned as ticker symbol');
              assert.equal(res.body['stockData'][1]['stock'], 'GOOG', 'GOOG not returned as ticker symbol');
              assert.equal(res.body['stockData'][0]['rel_likes'], -1, 'likes is not -1');
              assert.equal(res.body['stockData'][1]['rel_likes'], 1, 'likes is not 1');
            }
          }
          assert.typeOf(res.body['stockData'][0]['price'], 'number', 'price is not a number');
          assert.typeOf(res.body['stockData'][1]['price'], 'number', 'price is not a number');
        }
        done();
      });
  });

  // Viewing two stocks and liking them: GET request to /api/stock-prices/
  test('View two stocks and like them', (done) => {
    chai.request(server)
      .get('/api/stock-prices')
      .query({'stock': ['goog', 'msft'], 'like': true})
      .end((err, res) => {
        if (err) {
          console.error(err);
          assert.fail('Error executing test');
        } else {
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'Response is not an object');
          assert.property(res.body, 'stockData', 'Missing stockData property');
          assert.isArray(res.body['stockData'], 'stockData is not an array');
          try {
            assert.equal(res.body['stockData'][0]['stock'], 'GOOG', 'GOOG not returned as ticker symbol');
            assert.equal(res.body['stockData'][1]['stock'], 'MSFT', 'MSFT not returned as ticker symbol');
          } catch (err) {
            if (err === 'AssertionError') {
              assert.equal(res.body['stockData'][0]['stock'], 'MSFT', 'MSFT not returned as ticker symbol');
              assert.equal(res.body['stockData'][1]['stock'], 'GOOG', 'GOOG not returned as ticker symbol');
            }
          }
          assert.typeOf(res.body['stockData'][0]['price'], 'number', 'price is not a number');
          assert.typeOf(res.body['stockData'][1]['price'], 'number', 'price is not a number');
          assert.equal(res.body['stockData'][0]['rel_likes'], 0, 'likes is not zero');
          assert.equal(res.body['stockData'][1]['rel_likes'], 0, 'likes is not zero');
        }
        done();
      });
  });
});
