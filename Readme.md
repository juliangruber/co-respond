
# co-respond

  Respond to http requests with [co streams](https://github.com/juliangruber/co-stream).

  [![build status](https://secure.travis-ci.org/juliangruber/co-respond.png)](http://travis-ci.org/juliangruber/co-respond)

## Example

  Respond with a stream that yields a string three times.

```js
var http = require('http');
var co = require('co');
var respond = require('co-respond');
var wait = require('co-wait');

var server = http.createServer(function(req, res){
  co(function*(){
    try {
      yield respond(res, thrice('  hi!\n'));
    } catch (err) {
      res.statusCode = 500;
      res.end('  ' + err.message + '\n');
    }
  })();
});

function thrice(str){
  var i = 0;
  return function*(end){
    if (end || i++ > 2) return;
    yield wait(1000);
    return str;
  }
}

server.listen(8007);
console.log('curl http://localhost:8007/');
```

## Installation

```bash
$ npm install co-respond
```

## API

### yield respond(res, stream)

  Pipes the [co stream](https://github.com/juliangruber/co-stream) `stream` into res and yields when done.

  Throws if `stream` or `res` emit an error.

## License

  MIT

