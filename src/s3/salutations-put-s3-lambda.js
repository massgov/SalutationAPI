'use strict';

const salutationsPut = require("./salutations-put-s3.js");
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
            salutationsPut.init(context, callback);
        },
        function (callback) {
            salutationsPut.setup(event, context, callback);
        },
        function (callback) {
            salutationsPut.process(context, callback);
        },
        function (callback) {
            salutationsPut.destroy(context, callback);
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
