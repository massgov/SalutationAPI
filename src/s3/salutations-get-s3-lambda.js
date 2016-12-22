'use strict';

const salutationsGet = require("./salutations-get-s3.js");
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
            salutationsGet.init(context, callback);
        },
        function (callback) {
            salutationsGet.setup(event, callback);
        },
        function (callback) {
            salutationsGet.process(context, callback);
        },
        function (callback) {
            salutationsGet.destroy(context, callback);
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
