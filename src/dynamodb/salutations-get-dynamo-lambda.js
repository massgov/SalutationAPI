'use strict';

const salutationsGet = require("./salutations-get-dynamo.js");
const async = require('async');

/**
 * Lambda entry point
 *
 * @param event         the event from the Lambda call
 * @param context       the context from the Lambda call
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
            salutationsGet.takedown(context, callback);
        }
    ],
    /**
     * The callback function that returns the results of the Lambda call.
     *
     * @param err           any error that may have occurred
     * @param results       the results of the callback returns of each of the functions
     */
    function (err, results) {
        if (err) {
            return context.fail(err);
        }

        return context.done(null, results[2]);
    });
};
