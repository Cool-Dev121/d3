var w = 960,
    h = 700,
    r = Math.min(w, h) / 2,
    color = d3.scale.category20c();

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", w)
    .attr("height", h)
  .append("svg:g")
    .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

var partition = d3.layout.partition()
    .sort(null)
    .size([2 * Math.PI, r * r])
    .value(function(d) { return 1; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

d3.json("flare.json", function(json) {
  var path = vis.data(hierarchy(json).children).selectAll("path")
      .data(partition)
    .enter().append("svg:path")
      .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("stroke", "#fff")
      .style("fill", function(d) { return color((d.children ? d : d.parent).key); })
      .each(stash);

  d3.select("#size").on("click", function() {
    path
        .data(partition.value(function(d) { return d.size; }))
      .transition()
        .duration(1500)
        .attrTween("d", arcTween)
        .each("end", stash);

    d3.select("#size").classed("active", true);
    d3.select("#count").classed("active", false);
  });

  d3.select("#count").on("click", function() {
    path
        .data(partition.value(function(d) { return 1; }))
      .transition()
        .duration(1500)
        .attrTween("d", arcTween)
        .each("end", stash);

    d3.select("#size").classed("active", false);
    d3.select("#count").classed("active", true);
  });
});

// Stash the old values for transition.
function stash(d) {
  d.x0 = d.x;
  d.dx0 = d.dx;
}

// Interpolate the arcs in data space.
function arcTween(a) {
  var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
  return function(t) {
    return arc(i(t));
  };
}

// Convert a hierarchy of file sizes into a tree.
function hierarchy(d, key) {
  var node = {key: key};
  if (isNaN(d)) {
    node.children = [];
    for (key in d) node.children.push(hierarchy(d[key], key));
  } else {
    node.size = d;
  }
  return node;
}
