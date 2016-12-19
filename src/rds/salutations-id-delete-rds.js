'use strict';

const initDatabase = require('./initDatabase');
const dataFunctions = require('./dataFunctions');
const pg = require('pg');

let client;
let deleteRecordId;

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
 * Gets the id from the event and sets the variable id.
 *
 * @param event         the event from the exports.handler
 * @param callback      the callback function
 */
exports.setup = function setup(event, callback) {
    deleteRecordId = event.params.id !== undefined ? event.params.id : '';

    callback();
};

/**
 * Deletes the record with the specified id and passes it to the callback results.
 *
 * @param context       the context from the exports.handler
 * @param callback      the callback function
 */
exports.process = function process(context, callback) {
    dataFunctions.getSingleRecord(deleteRecordId, client, context, function (results) {
        dataFunctions.deleteRecord(deleteRecordId, client, context, function () {
            callback(null, results);
        });
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
