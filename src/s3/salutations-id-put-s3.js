'use strict';

const dataFunctions = require('./dataFunctions');
const AWS = require('aws-sdk');

AWS.config.region = 'us-east-1';
const s3obj = new AWS.S3();

let s3params;
let id;
let allRecords;
let updateParams;

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
 * Gets the parameters for the update from the event and sets the variable object.
 *
 * @param {Object} event - the event from the exports.handler
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function to call after the data has been uploaded
 */
exports.setup = function setup(event, context, callback) {
    id = event.params.id !== undefined ? event.params.id : '';
    let name = event.body.name !== undefined ? event.body.name : '';
    let greeting = event.body.greeting !== undefined ? event.body.greeting : '';
    let gender = event.body.gender !== undefined ? event.body.gender : '';
    let message = event.body.message !== undefined ? event.body.message : '';

    updateParams = {
        "name": name,
        "greeting": greeting,
        "gender": gender,
        "message": message,
    };

    dataFunctions.getAllRecords(s3obj, s3params, context, function (results) {
        allRecords = results;

        callback();
    });
};

/**
 * Updates the record, retrieves it, and passes it to the callback results.
 *
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function to call after the data has been uploaded
 */
exports.process = function process(context, callback) {
    dataFunctions.updateSingleRecord(id, updateParams, allRecords, s3obj, s3params, context, function (recordId) {
        dataFunctions.getSingleRecord(recordId, s3obj, s3params, context, function (record) {
            callback(null, record);
        });
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
