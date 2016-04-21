'use strict';

var path = require('path'),
    fs = require('fs');

/**
 * @param {String} fullname
 * @returns {{name: *, fullname: *, suffix: string, mtime: null}}
 * @private
 */
exports.getFileInfo = function (fullname) {
    var filename = path.basename(fullname),
        mtime = null;

    if (fs.existsSync(fullname)) {
        mtime = fs.statSync(fullname).mtime.getTime();
    }

    return {
        name: filename,
        fullname: fullname,
        suffix: filename.split('.').slice(1).join('.'),
        mtime: mtime
    };
};

exports.mkHash = function (path) {
    return path.replace(/[\/\\: ]/g, '_');
};
