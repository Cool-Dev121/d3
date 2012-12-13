d3.geo.centroid = function(object) {
  d3_geo_centroidW = d3_geo_centroidX = d3_geo_centroidY = d3_geo_centroidZ = 0;
  d3.geo.stream(object, d3_geo_centroid);
  // TODO fallback to [0, 0] e.g. for sphere, equator?
  // TODO mixed geometries
  return d3_geo_centroidW ? [
    Math.atan2(d3_geo_centroidY, d3_geo_centroidX) * d3_degrees,
    Math.asin(Math.max(-1, Math.min(1, d3_geo_centroidZ / Math.sqrt(d3_geo_centroidX * d3_geo_centroidX + d3_geo_centroidY * d3_geo_centroidY + d3_geo_centroidZ * d3_geo_centroidZ)))) * d3_degrees
  ] : null;
};

var d3_geo_centroidW,
    d3_geo_centroidX,
    d3_geo_centroidY,
    d3_geo_centroidZ;

var d3_geo_centroid = {
  sphere: d3_noop,
  point: d3_geo_centroidPoint,
  lineStart: d3_geo_centroidLineStart,
  lineEnd: d3_geo_centroidLineEnd,
  polygonStart: function() {
    d3_geo_centroid.lineStart = d3_geo_centroidRingStart;
  },
  polygonEnd: function() {
    d3_geo_centroid.lineStart = d3_geo_centroidLineStart;
  }
};

// Arithmetic mean of Cartesian vectors.
function d3_geo_centroidPoint(λ, φ) {
  ++d3_geo_centroidW;
  λ *= d3_radians;
  var cosφ = Math.cos(φ *= d3_radians);
  d3_geo_centroidX += (cosφ * Math.cos(λ) - d3_geo_centroidX) / d3_geo_centroidW;
  d3_geo_centroidY += (cosφ * Math.sin(λ) - d3_geo_centroidY) / d3_geo_centroidW;
  d3_geo_centroidZ += (Math.sin(φ) - d3_geo_centroidZ) / d3_geo_centroidW;
}

function d3_geo_centroidRingStart() {
  var λ00, φ00; // first point
  d3_geo_centroidLineStart();
  var linePoint = d3_geo_centroid.point;
  d3_geo_centroid.point = function(λ, φ) {
    linePoint(λ00 = λ, φ00 = φ);
  };
  d3_geo_centroid.lineEnd = function() {
    d3_geo_centroid.point(λ00, φ00);
    d3_geo_centroidLineEnd();
  };
}

function d3_geo_centroidLineStart() {
  var x0, y0, z0; // previous point

  d3_geo_centroid.point = function(λ, φ) {
    λ *= d3_radians;
    var cosφ = Math.cos(φ *= d3_radians);
    x0 = cosφ * Math.cos(λ);
    y0 = cosφ * Math.sin(λ);
    z0 = Math.sin(φ);
    d3_geo_centroid.point = nextPoint;
  };
  d3_geo_centroid.lineEnd = d3_geo_centroidLineEnd;

  function nextPoint(λ, φ) {
    λ *= d3_radians;
    var cosφ = Math.cos(φ *= d3_radians),
        x = cosφ * Math.cos(λ),
        y = cosφ * Math.sin(λ),
        z = Math.sin(φ),
        w = Math.atan2(
          Math.sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w),
          x0 * x + y0 * y + z0 * z);
    d3_geo_centroidW += w;
    d3_geo_centroidX += w * (x0 + (x0 = x));
    d3_geo_centroidY += w * (y0 + (y0 = y));
    d3_geo_centroidZ += w * (z0 + (z0 = z));
  }
}

function d3_geo_centroidLineEnd() {
  d3_geo_centroid.point = d3_geo_centroidPoint;
}
