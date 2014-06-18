var debug = require('debug')('spreadsheet');
var googleAuth = require('google-oauth-jwt');
var js2xmlparser = require("js2xmlparser");
var request = require('request');
var thunk = require('thunkify');

// generator extended Google Auth
var authenticate = thunk(googleAuth.authenticate);

// token cache
var tokens = {};

function Spreadsheet (options) {
  if (!(this instanceof Spreadsheet)) {
    return new Spreadsheet(options);
  }
  
  if (!options.auth || !options.auth.email || !options.auth.keyFile) throw new Error("auth.email & auth.keyFile are required");
  this.auth = options.auth;
  if (!Array.isArray(this.auth.scopes)) {
    this.auth.scopes = [
      'https://spreadsheets.google.com/feeds/',
      'https://docs.google.com/feeds/'
    ];
  }
  
  if (!options.fileId) throw new Error("fileId is required");
  this.fileId = options.fileId;
  this.sheetId = options.sheetId || "od6";
}

Spreadsheet.prototype.login = function *(options) {
  options = options || {};
  
  if (!options.email) throw new Error('email is required');
  if (!options.keyFile) throw new Error('keyFile (PEM encoded private key) is required');
  if (!Array.isArray(options.scopes)) {
    options.scopes = [
      'https://spreadsheets.google.com/feeds/',
      'https://docs.google.com/feeds/'
    ];
  }
  
  try {
    var token = yield authenticate(options);
  } catch (err) {
    debug('auth error', JSON.stringify(err), options);
  }
  
  return token;
}

Spreadsheet.prototype.add = function *(row) {
  // create entry xml for row
  var data = {
    "@": {
      "xmlns": "http://www.w3.org/2005/Atom",
      "xmlns:gsx": "http://schemas.google.com/spreadsheets/2006/extended"
    }
  };
  
  // add row col/val
  Object.keys(row).forEach(function(key) {
    data["gsx:"+key] = row[key];
  });
  
  // create xml, we don't need declaration
  var xml = js2xmlparser("entry", data, {
    declaration: {
      include: false
    }
  });
  
  // get token
  var token;
  if (this.auth.email in tokens) {
    token = tokens[this.auth.email];
  } else {
    token = yield this.login(this.auth);
  }
  
  // Append row to spreadsheet list feed
  return yield post("https://spreadsheets.google.com/feeds/list/" + this.fileId + "/" + this.sheetId + "/private/full?alt=json", {
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/atom+xml",
    },
    body: xml
  });
}


function post (url, options) {
  return function (fn) {
    debug('POST', url, options);
    request.post(url, options, function (err, res, body) {
      if (err) {
        fn(err);
      } else if (res.statusCode < 200 || res.statusCode >= 300) {
        debug('POST error', url, options, err, res.statusCode, body);
        fn(new Error(body));
      } else {
        fn();
      };
    });
  }
}

module.exports = Spreadsheet;