require("../env");
require("../../d3");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("d3.transition");

suite.addBatch({
  "transition": {
    topic: function() {
      return d3.transition;
    },
    "selects the document": function(transition) {
      var t = transition();
      assert.domEqual(t[0][0].node, document);
    }
  }
});

suite.export(module);

var suite = vows.describe("transition");

suite.addBatch({

  // Subtransitions
  // select
  // selectAll

  // Content
  "attr": require("./transition-test-attr"),
  "style": require("./transition-test-style"),
  // text
  // remove

  // Animation
  "delay": require("./transition-test-delay"),
  "duration": require("./transition-test-duration"),

  // Control
  "each": require("./transition-test-each")
  // tween
  // call

});

suite.export(module);
