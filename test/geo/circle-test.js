require("../env");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("d3.geo.circle");

suite.addBatch({
  "circle": {
    topic: d3.geo.circle,
    "generates a Polygon": function(circle) {
      assert.deepEqual(circle().type, "Polygon");
    },
    "clip": {
      topic: function() {
        return d3.geo.circle().origin([-71.03, -42.37]).clip;
      },
      "grid component": function(clip) {
        var yStepsBig = d3.range(-90, 90, 10);
        assert.inDelta(clip({type: "LineString", coordinates: yStepsBig.map(function(y) { return [110, y]; })}).coordinates, [[
          [109.538009, -90],
          [110, -80],
          [110, -70],
          [110, -60],
          [110, -50],
          [110, -47.625390]
        ]], 1e-6);
      },
      "can completely clip a LineString": function(clip) {
        assert.isNull(clip({type: "LineString", coordinates: [[90.0, -42.37], [95.0, -42.37], [90.0, -42.37]]}));
      },
      "doesn't insert a duplicate point": function(clip) {
        assert.inDelta(clip({type: "LineString", coordinates: [[0, 0]]}).coordinates, [[[0, 0]]], 1e-6);
      },
      "Point": {
        "visible": function(clip) {
          assert.deepEqual(clip({type: "Point", coordinates: [0, 0]}).coordinates, [0, 0]);
        },
        "invisible": function(clip) {
          assert.isNull(clip({type: "Point", coordinates: [-180, 0]}));
        }
      },
      "MultiPoint": function(clip) {
        assert.inDelta(clip({type: "MultiPoint", coordinates: [[0, 0], [-180, 0]]}).coordinates, [[0, 0]], 1e-6);
      }
    }
  }
});

suite.export(module);
