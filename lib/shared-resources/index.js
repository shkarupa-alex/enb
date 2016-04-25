/**
 * SharedResources
 *
 * Набор ресурсов, расшаренных между технологиями
 */

var JobQueue = require('./job-queue');
var FileCache = require('./file-cache');
var inherit = require('inherit');

module.exports = inherit({
    __constructor: function (opts) {
        this.jobQueue = new JobQueue();
        this.fileCache = new FileCache(opts);
    },

    destruct: function () {
        this.jobQueue.destruct();
    }
});
