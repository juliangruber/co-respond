var respond = require('./');
var test = require('tap').test;
var Writable = require('stream').Writable;
var co = require('co');
var http = require('http');
var respond = require('./');
var wait = require('co-wait');
var request = require('supertest');
var through = require('through');

test('throws', function(t){
  var called = 0;
  var ended = 0;
  var responded = false;

  function throws(){
    return function*(end){
      if (end) return ended++;
      called++;
      throw new Error('oops');
    }
  }

  var server = http.createServer(function(req, res){
    co(function*(){
      try {
        yield respond(res, throws());
      } catch (err) {
        responded = true;
        res.statusCode = 500;
        res.end(err.message);
      }
    })();
  });

  request(server)
  .get('/')
  .expect(500)
  .expect('oops', function(err){
    t.error(err);
    t.equal(called, 1, 'called once');
    t.equal(ended, 1, 'ended once');
    t.assert(responded);
    server.close();
    t.end();
  });
});

test('ends', function(t){
  var called = 0;
  var ended = 0;
  var responded = false;

  function thrice(str){
    var i = 0;
    return function*(end){
      if (end) return ended++;
      called++;
      if (i++ > 2) return;
      yield wait(10);
      return str;
    }
  }

  var server = http.createServer(function(req, res){
    co(function*(){
      yield respond(res, thrice('bob'));
      responded = true;
    })();
  });

  request(server)
  .get('/')
  .expect(200)
  .expect('bobbobbob', function(err){
    t.error(err, 'sane');
    t.equal(called, 4, 'called four times');
    t.equal(ended, 1, 'ended once');
    t.assert(responded, 'responded');
    server.close();
    t.end();
  });
});

test('aborts', function(t){
  var called = 0;
  var ended = 0;
  var responded = false;

  function repeat(str){
    return function*(end){
      if (end) return ended++;
      called++;
      yield wait(10);
      return str;
    }
  }

  var server = http.createServer(function(req, res){
    co(function*(){
      yield respond(res, repeat('bob'));
      responded = true;
    })();
  });

  var req = request(server)
  .get('/')
  .expect(200);

  req.pipe(through(function(data){
    t.equal(data.toString(), 'bob');
    req.abort();
  }, function(){
    setTimeout(function(){
      t.equal(called, 2, 'called twice');
      t.equal(ended, 1, 'ended once');
      t.assert(responded, 'responded');
      server.close();
      t.end();
    }, 100);
  }));
});

