'use strict';

const Database = require('./database').Database;
const sqlite3 = require('sqlite3').verbose();

class DatabaseSQLite extends Database {
  constructor(props = {}) {
    super();
    // Initialize the SQLite database
    if (props.hasOwnProperty('connectString')) {
      this.connectDatabase(props['connectString'], (err, success) => {
        if (err) {
          throw err;
        } else {
          this.dbConnection.all('SELECT name FROM sqlite_master', [], (err, rows) => {
            if (err) {
              throw err;
            } else {
              let tableExists = false;
              for (let i = 0; i < rows.length; i++) {
                if (rows[i]['name'] == 'stock_likes') {
                  tableExists = true;
                  break;
                }
              }
              if (tableExists) {
                this.closeDatabase((err, success) => {
                  if (err) {
                    throw err;
                  }
                });
              } else {
                this.createDatabase((err, success) => {
                  if (err) {
                    throw err;
                  } else {
                    this.closeDatabase((err, success) => {
                      if (err) {
                        throw err;
                      }
                    });
                  }
                });
              }
            }
          });
        }
      });
    }
  }

  // Method to connect to the database
  connectDatabase(connectString, callback) {
    if (this.dbConnection) {
      callback(null, `Already connected to ${connectString}`);
    } else {
      this.dbConnection = new sqlite3.Database(connectString, (err) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, `Connected to ${connectString}`);
        }
      });
    }
  }

  // Method to close the database
  closeDatabase(callback) {
    if (this.dbConnection) {
      this.dbConnection.close((err) => {
        if (err) {
          this.dbConnection = null;
          callback(err, null);
        } else {
          this.dbConnection = null;
          callback(null, 'Database Closed');
        }
      });
    } else {
      callback('Error: Database is not connected', null);
    }
  }

  // Method to create a new database with the required schema
  createDatabase(callback) {
    const creationSQL =
      `CREATE TABLE "stock_likes" (
  "stock_symbol"	TEXT NOT NULL,
  "ip_address"	TEXT NOT NULL,
  CONSTRAINT "stock_ipaddress" UNIQUE("stock_symbol","ip_address")
);
CREATE INDEX "symbol_idx" ON "stock_likes" (
  "stock_symbol"
);`;
    if (this.dbConnection) {
      this.dbConnection.exec(creationSQL, (err, success) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, 'Database Created');
        }
      });
    } else {
      callback('Error: Database is not connected', null);
    }
  }

  // Method to delete the database
  deleteDatabase(callback) {
    callback('Not Implemented', null);
  }

  // Crud Operations on schema

  // Add a like for a stock symbol
  addLike(symbol, ipAddress, callback) {
    const sql = `INSERT INTO stock_likes VALUES ('${symbol}', '${ipAddress}');`;
    if (this.dbConnection) {
      this.dbConnection.exec(sql, (err, success) => {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            callback(null, 'like already exists');
          } else {
            console.log(err);
            callback(err, null);
          }
        } else {
          callback(null, 'like added to database');
        }
      });
    } else {
      callback('Error: Database is not connected', null);
    }
  }

  // get the number of likes for stock symbol
  getLikes(symbol, callback) {
    const sql = `SELECT count() FROM stock_likes where stock_symbol = '${symbol}'`;
    if (this.dbConnection) {
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          callback(err, null);
        } else {
          const likes = rows[0]['count()'];
          callback(null, likes);
        }
      });
    } else {
      callback('Error: Database is not connected', null);
    }
  }

  // Update is either add a like or a delete a like

  // Remove a like for a stock symbol
  deleteLike(symbol, ipAddress, callback) {
    if (this.dbConnection) {
      const sql = `DELETE FROM stock_likes where stock_symbol = '${symbol}' and ip_address = '${ipAddress}'`;
      this.dbConnection.exec(sql, (err, success) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, 'like deleted');
        }
      });
    } else {
      callback('Error: Database is not connected', null);
    }
  }
}

exports.Database = DatabaseSQLite;