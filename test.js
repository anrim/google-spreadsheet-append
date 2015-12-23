var assert = require('assert');
var co = require('co');
var moment = require('moment');
var Spreadsheet = require('./index');

describe('Google Spreadsheets append', function () {
  var auth = {
    email: process.env.EMAIL,
    keyFile: process.env.KEYFILE
  };

  var spreadsheet = Spreadsheet({
    auth: auth,
    fileId: process.env.FILEID,
    sheetId: process.env.SHEETID || "od6"
  });

  describe('Login with JWT', function() {
    it('should throw error if neither key or key file is set', function() {
      assert(process.env.KEYFILE || process.env.KEY);
    });

    it('should throw error if key file is specified but missing', function(done) {
      return co(function*() {
        var auth = {
          email: process.env.EMAIL,
          keyFile: "./privatekeyxxx.pem"
        };

        var spreadsheet = Spreadsheet({
          auth: auth,
          fileId: process.env.FILEID,
          sheetId: process.env.SHEETID || "od6"
        });

        var err;
        try {
          var token = yield spreadsheet.login(auth);
        } catch (e) {
          err = e;
        }

        assert.equal(err.code, "invalid key file");
        assert(/no such file/.test(err.message));
      }).then(done, done);
    });

    it('should authenticate with key file', function(done) {
      return co(function*() {
        var auth = {
          email: process.env.EMAIL,
          keyFile: process.env.KEYFILE
        };

        var spreadsheet = Spreadsheet({
          auth: auth,
          fileId: process.env.FILEID,
          sheetId: process.env.SHEETID || "od6"
        });

        var token = yield spreadsheet.login(auth);
        assert(token);
      }).then(done, done);
    });

    it('should authenticate with key', function(done) {
      return co(function*() {
        var auth = {
          email: process.env.EMAIL,
          key: process.env.KEY
        };

        var spreadsheet = Spreadsheet({
          auth: auth,
          fileId: process.env.FILEID,
          sheetId: process.env.SHEETID || "od6"
        });

        var token = yield spreadsheet.login(auth);
        assert(token);
      }).then(done, done);
    });
  });

  describe('Append row', function() {
    before(function() {
      var auth = {
        email: process.env.EMAIL,
        keyFile: process.env.KEYFILE
      };

      var spreadsheet = Spreadsheet({
        auth: auth,
        fileId: process.env.FILEID,
        sheetId: process.env.SHEETID || "od6"
      });
    });

    it('should append new row', function(done) {
      return co(function*() {
        yield spreadsheet.add({timestamp: moment().format("M/D/YYYY HH:mm:ss"), email: "a@a.com"});
      }).then(done, done);
    });
  });
});
