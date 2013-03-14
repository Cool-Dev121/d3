var vows = require("vows"),
    load = require("../load"),
    assert = require("../env-assert");

var suite = vows.describe("d3.scale.category");

suite.addBatch({
  "category": {
    topic: load("scale/category", "color/rgb", "arrays/range"),
    "category10": category("category10", 10),
    "category20": category("category20", 20),
    "category20b": category("category20b", 20),
    "category20c": category("category20c", 20)
  }
});

function category(category, n) {
  return {
    "is an ordinal scale": function(d3) {
      var x = d3.scale[category](), colors = x.range();
      assert.lengthOf(x.domain(), 0);
      assert.lengthOf(x.range(), n);
      assert.equal(x(1), colors[0]);
      assert.equal(x(2), colors[1]);
      assert.equal(x(1), colors[0]);
      var y = x.copy();
      assert.deepEqual(y.domain(), x.domain());
      assert.deepEqual(y.range(), x.range());
      x.domain(d3.range(n));
      for (var i = 0; i < n; ++i) assert.equal(x(i + n), x(i));
      assert.equal(y(1), colors[0]);
      assert.equal(y(2), colors[1]);
    },
    "each instance is isolated": function(d3) {
      var a = d3.scale[category](), b = d3.scale[category](), colors = a.range();
      assert.equal(a(1), colors[0]);
      assert.equal(b(2), colors[0]);
      assert.equal(b(1), colors[1]);
      assert.equal(a(1), colors[0]);
    },
    "contains the expected number of values in the range": function(d3) {
      var x = d3.scale[category]();
      assert.lengthOf(x.range(), n);
    },
    "each range value is distinct": function(d3) {
      var map = {}, count = 0, x = d3.scale[category]();
      x.range().forEach(function(v) {
        if (!(v in map)) {
          map[v] = ++count;
        }
      });
      assert.equal(count, x.range().length);
    },
    "each range value is a hexadecimal color": function(d3) {
      var x = d3.scale[category]();
      x.range().forEach(function(v) {
        assert.match(v, /#[0-9a-f]{6}/);
        v = d3.rgb(v);
        assert.isFalse(isNaN(v.r));
        assert.isFalse(isNaN(v.g));
        assert.isFalse(isNaN(v.b));
      });
    },
    "no range values are very dark or very light": function(d3) {
      var x = d3.scale[category]();
      x.range().forEach(function(v) {
        var c = d3.hsl(v);
        assert.isTrue(c.l >= .34, "expected " + v + " to be lighter (l = " + c.l + ")");
        assert.isTrue(c.l <= .89, "expected " + v + " to be darker (l = " + c.l + ")");
      });
    }
  };
}

suite.export(module);
