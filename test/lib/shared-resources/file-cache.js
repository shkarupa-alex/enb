'use strict';

var fsUtil = require('../../../lib/fs/fs-util'),
    FileCache = require('../../../lib/shared-resources/file-cache'),
    vowFs = require('vow-fs'),
    vow = require('vow'),
    _ = require('lodash'),
    path = require('path');

describe('shared-resources/file-cache', function () {
    var sandbox = sinon.sandbox.create();

    beforeEach(function () {
        sandbox.stub(fsUtil);
        fsUtil.mkHash.returnsArg(0);

        sandbox.stub(vowFs);
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('get', function () {
        beforeEach(function () {
            vowFs.read.returns(vow.resolve());
        });

        function get_(opts) {
            opts = _.defaults(opts || {}, {
                key: 'some-default-key',
                mtime: 100500,
                tmpDir: '/some/default/dir'
            });

            var fileCache = new FileCache(opts.tmpDir);
            return fileCache.get(opts.key, opts.mtime);
        }

        it('should return null if no cached file', function () {
            fsUtil.getFileInfo.returns({});

            return get_()
                .then(function (val) {
                    expect(val).to.be.equal(null);
                });
        });

        it('should return null if cached file outdated', function () {
            fsUtil.getFileInfo.returns({ mtime: 1 });

            return get_({ mtime: 2 })
                .then(function (val) {
                    expect(val).to.be.equal(null);
                });
        });

        it('should read cached file', function () {
            fsUtil.getFileInfo.returns({ mtime: 2 });
            fsUtil.mkHash.withArgs('some/path').returns('some_path');

            return get_({ mtime: 1, key: 'some/path', tmpDir: '/tmp/dir' })
                .then(function () {
                    expect(vowFs.read).to.be.calledWith(path.join('/tmp/dir', 'file-cache', 'some_path'));
                });
        });

        it('should return content if cached file valid', function () {
            fsUtil.getFileInfo.returns({ mtime: 2 });

            vowFs.read.returns(vow.resolve('some-content'));

            return get_({ mtime: 1 })
                .then(function (val) {
                    expect(val).to.be.equal('some-content');
                });
        });
    });

    describe('put', function () {
        beforeEach(function () {
            vowFs.makeDir.returns(vow.resolve());
            vowFs.write.returns(vow.resolve());
        });

        function mkFileCache_(tmpDir) {
            return new FileCache(tmpDir || '/some/default/dir');
        }

        function put_(opts) {
            opts = _.defaults(opts || {}, {
                key: 'some-default-key',
                content: 'some-default-content',
                tmpDir: '/some/default/dir'
            });

            var fileCache = opts.fileCache || mkFileCache_(opts.tmpDir);
            return fileCache.put(opts.key, opts.content);
        }

        it('should write file', function () {
            fsUtil.mkHash.withArgs('some/path').returns('some_path');

            return put_({
                    key: 'some/path',
                    tmpDir: '/tmp/dir',
                    content: 'some-content'
                })
                .then(function () {
                    expect(vowFs.write).to.be.calledWith(
                        path.join('/tmp/dir', 'file-cache', 'some_path'),
                        'some-content'
                    );
                });
        });

        it('should create cache directory before writing file', function () {
            var mediator = sinon.spy().named('mediator');
            vowFs.makeDir.returns(vow.resolve().then(mediator));

            return put_({
                    key: 'some/path',
                    tmpDir: '/tmp/dir'
                })
                .then(function () {
                    expect(vowFs.makeDir).to.be.calledWith(path.join('/tmp/dir', 'file-cache'));
                    expect(vowFs.write).to.be.calledAfter(mediator);
                });
        });

        it('should create cache directory only once', function () {
            var fileCache = mkFileCache_();

            return put_({ fileCache: fileCache })
                .then(function () {
                    return put_({ fileCache: fileCache });
                })
                .then(function () {
                    expect(vowFs.makeDir).to.be.calledOnce;
                });
        });
    });
});
