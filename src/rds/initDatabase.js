'use strict';

const rdsConfig = require('./rds_config.js');
const pg = require('pg');

/**
 * Makes a connection to PostgreSQL with the credentials in the config file
 * 
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the function to call after the connection is made
 */
exports.connectDB = function connectDB(context, callback) {
    let host = rdsConfig.rds_host;
    let name = rdsConfig.rds_username;
    let password = rdsConfig.rds_password;
    let dbName = rdsConfig.rds_db_name;
    let port = rdsConfig.rds_port;

    let connectStr = "postgres://" + name + ":" + password + "@" + host + ":" + port + "/" + dbName;

    let client = new pg.Client(connectStr);

    client.connect(function(err) {
        if (err) {
            return context.fail("Error with connecting client: " + err);
        }

        callback(client);
    });
};
