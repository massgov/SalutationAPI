'use strict';

const dataFunctions = require('./dataFunctions');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();

let tableName;
let id;

exports.init = function init(context, callback) {
    tableName = "Salutations";

    callback();
};

exports.setup = function setup(event, callback) {
    id = event.params.id !== undefined ? event.params.id : '';

    callback();
};

exports.process = function process(context, callback) {
    dataFunctions.getSingleItem(id, tableName, dynamodb, context, function (results) {
        callback(null, results);
    });
};

exports.takedown = function takedown(context, callback) {
    callback();
};
