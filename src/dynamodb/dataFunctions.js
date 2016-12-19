'use strict';

exports.getAllItems = function getAllItems(tableName, dynamodb, context, callback) {
    let items = [];

    let params = {
        TableName: tableName,
        Limit: 100
    };

    dynamodb.scan(params, function (err, data) {
        if (err) {
            return context.fail("Error with DynamoDB scan: " + err);
        }

        for (let i = 0; i < data.Items.length; i++) {
            items.push(data.Items[i]);
        }

        callback(items);
    });
};

exports.getSingleItem = function getSingleItem(itemId, tableName, dynamodb, context, callback) {
    let params = {
        TableName: tableName,
        Key: {
            id: itemId
        }
    };

    dynamodb.get(params, function (err, data) {
        if (err) {
            return context.fail("Error with retrieving the item: " + err.stack);
        }

        callback(data.Item);
    });
};

exports.getFilteredItems = function getFilteredItems(filters, table, dynamodb, context, callback) {
    let name = filters.name;
    let greeting = filters.greeting;
    let gender = filters.gender;
    let message = filters.message;

    let items = [];
    let filterExpression = '';

    // if no parameters are specified, return all records
    if (name === '' && greeting === '' && gender === '' && message === '') {
        // do something
    } else {
        if (name !== '') {
            filterExpression += "attribute_exists('name') AND ('name' = :name)";
        }

        if (greeting !== '') {
            filterExpression += " AND attribute_exists('greeting') AND ('greeting' = :greeting)";
        }

        if (gender !== '') {
            filterExpression += " AND attribute_exists('gender') AND ('gender' = :gender)";
        }

        if (message !== '') {
            filterExpression += " AND attribute_exists('message') AND ('message' = :message)";
        }
    }

    console.log("Filter expression = " + filterExpression);

    let params = {
        TableName: table,
        Limit: 100
    };

    if (filterExpression !== '') {
        params.filterExpression = filterExpression;

        params.ExpressionAttributeValues = {
            ":name:": name,
            ":greeting:": greeting,
            ":gender:": gender,
            ":message:": message
        };
    }

    dynamodb.scan(params, function (err, data) {
        if (err) {
            return context.fail("Error with DynamoDB scan: " + err);
        }

        for (let i = 0; i < data.Items.length; i++) {
            items.push(data.Items[i]);
        }

        callback(items);
    });
};

exports.addItem = function addItem(itemObj, items, tableName, dynamodb, context, callback) {
    let id = (findHighestId(items) + 1).toString();
    let name = itemObj.name;
    let greeting = itemObj.greeting;
    let gender = itemObj.gender;
    let message = itemObj.message;
    let is_disabled = itemObj.is_disabled;

    dynamodb.putItem({
        TableName: tableName,
        Item: {
            "id": {
                "N": id
            },
            "name": {
                "S": name
            },
            "greeting": {
                "S": greeting
            },
            "gender": {
                "S": gender
            },
            "message": {
                "S": message
            },
            "is_disabled": {
                "BOOL": is_disabled
            }
        }
    }, function (err, data) {
        if (err) {
            return context.fail("Error with adding item: " + err);
        }

        callback(id.toString());
    });
};

exports.modifyAllItems = function modifyAllItems(updateParams, itemIds, tableName, dynamodb, context, callback) {
    let itemCounter = 0;

    let checkEnd = function (id) {
        console.log(id);

        itemCounter += 1;

        if (itemCounter === itemIds.length) {
            callback();
        }
    };

    for (let i = 0; i < itemIds.length; i++) {
        if (itemIds[i] === 0) {
            continue;
        }

        this.modifySingleItem(itemIds[i], updateParams, tableName, dynamodb, context, checkEnd);
    }
};

exports.modifySingleItem = function modifySingleItem(itemId, updateParams, tableName, dynamodb, context, callback) {
    if (Object.prototype.toString.call(itemId) !== "[object Number]") {
        console.error(Object.prototype.toString.call(itemId));

        return context.fail("Id is not a number.");
    }

    if (itemId === 0) {
        return context.fail("Cannot modify item 0.");
    }

    let params = {
        TableName: tableName,
        Key: {
            id: itemId
        }
    };

    let updateExpression = "SET ";
    let expressionAttributeValues = {};

    // for each parameter name-key
    for (let p in updateParams) {
        // if the parameter value is not ''
        if (updateParams.hasOwnProperty(p) && updateParams[p] !== '') {
            updateExpression = updateExpression + p.toString() + " = :" + p.toString() + ", ";
            expressionAttributeValues[":" + p.toString()] = updateParams[p];
        }
    }

    // removes the ", " at the end of the update expression string
    updateExpression = updateExpression.substring(0, updateExpression.length - 2);

    params.UpdateExpression = updateExpression;
    params.ExpressionAttributeValues = expressionAttributeValues;

    dynamodb.update(params, function (err, data) {
        if (err) {
            return context.fail("Error with updating item: " + err.stack);
        }

        callback(itemId);
    });
};

exports.deleteItem = function deleteItem(itemId, tableName, dynamodb, context, callback) {
    if (itemId === 0) {
        return context.fail("Cannot delete item 0.");
    }

    let params = {
        TableName: tableName,
        Key: {
            id: itemId
        }
    };

    dynamodb.delete(params, function (err, data) {
        if (err) {
            return context.fail("Error with deleting item: " + err);
        }

        callback();
    });
};

function findHighestId(items) {
    let highestId = 0;

    for (let i = 0; i < items.length; i++) {
        // sets the tracker to the current item's id if the id is a higher value
        highestId = parseInt(items[i].id.N) > highestId ? parseInt(items[i].id.N) : highestId;
    }

    return highestId;
}
