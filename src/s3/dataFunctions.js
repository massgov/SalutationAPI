'use strict';

/**
 * This retrieves all the record objects.
 *
 * @param {Object} s3obj - an AWS S3 object
 * @param {Object} s3params - a S3 bucket and key
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function to call after the data has been uploaded
 */
exports.getAllRecords = function getAllRecords(filters, s3obj, s3params, context, callback) {
    let records;

    // gets the data object from the S3 bucket
    s3obj.getObject(s3params, function(err, data) {
        if (err) {
            return context.fail("Error with getting S3 object: " + err.stack);
        } else {
            let dataBody;
            let jsonData;

            try {
                dataBody = data.Body;

                // converts the data object to a string and parses it for JSON
                jsonData = JSON.parse(dataBody.toString('utf8'));

                records = jsonData.salutationsData;
            } catch (err) {
                return context.fail("Error with parsing data: " + err);
            }

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

            // filters the records if there were any filters defined
            if (filtersDefined) {
                records = filterRecords(jsonData.salutationsData, filters, context);
            }

            // passes different records depending on the S3 bucket key given
            if (s3params.Key === "salutations-data.json") {
                callback(records);
            } else {
                callback(jsonData.salutationsDisabledData);
            }
        }
    });
};

/**
 * This retrieves the record object with the specified id.
 *
 * @param {number} id - the id parameter of the record to be retrieved
 * @param {Object} s3obj - an AWS S3 object
 * @param {Object} s3params - a S3 bucket and key
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function to call after the data has been uploaded
 */
exports.getSingleRecord = function getSingleRecord(id, s3obj, s3params, context, callback) {
    s3obj.getObject(s3params, function(err, data) {
        if (err) {
            return context.fail("Error with getting S3 object: " + err.stack);
        } else {
            let dataBody;
            let jsonData;

            try {
                dataBody = data.Body;

                // converts the data object to a string and parses it for JSON
                jsonData = JSON.parse(dataBody.toString('utf8'));
            } catch (err) {
                return context.fail("Error with parsing data: " + err);
            }

            let records = jsonData.salutationsData;
            let recordMatch;

            // iterates through the records to find the one with the matching id
            for (let i = 0; i < records.length; i++) {
                if (parseInt(records[i].id) === parseInt(id)) {
                    recordMatch = records[i];

                    // passes the matching record to the callback and exits the function
                    callback(recordMatch);
                    return;
                }
            }

            // checks if recordMatch variable was set
            if (!recordMatch) {
                return context.fail("Record with specified id not found.");
            }
        }
    });
};

/**
 * This adds a record object to the active records.
 *
 * @param {Object} recordObj - the record object to add
 * @param {Array} records - all the record objects
 * @param {Object} s3obj - an AWS S3 object
 * @param {Object} s3params - a S3 bucket and key
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function to call after the data has been uploaded
 */
exports.addRecord = function addRecord(recordObj, records, s3obj, s3params, context, callback) {
    // creates a new empty record object to add the record parameters to
    let newRecord = {};

    // assigns the id to the new record
    newRecord.id = (findHighestId(records) + 1).toString();

    // assigns all the record parameter values to the new record
    for (let key in recordObj) {
        newRecord[key] = recordObj[key];
    }  // end for-loop iterating through the record parameter keys

    // adds the new record to the array of record objects
    records.push(newRecord);

    // calls the function to upload the records to S3
    uploadToS3(records, s3obj, s3params, context, function () {
        // passes the id of the new record to the callback function
        callback(newRecord.id);
    });
};

/**
 * This applies updates to all the records.
 *
 * @param {Object} updateParams - the parameters to update
 * @param {Array} records - all the record objects
 * @param {Object} s3obj - an AWS S3 object
 * @param {Object} s3params - a S3 bucket and key
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function to call after the data has been uploaded
 */
exports.updateAllRecords = function updateAllRecords(updateParams, records, s3obj, s3params, context, callback) {
    let extend = require('util')._extend;

    // for each parameter name-key
    for (let p in updateParams) {
        // if the parameter value is not ''
        if (updateParams.hasOwnProperty(p) && updateParams[p] !== '') {

            // loops through each element in the JSON data array
            for (let i = 0; i < records.length; i++) {
                // condition: do not update id:0
                if (records[i].id !== '0') {
                    // update the object's parameter value
                    records[i][p] = records[i].hasOwnProperty(p) && records[i][p] !== undefined ? updateParams[p] : '';
                }  // end if

            }  // end for data
        }  // end if parameters

    }  // end for parameters

    // calls the function to upload the records to S3
    uploadToS3(records, s3obj, s3params, context, function () {
        callback();
    });
};

/**
 * This applies updates to a record with the specified id.
 *
 * @param {number} id - the id parameter of the record to be updated
 * @param {Object} updateParams - the parameters to update
 * @param {Array} records - all the record objects
 * @param {Object} s3obj - an AWS S3 object
 * @param {Object} s3params - a S3 bucket and key
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function to call after the data has been uploaded
 */
exports.updateSingleRecord = function updateSingleRecord(id, updateParams, records, s3obj, s3params, context, callback) {
    let extend = require('util')._extend;

    // prevents the default record from being modified
    if (id === '0') {
        return context.fail("The record with id 0 cannot be modified.");
    }

    let idExists = false;

    // loops through each element in the JSON data array
    for (let i = 0; i < records.length; i++) {

        // compares the record id with the input id
        if (records[i].id === id) {

            // sets the flag to true to indicate that the id has been found
            idExists = true;

            // for each parameter name-key
            for (let p in updateParams) {

                // if the parameter value is not ''
                if (updateParams.hasOwnProperty(p) && updateParams[p] !== '') {

                    // checks that the record has the parameter and it is not undefined
                    if (records[i].hasOwnProperty(p) && records[i][p] !== undefined) {

                        // updates the parameter of the record
                        records[i][p] = updateParams[p];
                    }  // end if

                }  // end if

            }  // end for-loop iterating through the parameter names

        }  // end if

    }  // end for-loop iterating through each element in the JSON data array

    // if the id was not found
    if (!idExists) {
        return context.fail("The specified id does not exist in the data.");
    }

    // calls the function to upload the records to S3
    uploadToS3(records, s3obj, s3params, context, function () {
        // passes the id of the updated record to the callback function
        callback(id);
    });
};

/**
 * This disables the record with the specified id from the active records and adds it to the
 * disabled records.
 *
 * @param {number} id - the id parameter of the record to be disabled
 * @param {Array} activeRecords - the record objects that are active
 * @param {Array} disabledRecords - the record objects that are disabled
 * @param {Object} s3obj - an AWS S3 object
 * @param {Object} s3ActiveParams - the S3 parameters for accessing the file for active records
 * @param {Object} s3DisabledParams - the S3 parameters for accessing the file for disabled records
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function to call after the data has been uploaded
 */
exports.disableRecord = function deletedRecord(id, activeRecords, disabledRecords, s3obj, s3ActiveParams, s3DisabledParams, context, callback) {
    let objDelRecord;
    let idIsThere = false;

    //checks for 0 id
    if (id === "0"){
        return context.fail("Cannot delete id: 0. Please try a different id.");
    }

    // loops through each object in the JSON data
    for (let i = 0; i < activeRecords.length; i++) {

        // compares the input id with the object id
        if (activeRecords[i].id === id) {

            // assigns idIsThere check
            idIsThere = true;

            activeRecords[i].isDisabled = "true";

            // assigns deleted record
            objDelRecord = {
              "id": activeRecords[i].id,
              "name": activeRecords[i].name,
              "greeting": activeRecords[i].greeting,
              "gender": activeRecords[i].gender,
              "message": activeRecords[i].message,
              "isDisabled": activeRecords[i].isDisabled
            };

            // removes (deletes) object from array
            activeRecords.splice(i, 1);
        }  // end if

    }  // end for-loop

    // exits if id is not there
    if (!idIsThere) {
        return context.fail("Id not found in record set.");
    } else {
        disabledRecords.push(objDelRecord);

        // calls the function to upload the active records to S3
        uploadToS3(activeRecords, s3obj, s3ActiveParams, context, function () {
            // calls the function to upload the disabled records to S3
            uploadToS3(disabledRecords, s3obj, s3DisabledParams, context, function () {
                // passes the deleted record object to the callback function
                callback(objDelRecord);
            });
        });
    }
};

/**
 * Helper function to return the record objects that match the specified filters.
 *
 * @param {Array} records - all the record objects
 * @param {Object} filters - the filters to search for
 * @param {Object} context - the context from the exports.handler
 *
 * @returns {Array} salutationsList - the record objects that matched the filters
 */
function filterRecords(records, filters, context, callback) {
    let name = filters.name;
    let greeting = filters.greeting;
    let gender = filters.gender;
    let message = filters.message;

    // the list to be returned
    let salutationsList = [];

    let salutationsListGreeting = [];
    let salutationsListGender = [];

    // if none of the parameters are specified, return all
    if (name === '' && greeting === '' && gender === '') {
        console.log("Return all.");

        salutationsList = records;
    } else {
        // if name is specified
        if (name !== '') {
            // for each object in the JSON data
            records.forEach(function(obj) {
                // compares the input name with the object name
                if (obj.name === name) {
                    // adds the object to the list to be returned
                    salutationsList.push(obj);
                }
            });

            // if the return list has objects and the greeting is also specified
            if (salutationsList.length > 0 && greeting !== '') {
                // for each object currently in the return list
                salutationsList.forEach(function(obj) {
                    // compares the input greeting with the object greeting
                    if (obj.greeting === greeting) {
                        // adds the object to the greetings list
                        salutationsListGreeting.push(obj);
                    }
                });

                // updates the new greetings list to be the list returned
                salutationsList = salutationsListGreeting;
            }

            // if the return list has objects and the gender is also specified
            if (salutationsList.length > 0 && gender !== '') {
                // for each object currently in the return list
                salutationsList.forEach(function(obj) {
                    // compares the input gender with the object gender
                    if (obj.gender === gender) {
                        // adds the object to the gender list
                        salutationsListGender.push(obj);
                    }
                });

                // updates the new genders list to be the list returned
                salutationsList = salutationsListGender;
            }

            // if greeting is specified
        } else if (greeting !== '') {
            // for each object in the JSON data
            records.forEach(function(obj) {
                // compares the input greeting with the object greeting
                if (obj.greeting === greeting) {
                    // adds the object to the list to be returned
                    salutationsList.push(obj);
                }
            });

            // if the return list has objects and the gender is also specified
            if (salutationsList.length > 0 && gender !== '') {
                // for each object currently in the return list
                salutationsList.forEach(function(obj) {
                    // compares the input gender with the object gender
                    if (obj.gender === gender) {
                        // adds the object to the gender list
                        salutationsListGender.push(obj);
                    }
                });

                // updates the new gender list to be the list returned
                salutationsList = salutationsListGender;
            }

            // if gender is specified
        } else if (gender !== '') {
            // for each object in the JSON data
            records.forEach(function(obj) {
                // compares the input gender with the object gender
                if (obj.gender === gender) {
                    // adds the object to the list to be returned
                    salutationsList.push(obj);
                }
            });

            // if the return list has objects and the greeting is also specified
            if (salutationsList.length > 0 && greeting !== '') {
                // for each object currently in the return list
                salutationsList.forEach(function(obj) {
                    // compares the input greeting with the object greeting
                    if (obj.greeting === greeting) {
                        // adds the object to the greeting list
                        salutationsListGreeting.push(obj);
                    }
                });

                // updates the new greeting list to be the list returned
                salutationsList = salutationsListGreeting;
            }
        }
    }

    return salutationsList;
}

/**
 * Helper function that takes an array of records and goes through each of them
 * to find the highest value id of the set.
 *
 * @param {Array} records - the record objects
 *
 * @returns {number} highestId - the highest id found
 */
function findHighestId(records) {
    // a tracker for holding the current highest id found
    let highestId = 0;

    for (let i = 0; i < records.length; i++) {
        // sets the tracker to the current record's id if the id is a higher value
        highestId = parseInt(records[i].id) > highestId ? parseInt(records[i].id) : highestId;
    }

    return highestId;
}

/**
 * This uploads records to S3.
 *
 * @param {Array} records - the record objects to be uploaded to S3
 * @param {Object} s3obj - an AWS S3 object
 * @param {Object} s3params - a S3 bucket and key
 * @param {Object} context - the context from the exports.handler
 * @param {function} callback - the callback function to call after the data has been uploaded
 *
 * @throws {context.fail} if there is an error with the upload
 */
function uploadToS3(records, s3obj, s3params, context, callback) {
    let extend = require('util')._extend;

    let stringJSON = JSON.stringify(records);
    let body;

    if (s3params.Key === "salutations-data.json") {
        body = "{ \"salutationsData\":\n\n" + stringJSON + "\n\n}";
    } else {
        body = "{ \"salutationsDisabledData\":\n\n" + stringJSON + "\n\n}";
    }

    let newParams = extend({}, s3params);
    newParams.Body = body;

    // try-catch for uploading errors
    try {
        // uploads the modified data
        s3obj.putObject(newParams, function(err, data) {
            if (err) {
                return context.fail("Error on upload: " + err);
            }

            console.log("Data has been uploaded: " + data);

            callback();
        });
    } catch (err) {
        // exits lambda fucntion, returns fail
        return context.fail("Error on upload: " + err);
    }
}
