require('dotenv').config();
module.exports = {
  "development": {
    "username": process.env.DB_USERNAME || "root",
    "password": process.env.DB_PASSWORD || null,
    "database": process.env.DB_DATABASE_NAME || "booking_care",
    "host": process.env.DB_HOST || "localhost",
    "port": process.env.DB_PORT || 3306,
    "dialect": process.env.DB_DIALECT || "mysql",
    "logging": false,
    "raw": true,
    "timezone": "+07:00",
    "query": {
      "raw": true
    }
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}