var smash = require("smash"),
    jsdom = require("jsdom");

module.exports = function() {
  var files = [].slice.call(arguments).map(function(d) { return "src/" + d; }),
      expression = "d3",
      sandbox = null;

  files.unshift("src/start");
  files.push("src/end");

  function topic() {
    smash.load(files, expression, sandbox, this.callback);
  }

  topic.expression = function(_) {
    expression = _;
    return topic;
  };

  topic.sandbox = function(_) {
    sandbox = _;
    return topic;
  };

  topic.document = function(_) {
    var document = jsdom.jsdom("<html><head></head><body></body></html>");
    sandbox = {document: document, window: document.createWindow()};
    return topic;
  };

  return topic;
};
