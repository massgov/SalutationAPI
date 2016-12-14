'use strict';

const salutationsPost = require("./salutations-post-s3.js");
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
            salutationsPost.init(context, callback);
        },
        function (callback) {
            salutationsPost.setup(event, context, callback);
        },
        function (callback) {
            salutationsPost.process(context, callback);
        },
        function (callback) {
            salutationsPost.destroy(context, callback);
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
