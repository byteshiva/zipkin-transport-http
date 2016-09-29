'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint-disable no-console */
var fetch = require('node-fetch');

var HttpLogger = function () {
  function HttpLogger(_ref) {
    var _this = this;

    var endpoint = _ref.endpoint;
    var _ref$httpInterval = _ref.httpInterval;
    var httpInterval = _ref$httpInterval === undefined ? 1000 : _ref$httpInterval;

    _classCallCheck(this, HttpLogger);

    this.endpoint = endpoint;
    this.queue = [];

    var timer = setInterval(function () {
      _this.processQueue();
    }, httpInterval);
    if (timer.unref) {
      // unref might not be available in browsers
      timer.unref(); // Allows Node to terminate instead of blocking on timer
    }
  }

  _createClass(HttpLogger, [{
    key: 'logSpan',
    value: function logSpan(span) {
      this.queue.push(span.toJSON());
    }
  }, {
    key: 'processQueue',
    value: function processQueue() {
      var _this2 = this;

      if (this.queue.length > 0) {
        (function () {
          var postBody = JSON.stringify(_this2.queue);
          fetch(_this2.endpoint, {
            method: 'POST',
            body: postBody,
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            }
          }).then(function (response) {
            if (response.status !== 202) {
              console.error('Unexpected response while sending Zipkin data, status:' + (response.status + ', body: ' + postBody));
            }
            _this2.queue.length = 0;
          }).catch(function (error) {
            console.error('Error sending Zipkin data', error);
            _this2.queue.length = 0;
          });
        })();
      }
    }
  }]);

  return HttpLogger;
}();

module.exports = HttpLogger;