d3["svg"]["arc"] = function() {
  var innerRadius = d3_svg_arcInnerRadius,
      outerRadius = d3_svg_arcOuterRadius,
      startAngle = d3_svg_arcStartAngle,
      endAngle = d3_svg_arcEndAngle;

  function arc(d, i) {
    var r0 = innerRadius.call(this, d, i),
        r1 = outerRadius.call(this, d, i),
        a0 = startAngle.call(this, d, i) + d3_svg_arcOffset,
        a1 = endAngle.call(this, d, i) + d3_svg_arcOffset,
        da = a1 - a0,
        c0 = Math.cos(a0),
        s0 = Math.sin(a0),
        c1 = Math.cos(a1),
        s1 = Math.sin(a1);
    return "M" + r1 * c0 + "," + r1 * s0
        + "A" + r1 + "," + r1 + " 0 "
        + ((da < Math.PI) ? "0" : "1") + ",1 "
        + r1 * c1 + "," + r1 * s1
        + "L" + r0 * c1 + "," + r0 * s1
        + "A" + r0 + "," + r0 + " 0 "
        + ((da < Math.PI) ? "0" : "1") + ",0 "
        + r0 * c0 + "," + r0 * s0 + "Z";
  }

  arc["innerRadius"] = function(v) {
    if (!arguments.length) return innerRadius;
    innerRadius = d3_functor(v);
    return arc;
  };

  arc["outerRadius"] = function(v) {
    if (!arguments.length) return outerRadius;
    outerRadius = d3_functor(v);
    return arc;
  };

  arc["startAngle"] = function(v) {
    if (!arguments.length) return startAngle;
    startAngle = d3_functor(v);
    return arc;
  };

  arc["endAngle"] = function(v) {
    if (!arguments.length) return endAngle;
    endAngle = d3_functor(v);
    return arc;
  };

  return arc;
};

var d3_svg_arcOffset = -Math.PI / 2;

function d3_svg_arcInnerRadius(d) {
  return d["innerRadius"];
}

function d3_svg_arcOuterRadius(d) {
  return d["outerRadius"];
}

function d3_svg_arcStartAngle(d) {
  return d["startAngle"];
}

function d3_svg_arcEndAngle(d) {
  return d["endAngle"];
}
