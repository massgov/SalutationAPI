'use strict';

const dataFunctions = require('./dataFunctions');
const AWS = require('aws-sdk');

AWS.config.region = 'us-east-1';
const s3obj = new AWS.S3();

let s3params;
let id;

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
 * Gets the id to query from the event.
 *
 * @param {Object} event - the event from the exports.handler
 * @param {function} callback - the callback function to call after the data has been uploaded
 */
exports.setup = function setup(event, callback) {
    id = event.params.id !== undefined ? event.params.id : '';

    callback();
};

/**
 * Retrieves the record that matches the id and passes it to the callback results.
 *
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function to call after the data has been uploaded
 */
exports.process = function process(context, callback) {
    dataFunctions.getSingleRecord(id, s3obj, s3params, context, function (results) {
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
