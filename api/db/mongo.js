const mongoose = require("mongoose");
const { HTTP_STATUS_CODES } = require("../global");
const ResponseError = require('../errors/responseError');

const connect = (dbUri = process.env.CLUSTER_URI, dbName = process.env.DATABASE_NAME) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(`${dbUri}/${dbName}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        mongoose.connection.on('error', () => {
            reject(new ResponseError("Error while connecting to Mongo"), HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        });
        resolve();
    });
};

const disconnect = async () => {
    await mongoose.connection.disconnect();
};

module.exports = { connect, disconnect };
