'use strict';

const dataFunctions = require('./dataFunctions');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();

let tableName;
let newItem;
let allItems;

exports.init = function init(context, callback) {
    tableName = "Salutations";

    callback();
};

exports.setup = function setup(event, context, callback) {
    let name = event.body.name !== undefined ? event.body.name : '';
    let greeting = event.body.greeting !== undefined ? event.body.greeting : '';
    let gender = event.body.gender !== undefined ? event.body.gender : '';
    let message = event.body.message !== undefined ? event.body.message : '';
    let is_disabled = false;

    newItem = {
        "name": name,
        "greeting": greeting,
        "gender": gender,
        "message": message,
        "is_disabled": is_disabled
    };

    dataFunctions.getAllItems(tableName, dynamodb, context, function (results) {
        allItems = results;

        callback();
    });
};

exports.process = function process(context, callback) {
    dataFunctions.addItem(newItem, allItems, tableName, dynamodb, context, function (itemId) {
        dataFunctions.getSingleItem(itemId, tableName, dynamodb, context, function (item) {
            callback(null, item);
        });
    });
};

exports.takedown = function takedown(context, callback) {
    callback();
};
