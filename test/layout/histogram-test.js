var vows = require("vows"),
    load = require("../load"),
    assert = require("../env-assert");

var suite = vows.describe("d3.layout.histogram");

suite.addBatch({
  "histogram": {
    topic: load("layout/histogram"),
    "defaults to frequencies": function(d3) {
      var h = d3.layout.histogram();
      assert.deepEqual(h([0,0,0,1,2,2]).map(elements), [[0, 0, 0], [], [1], [2, 2]]);
    },
    "each bin contains the matching source elements": function(d3) {
      var h = d3.layout.histogram();
      assert.deepEqual(h([0,0,0,1,2,2]).map(elements), [[0, 0, 0], [], [1], [2, 2]]);
    },
    "each bin also has defined x, y and dx properties": function(d3) {
      var h = d3.layout.histogram();
      assert.deepEqual(h([0,0,0,1,2,2]).map(metadata), [
        {x:   0, y: 3, dx: 0.5},
        {x: 0.5, y: 0, dx: 0.5},
        {x:   1, y: 1, dx: 0.5},
        {x: 1.5, y: 2, dx: 0.5}
      ]);
    },
    "can output frequencies": function(d3) {
      var h = d3.layout.histogram().frequency(true);
      assert.deepEqual(h([0,0,0,1,2,2]).map(metadata), [
        {x:   0, y: 3, dx: 0.5},
        {x: 0.5, y: 0, dx: 0.5},
        {x:   1, y: 1, dx: 0.5},
        {x: 1.5, y: 2, dx: 0.5}
      ]);
    },
    "can output probabilities": function(d3) {
      var h = d3.layout.histogram().frequency(false);
      assert.deepEqual(h([0,0,0,1,2,2]).map(metadata), [
        {x:   0, y: 3/6, dx: 0.5},
        {x: 0.5, y:   0, dx: 0.5},
        {x:   1, y: 1/6, dx: 0.5},
        {x: 1.5, y: 2/6, dx: 0.5}
      ]);
    },
    "can specify number of bins": function(d3) {
      var h = d3.layout.histogram().bins(2);
      assert.deepEqual(h([0,0,0,1,2,2]).map(elements), [
        [0, 0, 0],
        [1, 2, 2]
      ]);
      assert.deepEqual(h([0,0,0,1,2,2]).map(metadata), [
        {x: 0, y: 3, dx: 1},
        {x: 1, y: 3, dx: 1}
      ]);
    },
    "can specify bin thresholds": function(d3) {
      var h = d3.layout.histogram().bins([0,1,2,3]);
      assert.deepEqual(h([0,0,0,1,2,2]).map(elements), [
        [0, 0, 0],
        [1],
        [2, 2]
      ]);
      assert.deepEqual(h([0,0,0,1,2,2]).map(metadata), [
        {x: 0, y: 3, dx: 1},
        {x: 1, y: 1, dx: 1},
        {x: 2, y: 2, dx: 1}
      ]);
    },
    "returns the empty array with fewer than two bins": function(d3) {
      var h = d3.layout.histogram().bins([1]);
      assert.deepEqual(h([0]), []);
      var h = d3.layout.histogram().bins([]);
      assert.deepEqual(h([0]), []);
    }
  }
});

function elements(bin) {
  var array = [], i = -1, n = bin.length;
  while (++i < n) array.push(bin[i]);
  return array;
}

function metadata(bin) {
  var metadata = {};
  if ("x" in bin) metadata.x = bin.x;
  if ("y" in bin) metadata.y = bin.y;
  if ("dx" in bin) metadata.dx = bin.dx;
  return metadata;
}

suite.export(module);
