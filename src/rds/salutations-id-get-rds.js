'use strict';

const initDatabase = require('./initDatabase');
const dataFunctions = require('./dataFunctions');
const pg = require('pg');

let client;
let recordToGetId;

/**
 * Connects to the database and sets the client.
 *
 * @param context       the context from the exports.handler
 * @param callback      the callback function
 */
exports.init = function init(context, callback) {
    initDatabase.connectDB(context, function (results) {
        client = results;
        callback();
    });
};

/**
 * Gets the id of the record from the event and sets the variable.
 *
 * @param event         the event from the exports.handler
 * @param callback      the callback function
 */
exports.setup = function setup(event, callback) {
    recordToGetId = event.params.id !== undefined ? event.params.id : '';

    callback();
};

/**
 * Gets the record with the specified id and passes it to the callback results.
 *
 * @param context       the context from the exports.handler
 * @param callback      the callback function
 */
exports.process = function process(context, callback) {
    dataFunctions.getSingleRecord(recordToGetId, client, context, function (results) {
        callback(null, results);
    });
};

/**
 * Ends the connection with the database client.
 *
 * @param context       the context from the exports.handler
 * @param callback      the callback function
 */
exports.takedown = function takedown(context, callback) {
    client.end(function(err) {
        if (err) {
            return context.fail("Error with ending client: " + err);
        }

        callback();
    });
};
