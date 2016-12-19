'use strict';

const dataFunctions = require('./dataFunctions');
const AWS = require('aws-sdk');

AWS.config.update({
    region: "us-east-1"
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName;
let id;

exports.init = function init(context, callback) {
    tableName = "Salutations";

    callback();
};

exports.setup = function setup(event, context, callback) {
    id = event.params.id !== undefined ? event.params.id : '';

    callback();
};

exports.process = function process(context, callback) {
    dataFunctions.getSingleItem(id, tableName, dynamodb, context, function (results) {
        dataFunctions.deleteItem(id, tableName, dynamodb, context, function () {
            callback(null, results);
        });
    });
};

exports.takedown = function takedown(context, callback) {
    callback();
};
