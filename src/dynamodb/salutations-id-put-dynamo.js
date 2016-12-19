'use strict';

const dataFunctions = require('./dataFunctions');
const AWS = require('aws-sdk');

AWS.config.update({
    region: "us-east-1"
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName;
let updateParams;
let id;

exports.init = function init(context, callback) {
    tableName = "Salutations";

    callback();
};

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

    callback();
};

exports.process = function process(context, callback) {
    dataFunctions.modifySingleItem(id, updateParams, tableName, dynamodb, context, function (itemId) {
        dataFunctions.getSingleItem(itemId, tableName, dynamodb, context, function (results) {
            callback(null, results);
        });
    });
};

exports.takedown = function takedown(context, callback) {
    callback();
};
