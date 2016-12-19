'use strict';

const initDatabase = require('./initDatabase');
const dataFunctions = require('./dataFunctions');
const pg = require('pg');

let client;
let filters;

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
 * Gets the filters for the query from the event and sets the variable object.
 *
 * @param event         the event from the exports.handler
 * @param callback      the callback function
 */
exports.setup = function setup(event, callback) {
    let name = event.query.name !== undefined ? event.query.name : '';
    let greeting = event.query.greeting !== undefined ? event.query.greeting : '';
    let gender = event.query.gender !== undefined ? event.query.gender : '';
    let message = event.query.message !== undefined ? event.query.message : '';

    filters = {
        "name": name,
        "greeting": greeting,
        "gender": gender,
        "message": message
    };

    callback();
};

/**
 * Gets the records that match the filters and passes them to the callback results.
 *
 * @param context       the context from the exports.handler
 * @param callback      the callback function
 */
exports.process = function process(context, callback) {
    dataFunctions.getAllRecords(filters, client, context, function (results) {
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
