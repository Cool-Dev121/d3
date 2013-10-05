import "../core/functor";
import "../svg/line";
import "voronoi/";
import "geom";

d3.geom.voronoi = function(points) {
  var x = d3_svg_lineX,
      y = d3_svg_lineY,
      clipExtent = d3_geom_voronoiClipExtent;

  // @deprecated; use voronoi(data) instead.
  if (points) return voronoi(points);

  function voronoi(data) {
    var fx = d3_functor(x),
        fy = d3_functor(y),
        sites = data.map(function(d, i) { return {0: fx(d, i), 1: fy(d, i), i: i}; }),
        polygons = [];

    d3_geom_voronoi(sites, clipExtent).cells.forEach(function(cell) {
      var i = cell.site.i;
      (polygons[i] = cell.edges.length ? cell.edges.map(function(edge) {
        return edge.start();
      }).reverse() : [
        [clipExtent[0][0], clipExtent[0][1]],
        [clipExtent[1][0], clipExtent[0][1]],
        [clipExtent[1][0], clipExtent[1][1]],
        [clipExtent[0][0], clipExtent[1][1]]
      ]).point = data[i];
    });

    return polygons;
  }

  voronoi.links = function(data) {
    throw new Error("not yet implemented");
  };

  voronoi.triangles = function(data) {
    throw new Error("not yet implemented");
  };

  voronoi.x = function(_) {
    return arguments.length ? (x = _, voronoi) : x;
  };

  voronoi.y = function(_) {
    return arguments.length ? (y = _, voronoi) : y;
  };

  voronoi.clipExtent = function(_) {
    if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent;
    clipExtent = _ == null ? d3_geom_voronoiClipExtent : _;
    return voronoi;
  };

  // @deprecated; use clipExtent instead.
  voronoi.size = function(_) {
    if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent && clipExtent[1];
    return voronoi.clipExtent(_ && [[0, 0], _]);
  };

  return voronoi;
};

var d3_geom_voronoiClipExtent = [[-1e6, -1e6], [1e6, 1e6]];
