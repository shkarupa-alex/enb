'use strict';

var inherit = require('inherit'),
    vow = require('vow'),
    vowFs = require('vow-fs'),
    path = require('path'),
    fsUtil = require('../fs/fs-util');

module.exports = inherit({
    __constructor: function (tmpDir) {
        this._cacheDir = path.join(tmpDir, 'file-cache');
    },

    _getCachePath: function (cacheKey) {
        return path.join(this._cacheDir, fsUtil.mkHash(cacheKey));
    },

    get: function (cacheKey, sourceMtime) {
        var cachePath = this._getCachePath(cacheKey),
            cacheMtime = fsUtil.getFileInfo(cachePath).mtime;

        return sourceMtime > cacheMtime
            ? vow.resolve(null)
            : vowFs.read(cachePath);
    },

    put: function (cacheKey, content) {
        return vowFs.makeDir(this._cacheDir)
            .then(function () {
                this.put = this._put;
                return this._put(cacheKey, content);
            }.bind(this));
    },

    _put: function (cacheKey, content) {
        var cachePath = this._getCachePath(cacheKey);
        return vowFs.write(cachePath, content);
    }
});
