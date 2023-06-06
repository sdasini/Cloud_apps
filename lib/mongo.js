const { MongoClient } = require('mongodb')

const mongoHost = process.env.MONGO_HOST || 'localhost'
const mongoPort = process.env.MONGO_PORT || 27017
const mongoUser = process.env.MONGO_USER
const mongoPassword = process.env.MONGO_PASSWORD
const mongoDbName = process.env.MONGO_DB_NAME
const mongoAuthDbName = process.env.MONGO_AUTH_DB_NAME || mongoDbName

const mongoUrl = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoAuthDbName}`;

let db = null;

exports.connectToDb = function (callback) {
  MongoClient.connect(mongoUrl).then(function (client) {
    db = client.db(mongoDbName);
    callback();
  });
};

exports.getDbReference = function () {
  return db;
};

exports.closeDbConnection = function (callback) {
  _closeDbConnection(callback)
}
