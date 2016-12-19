'use strict';

const dataFunctions = require('./dataFunctions');
const AWS = require('aws-sdk');

AWS.config.update({
    region: "us-east-1"
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

let table;
let filters;

exports.init = function init(context, callback) {
    table = "Salutations";

    callback();
};

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

exports.process = function process(context, callback) {
    dataFunctions.getFilteredItems(filters, table, dynamodb, context, function (results) {
        callback(null, results);
    });
};

exports.takedown = function takedown(context, callback) {
    callback();
};
