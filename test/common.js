var fs = require('fs');
var path = require('path');
var assert = require('assert');
var fake = require('fake');

var common = module.exports;

var rootDir = path.join(__dirname, '..');
common.dir = {
  lib: path.join(rootDir, '/lib'),
  fixture: path.join(rootDir, '/test/fixture'),
  tmp: path.join(rootDir, '/test/tmp')
};

common.defaultTypeValue = function() { return new Buffer([1, 2, 3]); };

common.assert = assert;
common.fake = fake;

common.port = 8432;

common.staticPort = 9432;
common.httpsPort = 9443;

// store server cert in common for later reuse, because self-signed
common.httpsServerKey = fs.readFileSync(path.join(__dirname, './fixture/key.pem'));
common.httpsServerCert = fs.readFileSync(path.join(__dirname, './fixture/cert.pem'));

// Actions

common.actions = {};

// generic form submit
common.actions.submit = function(form, server)
{
  return form.submit('http://localhost:' + common.port + '/', function(err, res) {

    if (err) {
      throw err;
    }

    assert.strictEqual(res.statusCode, 200);

    // unstuck new streams
    res.resume();

    server.close();
  });
};


common.actions.formOnFile = function(FIELDS, name, file) {
  assert.ok(name in FIELDS);
  var field = FIELDS[name];
  assert.strictEqual(file.name, path.basename(field.value.path));
  assert.strictEqual(file.type, field.type);
};

// after form has finished parsing
common.actions.formOnEnd = function(res) {
  res.writeHead(200);
  res.end('done');
};
