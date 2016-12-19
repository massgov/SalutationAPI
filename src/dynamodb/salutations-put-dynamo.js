'use strict';

const dataFunctions = require('./dataFunctions');
const AWS = require('aws-sdk');

AWS.config.update({
    region: "us-east-1"
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName;
let updateParams;
let allItemIds = [];

exports.init = function init(context, callback) {
    tableName = "Salutations";

    callback();
};

exports.setup = function setup(event, context, callback) {
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

    dataFunctions.getAllItems(tableName, dynamodb, context, function (results) {
        for (let i = 0; i < results.length; i++) {
            allItemIds.push(results[i].id);
        }

        callback();
    });
};

exports.process = function process(context, callback) {
    dataFunctions.modifyAllItems(updateParams, allItemIds, tableName, dynamodb, context, function () {
        dataFunctions.getAllItems(tableName, dynamodb, context, function (results) {
            callback(null, results);
        });
    });
};

exports.takedown = function takedown(context, callback) {
    callback();
};
