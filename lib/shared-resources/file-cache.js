'use strict';

var inherit = require('inherit'),
    vow = require('vow'),
    vowFs = require('vow-fs'),
    path = require('path'),
    fsUtil = require('../fs/fs-util');

module.exports = inherit({
    __constructor: function (opts) {
        this._cacheDir = path.join(opts.tmpDir, 'file-cache');
    },

    get: function (cacheKey, sourceMtime) {
        if (this._mtime) {
            sourceMtime = Math.max(sourceMtime, this._mtime);
        }

        var cachePath = this._getCachePath(cacheKey),
            cacheMtime = fsUtil.getFileInfo(cachePath).mtime;

        return cacheMtime && sourceMtime < cacheMtime
            ? vowFs.read(cachePath)
            : vow.resolve(null);
    },

    put: function (cacheKey, content) {
        return vowFs.makeDir(this._cacheDir)
            .then(function () {
                this.put = this._put; // performance optimization, we need to create cache dir only first time
                return this._put(cacheKey, content);
            }.bind(this));
    },

    _put: function (cacheKey, content) {
        var cachePath = this._getCachePath(cacheKey);
        return vowFs.write(cachePath, content);
    },

    _getCachePath: function (cacheKey) {
        return path.join(this._cacheDir, fsUtil.mkHash(cacheKey));
    },

    drop: function () {
        this._mtime = Date.now();
    }
});
