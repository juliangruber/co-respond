
/**
 * Module dependencies.
 */

var Readable = require('stream').Readable;
var co = require('co');
var finished = require('on-finished');

/**
 * Respond to `res` with `stream`.
 *
 * @param {http.Response} res
 * @param {GeneratorFunction} stream
 * @return {Function}
 * @api public
 */

module.exports = function respond(res, stream){
  return function(done){
    var readable = Readable();
    var read = co(stream);
    var closed = false;

    readable._read = function(){
      if (closed) return;
      read(false, function(err, data){
        if (closed) return;
        if (err) {
          readable.push(null);
          return done(err);
        };
        data = data || null;
        readable.push(data);
      });
    }

    finished(res, function(err){
      closed = true;
      readable.push(null);
      read(true, function(){
        done(err);
      });
    });

    readable.pipe(res);
  }
};

