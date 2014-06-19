var assert = require('assert');
var co = require('co');
var moment = require('moment');
var Spreadsheet = require('./index');

describe('Google Spreadsheets append', function () {
  var auth = {
    email: process.env.EMAIL,
    keyFile: process.env.KEYFILE,
    key: process.env.KEY
  };
    
  var spreadsheet = Spreadsheet({
    auth: auth,
    fileId: process.env.FILEID,
    sheetId: process.env.SHEETID || "od6"
  });
  
  describe('Login with JWT', function () {
    it('should return JSON Web Token (JWT)', function (done) {
      co(function *() {
        var token = yield spreadsheet.login(auth);
        assert(token);
        done();
      })();
    });
  });
  
  describe('Append row', function () {
    it('should append new row', function (done) {
      co(function *() {
        yield spreadsheet.add({timestamp: moment().format("M/D/YYYY HH:mm:ss"), email: "a@a.com"});
        done();
      })();
    });
  });
});

