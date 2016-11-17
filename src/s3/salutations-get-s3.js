'use strict';

const dataFunctions = require('./dataFunctions');
const AWS = require('aws-sdk');

AWS.config.region = 'us-east-1';
const s3obj = new AWS.S3();

let s3params;
let filters;

/**
 * Sets the S3 parameters by defining the bucket and key to use.
 *
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function to call after the data has been uploaded
 */
exports.init = function init(context, callback) {
    let bucket = "salutations-data.api.mass.gov";
    let key = "salutations-data.json";

    s3params = {
        Bucket: bucket,
        Key: key
    };

    callback();
};

/**
 * Gets the filters for the query from the event and sets the variable object.
 *
 * @param {Object} event - the event from the exports.handler
 * @param {function} callback - the callback function to call after the data has been uploaded
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
 * Retrieves all the records that match the filters and passes them to the callback results.
 *
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function to call after the data has been uploaded
 */
exports.process = function process(context, callback) {
    dataFunctions.getAllRecords(filters, s3obj, s3params, context, function (results) {
        callback(null, results);
    });
};

/**
 * Does the final callback.
 *
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function to call after the data has been uploaded
 */
exports.destroy = function takedown(context, callback) {
    callback();
};
