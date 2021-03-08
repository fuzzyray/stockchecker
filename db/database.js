'use strict';

// Create a generic interface class for the database operations. We will use polymorphism to implement
// the functionality for specific database software

// The required functionality required by the app is:
// 1. add a like to a stock symbol 
// 2. get the number of likes for a stock symbol

// To accomplish this, we need a one table for the likes of a stock
// Two columns need to be defined, stock symbol and ip address

// To add a like to the table, we first check if the symbol and ip address are already in the table
// If they are not in the table, then we add them to the table, if they already exist, we do nothing
// To get the number of likes for a stock, we need to get the sum of rows containing that symbol

class Database {
  // this.dbConnection is the object created upon a database connection
  // Use props for software specific items/functions needed during init
  constructor(props = {}) {
    this.dbConnection = null;
  }

  // Method to connect to the database
  connectDatabase(connectString, callback) {
    return null;
  }

  // Method to connect to the database
  closeDatabase(callback) {
    return null;
  }

  // Method to create a new database with the required schema
  createDatabase(callback) {
    return null;
  }

  // Method to delete the database
  deleteDatabase(callback) {
    return null;
  }

  // Crud Operations on schema

  // Add a like for a stock symbol
  addLike(symbol, ipAddress, callback) {
    return null;
  }

  // get the number of likes for stock symbol
  getLikes(symbol, callback) {
    return null;
  }

  // Update is either add a like or a delete a like

  // Remove a like for a stock symbol
  deleteLike(symbol, ipAddress, callback) {
    return null;
  }
}

exports.Database = Database;