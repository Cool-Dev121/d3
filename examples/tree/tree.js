var w = 960,
    h = 2000;

var tree = d3.layout.tree()
    .size([h, w - 160])
    .sort(null)
    .children(function(d) { return isNaN(d.value) ? d3.entries(d.value) : null; });

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", w)
    .attr("height", h)
  .append("svg:g")
    .attr("transform", "translate(40, 0)");

d3.json("flare.json", function(json) {
  var nodes = tree(d3.entries(json)[0]);

  var link = vis.selectAll("path.link")
      .data(tree.links(nodes))
    .enter().append("svg:path")
      .attr("class", "link")
      .attr("d", path);

  var node = vis.selectAll("g.node")
      .data(nodes)
    .enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

  node.append("svg:circle")
      .attr("r", 4.5);

  node.append("svg:text")
      .attr("dx", function(d) { return d.children ? -8 : 8; })
      .attr("dy", 3)
      .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
      .text(function(d) { return d.data.key; });

  // Computes a pretty Bézier curve from parent to child. TODO reusable helper?
  function path(d) {
    var y = (d.parent.y + d.child.y) / 2,
        p0 = d.parent,
        p3 = d.child,
        p1 = {x: p0.x, y: y},
        p2 = {x: p3.x, y: y};
    return "M" + p0.y + "," + p0.x
         + "C" + p1.y + "," + p1.x
         + " " + p2.y + "," + p2.x
         + " " + p3.y + "," + p3.x;
  }
});
