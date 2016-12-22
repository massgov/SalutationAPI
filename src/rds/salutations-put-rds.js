'use strict';

const initDatabase = require('./initDatabase');
const dataFunctions = require('./dataFunctions');
const pg = require('pg');

let client;
let putParams;

/**
 * Connects to the database and sets the client.
 *
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function
 */
exports.init = function init(context, callback) {
    initDatabase.connectDB(context, function (results) {
        client = results;
        callback();
    });
};

/**
 * Gets the modification parameters from the event and sets the put parameters object variable.
 *
 * @param {Object} event - the event from the exports.handler
 * @param {function} callback - the callback function
 */
exports.setup = function setup(event, callback) {
    let name = event.body.name !== undefined ? event.body.name : '';
    let greeting = event.body.greeting !== undefined ? event.body.greeting : '';
    let gender = event.body.gender !== undefined ? event.body.gender : '';
    let message = event.body.message !== undefined ? event.body.message : '';

    putParams = {
        "name": name,
        "greeting": greeting,
        "gender": gender,
        "message": message
    };

    callback();
};

/**
 * Gets all the modified records and passes them to the callback results.
 *
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function
 */
exports.process = function process(context, callback) {
    dataFunctions.modifyAllRecords(putParams, client, context, function (results) {
        dataFunctions.getAllRecords(client, context, function (results) {
            callback(null, results);
        });
    });
};

/**
 * Ends the connection with the database client.
 *
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function
 */
exports.takedown = function takedown(context, callback) {
    client.end(function(err) {
        if (err) {
            return context.fail("Error with ending client: " + err);
        }

        callback();
    });
};
