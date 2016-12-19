'use strict';

/**
 * Retrieves all the record objects. If there are any filters defined, it will retrieve all the records that match the filters.
 * 
 * @param {Object} filters - the filters to match in the search
 * @param {Object} client - the PostgreSQL database client
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function
 */
exports.getAllRecords = function getAllRecords(filters, client, context, callback) {
    let filtersDefined = false;

    // checks if the filters object is empty
    if (Object.keys(filters).length !== 0 && filters.constructor === Object) {
        // checks if any of the filters are undefined
        for (let key in filters) {
            if (filters[key] !== '') {
                filtersDefined = true;
                break;
            }
        }  // end for-loop iterating through the filter keys
    }
    
    let queryStr = "SELECT * FROM Salutations";

    if (filtersDefined) {
        queryStr = applyFilters(filters, queryStr);
    }

    let data = [];

    let query = client.query(queryStr, function(err) {
        if (err) {
            client.end();
            return context.fail("Error with select query: " + err);
        }
    });

    query.on('row', function(row) {
        data.push(row);
    });

    query.on('end', function() {
        callback(data);
    });
};

/**
 * Retrieves the single record with the specified id.
 * 
 * @param {number} id - the id parameter of the record to be retrieved
 * @param {Object} client - the PostgreSQL database client
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function
 */
exports.getSingleRecord = function getSingleRecord(id, client, context, callback) {
    let queryStr = "SELECT * FROM Salutations WHERE id = " + id;

    let data = [];

    let query = client.query(queryStr, function(err) {
        if (err) {
            client.end();
            return context.fail("Error with select query: " + err);
        }
    });

    query.on('row', function(row) {
        data.push(row);
    });

    query.on('end', function() {
        callback(data);
    });
};

/**
 * Adds a record to the database table. This uses a SQL INSERT query to create the new row.
 *
 * @param {Object} recordObj - the object variable of the record to be added
 * @param {Object} client - the PostgreSQL database client
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function
 */
exports.addRecord = function addRecord(recordObj, client, context, callback) {
    let id = findHighestId(client, context) + 1;
    let name = recordObj.name;
    let greeting = recordObj.greeting;
    let gender = recordObj.gender;
    let message = recordObj.message;
    let is_disabled = recordObj.is_disabled;

    let queryStr = "INSERT INTO Salutations (id, name, greeting, gender, message, is_disabled) VALUES (" + id + ", '" + name + "', '" + greeting + "', '" + gender + "', '" + message + "', " + is_disabled + ")";
    console.log("Query string: " + queryStr);

    let query = client.query(queryStr);

    client.query(queryStr, function(err) {
        if (err) {
            if (!err.toString().includes("error: duplicate key value violates unique constraint")) {
                client.end();
                return context.fail("Error with insert query: " + err);
            }
        }

        callback();
    });
};

/**
 * Deletes a record from the database table. This uses a SQL DELETE query to remove the row.
 *
 * @param {number} id - the id of the record to delete
 * @param {Object} client - the PostgreSQL database client
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function
 */
exports.deleteRecord = function deleteRecord(id, client, context, callback) {
    let queryStr = "DELETE FROM Salutations WHERE id = " + id;

    console.log("Query String is: " + queryStr);

    client.query(queryStr, function (err) {
        if (err) {
            return context.fail("Error with the delete query: " + err);
        }

        callback();
    });
};

/**
 * Modifies all the records in the database table. This uses a SQL UPDATE query to modify the rows.
 *
 * @param {Object} putParams - the object with all the modification parameters
 * @param {Object} client - the PostgreSQL database client
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function
 */
exports.modifyAllRecords = function modifyAllRecords(putParams, client, context, callback) {
    let name = putParams.name;
    let greeting = putParams.greeting;
    let gender = putParams.gender;
    let message = putParams.message;

    let queryStr = '';

    if (name === '' && greeting === '' && gender === '' && message === '') {
        callback();
    } else {
        queryStr = "UPDATE Salutations SET ";

        if (name !== '') {
            queryStr = queryStr + "name = '" + name + "', ";
        }

        if (greeting !== '') {
            queryStr = queryStr + "greeting = '" + greeting + "', ";
        }

        if (gender !== '') {
            queryStr = queryStr + "gender = '" + gender + "', ";
        }

        if (message !== '') {
            queryStr = queryStr + "message = '" + message + "', ";
        }

        // removes the ", " at the end of the query string
        queryStr = queryStr.substring(0, queryStr.length - 2);
    }

    console.log("Query String is: " + queryStr);

    client.query(queryStr, function(err) {
        if (err) {
            return context.fail("Error with update query: " + err);
        }

        callback();
    });
};

/**
 * Modifies a single record in the database table. This uses a SQL UPDATE query to modify the row.
 *
 * @param {Object} putParams - the object with the modification parameters
 * @param {Object} client - the PostgreSQL database client
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function
 */
exports.modifySingleRecord = function modifySingleRecord(putParams, client, context, callback) {
    let id = putParams.id;
    let name = putParams.name;
    let greeting = putParams.greeting;
    let gender = putParams.gender;
    let message = putParams.message;

    let queryStr = '';

    if (name === '' && greeting === '' && gender === '' && message === '') {
        callback();
    } else {
        queryStr = "UPDATE Salutations SET ";

        if (name !== '') {
            queryStr = queryStr + "name = '" + name + "', ";
        }

        if (greeting !== '') {
            queryStr = queryStr + "greeting = '" + greeting + "', ";
        }

        if (gender !== '') {
            queryStr = queryStr + "gender = '" + gender + "', ";
        }

        if (message !== '') {
            queryStr = queryStr + "message = '" + message + "', ";
        }

        // removes the ", " at the end of the query string
        queryStr = queryStr.substring(0, queryStr.length - 2);
    }

    queryStr = queryStr + " WHERE id = " + String(id);

    console.log("Query String is: " + queryStr);

    client.query(queryStr, function(err) {
        if (err) {
            return context.fail("Error with update query: " + err);
        }

        callback();
    });
};

/**
 * Applies the specified filters to a given query string.
 * 
 * @param {Object} filters - the filters to apply
 * @param {string} queryStr - the SQL query string
 * 
 * @returns {string} modifiedQuery - the modified SQL query string with the applied filters
 */
function applyFilters(filters, queryStr) {
    if (filters.constructor !== String) {
        throw "Query string input is not of String type.";
    }

    let name = filters.name;
    let greeting = filters.greeting;
    let gender = filters.gender;
    let message = filters.message;

    let modifiedQuery = "";

    // if no parameters are specified, return all records
    if (name === '' && greeting === '' && gender === '' && message === '') {
        return;
    } else {
        modifiedQuery = queryStr + " WHERE";

        if (name !== '') {
            modifiedQuery = modifiedQuery + " NAME = '" + name + "' AND";
        }

        if (greeting !== '') {
            modifiedQuery = modifiedQuery + " GREETING = '" + greeting + "' AND";
        }

        if (gender !== '') {
            modifiedQuery = modifiedQuery + " GENDER = '" + gender + "' AND";
        }

        if (message !== '') {
            modifiedQuery = modifiedQuery + " MESSAGE = '" + message + "' AND";
        }

        // removes the " AND" at the end of the query string
        modifiedQuery = modifiedQuery.substring(0, modifiedQuery.length - 4);
    }

    modifiedQuery = modifiedQuery + " ORDER BY id ASC";

    return modifiedQuery;
}

/**
 * Gets the current highest index in the database table. This uses a SQL SELECT query to retrieve
 * all the rows and then limits the return to the top 1 descending value.
 *
 * @param {Object} client - the PostgreSQL database client
 * @param {function} callback - the callback function
 *
 * @returns {number} highestId - the highest id found
 */
function findHighestId(client, context) {
    let queryStr = "SELECT * FROM Salutations ORDER BY id DESC LIMIT 1";
    let query, data;

    try {
        query = client.query(queryStr);
    } catch (err) {
        return context.fail("Error with query to find highest id: " + err);
    }

    query.on('row', function(row) {
        data = row;
    });

    query.on('end', function() {
        return data.id;
    });
}
