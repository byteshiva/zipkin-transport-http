'use strict';

var _require = require('zipkin');

var Tracer = _require.Tracer;
var BatchRecorder = _require.BatchRecorder;
var Annotation = _require.Annotation;
var ExplicitContext = _require.ExplicitContext;

var HttpLogger = require('../src/HttpLogger');
var express = require('express');
var bodyParser = require('body-parser');

describe('HTTP transport - integration test', function () {
  it('should send trace data via HTTP', function (done) {
    var _this = this;

    var app = express();
    app.use(bodyParser.json());
    app.post('/api/v1/spans', function (req, res) {
      res.status(202).json({});
      var traceData = req.body;
      expect(traceData.length).to.equal(1);
      expect(traceData[0].name).to.equal('GET');
      expect(traceData[0].binaryAnnotations.length).to.equal(2);
      expect(traceData[0].annotations.length).to.equal(2);
      _this.server.close(done);
    });
    this.server = app.listen(0, function () {
      _this.port = _this.server.address().port;
      var httpLogger = new HttpLogger({
        endpoint: 'http://localhost:' + _this.port + '/api/v1/spans'
      });

      var ctxImpl = new ExplicitContext();
      var recorder = new BatchRecorder({ logger: httpLogger });
      var tracer = new Tracer({ recorder: recorder, ctxImpl: ctxImpl });

      ctxImpl.scoped(function () {
        tracer.recordAnnotation(new Annotation.ServerRecv());
        tracer.recordServiceName('my-service');
        tracer.recordRpc('GET');
        tracer.recordBinary('http.url', 'http://example.com');
        tracer.recordBinary('http.response_code', '200');
        tracer.recordAnnotation(new Annotation.ServerSend());
      });
    });
  });
});