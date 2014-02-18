var http = require('http');
var co = require('co');
var respond = require('./');
var wait = require('co-wait');

function repeat(str){
  return function*(end){
    if (end) return;
    yield wait(1000);
    return str;
  }
}

function thrice(str){
  var i = 0;
  return function*(end){
    if (end || i++ > 2) return;
    yield wait(1000);
    return str;
  }
}

function throws(){
  return function*(){
    throw new Error('oops');
  }
}

var server = http.createServer(function(req, res){
  co(function*(){

    var type = req.url.slice(1);
    var source = {
      repeat: repeat('  hi!\n'),
      thrice: thrice('  hi!\n'),
      throws: throws()
    }[type];

    res.write(type + ':\n');

    try {
      yield respond(res, source);
    } catch (err) {
      res.statusCode = 500;
      res.end('  ' + err.message + '\n');
    }

    console.log('responded');

  })();
});

server.listen(8007);
console.log('curl http://localhost:8007/{throws,thrice,repeat}');
