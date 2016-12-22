'use strict';

const salutationsIdPut = require("./salutations-id-put-rds.js");
const async = require('async');

/**
 * Lambda entry point
 *
 * @param {Object} event - the event from the Lambda call
 * @param {Object} context - the context from the Lambda call
 */
exports.handler = (event, context) => {
    async.series([
        function (callback) {
            salutationsIdPut.init(context, callback);
        },
        function (callback) {
            salutationsIdPut.setup(event, callback);
        },
        function (callback) {
            salutationsIdPut.process(context, callback);
        },
        function (callback) {
            salutationsIdPut.takedown(context, callback);
        }
    ],
    /**
     * The callback function that returns the results of the Lambda call.
     *
     * @param {Object} err - any error that may have occurred
     * @param {Object[]} results - the results of the callback returns of each of the functions
     */
    function (err, results) {
        if (err) {
            return context.fail(err);
        }

        return context.done(null, results[2]);
    });
};
